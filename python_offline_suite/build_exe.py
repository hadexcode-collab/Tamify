"""
Automated PyInstaller Build Script for Tamil Archive OCR Desktop App
Packages all Python modules, fonts, dictionaries and GUI into a single standalone .exe
"""

import os
import subprocess
import sys

def build():
    print("==================================================")
    print("[BUILD] Building Standalone Tamil OCR Desktop Executable (.exe)")
    print("==================================================")

    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name=Tamify_Desktop_Studio",
        "--onefile",
        "--windowed",
        "--noconfirm",
        "--clean",
        "--add-data=tamil_converter.py;.",
        "--add-data=tamil_docx_exporter.py;.",
        "--add-data=tamil_ocr_engine.py;.",
        "desktop_app.py"
    ]

    print("Running PyInstaller with command:")
    print(" ".join(cmd))

    result = subprocess.run(cmd)

    if result.returncode == 0:
        print("\n==================================================")
        print("[OK] SUCCESS! Executable built successfully!")
        print("Output file location: dist/Tamify_Desktop_Studio.exe")
        print("You can distribute this single .exe file to any Windows computer.")
        print("==================================================")
    else:
        print("\n[ERROR] Build failed. Please ensure PyInstaller is installed (`pip install pyinstaller`).")

if __name__ == "__main__":
    build()
