# Tamify Desktop Studio (தமிழ் & இந்திய மொழிகள் ஆவணக் காப்பகம்)
## 100% Offline Standalone Desktop Application & Windows .EXE

Tamify Desktop Studio is a standalone offline application allowing you to perform **PDF to Excel table extraction, PDF to Word (.docx) OCR conversion, PDF page editing, and Official Indian Languages conversion (Hindi, English, Malayalam, Kannada, Telugu, Bengali, Odia, Gujarati, Punjabi, Tamil)** completely offline on your local machine with zero cloud server dependencies.

---

### 📂 4 Clean Offline Interfaces

1. **📊 PDF to Excel (பிடிஎஃப் டு எக்செல்)**: Extract structured tables and financial registers from PDFs into `.xlsx` (native Excel) and `.csv` files.
2. **📄 PDF to Word (பிடிஎஃப் டு வேர்ட்)**: Offline OCR for scanned documents and image PDFs with direct export to formatted `.docx` (TAU-Marutham / Nirmala UI typography).
3. **📝 PDF Editor (பிடிஎஃப் எடிட்டர்)**: View PDF details, rotate pages, extract selected pages, and stamp official verification notices offline.
4. **🔤 Language & Font Converter (மொழி & எழுத்துரு மாற்றி)**: Transliterate across official Indian languages (Hindi, English, Malayalam, Kannada, Telugu, Bengali, Odia, Gujarati, Punjabi, Tamil) and convert legacy typewriter fonts (BAMINI, TAM, TAB, TSCII) to Unicode UTF-8.

---

### 📂 Suite Contents

| File | Purpose |
| :--- | :--- |
| `desktop_app.py` | Full 4-tab Graphical User Interface (GUI) Desktop Application (Tkinter/ttk). |
| `tamil_converter.py` | Standalone Python module for Indian Languages transliteration and BAMINI, TAM, TAB, TSCII $\leftrightarrow$ Unicode. |
| `tamil_ocr_engine.py` | Offline Multi-page PDF renderer, image binarization & Tesseract OCR runner. |
| `tamil_docx_exporter.py` | Document `.docx` exporter with TAU-Marutham/Nirmala UI font styling. |
| `requirements.txt` | Python library dependencies (openpyxl, pymupdf, python-docx, pytesseract, pillow, pyinstaller). |
| `build_exe.py` / `build_exe.bat` | One-click script to compile into a single `Tamify_Desktop_Studio.exe` for Windows. |

---

### 🚀 Quick Start (Running Locally)

#### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

*(Optional for OCR)*: Install Tesseract with Indian language data:
- **Windows**: Download Tesseract installer from UB-Mannheim (`tesseract-ocr-w64-setup.exe`) and check desired Indian scripts (Tamil, Hindi, Telugu, etc.).
- **Ubuntu/Debian**: `sudo apt install tesseract-ocr tesseract-ocr-tam tesseract-ocr-hin`
- **Mac**: `brew install tesseract tesseract-lang`

#### 2. Launch the Desktop GUI
```bash
python desktop_app.py
```

---

### 📦 Building a Single Standalone Windows `.exe` File

To create a single `.exe` file that runs on any Windows PC without requiring Python:

1. Double-click `build_exe.bat` (or run `python build_exe.py`).
2. Your standalone executable will be created inside the `dist/` folder:
   ```
   dist/Tamify_Desktop_Studio.exe
   ```
3. Double-click `Tamify_Desktop_Studio.exe` to run the application anywhere offline!
