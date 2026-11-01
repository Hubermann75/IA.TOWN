#!/usr/bin/env python3
"""
PE32+ (x86_64) Native Windows GUI Executable Builder
Generates a valid, signed-compatible, zero-dependency Windows PE .exe launcher
that invokes ShellExecuteA to launch IA TOWN Beta v1.0 in GUI mode.
"""

import struct
import os
import sys

def build_pe_executable(output_path, url_target):
    # Alignment helpers
    def align_up(val, align):
        return (val + align - 1) & ~(align - 1)

    FILE_ALIGN = 0x200
    SEC_ALIGN = 0x1000
    IMAGE_BASE = 0x140000000

    # Section virtual addresses:
    # Headers: RVA 0x0, FileOffset 0x0, Size 0x400
    # .text:   RVA 0x1000, FileOffset 0x400, Size 0x200
    # .rdata:  RVA 0x2000, FileOffset 0x600, Size 0x600
    TEXT_RVA = 0x1000
    RDATA_RVA = 0x2000

    # In .rdata, we lay out:
    # 0x000: Import Directory Table (IDT) - 3 descriptors (kernel32, shell32, null terminator)
    # 0x040: IAT for kernel32 (1 entry: ExitProcess, + null)
    # 0x050: IAT for shell32 (1 entry: ShellExecuteA, + null)
    # 0x060: ILT for kernel32 (1 entry: ExitProcess, + null)
    # 0x070: ILT for shell32 (1 entry: ShellExecuteA, + null)
    # 0x080: Hint/Name "ExitProcess"
    # 0x0A0: Hint/Name "ShellExecuteA"
    # 0x0C0: DLL Name "kernel32.dll"
    # 0x0D0: DLL Name "shell32.dll"
    # 0x0E0: String "open"
    # 0x100: String URL (target URL)

    IDT_OFFSET = 0x000
    IAT_K32_OFFSET = 0x040
    IAT_S32_OFFSET = 0x050
    ILT_K32_OFFSET = 0x060
    ILT_S32_OFFSET = 0x070
    HINT_EXITPROCESS_OFFSET = 0x080
    HINT_SHELLEXECUTE_OFFSET = 0x0A0
    DLL_K32_OFFSET = 0x0D0
    DLL_S32_OFFSET = 0x0E0
    STR_OPEN_OFFSET = 0x0F0
    STR_URL_OFFSET = 0x100

    # Build .rdata content
    rdata = bytearray(0x600)

    # 1. Hint / Name Table
    # ExitProcess: Hint (2 bytes: 0) + Name ("ExitProcess\0")
    struct.pack_into("<H", rdata, HINT_EXITPROCESS_OFFSET, 0)
    name_exit = b"ExitProcess\x00"
    rdata[HINT_EXITPROCESS_OFFSET + 2 : HINT_EXITPROCESS_OFFSET + 2 + len(name_exit)] = name_exit

    # ShellExecuteA: Hint (2 bytes: 0) + Name ("ShellExecuteA\0")
    struct.pack_into("<H", rdata, HINT_SHELLEXECUTE_OFFSET, 0)
    name_sh = b"ShellExecuteA\x00"
    rdata[HINT_SHELLEXECUTE_OFFSET + 2 : HINT_SHELLEXECUTE_OFFSET + 2 + len(name_sh)] = name_sh

    # DLL Names
    dll_k32 = b"kernel32.dll\x00"
    rdata[DLL_K32_OFFSET : DLL_K32_OFFSET + len(dll_k32)] = dll_k32
    dll_s32 = b"shell32.dll\x00"
    rdata[DLL_S32_OFFSET : DLL_S32_OFFSET + len(dll_s32)] = dll_s32

    # Strings
    str_open = b"open\x00"
    rdata[STR_OPEN_OFFSET : STR_OPEN_OFFSET + len(str_open)] = str_open
    url_bytes = url_target.encode('utf-8') + b"\x00"
    rdata[STR_URL_OFFSET : STR_URL_OFFSET + len(url_bytes)] = url_bytes

    # 2. IAT & ILT
    # kernel32 (ExitProcess)
    k32_hint_rva = RDATA_RVA + HINT_EXITPROCESS_OFFSET
    struct.pack_into("<Q", rdata, IAT_K32_OFFSET, k32_hint_rva)
    struct.pack_into("<Q", rdata, IAT_K32_OFFSET + 8, 0) # null terminator
    struct.pack_into("<Q", rdata, ILT_K32_OFFSET, k32_hint_rva)
    struct.pack_into("<Q", rdata, ILT_K32_OFFSET + 8, 0)

    # shell32 (ShellExecuteA)
    s32_hint_rva = RDATA_RVA + HINT_SHELLEXECUTE_OFFSET
    struct.pack_into("<Q", rdata, IAT_S32_OFFSET, s32_hint_rva)
    struct.pack_into("<Q", rdata, IAT_S32_OFFSET + 8, 0) # null terminator
    struct.pack_into("<Q", rdata, ILT_S32_OFFSET, s32_hint_rva)
    struct.pack_into("<Q", rdata, ILT_S32_OFFSET + 8, 0)

    # 3. IDT (Import Directory Table)
    # Entry 0: kernel32.dll
    # struct IMAGE_IMPORT_DESCRIPTOR:
    # DWORD OriginalFirstThunk (ILT RVA)
    # DWORD TimeDateStamp
    # DWORD ForwarderChain
    # DWORD Name (RVA)
    # DWORD FirstThunk (IAT RVA)
    struct.pack_into("<IIIII", rdata, IDT_OFFSET,
                     RDATA_RVA + ILT_K32_OFFSET,
                     0, 0,
                     RDATA_RVA + DLL_K32_OFFSET,
                     RDATA_RVA + IAT_K32_OFFSET)

    # Entry 1: shell32.dll
    struct.pack_into("<IIIII", rdata, IDT_OFFSET + 20,
                     RDATA_RVA + ILT_S32_OFFSET,
                     0, 0,
                     RDATA_RVA + DLL_S32_OFFSET,
                     RDATA_RVA + IAT_S32_OFFSET)

    # Entry 2: Null terminator (20 bytes zero)

    # 4. Assembly Machine Code for .text
    # x86_64 Calling Convention:
    # RCX = hwnd (0)
    # RDX = lpOperation ("open") -> RIP-relative
    # R8  = lpFile (url)        -> RIP-relative
    # R9  = lpParameters (0)
    # [RSP+32] = lpDirectory (0)
    # [RSP+40] = nShowCmd (SW_SHOWNORMAL = 1)
    #
    # Code layout (starts at offset 0 in .text, RVA 0x1000):
    # 48 83 EC 38           sub rsp, 0x38 (56 bytes: 32 shadow + 16 stack args + 8 alignment)
    # 48 31 C9              xor rcx, rcx  (hwnd = 0)
    # 48 8D 15 [disp32]     lea rdx, [rip + disp_to_str_open]
    # 4C 8D 05 [disp32]     lea r8,  [rip + disp_to_str_url]
    # 4D 31 C9              xor r9, r9   (lpParameters = 0)
    # 48 C7 44 24 20 00 00 00 00  mov qword ptr [rsp+0x20], 0 (lpDirectory = 0)
    # C7 44 24 28 01 00 00 00     mov dword ptr [rsp+0x28], 1 (nShowCmd = 1)
    # FF 15 [disp32]        call qword ptr [rip + disp_to_iat_s32]
    # 31 C9                 xor ecx, ecx (uExitCode = 0)
    # FF 15 [disp32]        call qword ptr [rip + disp_to_iat_k32]
    # 48 83 C4 38           add rsp, 0x38
    # C3                    ret

    text = bytearray(0x200)
    code = bytearray()

    # sub rsp, 0x38
    code.extend(b"\x48\x83\xEC\x38")
    # xor rcx, rcx
    code.extend(b"\x48\x31\xC9")

    # lea rdx, [rip + disp_open]
    # instruction length = 7 bytes. RIP after instruction = TEXT_RVA + len(code) + 7
    rip_after = TEXT_RVA + len(code) + 7
    disp_open = (RDATA_RVA + STR_OPEN_OFFSET) - rip_after
    code.extend(b"\x48\x8D\x15" + struct.pack("<i", disp_open))

    # lea r8, [rip + disp_url]
    rip_after = TEXT_RVA + len(code) + 7
    disp_url = (RDATA_RVA + STR_URL_OFFSET) - rip_after
    code.extend(b"\x4C\x8D\x05" + struct.pack("<i", disp_url))

    # xor r9, r9
    code.extend(b"\x4D\x31\xC9")

    # mov qword ptr [rsp+0x20], 0
    code.extend(b"\x48\xC7\x44\x24\x20\x00\x00\x00\x00")

    # mov dword ptr [rsp+0x28], 1
    code.extend(b"\xC7\x44\x24\x28\x01\x00\x00\x00")

    # call [rip + disp_iat_s32] (ShellExecuteA)
    # FF 15 disp32 -> 6 bytes
    rip_after = TEXT_RVA + len(code) + 6
    disp_iat_s32 = (RDATA_RVA + IAT_S32_OFFSET) - rip_after
    code.extend(b"\xFF\x15" + struct.pack("<i", disp_iat_s32))

    # xor ecx, ecx
    code.extend(b"\x31\xC9")

    # call [rip + disp_iat_k32] (ExitProcess)
    rip_after = TEXT_RVA + len(code) + 6
    disp_iat_k32 = (RDATA_RVA + IAT_K32_OFFSET) - rip_after
    code.extend(b"\xFF\x15" + struct.pack("<i", disp_iat_k32))

    # add rsp, 0x38; ret
    code.extend(b"\x48\x83\xC4\x38\xC3")

    text[0 : len(code)] = code

    # 5. DOS Header & DOS Stub (0x80 bytes total)
    dos_header = bytearray(0x80)
    # e_magic = 'MZ'
    dos_header[0:2] = b"MZ"
    # e_lfanew at offset 0x3C = 0x80
    struct.pack_into("<I", dos_header, 0x3C, 0x80)
    # DOS stub string
    stub = b"\x0E\x1F\xBA\x0E\x00\xB4\x09\xCD\x21\xB8\x01\x4C\xCD\x21This program cannot be run in DOS mode.\r\r\n$\x00\x00\x00\x00\x00\x00\x00"
    dos_header[0x40 : 0x40 + len(stub)] = stub

    # 6. PE Headers (starts at 0x80)
    # Signature: 'PE\0\0' (4 bytes)
    pe_sig = b"PE\x00\x00"

    # COFF File Header (20 bytes)
    # Machine = 0x8664 (AMD64)
    # NumberOfSections = 2 (.text, .rdata)
    # TimeDateStamp = 0x6724E600
    # PointerToSymbolTable = 0
    # NumberOfSymbols = 0
    # SizeOfOptionalHeader = 240 (0xF0)
    # Characteristics = 0x0022 (EXECUTABLE_IMAGE | LARGE_ADDRESS_AWARE)
    coff_header = struct.pack("<HHIIIHH",
                              0x8664,
                              2,
                              0x6724E600,
                              0, 0,
                              240,
                              0x0022)

    # Optional Header (PE32+ / x64, 240 bytes)
    # Magic = 0x020B
    # MajorLinker = 14, MinorLinker = 0
    # SizeOfCode = len(text)
    # SizeOfInitializedData = len(rdata)
    # SizeOfUninitializedData = 0
    # AddressOfEntryPoint = TEXT_RVA (0x1000)
    # BaseOfCode = TEXT_RVA (0x1000)
    # ImageBase = 0x140000000
    # SectionAlignment = 0x1000
    # FileAlignment = 0x200
    # MajorOS = 6, MinorOS = 0
    # MajorImage = 1, MinorImage = 0
    # MajorSubsystem = 6, MinorSubsystem = 0
    # Win32VersionValue = 0
    # SizeOfImage = 0x3000
    # SizeOfHeaders = 0x400
    # CheckSum = 0
    # Subsystem = 2 (IMAGE_SUBSYSTEM_WINDOWS_GUI -> zero console window!)
    # DllCharacteristics = 0x8160 (DYNAMIC_BASE | NX_COMPAT | TERMINAL_SERVER_AWARE)
    # SizeOfStackReserve = 0x100000, SizeOfStackCommit = 0x1000
    # SizeOfHeapReserve = 0x100000, SizeOfHeapCommit = 0x1000
    # LoaderFlags = 0
    # NumberOfRvaAndSizes = 16
    opt_standard = struct.pack("<HBBIIIIIQIIHHHHHHIIIIHHQQQQII",
                               0x020B,  # Magic PE32+
                               14, 0,   # Linker
                               len(text),
                               len(rdata),
                               0,
                               TEXT_RVA,
                               TEXT_RVA,
                               IMAGE_BASE,
                               SEC_ALIGN,
                               FILE_ALIGN,
                               6, 0,    # OS Version
                               1, 0,    # Image Version
                               6, 0,    # Subsystem Version
                               0,       # Win32Version
                               0x3000,  # SizeOfImage
                               0x400,   # SizeOfHeaders
                               0,       # Checksum
                               2,       # Subsystem: WINDOWS_GUI
                               0x8160,  # DllCharacteristics
                               0x100000, 0x1000, # Stack
                               0x100000, 0x1000, # Heap
                               0,       # LoaderFlags
                               16)      # DataDirs

    # Data Directories (16 * 8 = 128 bytes)
    # Index 1: Import Directory (RVA = RDATA_RVA + IDT_OFFSET, Size = 3 * 20 = 60)
    # Index 12: IAT Directory (RVA = RDATA_RVA + IAT_K32_OFFSET, Size = 32)
    data_dirs = bytearray(128)
    # Import Directory (index 1)
    struct.pack_into("<II", data_dirs, 1 * 8, RDATA_RVA + IDT_OFFSET, 60)
    # IAT Directory (index 12)
    struct.pack_into("<II", data_dirs, 12 * 8, RDATA_RVA + IAT_K32_OFFSET, 32)

    optional_header = opt_standard + data_dirs

    # 7. Section Headers (2 * 40 bytes)
    # .text
    sec_text = struct.pack("<8sIIIIIIHHI",
                           b".text\x00\x00\x00",
                           len(text),       # VirtualSize
                           TEXT_RVA,        # VirtualAddress
                           0x200,           # SizeOfRawData
                           0x400,           # PointerToRawData
                           0, 0, 0, 0,
                           0x60000020)      # CODE | EXECUTE | READ

    # .rdata
    sec_rdata = struct.pack("<8sIIIIIIHHI",
                            b".rdata\x00\x00",
                            len(rdata),      # VirtualSize
                            RDATA_RVA,       # VirtualAddress
                            0x600,           # SizeOfRawData
                            0x600,           # PointerToRawData
                            0, 0, 0, 0,
                            0x40000040)      # INITIALIZED_DATA | READ

    # Assemble Headers block (padded to 0x400)
    headers = bytearray(0x400)
    h_data = dos_header + pe_sig + coff_header + optional_header + sec_text + sec_rdata
    headers[0 : len(h_data)] = h_data

    # Final PE binary = headers (0x400) + text (0x200) + rdata (0x600) = 0xC00 (3072 bytes)
    pe_binary = headers + text + rdata

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(pe_binary)

    print(f"Generated Windows PE32+ .exe: {output_path} ({len(pe_binary)} bytes)")
    return len(pe_binary)

if __name__ == "__main__":
    url = "https://ais-dev-ksdeoxi4xdoqllzss2tskc-47512140463.europe-west2.run.app"
    out = "public/downloads/IA_TOWN_Beta_v1.0.exe"
    build_pe_executable(out, url)
    # Also create desktop setup variant
    build_pe_executable("public/downloads/IA_TOWN_Setup.exe", url)
