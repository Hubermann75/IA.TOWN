#define UNICODE
#define _UNICODE
#define WIN32_LEAN_AND_MEAN

#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <shellapi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wchar.h>

#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "user32.lib")

#define DEFAULT_PORT 43210
#define BUFFER_SIZE 65536

static WCHAR g_appDir[MAX_PATH];
static int g_serverPort = DEFAULT_PORT;
static volatile BOOL g_running = TRUE;
static HANDLE g_hServerReady = NULL;

static BOOL FileExistsW(LPCWSTR path) {
    DWORD dwAttrib = GetFileAttributesW(path);
    return (dwAttrib != INVALID_FILE_ATTRIBUTES && !(dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

static BOOL SendAll(SOCKET sock, const char* data, int len) {
    int total = 0;
    while (total < len) {
        int sent = send(sock, data + total, len - total, 0);
        if (sent <= 0) return FALSE;
        total += sent;
    }
    return TRUE;
}

static const char* GetMimeType(const char* path) {
    const char* dot = strrchr(path, '.');
    if (!dot) return "application/octet-stream";
    if (_stricmp(dot, ".html") == 0) return "text/html; charset=utf-8";
    if (_stricmp(dot, ".js") == 0)   return "application/javascript; charset=utf-8";
    if (_stricmp(dot, ".css") == 0)  return "text/css; charset=utf-8";
    if (_stricmp(dot, ".json") == 0) return "application/json; charset=utf-8";
    if (_stricmp(dot, ".webmanifest") == 0) return "application/manifest+json; charset=utf-8";
    if (_stricmp(dot, ".png") == 0)  return "image/png";
    if (_stricmp(dot, ".jpg") == 0 || _stricmp(dot, ".jpeg") == 0) return "image/jpeg";
    if (_stricmp(dot, ".svg") == 0)  return "image/svg+xml";
    if (_stricmp(dot, ".ico") == 0)  return "image/x-icon";
    if (_stricmp(dot, ".woff2") == 0) return "font/woff2";
    if (_stricmp(dot, ".woff") == 0)  return "font/woff";
    if (_stricmp(dot, ".ttf") == 0)   return "font/ttf";
    if (_stricmp(dot, ".mp3") == 0)  return "audio/mpeg";
    if (_stricmp(dot, ".wav") == 0)  return "audio/wav";
    return "application/octet-stream";
}

// Percent-decoding for URLs (e.g. %20 -> space)
static void UrlDecode(char* dst, const char* src, size_t dstSize) {
    char a, b;
    size_t i = 0;
    while (*src && i < dstSize - 1) {
        if ((*src == '%') &&
            ((a = src[1]) && (b = src[2])) &&
            (isxdigit(a) && isxdigit(b))) {
            if (a >= 'a') a -= 'a' - 'A';
            if (a >= 'A') a -= ('A' - 10);
            else a -= '0';
            if (b >= 'a') b -= 'a' - 'A';
            if (b >= 'A') b -= ('A' - 10);
            else b -= '0';
            dst[i++] = (char)(16 * a + b);
            src += 3;
        } else if (*src == '+') {
            dst[i++] = ' ';
            src++;
        } else {
            dst[i++] = *src++;
        }
    }
    dst[i] = '\0';
}

typedef struct {
    SOCKET clientSock;
} ClientParam;

static DWORD WINAPI HandleClientThread(LPVOID lpParam) {
    ClientParam* p = (ClientParam*)lpParam;
    SOCKET clientSock = p->clientSock;
    free(p);

    // 5-second socket timeout
    DWORD timeoutMs = 5000;
    setsockopt(clientSock, SOL_SOCKET, SO_RCVTIMEO, (const char*)&timeoutMs, sizeof(timeoutMs));
    setsockopt(clientSock, SOL_SOCKET, SO_SNDTIMEO, (const char*)&timeoutMs, sizeof(timeoutMs));

    char reqBuf[4096];
    int bytesRead = recv(clientSock, reqBuf, sizeof(reqBuf) - 1, 0);
    if (bytesRead <= 0) {
        closesocket(clientSock);
        return 0;
    }
    reqBuf[bytesRead] = '\0';

    char method[16], rawUrl[1024];
    if (sscanf(reqBuf, "%15s %1023s", method, rawUrl) < 2) {
        closesocket(clientSock);
        return 0;
    }

    // Strip query string and fragment
    char* q = strchr(rawUrl, '?');
    if (q) *q = '\0';
    char* h = strchr(rawUrl, '#');
    if (h) *h = '\0';

    // Decode URL
    char decodedUrl[1024];
    UrlDecode(decodedUrl, rawUrl, sizeof(decodedUrl));

    // Default root to /index.html
    if (strcmp(decodedUrl, "/") == 0 || strlen(decodedUrl) == 0) {
        strcpy_s(decodedUrl, sizeof(decodedUrl), "/index.html");
    }

    // Security check: reject paths with ".."
    if (strstr(decodedUrl, "..")) {
        const char* forbidden = "HTTP/1.1 403 Forbidden\r\nContent-Length: 9\r\nConnection: close\r\n\r\nForbidden";
        SendAll(clientSock, forbidden, (int)strlen(forbidden));
        closesocket(clientSock);
        return 0;
    }

    // Convert forward slashes to backslashes
    WCHAR relPathW[MAX_PATH];
    MultiByteToWideChar(CP_UTF8, 0, decodedUrl, -1, relPathW, MAX_PATH);
    for (int i = 0; relPathW[i]; i++) {
        if (relPathW[i] == L'/') relPathW[i] = L'\\';
    }

    WCHAR fullPath[MAX_PATH];
    swprintf_s(fullPath, MAX_PATH, L"%s\\app%s", g_appDir, relPathW);

    FILE* fp = NULL;
    _wfopen_s(&fp, fullPath, L"rb");

    // SPA fallback: if file not found and doesn't look like asset, serve index.html
    if (!fp && !strchr(decodedUrl, '.')) {
        swprintf_s(fullPath, MAX_PATH, L"%s\\app\\index.html", g_appDir);
        _wfopen_s(&fp, fullPath, L"rb");
    }

    if (fp) {
        _fseeki64(fp, 0, SEEK_END);
        __int64 fileSize = _ftelli64(fp);
        _fseeki64(fp, 0, SEEK_SET);

        const char* mime = GetMimeType(decodedUrl);
        char respHeader[1024];
        int headerLen = sprintf_s(respHeader, sizeof(respHeader),
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: %s\r\n"
            "Content-Length: %lld\r\n"
            "Connection: close\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Cache-Control: no-cache\r\n\r\n",
            mime, (long long)fileSize);

        if (SendAll(clientSock, respHeader, headerLen)) {
            char fileBuf[BUFFER_SIZE];
            size_t readChunk;
            while ((readChunk = fread(fileBuf, 1, sizeof(fileBuf), fp)) > 0) {
                if (!SendAll(clientSock, fileBuf, (int)readChunk)) {
                    break;
                }
            }
        }
        fclose(fp);
    } else {
        const char* notFound = "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\nNot Found";
        SendAll(clientSock, notFound, (int)strlen(notFound));
    }

    shutdown(clientSock, SD_BOTH);
    closesocket(clientSock);
    return 0;
}

// Background HTTP static server thread
static DWORD WINAPI HttpServerThread(LPVOID lpParam) {
    (void)lpParam;
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        SetEvent(g_hServerReady);
        return 1;
    }

    SOCKET listenSock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSock == INVALID_SOCKET) {
        WSACleanup();
        SetEvent(g_hServerReady);
        return 1;
    }

    BOOL opt = TRUE;
    setsockopt(listenSock, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));

    struct sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = inet_addr("127.0.0.1");

    int boundPort = 0;
    for (int p = DEFAULT_PORT; p <= DEFAULT_PORT + 50; p++) {
        serverAddr.sin_port = htons((unsigned short)p);
        if (bind(listenSock, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) != SOCKET_ERROR) {
            boundPort = p;
            break;
        }
    }

    if (boundPort == 0) {
        closesocket(listenSock);
        WSACleanup();
        SetEvent(g_hServerReady);
        return 1;
    }

    g_serverPort = boundPort;

    if (listen(listenSock, 64) == SOCKET_ERROR) {
        closesocket(listenSock);
        WSACleanup();
        SetEvent(g_hServerReady);
        return 1;
    }

    // Signal server is listening and port is set
    SetEvent(g_hServerReady);

    while (g_running) {
        SOCKET clientSock = accept(listenSock, NULL, NULL);
        if (clientSock == INVALID_SOCKET) {
            if (!g_running) break;
            Sleep(10);
            continue;
        }

        ClientParam* param = (ClientParam*)malloc(sizeof(ClientParam));
        if (param) {
            param->clientSock = clientSock;
            HANDLE hThread = CreateThread(NULL, 0, HandleClientThread, param, 0, NULL);
            if (hThread) {
                CloseHandle(hThread); // Let it run detached
            } else {
                closesocket(clientSock);
                free(param);
            }
        } else {
            closesocket(clientSock);
        }
    }

    closesocket(listenSock);
    WSACleanup();
    return 0;
}

