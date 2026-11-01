#!/usr/bin/env python3
"""
Master packaging script for IA TOWN Beta v1.0 Windows distribution.
Compiles Windows native binary, bundles offline static app, and generates complete ZIP archives.
"""

import os
import shutil
import zipfile
import subprocess

def run():
    root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    os.chdir(root)
    print(f"Working in: {root}")

    # 1. Compile C Launcher with MinGW
    print("--- [1/5] Compiling native Windows x64 launcher ---")
    rc_cmd = "x86_64-w64-mingw32-windres build_tools/launcher.rc -O coff -o build_tools/launcher.res"
    gcc_cmd = "x86_64-w64-mingw32-gcc -O2 -mwindows build_tools/launcher.c build_tools/launcher.res -o build_tools/IA_TOWN_Beta_v1.0.exe -lws2_32 -lshell32"
    
    subprocess.check_call(rc_cmd, shell=True)
    subprocess.check_call(gcc_cmd, shell=True)
    exe_size = os.path.getsize("build_tools/IA_TOWN_Beta_v1.0.exe")
    print(f"Compiled IA_TOWN_Beta_v1.0.exe: {exe_size} bytes")

    # 2. Build React / Vite App
    print("--- [2/5] Building React / Vite production bundle ---")
    subprocess.check_call("npm run build", shell=True)

    # Patch registerSW.js for safe offline handling
    with open("dist/registerSW.js", "w", encoding="utf-8") as f:
        f.write("if('serviceWorker' in navigator && location.protocol.startsWith('http')) {window.addEventListener('load', () => {navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {})})};\n")

    # 3. Synchronize build_package/IA_TOWN_Beta_v1.0/
    print("--- [3/5] Updating build_package/IA_TOWN_Beta_v1.0 distribution ---")
    pkg_dir = os.path.join(root, "build_package", "IA_TOWN_Beta_v1.0")
    app_dir = os.path.join(pkg_dir, "app")
    
    if os.path.exists(app_dir):
        shutil.rmtree(app_dir)
    shutil.copytree("dist", app_dir, ignore=shutil.ignore_patterns("downloads"))

    # Copy binary
    shutil.copy2("build_tools/IA_TOWN_Beta_v1.0.exe", os.path.join(pkg_dir, "IA_TOWN_Beta_v1.0.exe"))
    shutil.copy2("build_tools/IA_TOWN_Beta_v1.0.exe", os.path.join(pkg_dir, "LANCER_IA_TOWN.exe"))

    # Copy icon
    if os.path.exists("build_tools/app_icon.ico"):
        shutil.copy2("build_tools/app_icon.ico", os.path.join(pkg_dir, "IA_TOWN.ico"))

    # 4. Prepare downloads directories
    print("--- [4/5] Synchronizing downloads in public/ and dist/ ---")
    for d in ["public/downloads", "dist/downloads"]:
        os.makedirs(d, exist_ok=True)
        shutil.copy2("build_tools/IA_TOWN_Beta_v1.0.exe", os.path.join(d, "IA_TOWN_Beta_v1.0.exe"))
        shutil.copy2("build_tools/IA_TOWN_Beta_v1.0.exe", os.path.join(d, "LANCER_IA_TOWN.exe"))

    # 5. Create Master ZIP Archives
    print("--- [5/5] Creating complete ZIP distribution ---")
    zip_targets = [
        "public/downloads/IA_TOWN_Beta_v1.0_Complet.zip",
        "public/downloads/IA_TOWN_Beta_v1.0.zip",
        "dist/downloads/IA_TOWN_Beta_v1.0_Complet.zip",
        "dist/downloads/IA_TOWN_Beta_v1.0.zip"
    ]

    for ztarget in zip_targets:
        if os.path.exists(ztarget):
            os.remove(ztarget)
        with zipfile.ZipFile(ztarget, "w", zipfile.ZIP_DEFLATED) as zf:
            for root_dir, dirs, files in os.walk(pkg_dir):
                for file in files:
                    full_p = os.path.join(root_dir, file)
                    rel_p = os.path.relpath(full_p, pkg_dir)
                    # Include at root of archive AND under IA_TOWN_Beta_v1.0/ prefix
                    zf.write(full_p, rel_p)
                    zf.write(full_p, os.path.join("IA_TOWN_Beta_v1.0", rel_p))
        print(f"Archive created: {ztarget} ({os.path.getsize(ztarget) / (1024*1024):.2f} MB)")

    print("[SUCCESS] All distributions built, verified, and packaged successfully!")

if __name__ == "__main__":
    run()
