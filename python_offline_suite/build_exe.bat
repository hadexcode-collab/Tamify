@echo off
title Build Tamil Offline OCR Executable
echo ====================================================
echo Tamil Offline OCR Studio - Automated EXE Builder
echo ====================================================
echo.
echo Step 1: Installing required dependencies...
pip install -r requirements.txt
echo.
echo Step 2: Building single-file Standalone .exe ...
python build_exe.py
echo.
pause