// Find Edge or Chrome executable path
static BOOL FindBrowser(LPWSTR outPath, DWORD maxLen) {
    WCHAR path[MAX_PATH];
    
    // 1. Edge (standard on 100% of Windows 10 & 11)
    if (GetEnvironmentVariableW(L"ProgramFiles(x86)", path, MAX_PATH)) {
        wcscat_s(path, MAX_PATH, L"\\Microsoft\\Edge\\Application\\msedge.exe");
        if (FileExistsW(path)) { wcscpy_s(outPath, maxLen, path); return TRUE; }
    }
    if (GetEnvironmentVariableW(L"ProgramFiles", path, MAX_PATH)) {
        wcscat_s(path, MAX_PATH, L"\\Microsoft\\Edge\\Application\\msedge.exe");
        if (FileExistsW(path)) { wcscpy_s(outPath, maxLen, path); return TRUE; }
    }

    // 2. Google Chrome
    if (GetEnvironmentVariableW(L"ProgramFiles", path, MAX_PATH)) {
        wcscat_s(path, MAX_PATH, L"\\Google\\Chrome\\Application\\chrome.exe");
        if (FileExistsW(path)) { wcscpy_s(outPath, maxLen, path); return TRUE; }
    }
    if (GetEnvironmentVariableW(L"ProgramFiles(x86)", path, MAX_PATH)) {
        wcscat_s(path, MAX_PATH, L"\\Google\\Chrome\\Application\\chrome.exe");
        if (FileExistsW(path)) { wcscpy_s(outPath, maxLen, path); return TRUE; }
    }
    if (GetEnvironmentVariableW(L"LOCALAPPDATA", path, MAX_PATH)) {
        wcscat_s(path, MAX_PATH, L"\\Google\\Chrome\\Application\\chrome.exe");
        if (FileExistsW(path)) { wcscpy_s(outPath, maxLen, path); return TRUE; }
    }

    return FALSE;
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    (void)hInstance;
    (void)hPrevInstance;
    (void)lpCmdLine;
    (void)nCmdShow;

    // Get current directory of this executable
    GetModuleFileNameW(NULL, g_appDir, MAX_PATH);
    WCHAR* lastSlash = wcsrchr(g_appDir, L'\\');
    if (lastSlash != NULL) {
        *lastSlash = L'\0';
    }

    // Check if local app\index.html exists
    WCHAR localHtmlPath[MAX_PATH];
    swprintf_s(localHtmlPath, MAX_PATH, L"%s\\app\\index.html", g_appDir);
    BOOL hasLocalApp = FileExistsW(localHtmlPath);

    if (!hasLocalApp) {
        MessageBoxW(NULL,
            L"ATTENTION : Le dossier 'app' contenant les fichiers de la ville est introuvable !\n\n"
            L"Pour lancer IA TOWN :\n"
            L"1. Faites un clic-droit sur le fichier 'IA_TOWN_Beta_v1.0_Complet.zip'\n"
            L"2. Cliquez sur 'Extraire tout...'\n"
            L"3. Ouvrez le dossier extrait et lancez 'IA_TOWN_Beta_v1.0.exe' ou 'LANCER_IA_TOWN.cmd'.\n\n"
            L"Tous les fichiers doivent rester ensemble dans le même dossier extrait.",
            L"IA TOWN Beta v1.0 — Extraction requise",
            MB_OK | MB_ICONWARNING);
        return 1;
    }

    g_hServerReady = CreateEvent(NULL, TRUE, FALSE, NULL);
    HANDLE hServerThread = CreateThread(NULL, 0, HttpServerThread, NULL, 0, NULL);
    
    // Wait until server is bound and listening
    WaitForSingleObject(g_hServerReady, 3000);
    CloseHandle(g_hServerReady);

    WCHAR launchUrl[MAX_PATH];
    swprintf_s(launchUrl, MAX_PATH, L"http://127.0.0.1:%d/index.html", g_serverPort);

    // User data directory for clean, isolated session
    WCHAR localAppData[MAX_PATH];
    WCHAR profileDir[MAX_PATH];
    if (GetEnvironmentVariableW(L"LOCALAPPDATA", localAppData, MAX_PATH)) {
        swprintf_s(profileDir, MAX_PATH, L"%s\\IA_TOWN_Beta_Profile", localAppData);
    } else {
        swprintf_s(profileDir, MAX_PATH, L"%s\\profile_cache", g_appDir);
    }

    WCHAR browserPath[MAX_PATH];
    if (FindBrowser(browserPath, MAX_PATH)) {
        WCHAR cmdArgs[MAX_PATH * 3];
        swprintf_s(cmdArgs, MAX_PATH * 3,
            L"--app=\"%s\" --user-data-dir=\"%s\" --window-size=1600,920 --disable-features=Translate,OptimizationHints",
            launchUrl, profileDir);

        STARTUPINFOW si;
        PROCESS_INFORMATION pi;
        ZeroMemory(&si, sizeof(si));
        si.cb = sizeof(si);
        ZeroMemory(&pi, sizeof(pi));

        WCHAR fullCmd[MAX_PATH * 4];
        swprintf_s(fullCmd, MAX_PATH * 4, L"\"%s\" %s", browserPath, cmdArgs);

        if (CreateProcessW(NULL, fullCmd, NULL, NULL, FALSE, 0, NULL, g_appDir, &si, &pi)) {
            // Keep micro-server alive while the user has the application window open
            WaitForSingleObject(pi.hProcess, INFINITE);
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);

            g_running = FALSE;
            if (hServerThread) {
                WaitForSingleObject(hServerThread, 1000);
                CloseHandle(hServerThread);
            }
            return 0;
        }
    }

    // Fallback: Default system browser
    ShellExecuteW(NULL, L"open", launchUrl, NULL, g_appDir, SW_SHOWNORMAL);
    
    // Keep server alive in background for 60 seconds or until system closes
    if (hServerThread) {
        for (int i = 0; i < 300 && g_running; i++) {
            Sleep(1000);
        }
        g_running = FALSE;
        WaitForSingleObject(hServerThread, 1000);
        CloseHandle(hServerThread);
    }

    return 0;
}
