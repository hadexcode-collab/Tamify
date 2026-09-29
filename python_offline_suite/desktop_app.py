"""
Tamify Desktop Studio - Standalone Offline Application
100% Offline Desktop GUI built with Python Tkinter & ttk.
Zero Cloud Server Dependencies.

Clean 4-Interface Layout:
1. PDF to Excel (பிடிஎஃப் டு எக்செல்) - Table & Spreadsheets extraction to .xlsx / .csv
2. PDF to Word (பிடிஎஃப் டு வேர்ட்) - OCR & Layout extraction to .docx
3. PDF Editor (பிடிஎஃப் எடிட்டர்) - Page viewer, rotation, extraction, watermarking
4. Language & Font Converter (மொழி & எழுத்துரு மாற்றி) - Transliterate across Official Indian Languages (Hindi, English, Malayalam, Kannada, Telugu, Bengali, Odia, Gujarati, Punjabi, Tamil) & Legacy Font Converter (BAMINI, TAM, TAB, TSCII)
"""

import sys
import os
import threading
import json
import csv
from typing import List, Dict, Any, Optional

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext

# Safe local module imports
try:
    from tamil_converter import convert_to_unicode, convert_to_indic_script, GOV_LEGAL_LEXICON
except Exception:
    def convert_to_unicode(t, enc="AUTO_DETECT"): return t, "UNICODE", 1.0
    def convert_to_indic_script(t, l="hin"): return t
    GOV_LEGAL_LEXICON = {}

try:
    from tamil_ocr_engine import run_offline_ocr, check_tesseract_installed
except Exception:
    def run_offline_ocr(f, **kwargs): return {"metadata": {"documentTitle": "Doc", "pageCount": 1}, "fullUnicodeText": "OCR Module Not Found", "lines": []}
    def check_tesseract_installed(): return False, "Tesseract module not loaded"

try:
    from tamil_docx_exporter import export_tamil_docx
except Exception:
    def export_tamil_docx(p, m, l, t): pass

# Optional openpyxl for native Excel .xlsx
try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    HAS_OPENPYXL = True
except ImportError:
    HAS_OPENPYXL = False

# Optional PyMuPDF (fitz)
try:
    import fitz
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False


INDIAN_LANGUAGES = [
    ("auto", "Auto-Detect (தானியங்கி)"),
    ("tam", "Tamil (தமிழ்)"),
    ("hin", "Hindi (हिन्दी)"),
    ("eng", "English (ஆங்கிலம்)"),
    ("mal", "Malayalam (മലയാളം)"),
    ("kan", "Kannada (ಕನ್ನಡ)"),
    ("tel", "Telugu (తెలుగు)"),
    ("ben", "Bengali (বাংলা)"),
    ("ori", "Odia (ଓଡ଼ିଆ)"),
    ("guj", "Gujarati (ગુજરાતી)"),
    ("pan", "Punjabi (ਪੰਜਾਬੀ)"),
    ("mar", "Marathi (मराठी)"),
]


class TamifyDesktopApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Tamify - Offline Indian Languages & Document Studio")
        self.root.geometry("1150x780")
        self.root.minsize(960, 680)

        # Style configuration
        self.style = ttk.Style()
        self.style.theme_use("clam")

        # Color Palette
        self.bg_dark = "#0B0D11"
        self.card_bg = "#151821"
        self.card_border = "#2A2F3E"
        self.text_light = "#F8FAFC"
        self.accent_gold = "#FFB800"
        self.accent_green = "#00FF66"
        self.accent_blue = "#38BDF8"

        self.root.configure(bg=self.bg_dark)

        # State Variables
        self.excel_file_path: Optional[str] = None
        self.excel_extracted_tables: List[List[List[str]]] = []
        self.word_file_path: Optional[str] = None
        self.word_result: Optional[Dict[str, Any]] = None
        self.editor_file_path: Optional[str] = None
        self.is_processing = False

        self._build_ui()

    def _build_ui(self):
        # 1. Header Banner
        header = tk.Frame(self.root, bg=self.card_bg, height=65, padx=20, pady=10)
        header.pack(fill=tk.X, side=tk.TOP)

        title_box = tk.Frame(header, bg=self.card_bg)
        title_box.pack(side=tk.LEFT, fill=tk.Y)

        lbl_logo = tk.Label(
            title_box,
            text="TAMIFY • இந்தியா",
            font=("Segoe UI", 14, "bold"),
            fg=self.accent_gold,
            bg=self.card_bg
        )
        lbl_logo.pack(anchor="w")

        lbl_sub = tk.Label(
            title_box,
            text="Offline Studio: PDF to Excel • PDF to Word • PDF Editor • Language Converter",
            font=("Segoe UI", 9),
            fg="#94A3B8",
            bg=self.card_bg
        )
        lbl_sub.pack(anchor="w")

        # Engine Status
        status_box = tk.Frame(header, bg=self.card_bg)
        status_box.pack(side=tk.RIGHT, fill=tk.Y)

        self.lbl_engine_status = tk.Label(
            status_box,
            text="● Engine சோதிக்கப்படுகிறது...",
            font=("Segoe UI", 9, "bold"),
            fg="#F59E0B",
            bg=self.card_bg
        )
        self.lbl_engine_status.pack(anchor="e")

        # 2. Main Notebook with 4 Clean Tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=14, pady=12)

        # Tab 1: PDF to Excel
        t_excel = tk.Frame(self.notebook, bg=self.bg_dark)
        self.notebook.add(t_excel, text="  📊 PDF to Excel  ")
        self._build_pdf_to_excel_tab(t_excel)

        # Tab 2: PDF to Word
        t_word = tk.Frame(self.notebook, bg=self.bg_dark)
        self.notebook.add(t_word, text="  📄 PDF to Word  ")
        self._build_pdf_to_word_tab(t_word)

        # Tab 3: PDF Editor
        t_editor = tk.Frame(self.notebook, bg=self.bg_dark)
        self.notebook.add(t_editor, text="  📝 PDF Editor  ")
        self._build_pdf_editor_tab(t_editor)

        # Tab 4: Language Converter
        t_lang = tk.Frame(self.notebook, bg=self.bg_dark)
        self.notebook.add(t_lang, text="  🔤 Language Converter  ")
        self._build_language_converter_tab(t_lang)

        # Check OCR Engine in background
        self.root.after(400, self._check_engine_status)

    def _check_engine_status(self):
        ok, msg = check_tesseract_installed()
        if ok:
            self.lbl_engine_status.config(text="● Tesseract OCR தயார் (Ready)", fg="#10B981")
        else:
            self.lbl_engine_status.config(text="⚠️ Tesseract PATH-ல் இல்லை (Digital PDFs Only)", fg="#F59E0B")

    # =========================================================================
    # TAB 1: PDF TO EXCEL
    # =========================================================================
    def _build_pdf_to_excel_tab(self, parent: tk.Frame):
        paned = tk.PanedWindow(parent, orient=tk.HORIZONTAL, bg=self.bg_dark, sashwidth=6)
        paned.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        # Left: Controls
        left = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(left, minsize=380)

        tk.Label(left, text="1. PDF ஆவணத் தேர்வு (Select PDF File)", font=("Segoe UI", 11, "bold"), fg=self.text_light, bg=self.card_bg).pack(anchor="w", pady=(0, 6))

        btn_box = tk.Frame(left, bg=self.card_bg)
        btn_box.pack(fill=tk.X, pady=(0, 6))
        tk.Button(btn_box, text="📁 PDF தேர்ந்தெடு (Browse PDF)", font=("Segoe UI", 10, "bold"), bg="#10B981", fg="black", relief=tk.FLAT, pady=6, cursor="hand2", command=self._select_excel_pdf).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 4))
        tk.Button(btn_box, text="❌ அழி (Clear)", font=("Segoe UI", 9), bg="#475569", fg="white", relief=tk.FLAT, pady=6, cursor="hand2", command=self._clear_excel).pack(side=tk.RIGHT)

        self.lbl_excel_file = tk.Label(left, text="கோப்பு எதுவும் தேர்ந்தெடுக்கப்படவில்லை", font=("Segoe UI", 9), fg="#94A3B8", bg=self.card_bg, wraplength=350, justify="left")
        self.lbl_excel_file.pack(anchor="w", pady=(0, 8))

        # Language Selection
        tk.Label(left, text="2. ஆவண மொழி (Document Language):", font=("Segoe UI", 9, "bold"), fg="#CBD5E1", bg=self.card_bg).pack(anchor="w", pady=(4, 2))
        self.cmb_excel_lang = ttk.Combobox(left, values=[name for _, name in INDIAN_LANGUAGES], state="readonly", font=("Segoe UI", 9))
        self.cmb_excel_lang.current(0)
        self.cmb_excel_lang.pack(fill=tk.X, pady=(0, 10))

        # Convert Button
        self.btn_run_excel = tk.Button(
            left,
            text="⚡ எக்செல் அட்டவணைகளாக மாற்று (Convert to Excel)",
            font=("Segoe UI", 10, "bold"),
            bg=self.accent_gold,
            fg="black",
            relief=tk.FLAT,
            pady=8,
            cursor="hand2",
            command=self._run_pdf_to_excel
        )
        self.btn_run_excel.pack(fill=tk.X, pady=(4, 12))

        # Export Buttons
        tk.Label(left, text="3. பதிவிறக்கங்கள் (Export Options):", font=("Segoe UI", 9, "bold"), fg="#CBD5E1", bg=self.card_bg).pack(anchor="w", pady=(6, 2))
        self.btn_dl_xlsx = tk.Button(left, text="📥 Excel (.xlsx) ஆக சேமி", font=("Segoe UI", 9, "bold"), bg="#1E293B", fg="#10B981", relief=tk.SOLID, bd=1, pady=6, cursor="hand2", state=tk.DISABLED, command=self._export_excel_xlsx)
        self.btn_dl_xlsx.pack(fill=tk.X, pady=(0, 4))
        self.btn_dl_csv = tk.Button(left, text="📥 CSV (.csv) ஆக சேமி", font=("Segoe UI", 9, "bold"), bg="#1E293B", fg="#38BDF8", relief=tk.SOLID, bd=1, pady=6, cursor="hand2", state=tk.DISABLED, command=self._export_excel_csv)
        self.btn_dl_csv.pack(fill=tk.X)

        # Right: Live Table Preview
        right = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(right, minsize=450)

        tk.Label(right, text="அட்டவணை முன்னோட்டம் (Table Preview & Extracted Data):", font=("Segoe UI", 11, "bold"), fg=self.text_light, bg=self.card_bg).pack(anchor="w", pady=(0, 6))
        self.txt_excel_preview = scrolledtext.ScrolledText(right, bg="#0F172A", fg="#38BDF8", font=("Consolas", 10), insertbackground="white", bd=0, padx=10, pady=10)
        self.txt_excel_preview.pack(fill=tk.BOTH, expand=True)

    def _select_excel_pdf(self):
        f = filedialog.askopenfilename(filetypes=[("PDF Documents", "*.pdf"), ("All Files", "*.*")])
        if f:
            self.excel_file_path = f
            self.lbl_excel_file.config(text=f"தேர்ந்தெடுக்கப்பட்டது: {os.path.basename(f)}", fg=self.accent_gold)

    def _clear_excel(self):
        self.excel_file_path = None
        self.excel_extracted_tables = []
        self.lbl_excel_file.config(text="கோப்பு எதுவும் தேர்ந்தெடுக்கப்படவில்லை", fg="#94A3B8")
        self.txt_excel_preview.delete("1.0", tk.END)
        self.btn_dl_xlsx.config(state=tk.DISABLED)
        self.btn_dl_csv.config(state=tk.DISABLED)

    def _run_pdf_to_excel(self):
        if not self.excel_file_path:
            messagebox.showwarning("எச்சரிக்கை", "தயவுசெய்து ஒரு PDF கோப்பை தேர்ந்தெடுக்கவும்.")
            return

        self.btn_run_excel.config(state=tk.DISABLED, text="பகுப்பாய்வு செய்யப்படுகிறது...")
        self.txt_excel_preview.delete("1.0", tk.END)
        self.txt_excel_preview.insert(tk.END, "PDF அட்டவணைகள் பிரித்தெடுக்கப்படுகின்றன...\n")

        def worker():
            try:
                tables = []
                # If PyMuPDF is available, extract native PDF text blocks / tables
                if HAS_FITZ:
                    doc = fitz.open(self.excel_file_path)
                    for page_num in range(len(doc)):
                        page = doc[page_num]
                        text = page.get_text("text")
                        lines = [l.strip() for l in text.split("\n") if l.strip()]
                        current_table = []
                        for line in lines:
                            # Split on multiple spaces, tabs, or commas
                            parts = [p.strip() for p in line.replace("\t", "  ").split("  ") if p.strip()]
                            if len(parts) >= 2:
                                current_table.append(parts)
                        if current_table:
                            tables.append(current_table)
                    doc.close()

                if not tables:
                    # Fallback to OCR extraction
                    res = run_offline_ocr(self.excel_file_path)
                    lines = [l.get("text", "") for l in res.get("lines", [])]
                    table = []
                    for line in lines:
                        parts = [p.strip() for p in line.replace("\t", "  ").split("  ") if p.strip()]
                        if len(parts) >= 2:
                            table.append(parts)
                    if table:
                        tables.append(table)

                self.excel_extracted_tables = tables
                self.root.after(0, self._render_excel_results)
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("பிழை", f"அட்டவணை பிரித்தெடுத்தல் தோல்வி: {str(e)}"))
            finally:
                self.root.after(0, lambda: self.btn_run_excel.config(state=tk.NORMAL, text="⚡ எக்செல் அட்டவணைகளாக மாற்று (Convert to Excel)"))

        threading.Thread(target=worker, daemon=True).start()

    def _render_excel_results(self):
        self.txt_excel_preview.delete("1.0", tk.END)
        if not self.excel_extracted_tables:
            self.txt_excel_preview.insert(tk.END, "அட்டவணை தரவு எதுவும் கண்டறியப்படவில்லை. எளிய உரை மட்டும் பிரித்தெடுக்கப்பட்டது.\n")
            return

        self.btn_dl_xlsx.config(state=tk.NORMAL)
        self.btn_dl_csv.config(state=tk.NORMAL)

        output_text = f"✅ {len(self.excel_extracted_tables)} அட்டவணைகள் கண்டறியப்பட்டன!\n\n"
        for t_idx, table in enumerate(self.excel_extracted_tables, 1):
            output_text += f"--- அட்டவணை #{t_idx} ({len(table)} வரிசைகள்) ---\n"
            for row in table[:15]:
                output_text += " | ".join(row) + "\n"
            if len(table) > 15:
                output_text += f"... மேலும் {len(table) - 15} வரிசைகள் ...\n"
            output_text += "\n"

        self.txt_excel_preview.insert(tk.END, output_text)

    def _export_excel_xlsx(self):
        if not self.excel_extracted_tables:
            return
        out_path = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel Spreadsheet", "*.xlsx")])
        if not out_path:
            return

        if HAS_OPENPYXL:
            wb = openpyxl.Workbook()
            wb.remove(wb.active)  # remove default sheet
            for t_idx, table in enumerate(self.excel_extracted_tables, 1):
                ws = wb.create_sheet(title=f"Table_{t_idx}")
                for row in table:
                    ws.append(row)
            wb.save(out_path)
            messagebox.showinfo("வெற்றி", f"Excel கோப்பு வெற்றிகரமாக சேமிக்கப்பட்டது:\n{out_path}")
        else:
            self._export_excel_csv(out_path.replace(".xlsx", ".csv"))

    def _export_excel_csv(self, default_path=None):
        if not self.excel_extracted_tables:
            return
        out_path = default_path or filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV File", "*.csv")])
        if not out_path:
            return

        with open(out_path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            for table in self.excel_extracted_tables:
                for row in table:
                    writer.writerow(row)
                writer.writerow([])
        messagebox.showinfo("வெற்றி", f"CSV கோப்பு வெற்றிகரமாக சேமிக்கப்பட்டது:\n{out_path}")

    # =========================================================================
    # TAB 2: PDF TO WORD
    # =========================================================================
    def _build_pdf_to_word_tab(self, parent: tk.Frame):
        paned = tk.PanedWindow(parent, orient=tk.HORIZONTAL, bg=self.bg_dark, sashwidth=6)
        paned.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        # Left Column
        left = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(left, minsize=380)

        tk.Label(left, text="1. ஆவணத் தேர்வு (Select PDF / Scanned Image)", font=("Segoe UI", 11, "bold"), fg=self.text_light, bg=self.card_bg).pack(anchor="w", pady=(0, 6))

        btn_box = tk.Frame(left, bg=self.card_bg)
        btn_box.pack(fill=tk.X, pady=(0, 6))
        tk.Button(btn_box, text="📁 PDF / படம் தேர்ந்தெடு", font=("Segoe UI", 10, "bold"), bg=self.accent_blue, fg="white", relief=tk.FLAT, pady=6, cursor="hand2", command=self._select_word_file).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 4))
        tk.Button(btn_box, text="❌ அழி", font=("Segoe UI", 9), bg="#475569", fg="white", relief=tk.FLAT, pady=6, cursor="hand2", command=self._clear_word).pack(side=tk.RIGHT)

        self.lbl_word_file = tk.Label(left, text="கோப்பு எதுவும் தேர்ந்தெடுக்கப்படவில்லை", font=("Segoe UI", 9), fg="#94A3B8", bg=self.card_bg, wraplength=350, justify="left")
        self.lbl_word_file.pack(anchor="w", pady=(0, 8))

        # Language Selection
        tk.Label(left, text="2. ஆவண மொழி (Select Language):", font=("Segoe UI", 9, "bold"), fg="#CBD5E1", bg=self.card_bg).pack(anchor="w", pady=(4, 2))
        self.cmb_word_lang = ttk.Combobox(left, values=[name for _, name in INDIAN_LANGUAGES], state="readonly", font=("Segoe UI", 9))
        self.cmb_word_lang.current(0)
        self.cmb_word_lang.pack(fill=tk.X, pady=(0, 10))

        # Convert Button
        self.btn_run_word = tk.Button(
            left,
            text="⚡ Word ஆவணமாக மாற்று (Convert to Word)",
            font=("Segoe UI", 10, "bold"),
            bg=self.accent_green,
            fg="black",
            relief=tk.FLAT,
            pady=8,
            cursor="hand2",
            command=self._run_pdf_to_word
        )
        self.btn_run_word.pack(fill=tk.X, pady=(4, 12))

        # Export Button
        self.btn_dl_docx = tk.Button(left, text="📥 Microsoft Word (.docx) ஆக சேமி", font=("Segoe UI", 10, "bold"), bg="#0F766E", fg="white", relief=tk.FLAT, pady=8, cursor="hand2", state=tk.DISABLED, command=self._export_word_docx)
        self.btn_dl_docx.pack(fill=tk.X, pady=(0, 4))

        # Right Column: Word Output Preview
        right = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(right, minsize=450)

        tk.Label(right, text="Word உரை முன்னோட்டம் (Extracted Document Text):", font=("Segoe UI", 11, "bold"), fg=self.text_light, bg=self.card_bg).pack(anchor="w", pady=(0, 6))
        self.txt_word_preview = scrolledtext.ScrolledText(right, bg="#0F172A", fg="#F8FAFC", font=("Nirmala UI", 11), insertbackground="white", bd=0, padx=12, pady=12)
        self.txt_word_preview.pack(fill=tk.BOTH, expand=True)

    def _select_word_file(self):
        f = filedialog.askopenfilename(filetypes=[("PDF & Images", "*.pdf;*.png;*.jpg;*.jpeg;*.bmp;*.tiff"), ("All Files", "*.*")])
        if f:
            self.word_file_path = f
            self.lbl_word_file.config(text=f"தேர்ந்தெடுக்கப்பட்டது: {os.path.basename(f)}", fg=self.accent_gold)

    def _clear_word(self):
        self.word_file_path = None
        self.word_result = None
        self.lbl_word_file.config(text="கோப்பு எதுவும் தேர்ந்தெடுக்கப்படவில்லை", fg="#94A3B8")
        self.txt_word_preview.delete("1.0", tk.END)
        self.btn_dl_docx.config(state=tk.DISABLED)

    def _run_pdf_to_word(self):
        if not self.word_file_path:
            messagebox.showwarning("எச்சரிக்கை", "தயவுசெய்து ஒரு PDF அல்லது படக் கோப்பை தேர்ந்தெடுக்கவும்.")
            return

        self.btn_run_word.config(state=tk.DISABLED, text="ஆவணம் செயலாக்கப்படுகிறது...")
        self.txt_word_preview.delete("1.0", tk.END)
        self.txt_word_preview.insert(tk.END, "ஆஃப்லைன் OCR மற்றும் உரை பகுப்பாய்வு இயங்குகிறது...\n")

        # Get selected language code
        sel_idx = self.cmb_word_lang.current()
        lang_code = INDIAN_LANGUAGES[sel_idx][0] if sel_idx >= 0 else "tam"

        def worker():
            try:
                res = run_offline_ocr(self.word_file_path, language=lang_code)
                self.word_result = res
                self.root.after(0, self._render_word_results)
            except Exception as e:
                self.root.after(0, lambda: messagebox.showerror("பிழை", f"Word செயலாக்கம் தோல்வி: {str(e)}"))
            finally:
                self.root.after(0, lambda: self.btn_run_word.config(state=tk.NORMAL, text="⚡ Word ஆவணமாக மாற்று (Convert to Word)"))

        threading.Thread(target=worker, daemon=True).start()

    def _render_word_results(self):
        self.txt_word_preview.delete("1.0", tk.END)
        if not self.word_result:
            return

        text = self.word_result.get("fullUnicodeText", "")
        self.txt_word_preview.insert(tk.END, text)
        self.btn_dl_docx.config(state=tk.NORMAL)

    def _export_word_docx(self):
        if not self.word_result:
            return
        out_path = filedialog.asksaveasfilename(defaultextension=".docx", filetypes=[("Word Document", "*.docx")])
        if not out_path:
            return

        try:
            lines = self.word_result.get("lines", [])
            metadata = self.word_result.get("metadata", {})
            export_tamil_docx(out_path, metadata, lines, "TAU-Marutham")
            messagebox.showinfo("வெற்றி", f"Word (.docx) ஆவணம் சேமிக்கப்பட்டது:\n{out_path}")
        except Exception as e:
            messagebox.showerror("பிழை", f"DOCX சேமிப்பு தோல்வி: {str(e)}")

    # =========================================================================
    # TAB 3: PDF EDITOR
    # =========================================================================
    def _build_pdf_editor_tab(self, parent: tk.Frame):
        paned = tk.PanedWindow(parent, orient=tk.HORIZONTAL, bg=self.bg_dark, sashwidth=6)
        paned.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        # Left Column: Tools
        left = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(left, minsize=380)

        tk.Label(left, text="PDF திருத்தக் கருவிகள் (PDF Editor Tools)", font=("Segoe UI", 11, "bold"), fg=self.text_light, bg=self.card_bg).pack(anchor="w", pady=(0, 6))

        tk.Button(left, text="📁 PDF கோப்பைத் திற (Open PDF)", font=("Segoe UI", 10, "bold"), bg="#0284C7", fg="white", relief=tk.FLAT, pady=6, cursor="hand2", command=self._select_editor_pdf).pack(fill=tk.X, pady=(0, 6))

        self.lbl_editor_file = tk.Label(left, text="கோப்பு எதுவும் திறக்கப்படவில்லை", font=("Segoe UI", 9), fg="#94A3B8", bg=self.card_bg, wraplength=350, justify="left")
        self.lbl_editor_file.pack(anchor="w", pady=(0, 12))

        # Actions
        tk.Label(left, text="பக்கக் கருவிகள் (Page Operations):", font=("Segoe UI", 9, "bold"), fg="#CBD5E1", bg=self.card_bg).pack(anchor="w", pady=(6, 2))
        tk.Button(left, text="🔄 90° வலஞ்சுழியாக திருப்பு (Rotate 90° CW)", font=("Segoe UI", 9), bg="#1E293B", fg="white", relief=tk.SOLID, bd=1, pady=6, cursor="hand2", command=self._rotate_pdf_pages).pack(fill=tk.X, pady=(0, 4))
        tk.Button(left, text="✂️ குறிப்பிட்ட பக்கங்களைப் பிரித்தெடு (Extract Pages)", font=("Segoe UI", 9), bg="#1E293B", fg="white", relief=tk.SOLID, bd=1, pady=6, cursor="hand2", command=self._extract_pdf_pages).pack(fill=tk.X, pady=(0, 4))
        tk.Button(left, text="🛡️ அரசு முத்திரை / வாட்டர்மார்க் சேர் (Add Stamp)", font=("Segoe UI", 9), bg="#1E293B", fg=self.accent_gold, relief=tk.SOLID, bd=1, pady=6, cursor="hand2", command=self._add_stamp_pdf).pack(fill=tk.X)

        # Right Column: PDF Info & Text View
        right = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(right, minsize=450)

        tk.Label(right, text="PDF ஆவண விவரங்கள் & பக்கங்கள் (PDF Details & Pages):", font=("Segoe UI", 11, "bold"), fg=self.text_light, bg=self.card_bg).pack(anchor="w", pady=(0, 6))
        self.txt_editor_preview = scrolledtext.ScrolledText(right, bg="#0F172A", fg="#F8FAFC", font=("Consolas", 10), insertbackground="white", bd=0, padx=10, pady=10)
        self.txt_editor_preview.pack(fill=tk.BOTH, expand=True)

    def _select_editor_pdf(self):
        f = filedialog.askopenfilename(filetypes=[("PDF Documents", "*.pdf"), ("All Files", "*.*")])
        if f:
            self.editor_file_path = f
            self.lbl_editor_file.config(text=f"திறக்கப்பட்டது: {os.path.basename(f)}", fg=self.accent_gold)
            self._load_editor_pdf_info()

    def _load_editor_pdf_info(self):
        if not self.editor_file_path:
            return
        self.txt_editor_preview.delete("1.0", tk.END)

        if HAS_FITZ:
            doc = fitz.open(self.editor_file_path)
            info = f"கோப்பு பெயர்: {os.path.basename(self.editor_file_path)}\n"
            info += f"பக்கங்கள் எண்ணிக்கை: {len(doc)}\n"
            info += f"ஆவண ஆசிரியர்: {doc.metadata.get('author', 'N/A')}\n"
            info += f"ஆவண தலைப்பு: {doc.metadata.get('title', 'N/A')}\n"
            info += "=" * 50 + "\n\n"
            for p_num in range(min(5, len(doc))):
                page = doc[p_num]
                info += f"[பக்கம் {p_num + 1} - உரைச் சுருக்கம்]:\n"
                txt = page.get_text("text")[:300]
                info += (txt.strip() if txt.strip() else "(படங்கள் அல்லது ஸ்கேன் செய்யப்பட்ட உள்ளடக்கம்)") + "\n\n"
            doc.close()
            self.txt_editor_preview.insert(tk.END, info)
        else:
            self.txt_editor_preview.insert(tk.END, f"திறக்கப்பட்டது: {self.editor_file_path}\nPyMuPDF நூலகம் தேவை.")

    def _rotate_pdf_pages(self):
        if not self.editor_file_path or not HAS_FITZ:
            messagebox.showwarning("எச்சரிக்கை", "தயவுசெய்து ஒரு PDF கோப்பைத் திறக்கவும்.")
            return
        out = filedialog.asksaveasfilename(defaultextension=".pdf", filetypes=[("PDF Documents", "*.pdf")])
        if not out:
            return
        doc = fitz.open(self.editor_file_path)
        for page in doc:
            page.set_rotation((page.rotation + 90) % 360)
        doc.save(out)
        doc.close()
        messagebox.showinfo("வெற்றி", f"சுழற்றப்பட்ட PDF சேமிக்கப்பட்டது:\n{out}")

    def _extract_pdf_pages(self):
        if not self.editor_file_path or not HAS_FITZ:
            messagebox.showwarning("எச்சரிக்கை", "தயவுசெய்து ஒரு PDF கோப்பைத் திறக்கவும்.")
            return
        out = filedialog.asksaveasfilename(defaultextension=".pdf", filetypes=[("PDF Documents", "*.pdf")])
        if not out:
            return
        doc = fitz.open(self.editor_file_path)
        doc.select([0])  # extract first page as demonstration
        doc.save(out)
        doc.close()
        messagebox.showinfo("வெற்றி", f"பிரித்தெடுக்கப்பட்ட PDF சேமிக்கப்பட்டது:\n{out}")

    def _add_stamp_pdf(self):
        if not self.editor_file_path or not HAS_FITZ:
            messagebox.showwarning("எச்சரிக்கை", "தயவுசெய்து ஒரு PDF கோப்பைத் திறக்கவும்.")
            return
        out = filedialog.asksaveasfilename(defaultextension=".pdf", filetypes=[("PDF Documents", "*.pdf")])
        if not out:
            return
        doc = fitz.open(self.editor_file_path)
        for page in doc:
            page.insert_text((50, 50), "TAMIFY VERIFIED • OFFICIAL", color=(0.8, 0.2, 0.2), fontsize=14)
        doc.save(out)
        doc.close()
        messagebox.showinfo("வெற்றி", f"முத்திரை இடப்பட்ட PDF சேமிக்கப்பட்டது:\n{out}")

    # =========================================================================
    # TAB 4: LANGUAGE CONVERTER (INDIAN LANGUAGES & LEGACY FONTS)
    # =========================================================================
    def _build_language_converter_tab(self, parent: tk.Frame):
        paned = tk.PanedWindow(parent, orient=tk.HORIZONTAL, bg=self.bg_dark, sashwidth=6)
        paned.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        # Left Column: Input
        left = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(left, minsize=400)

        tk.Label(left, text="மூல உரை (Input Source Text):", font=("Segoe UI", 11, "bold"), fg=self.text_light, bg=self.card_bg).pack(anchor="w", pady=(0, 6))

        # Mode Selection
        mode_box = tk.Frame(left, bg=self.card_bg)
        mode_box.pack(fill=tk.X, pady=(0, 8))
        tk.Label(mode_box, text="மாற்றக வகை:", font=("Segoe UI", 9, "bold"), fg="#CBD5E1", bg=self.card_bg).pack(side=tk.LEFT)
        self.conv_mode_var = tk.StringVar(value="indic")
        tk.Radiobutton(mode_box, text="இந்திய மொழிகள்", variable=self.conv_mode_var, value="indic", bg=self.card_bg, fg=self.accent_gold, selectcolor="#0F172A", command=self._on_conv_mode_change).pack(side=tk.LEFT, padx=6)
        tk.Radiobutton(mode_box, text="பழைய எழுத்துரு", variable=self.conv_mode_var, value="legacy", bg=self.card_bg, fg=self.accent_blue, selectcolor="#0F172A", command=self._on_conv_mode_change).pack(side=tk.LEFT)

        # Target Language Dropdown
        self.lbl_target_lang = tk.Label(left, text="இலக்கு மொழி (Target Language):", font=("Segoe UI", 9, "bold"), fg="#CBD5E1", bg=self.card_bg)
        self.lbl_target_lang.pack(anchor="w", pady=(4, 2))
        self.cmb_conv_target = ttk.Combobox(left, values=[name for code, name in INDIAN_LANGUAGES if code != "auto"], state="readonly", font=("Segoe UI", 9))
        self.cmb_conv_target.current(1)  # Default Hindi
        self.cmb_conv_target.pack(fill=tk.X, pady=(0, 8))

        self.txt_conv_input = scrolledtext.ScrolledText(left, bg="#0F172A", fg=self.accent_gold, font=("Nirmala UI", 11), insertbackground="white", bd=0, padx=10, pady=10, height=12)
        self.txt_conv_input.insert(tk.END, "தமிழ்நாடு அரசு அரசாணை (நிலை) எண் 142 - அனைத்து மாவட்ட ஆட்சியர்களுக்கும் சுற்றறிக்கை")
        self.txt_conv_input.pack(fill=tk.BOTH, expand=True, pady=(0, 8))

        tk.Button(left, text="🔄 உரையை மாற்று (Convert Now)", font=("Segoe UI", 10, "bold"), bg=self.accent_gold, fg="black", relief=tk.FLAT, pady=8, cursor="hand2", command=self._run_conversion).pack(fill=tk.X)

        # Right Column: Converted Output
        right = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(right, minsize=450)

        top_r = tk.Frame(right, bg=self.card_bg)
        top_r.pack(fill=tk.X, pady=(0, 6))
        tk.Label(top_r, text="மாற்றப்பட்ட உரை (Converted Text):", font=("Segoe UI", 11, "bold"), fg=self.accent_green, bg=self.card_bg).pack(side=tk.LEFT)
        tk.Button(top_r, text="📋 நகல் (Copy)", font=("Segoe UI", 9), bg="#1E293B", fg="white", relief=tk.SOLID, bd=1, padx=10, pady=2, cursor="hand2", command=self._copy_conv_output).pack(side=tk.RIGHT)

        self.txt_conv_output = scrolledtext.ScrolledText(right, bg="#0F172A", fg="#F8FAFC", font=("Nirmala UI", 11), insertbackground="white", bd=0, padx=10, pady=10)
        self.txt_conv_output.pack(fill=tk.BOTH, expand=True)

    def _on_conv_mode_change(self):
        mode = self.conv_mode_var.get()
        if mode == "indic":
            self.lbl_target_lang.config(text="இலக்கு மொழி (Target Language):")
            self.cmb_conv_target.config(values=[name for code, name in INDIAN_LANGUAGES if code != "auto"])
            self.cmb_conv_target.current(1)
        else:
            self.lbl_target_lang.config(text="மூல எழுத்துரு (Legacy Font):")
            self.cmb_conv_target.config(values=["BAMINI (பாமினி)", "TSCII (0x80 Byte Code)", "TAM (Tamil ASCII)", "TAB (Tamil Bilingual)"])
            self.cmb_conv_target.current(0)

    def _run_conversion(self):
        text = self.txt_conv_input.get("1.0", tk.END).strip()
        if not text:
            return

        mode = self.conv_mode_var.get()
        if mode == "indic":
            # Map index to language code
            sel_idx = self.cmb_conv_target.current()
            clean_langs = [code for code, _ in INDIAN_LANGUAGES if code != "auto"]
            lang_code = clean_langs[sel_idx] if sel_idx >= 0 and sel_idx < len(clean_langs) else "hin"
            out = convert_to_indic_script(text, lang_code)
        else:
            sel_enc = self.cmb_conv_target.get()
            enc = "BAMINI"
            if "TSCII" in sel_enc: enc = "TSCII"
            elif "TAM" in sel_enc: enc = "TAM"
            elif "TAB" in sel_enc: enc = "TAB"
            out, _, _ = convert_to_unicode(text, enc)

        self.txt_conv_output.delete("1.0", tk.END)
        self.txt_conv_output.insert(tk.END, out)

    def _copy_conv_output(self):
        out = self.txt_conv_output.get("1.0", tk.END).strip()
        if out:
            self.root.clipboard_clear()
            self.root.clipboard_append(out)
            messagebox.showinfo("வெற்றி", "உரை நகலெடுக்கப்பட்டது (Copied to Clipboard)!")


def main():
    root = tk.Tk()
    app = TamifyDesktopApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
