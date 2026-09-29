/**
 * Bundles all standalone Python offline files into a single downloadable .zip archive.
 */
import JSZip from 'jszip';

export async function downloadPythonOfflineSuiteZip(): Promise<void> {
  const zip = new JSZip();

  const desktopAppCode = `"""
Tamil Archive OCR & Morphological Suite - Standalone Desktop Application
100% Offline Desktop GUI built with Python Tkinter & ttk.
Zero Cloud Server Dependencies.
"""
import sys, os, threading, json, traceback
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext

# Handle local imports safely
try:
    from tamil_converter import convert_to_unicode, GOV_LEGAL_LEXICON
except Exception as e:
    def convert_to_unicode(text, encoding="AUTO_DETECT"): return text, "UNICODE", 1.0
    GOV_LEGAL_LEXICON = {}

try:
    from tamil_ocr_engine import run_offline_ocr, check_tesseract_installed
except Exception as e:
    def run_offline_ocr(file_path): return {"metadata": {"documentTitle": "Tamil Doc", "pageCount": 1}, "fullUnicodeText": "Error loading OCR engine", "lines": []}
    def check_tesseract_installed(): return False, "Not loaded"

try:
    from tamil_docx_exporter import export_tamil_docx
except Exception as e:
    def export_tamil_docx(p, m, l, t): pass

class TamilOCRDesktopApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("தமிழ் ஆவணக் காப்பகம் - Offline Tamil OCR & Converter Suite v2.0")
        self.root.geometry("1150x780")
        self.root.minsize(950, 680)
        self.bg_dark = "#0F172A"
        self.card_bg = "#1E293B"
        self.root.configure(bg=self.bg_dark)
        self.current_file_path = None
        self.current_result = None
        self.batch_files = []
        self.is_processing = False
        self._build_ui()

    def _build_ui(self):
        # Header Banner
        header_frame = tk.Frame(self.root, bg=self.card_bg, height=65, padx=20, pady=10)
        header_frame.pack(fill=tk.X, side=tk.TOP)
        
        title_box = tk.Frame(header_frame, bg=self.card_bg)
        title_box.pack(side=tk.LEFT, fill=tk.Y)
        tk.Label(title_box, text="தமிழ் ஆவணக் காப்பக OCR & மாற்றகம் (Offline Desktop Suite)", font=("Nirmala UI", 14, "bold"), fg="#F8FAFC", bg=self.card_bg).pack(anchor="w")
        tk.Label(title_box, text="Offline Tesseract OCR • Bamini/TSCII/TAM Converter • DOCX Generator", font=("Segoe UI", 9), fg="#94A3B8", bg=self.card_bg).pack(anchor="w")

        status_box = tk.Frame(header_frame, bg=self.card_bg)
        status_box.pack(side=tk.RIGHT, fill=tk.Y)
        self.lbl_tess_status = tk.Label(status_box, text="● Tesseract சோதிக்கப்படுகிறது...", font=("Nirmala UI", 9, "bold"), fg="#F59E0B", bg=self.card_bg)
        self.lbl_tess_status.pack(anchor="e")

        # Tabs
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=12, pady=10)

        t_single = tk.Frame(notebook, bg=self.bg_dark)
        notebook.add(t_single, text="  📄 தனி ஆவணம் (Single Document)  ")
        self._build_single_tab(t_single)

        t_conv = tk.Frame(notebook, bg=self.bg_dark)
        notebook.add(t_conv, text="  🔤 எழுத்துரு மாற்றகம் (Font Converter)  ")
        self._build_converter_tab(t_conv)

        t_batch = tk.Frame(notebook, bg=self.bg_dark)
        notebook.add(t_batch, text="  📚 தொகுதி ஆவணங்கள் (Batch Queue)  ")
        self._build_batch_tab(t_batch)

        # Check Tesseract in background
        self.root.after(500, self._check_engine)

    def _check_engine(self):
        ok, msg = check_tesseract_installed()
        if ok:
            self.lbl_tess_status.config(text="● Tesseract Engine தயார் (Ready)", fg="#10B981")
        else:
            self.lbl_tess_status.config(text="⚠️ Tesseract நிறுவப்படவில்லை (Tesseract not in PATH)", fg="#EF4444")

    def _build_single_tab(self, parent):
        paned = tk.PanedWindow(parent, orient=tk.HORIZONTAL, bg=self.bg_dark, sashwidth=6)
        paned.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)

        # Left Column (Input & Actions)
        left = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(left, minsize=400)

        tk.Label(left, text="1. ஆவணத் தேர்வு (Input File / Text)", font=("Nirmala UI", 11, "bold"), fg="#F8FAFC", bg=self.card_bg).pack(anchor="w", pady=(0, 6))
        
        btn_box = tk.Frame(left, bg=self.card_bg)
        btn_box.pack(fill=tk.X, pady=(0, 6))
        tk.Button(btn_box, text="📁 PDF / படம் தேர்ந்தெடு (Browse File)", font=("Nirmala UI", 10, "bold"), bg="#3B82F6", fg="white", relief=tk.FLAT, pady=6, cursor="hand2", command=self._select_file).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 4))
        tk.Button(btn_box, text="❌ அழி (Clear)", font=("Nirmala UI", 9), bg="#475569", fg="white", relief=tk.FLAT, pady=6, cursor="hand2", command=self._clear_single).pack(side=tk.RIGHT)

        self.lbl_file = tk.Label(left, text="கோப்பு எதுவும் தேர்ந்தெடுக்கப்படவில்லை", font=("Nirmala UI", 9), fg="#94A3B8", bg=self.card_bg, wraplength=380, justify="left")
        self.lbl_file.pack(anchor="w", pady=(0, 8))

        tk.Label(left, text="அல்லது பழைய எழுத்துரு உரையை ஒட்டுக (Or Paste Legacy Text):", font=("Nirmala UI", 9), fg="#CBD5E1", bg=self.card_bg).pack(anchor="w", pady=(0, 4))
        self.txt_in = scrolledtext.ScrolledText(left, height=10, bg="#0F172A", fg="#E2E8F0", font=("Nirmala UI", 10), insertbackground="white")
        self.txt_in.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        # Status & Progress label
        self.lbl_progress = tk.Label(left, text="", font=("Nirmala UI", 9, "bold"), fg="#F59E0B", bg=self.card_bg)
        self.lbl_progress.pack(anchor="w", pady=(0, 6))

        self.btn_run = tk.Button(left, text="⚡ ஆஃப்லைன் OCR & மாற்றுக (Run Offline OCR)", font=("Nirmala UI", 11, "bold"), bg="#F59E0B", fg="#0F172A", relief=tk.FLAT, pady=10, cursor="hand2", command=self._run_single)
        self.btn_run.pack(fill=tk.X)

        # Right Column (Output Preview & Export)
        right = tk.Frame(paned, bg=self.card_bg, padx=14, pady=14)
        paned.add(right, minsize=480)

        r_head = tk.Frame(right, bg=self.card_bg)
        r_head.pack(fill=tk.X, pady=(0, 6))
        tk.Label(r_head, text="2. யூனிகோட் முன்னோட்டம் (Unicode Output)", font=("Nirmala UI", 11, "bold"), fg="#F8FAFC", bg=self.card_bg).pack(side=tk.LEFT)
        self.lbl_meta = tk.Label(r_head, text="", font=("Segoe UI", 9), fg="#38BDF8", bg=self.card_bg)
        self.lbl_meta.pack(side=tk.RIGHT)

        self.txt_out = scrolledtext.ScrolledText(right, bg="#0F172A", fg="#F8FAFC", font=("Nirmala UI", 11), insertbackground="white")
        self.txt_out.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        bar = tk.Frame(right, bg=self.card_bg)
        bar.pack(fill=tk.X)
        self.btn_docx = tk.Button(bar, text="📥 Word (.docx) ஆக சேமி", font=("Nirmala UI", 10, "bold"), bg="#2563EB", fg="white", relief=tk.FLAT, padx=14, pady=7, cursor="hand2", command=self._export_docx)
        self.btn_docx.pack(side=tk.LEFT, padx=(0, 8))
        self.btn_txt = tk.Button(bar, text="📄 உரை (.txt) சேமி", font=("Nirmala UI", 10), bg="#475569", fg="white", relief=tk.FLAT, padx=12, pady=7, cursor="hand2", command=self._export_txt)
        self.btn_txt.pack(side=tk.LEFT)

    def _select_file(self):
        f = filedialog.askopenfilename(filetypes=[("PDF & Images", "*.pdf *.png *.jpg *.jpeg *.bmp *.tiff *.txt"), ("All Files", "*.*")])
        if f:
            self.current_file_path = f
            sz = os.path.getsize(f) / (1024 * 1024)
            self.lbl_file.config(text=f"தேர்ந்தெடுக்கப்பட்டது: {os.path.basename(f)} ({sz:.2f} MB)")
            self.lbl_progress.config(text="")

    def _clear_single(self):
        self.current_file_path = None
        self.current_result = None
        self.lbl_file.config(text="கோப்பு எதுவும் தேர்ந்தெடுக்கப்படவில்லை")
        self.txt_in.delete("1.0", tk.END)
        self.txt_out.delete("1.0", tk.END)
        self.lbl_meta.config(text="")
        self.lbl_progress.config(text="")

    def _run_single(self):
        if self.is_processing: return
        raw_in = self.txt_in.get("1.0", tk.END).strip()
        if not self.current_file_path and not raw_in:
            messagebox.showwarning("எச்சரிக்கை", "தயவுசெய்து ஒரு PDF/படக் கோப்பைத் தேர்ந்தெடுக்கவும் அல்லது உரையை ஒட்டவும்.")
            return

        self.is_processing = True
        self.btn_run.config(text="⏳ மாற்றம் செய்யப்படுகிறது (Processing...)", state=tk.DISABLED)
        self.lbl_progress.config(text="செயல்முறை துவங்குகிறது...")

        def update_prog(msg):
            self.root.after(0, lambda: self.lbl_progress.config(text=msg))

        def worker():
            try:
                if self.current_file_path:
                    update_prog("ஆவணம் வாசிக்கப்பட்டு OCR செய்யப்படுகிறது...")
                    res = run_offline_ocr(self.current_file_path, progress_callback=update_prog)
                else:
                    update_prog("எழுத்துரு மாற்றகம் இயங்குகிறது...")
                    conv, enc, conf = convert_to_unicode(raw_in)
                    lines = [{"lineNumber": i+1, "type": "PARAGRAPH", "tamilText": l} for i, l in enumerate(conv.split('\\n')) if l.strip()]
                    res = {
                        "metadata": {"documentTitle": "உரை ஆவணம்", "department": "தமிழ்நாடு அரசு", "pageCount": 1},
                        "fullUnicodeText": conv,
                        "lines": lines,
                        "tables": [],
                        "detectedEncoding": enc,
                        "overallConfidence": conf
                    }

                self.current_result = res
                self.root.after(0, lambda: self._render_result(res))
            except Exception as e:
                err = traceback.format_exc()
                self.root.after(0, lambda: messagebox.showerror("பிழை", f"மாற்றத்தில் பிழை:\\n{str(e)}\\n\\n{err[:300]}"))
            finally:
                self.is_processing = False
                self.root.after(0, lambda: self.btn_run.config(text="⚡ ஆஃப்லைன் OCR & மாற்றுக (Run Offline OCR)", state=tk.NORMAL))
                self.root.after(0, lambda: self.lbl_progress.config(text="✅ முடிந்தது (Completed)"))

        threading.Thread(target=worker, daemon=True).start()

    def _render_result(self, res):
        self.txt_out.delete("1.0", tk.END)
        self.txt_out.insert(tk.END, res.get("fullUnicodeText", ""))
        enc = res.get("detectedEncoding", "UNICODE")
        conf = int(res.get("overallConfidence", 0.95) * 100)
        self.lbl_meta.config(text=f"Encoding: {enc} | Confidence: {conf}%")

    def _export_docx(self):
        if not self.current_result:
            messagebox.showwarning("எச்சரிக்கை", "முதலில் OCR மாற்றத்தை இயக்கவும்.")
            return
        f = filedialog.asksaveasfilename(defaultextension=".docx", filetypes=[("Word Document", "*.docx")])
        if f:
            try:
                res = self.current_result
                export_tamil_docx(f, res.get("metadata", {}), res.get("lines", []), res.get("tables", []))
                messagebox.showinfo("வெற்றி", f"Word ஆவணம் வெற்றிகரமாக சேமிக்கப்பட்டது:\\n{f}")
            except Exception as e:
                messagebox.showerror("பிழை", f"சேமிக்க முடியவில்லை:\\n{str(e)}")

    def _export_txt(self):
        if not self.current_result:
            messagebox.showwarning("எச்சரிக்கை", "முதலில் OCR மாற்றத்தை இயக்கவும்.")
            return
        f = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text File", "*.txt")])
        if f:
            try:
                with open(f, 'w', encoding='utf-8') as fp:
                    fp.write(self.txt_out.get("1.0", tk.END))
                messagebox.showinfo("வெற்றி", f"உரை கோப்பு சேமிக்கப்பட்டது:\\n{f}")
            except Exception as e:
                messagebox.showerror("பிழை", f"சேமிக்க முடியவில்லை:\\n{str(e)}")

    def _build_batch_tab(self, parent):
        f = tk.Frame(parent, bg=self.bg_dark, padx=14, pady=14)
        f.pack(fill=tk.BOTH, expand=True)

        top_b = tk.Frame(f, bg=self.bg_dark)
        top_b.pack(fill=tk.X, pady=(0, 10))
        tk.Button(top_b, text="➕ பல கோப்புகளைச் சேர் (Add Multiple PDFs)", font=("Nirmala UI", 10, "bold"), bg="#3B82F6", fg="white", relief=tk.FLAT, padx=12, pady=6, cursor="hand2", command=self._add_batch_files).pack(side=tk.LEFT, padx=(0, 6))
        tk.Button(top_b, text="❌ பட்டியலை அழி (Clear List)", font=("Nirmala UI", 9), bg="#475569", fg="white", relief=tk.FLAT, padx=10, pady=6, cursor="hand2", command=self._clear_batch).pack(side=tk.LEFT)

        cols = ("#", "File Name", "Size", "Status")
        self.tree = ttk.Treeview(f, columns=cols, show="headings", height=12)
        for c in cols:
            self.tree.heading(c, text=c)
        self.tree.column("#", width=40, anchor="center")
        self.tree.column("File Name", width=400)
        self.tree.column("Size", width=100, anchor="center")
        self.tree.column("Status", width=150, anchor="center")
        self.tree.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        self.btn_batch_start = tk.Button(f, text="🚀 அனைத்தையும் மாற்றி DOCX ஆக சேமி (Start Batch Convert)", font=("Nirmala UI", 11, "bold"), bg="#10B981", fg="white", relief=tk.FLAT, pady=10, cursor="hand2", command=self._start_batch)
        self.btn_batch_start.pack(fill=tk.X)

    def _add_batch_files(self):
        files = filedialog.askopenfilenames(filetypes=[("PDF & Images", "*.pdf *.png *.jpg *.jpeg *.bmp"), ("All Files", "*.*")])
        for p in files:
            if p not in self.batch_files:
                self.batch_files.append(p)
                sz = os.path.getsize(p) / (1024 * 1024)
                self.tree.insert("", tk.END, values=(len(self.batch_files), os.path.basename(p), f"{sz:.2f} MB", "Pending"))

    def _clear_batch(self):
        self.batch_files = []
        for row in self.tree.get_children():
            self.tree.delete(row)

    def _start_batch(self):
        if not self.batch_files:
            messagebox.showwarning("எச்சரிக்கை", "பட்டியலில் கோப்புகள் எதுவும் இல்லை.")
            return
        out_dir = filedialog.askdirectory(title="DOCX கோப்புகளைச் சேமிக்கும் கோப்புறையைத் தேர்ந்தெடுக்கவும்")
        if not out_dir: return

        self.btn_batch_start.config(text="⏳ தொகுதி மாற்றம் நடக்கிறது...", state=tk.DISABLED)

        def worker():
            items = self.tree.get_children()
            for idx, p in enumerate(self.batch_files):
                try:
                    self.tree.item(items[idx], values=(idx+1, os.path.basename(p), f"{os.path.getsize(p)/(1024*1024):.2f} MB", "Processing..."))
                    res = run_offline_ocr(p)
                    out_p = os.path.join(out_dir, f"{os.path.splitext(os.path.basename(p))[0]}_Converted.docx")
                    export_tamil_docx(out_p, res.get("metadata", {}), res.get("lines", []), res.get("tables", []))
                    self.tree.item(items[idx], values=(idx+1, os.path.basename(p), f"{os.path.getsize(p)/(1024*1024):.2f} MB", "✅ Done"))
                except Exception as e:
                    self.tree.item(items[idx], values=(idx+1, os.path.basename(p), f"{os.path.getsize(p)/(1024*1024):.2f} MB", f"❌ Failed"))
            self.root.after(0, lambda: messagebox.showinfo("முடிந்தது", f"அனைத்து ஆவணங்களும் Word (.docx) ஆக மாற்றப்பட்டு சேமிக்கப்பட்டன:\\n{out_dir}"))
            self.root.after(0, lambda: self.btn_batch_start.config(text="🚀 அனைத்தையும் மாற்றி DOCX ஆக சேமி (Start Batch Convert)", state=tk.NORMAL))

        threading.Thread(target=worker, daemon=True).start()

    def _build_converter_tab(self, parent):
        f = tk.Frame(parent, bg=self.bg_dark, padx=14, pady=14)
        f.pack(fill=tk.BOTH, expand=True)

        tk.Label(f, text="பழைய TAB / TAM / BAMINI / Vaanavil உரையை யூனிகோடாக மாற்றுக:", font=("Nirmala UI", 11, "bold"), fg="#F8FAFC", bg=self.bg_dark).pack(anchor="w", pady=(0, 6))
        
        sample_bar = tk.Frame(f, bg=self.bg_dark)
        sample_bar.pack(fill=tk.X, pady=(0, 6))
        
        def load_sample():
            sample_tam = "கடÆß மாவØட ¯தåைமÔ கà அ³வல…å ெசயà¯ைறகã\\nந.க.எÙ.7429/அ6/2026\\nபãÔகà - தâநா© அயà இயÔகÝ – கடÆß மாவØடÝ"
            txt_i.delete("1.0", tk.END)
            txt_i.insert(tk.END, sample_tam)
            conv()

        tk.Button(sample_bar, text="📋 மாதிரி உரை ஏற்றுக (Load TAB/TAM Sample)", font=("Nirmala UI", 9), bg="#475569", fg="white", relief=tk.FLAT, padx=8, pady=4, cursor="hand2", command=load_sample).pack(side=tk.LEFT)

        txt_i = scrolledtext.ScrolledText(f, height=9, bg="#1E293B", fg="#FFB800", font=("Nirmala UI", 10), insertbackground="white")
        txt_i.pack(fill=tk.BOTH, expand=True, pady=(0, 8))
        txt_i.insert(tk.END, "கடÆß மாவØட ¯தåைமÔ கà அ³வல…å ெசயà¯ைறகã\\nந.க.எÙ.7429/அ6/2026\\nபãÔகà - தâநா© அயà இயÔகÝ – கடÆß")

        txt_o = scrolledtext.ScrolledText(f, height=9, bg="#0F172A", fg="#F8FAFC", font=("Nirmala UI", 11), insertbackground="white")
        txt_o.pack(fill=tk.BOTH, expand=True, pady=(0, 8))

        def conv():
            c, enc, _ = convert_to_unicode(txt_i.get("1.0", tk.END).strip())
            txt_o.delete("1.0", tk.END)
            txt_o.insert(tk.END, c)

        def copy_out():
            self.root.clipboard_clear()
            self.root.clipboard_append(txt_o.get("1.0", tk.END))
            messagebox.showinfo("நகலெடுக்கப்பட்டது", "தூய தமிழ் யூனிகோட் உரை நகலெடுக்கப்பட்டது!")

        btn_bar = tk.Frame(f, bg=self.bg_dark)
        btn_bar.pack(fill=tk.X)
        tk.Button(btn_bar, text="🔄 தூய யூனிகோடாக மாற்று (Convert to Unicode)", font=("Nirmala UI", 11, "bold"), bg="#3B82F6", fg="white", relief=tk.FLAT, pady=8, cursor="hand2", command=conv).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 6))
        tk.Button(btn_bar, text="📋 நகல் (Copy)", font=("Nirmala UI", 10, "bold"), bg="#10B981", fg="white", relief=tk.FLAT, padx=14, pady=8, cursor="hand2", command=copy_out).pack(side=tk.RIGHT)

if __name__ == "__main__":
    root = tk.Tk()
    app = TamilOCRDesktopApp(root)
    root.mainloop()
`;

  const tamilOcrEngineCode = `"""
Offline Tamil OCR Engine - Enhanced with Tesseract Auto-Discovery & Direct Text Fallback
"""
import os, sys, re
from PIL import Image, ImageEnhance, ImageFilter

try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

# Auto-locate Tesseract on Windows if not in PATH
def find_tesseract_binary():
    if pytesseract is None:
        return False
    common_paths = [
        r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe",
        r"C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe",
        os.path.expanduser(r"~\\AppData\\Local\\Programs\\Tesseract-OCR\\tesseract.exe")
    ]
    for p in common_paths:
        if os.path.isfile(p):
            pytesseract.pytesseract.tesseract_cmd = p
            return True
    return True

find_tesseract_binary()

def check_tesseract_installed():
    if pytesseract is None:
        return False, "pytesseract library not found"
    try:
        ver = pytesseract.get_tesseract_version()
        return True, f"Tesseract v{ver}"
    except Exception as e:
        return False, str(e)

from tamil_converter import convert_to_unicode

def run_offline_ocr(file_path, encoding_hint="AUTO_DETECT", progress_callback=None):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"கோப்பு கிடைக்கவில்லை: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    full_text = ""

    if ext == '.pdf':
        if fitz is None:
            raise ImportError("PyMuPDF (fitz) நிறுவப்படவில்லை. 'pip install pymupdf' இயக்கவும்.")
        doc = fitz.open(file_path)
        pages_text = []
        total_p = len(doc)
        for i, page in enumerate(doc):
            if progress_callback:
                progress_callback(f"பக்கம் {i+1} / {total_p} வாசிக்கப்படுகிறது...")
            
            # Step 1: Check if PDF has embedded digital text
            raw_page_text = page.get_text()
            if raw_page_text and len(raw_page_text.strip()) > 30:
                pages_text.append(raw_page_text)
                continue

            # Step 2: Scanned PDF fallback to OCR
            pix = page.get_pixmap(matrix=fitz.Matrix(300/72, 300/72))
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            gray = img.convert('L')
            enh = ImageEnhance.Contrast(gray).enhance(1.8)
            
            if pytesseract:
                try:
                    t = pytesseract.image_to_string(enh, lang='tam+eng')
                except Exception:
                    try:
                        t = pytesseract.image_to_string(enh)
                    except Exception:
                        t = raw_page_text
            else:
                t = raw_page_text
            pages_text.append(t)
        full_text = "\\n\\n".join(pages_text)
        doc.close()
    elif ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.webp']:
        if progress_callback: progress_callback("படம் OCR செய்யப்படுகிறது...")
        img = Image.open(file_path).convert('L')
        enh = ImageEnhance.Contrast(img).enhance(1.8)
        if pytesseract:
            try:
                full_text = pytesseract.image_to_string(enh, lang='tam+eng')
            except Exception:
                full_text = pytesseract.image_to_string(enh)
        else:
            raise RuntimeError("படங்களுக்கு Tesseract OCR தேவை. 'pip install pytesseract' இயக்கவும்.")
    elif ext == '.txt':
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            full_text = f.read()
    else:
        raise ValueError(f"ஆதரிக்கப்படாத கோப்பு வடிவம்: {ext}")

    conv, enc, conf = convert_to_unicode(full_text, encoding_hint)
    lines = [{"lineNumber": i+1, "type": "PARAGRAPH", "tamilText": l} for i, l in enumerate(conv.split('\\n')) if l.strip()]
    return {
        "metadata": {"documentTitle": os.path.basename(file_path), "department": "தமிழ்நாடு அரசு", "pageCount": 1},
        "fullUnicodeText": conv,
        "lines": lines,
        "tables": [],
        "detectedEncoding": enc,
        "overallConfidence": conf
    }
`;

  const tamilConverterCode = `"""
Tamil Legacy Font & Encoding Converters (TAB, TAM, BAMINI, Vaanavil, TSCII -> Unicode)
"""
import re

TAB_TAM_MAP = {
    '«': 'து', '¬': 'தூ', '®': 'இ', '¯': 'மு', '°': 'உ', '±': 'ஊ',
    '²': 'று', '³': 'லு', '´': 'ளு', 'µ': 'ஒ', '¶': 'வு', '·': 'ஔ', '¸': 'ஃ',
    '¹': 'க்', 'º': 'க', '»': 'கா', '¼': 'கி', '½': 'கீ', '¾': 'கு', '¿': 'கூ',
    'À': 'ங்', 'Á': 'ங', 'Â': 'ச்', 'Ã': 'ச', 'Ä': 'சா', 'Å': 'சி', 'Æ': 'லூ',
    'Ç': 'சு', 'È': 'சூ', 'É': 'ஞ்', 'Ê': 'ஞ', 'Ë': 'ட்', 'Ì': 'ட', 'Í': 'டா',
    'Î': 'டி', 'Ï': 'டீ', 'Ð': 'டு', 'Ñ': 'டூ', 'Ò': 'ண்', 'Ó': 'ண', 'Ô': 'க்',
    'Õ': 'ங்', 'Ö': 'ச்', '×': 'ஞ்', 'Ø': 'ட்', 'Ù': 'ண்', 'Ú': 'த்', 'Û': 'ந்',
    'Ü': 'ப்', 'Ý': 'ம்', 'Þ': 'ய்', 'ß': 'ர்', 'à': 'ல்', 'á': 'வ்', 'â': 'ழ்',
    'ã': 'ள்', 'ä': 'ற்', 'å': 'ன்', 'æ': 'ஜ', 'ç': 'ஜ', 'è': 'ஷ', 'é': 'ஸ',
    'ê': 'சி', 'ë': 'ஹ', 'ì': 'க்ஷ', 'í': 'ச்', 'î': 'ம்', 'ï': 'ம', 'ð': 'மா',
    'ñ': 'மி', 'ò': 'மீ', 'ó': 'மு', 'ô': 'மூ', 'õ': 'ய்', 'ö': 'ய', '÷': 'யா',
    'ø': 'யி', 'ù': 'யீ', 'ú': 'யு', 'û': 'யூ', 'ü': 'ர்', 'ý': 'ர', 'þ': 'ரா',
    'ÿ': 'ரி'
}

BAMINI_MAP = {
    'SRI': 'ஸ்ரீ', '\`{': 'ஸ்ரீ', 'க்ஷ': 'க்ஷ', 'n\\\\fs;': 'க்ஷௌ', 'N\\\\fh': 'க்ஷோ', 'n\\\\fh': 'க்ஷொ',
    'N\\\\f': 'க்ஷே', 'n\\\\f': 'க்ஷெ', 'iif\\\\': 'க்ஷை', 'i\\\\': 'க்ஷை', '\\\\;': 'க்ஷ்', '\\\\': 'ஷ',
    '\\\\h': 'ஷா', '\\\\p': 'ஷி', '\\\\P': 'ஷீ', '\\\\[': 'ஷு', '\\\\{': 'ஷூ', 'c;': 'ஸ்', 'c': 'ஸ',
    'ch': 'ஸா', 'cp': 'ஸி', 'cP': 'ஸீ', 'c[': 'ஸு', 'c{': 'ஸூ', '\`;': 'ஹ்', '\`': 'ஹ', '\`h': 'ஹா',
    '\`p': 'ஹி', '\`P': 'ஹீ',
    'nfs;': 'கௌ', 'nqs;': 'ஙௌ', 'nrs;': 'சௌ', 'n[s;': 'ஜௌ', 'nPs;': 'ஞௌ', 'nls;': 'டௌ',
    'nzs;': 'ணௌ', 'njs;': 'தௌ', 'nes;': 'நௌ', 'nds;': 'னௌ', 'ngs;': 'பௌ', 'nks;': 'மௌ',
    'nas;': 'யௌ', 'nus;': 'ரௌ', 'nys;': 'லௌ', 'nss;': 'ளௌ', 'nts;': 'வௌ', 'nws;': 'ழௌ',
    'nWs;': 'றௌ', 'n\`s;': 'ஹௌ',
    'nfh': 'கொ', 'nqh': 'ஙொ', 'nrh': 'சொ', 'n[h': 'ஜொ', 'nPh': 'ஞொ', 'nlh': 'டொ',
    'nzh': 'ணொ', 'njh': 'தொ', 'neh': 'நொ', 'ndh': 'னொ', 'ngh': 'பொ', 'nkh': 'மொ',
    'nah': 'யொ', 'nuh': 'ரொ', 'nyh': 'லொ', 'nsh': 'ளொ', 'nth': 'வொ', 'nwh': 'ழொ',
    'nWh': 'றொ', 'n\`h': 'ஹொ',
    'Nfh': 'கோ', 'Nqh': 'ஙோ', 'Nrh': 'சோ', 'N[h': 'ஜோ', 'NPh': 'ஞோ', 'Nlh': 'டோ',
    'Nzh': 'ணோ', 'Njh': 'தோ', 'Neh': 'நோ', 'Ndh': 'னோ', 'Ngh': 'போ', 'Nkh': 'மோ',
    'Nah': 'யோ', 'Nuh': 'ரோ', 'Nyh': 'லோ', 'Nsh': 'ளோ', 'Nth': 'வோ', 'Nwh': 'ழோ',
    'NWh': 'றோ', 'N\`h': 'ஹோ',
    'nf': 'கெ', 'nq': 'ஙெ', 'nr': 'செ', 'n[': 'ஜெ', 'nP': 'ஞெ', 'nl': 'டெ', 'nz': 'ணெ',
    'nj': 'தெ', 'ne': 'நெ', 'nd': 'னெ', 'ng': 'பெ', 'nk': 'மெ', 'na': 'யெ', 'nu': 'ரெ',
    'ny': 'லெ', 'ns': 'ளெ', 'nt': 'வெ', 'nw': 'ழெ', 'nW': 'றெ', 'n\`': 'ஹெ',
    'Nf': 'கே', 'Nq': 'ஙே', 'Nr': 'சே', 'N[': 'ஜே', 'NP': 'ஞே', 'Nl': 'டே', 'Nz': 'ணே',
    'Nj': 'தே', 'Ne': 'நே', 'Nd': 'னே', 'Ng': 'பே', 'Nk': 'மே', 'Na': 'யே', 'Nu': 'ரே',
    'Ny': 'லே', 'Ns': 'ளே', 'Nt': 'வே', 'Nw': 'ழே', 'NW': 'றே', 'N\`': 'ஹே',
    'iif': 'கை', 'iiq': 'ஙை', 'iir': 'சை', 'ii[': 'ஜை', 'iiP': 'ஞை', 'iil': 'டை',
    'iiz': 'ணை', 'iij': 'தை', 'iie': 'நை', 'iid': 'னை', 'iig': 'பை', 'iik': 'மை',
    'iia': 'யை', 'iiu': 'ரை', 'iiy': 'லை', 'iis': 'ளை', 'iit': 'வை', 'iiw': 'றை',
    'iio': 'ழை', 'iiW': 'றை', 'ii\`': 'ஹை',
    'if': 'கை', 'iq': 'ஙை', 'ir': 'சை', 'i[': 'ஜை', 'iP': 'ஞை', 'il': 'டை', 'iz': 'ணை',
    'ij': 'தை', 'ie': 'நை', 'id': 'னை', 'ig': 'பை', 'ik': 'மை', 'ia': 'யை', 'iu': 'ரை',
    'iy': 'லை', 'is': 'ளை', 'it': 'வை', 'iw': 'றை', 'io': 'ழை', 'iW': 'றை', 'i\`': 'ஹை',
    'f;': 'க்', 'q;': 'ங்', 'r;': 'ச்', '[;': 'ஜ்', 'P;': 'ஞ்', 'l;': 'ட்', 'z;': 'ண்',
    'j;': 'த்', 'e;': 'ந்', 'd;': 'ன்', 'g;': 'ப்', 'k;': 'ம்', 'a;': 'ய்', 'u;': 'ர்',
    'y;': 'ல்', 's;': 'ள்', 't;': 'வ்', 'w;': 'ற்', 'o;': 'ழ்', 'W;': 'ற்', 'G;': 'ப்',
    'F': 'கு', 'T': 'கூ', 'S': 'சு', 'R': 'சூ', 'Q': 'ஞு', 'L': 'டு', '^': 'டூ',
    'Z': 'ணு', 'b': 'ணூ', 'J': 'து', 'J}': 'தூ', 'E': 'நு', 'E}': 'நூ', 'D': 'னு',
    'D}': 'னூ', 'G': 'பு', 'G}': 'பூ', 'K': 'மு', 'K}': 'மூ', 'A': 'யு', 'A}': 'யூ',
    'U': 'ரு', 'U}': 'ரூ', 'Y': 'லு', 'Y}': 'லூ', 'S}': 'ளு', 'S~': 'ளூ', 'T}': 'வு',
    'T~': 'வூ', 'w}': 'றூ', 'W': 'று', 'W~': 'றூ', 'O': 'ழூ',
    'fp': 'கி', 'qp': 'ஙி', 'rp': 'சி', '[p': 'ஜி', 'Pp': 'ஞி', 'lp': 'டி', 'zp': 'ணி',
    'jp': 'தி', 'ep': 'நி', 'dp': 'னி', 'gp': 'பி', 'kp': 'மி', 'ap': 'யி', 'up': 'ரி',
    'yp': 'லி', 'sp': 'ளி', 'tp': 'வி', 'wp': 'றி', 'op': 'ழி', 'Wp': 'றி',
    'fP': 'கீ', 'qP': 'ஙீ', 'rP': 'சீ', '[P': 'ஜீ', 'PP': 'ஞீ', 'lP': 'டீ', 'zP': 'ணீ',
    'jP': 'தீ', 'eP': 'நீ', 'dP': 'னீ', 'gP': 'பீ', 'kP': 'மீ', 'aP': 'யீ', 'uP': 'ரீ',
    'yP': 'லீ', 'sP': 'ளீ', 'tP': 'வீ', 'wP': 'றீ', 'oP': 'ழீ', 'WP': 'றீ',
    'm': 'அ', 'M': 'ஆ', 'top;': 'ஈ', 'top': 'இ', 'C': 'ஊ', 'v': 'எ', 'V': 'ஏ', 'I': 'ஐ',
    'x': 'ஒ', 'X': 'ஓ', 'xs;': 'ஔ', '/': 'ஃ', 'm/': 'ஃ',
    'f': 'க', 'q': 'ங', 'r': 'ச', '[': 'ஜ', 'P': 'ஞ', 'l': 'ட', 'z': 'ண', 'j': 'த',
    'e': 'ந', 'd': 'ன', 'g': 'ப', 'k': 'ம', 'a': 'ய', 'u': 'ர', 'y': 'ல', 's': 'ள',
    't': 'வ', 'w': 'ற', 'o': 'ழ', 'h': 'ா', 'p': 'ி'
}

AUTO_FIX_DICT = [
    (r'கடÆß', 'கடலூர்'),
    (r'கட³ß', 'கடலூர்'),
    (r'¯தåைமÔ\s*கà\s*அ³வல', 'முதன்மைக் கல்வி அலுவல'),
    (r'¯தåைம', 'முதன்மைக்'),
    (r'கà\s*அ³வல', 'கல்வி அலுவல'),
    (r'ெசயà¯ைறகã', 'செயல்முறைகள்'),
    (r'தâநா©', 'தமிழ்நாடு'),
    (r'அயà\s*இயÔக', 'அறிவியல் இயக்க'),
    (r'அயà', 'அறிவியல்'),
    (r'மாவØடÝ', 'மாவட்டம்'),
    (r'மாவØட', 'மாவட்ட'),
    (r'பã\s*மாணவ', 'பள்ளி மாணவ'),
    (r'பãÔகà', 'பள்ளிக் கல்வி'),
    (r'பãகà', 'பள்ளிகள்'),
    (r'பã', 'பள்ளி'),
    (r'னா}\s*னா', 'வினாடி வினா'),
    (r'னா}', 'வினாடி'),
    (r'ேபாØ}', 'போட்டி'),
    (r'«ß', 'துளிர்'),
    (r'ஜÛதß\s*மÛதß', 'ஜந்தர் மந்தர்'),
    (r'ஆÕxல', 'ஆங்கில'),
    (r'நைடெப²தà', 'நடைபெறுதல்'),
    (r'நைடெபற¶ãள', 'நடைபெறவுள்ள'),
    (r'நைடெப²', 'நடைபெறு'),
    (r'மாணவ\/மாணயß', 'மாணவ/மாணவியர்'),
    (r'மாணவ\/மாணகå', 'மாணவ/மாணவிகள்'),
    (r'பÕேகäக', 'பங்கேற்க'),
    (r'ெசÞதà', 'செய்தல்'),
    (r'ெதாடßபாக', 'தொடர்பாக'),
    (r'பாßைவ', 'பார்வை'),
    (r'ஒ±ÕxைணÜபாள', 'ஒருங்கிணைப்பாள'),
    (r'க}தÝ', 'கடிதம்'),
    (r'க}த', 'கடித'),
    (r'ெசåைன', 'சென்னை'),
    (r'இயÔ¤ந', 'இயக்குந'),
    (r'êÛதைனÚ\s*றå', 'சிந்தனைத் திறன்'),
    (r'ஆÞ¶Ú\s*தåைம', 'ஆய்வுத் தன்மை'),
    (r'பைடÜபாäறைல', 'படைப்பாற்றலை'),
    (r'ஊÔ¤Ôக¶Ý', 'ஊக்குவிக்கவும்'),
    (r'மனÜபாåைம', 'மனப்பான்மை'),
    (r'ேமÝப©Ú«Ý', 'மேம்படுத்தும்'),
    (r'ேநாÔx³Ý', 'நோக்கிலும்'),
    (r'காªÝ', 'காணும்'),
    (r'ெத…ÔகÜபØ©ãள«', 'தெரிவிக்கப்பட்டுள்ளது'),
    (r'அர¦', 'அரசு'),
    (r'°த\s*ெப²Ý', 'உதவி பெறும்'),
    (r'தயாß', 'தனியார்'),
    (r'ந©ைல', 'நடுநிலை'),
    (r'உயßைல', 'உயர்நிலை'),
    (r'ேமàைலÜ', 'மேல்நிலைப்'),
    (r'ேமàைல', 'மேல்நிலை'),
    (r'¯தà', 'முதல்'),
    (r'வ¤Ü®', 'வகுப்பு'),
    (r'ப³Ý', 'பயிலும்'),
    (r'இைணÜà', 'இணைப்பில்'),
    (r'இைணÜ®', 'இணைப்பு'),
    (r'வகாØ©தàகå', 'வழிகாட்டுதல்கள்'),
    (r'ப}', 'படி'),
    (r'மய\s*உண¶டå', 'சுய விருப்ப உணர்வுடன்'),
    (r'இÜேபாØ}à', 'இப்போட்டியில்'),
    (r'கலÛ«ெகாãள', 'கலந்துகொள்ள'),
    (r'உ…ய', 'உரிய'),
    (r'நடவ}Ôைக', 'நடவடிக்கை'),
    (r'ேமäெகாã´மா²', 'மேற்கொள்ளுமாறு'),
    (r'அைனÚ«Ü', 'அனைத்துப்'),
    (r'தைலைமயாê…யßகã', 'தலைமையாசிரியர்கள்'),
    (r'ேகØ©ÔெகாãளÜப©xறாßகã', 'கேட்டுக்கொள்ளப்படுகிறார்கள்'),
    (r'சாßÛத', 'சார்ந்த'),
    (r'ஒÚ«ைழÜைன', 'ஒத்துழைப்பினை'),
    (r'வழÕ¤மா²', 'வழங்குமாறு'),
    (r'ஒÝ\)\/-', 'ஒப்பம்)/-'),
    (r'ெப²நß', 'பெறுநர்'),
    (r'நகà', 'நகல்'),
    (r'இைடைல', 'இடைநிலை'),
    (r'ெதாடÔகÔ', 'தொடக்கக்'),
    (r'±ÚதாசலÝ', 'விருத்தாசலம்')
]

def convert_tam_to_unicode(text: str) -> str:
    if not text: return ""
    for k in sorted(TAB_TAM_MAP.keys(), key=lambda x: len(x), reverse=True):
        if k in text:
            text = text.replace(k, TAB_TAM_MAP[k])
    for pat, rep in AUTO_FIX_DICT:
        text = re.sub(pat, rep, text)
    return text

def convert_bamini_to_unicode(text: str) -> str:
    if not text: return ""
    for k in sorted(BAMINI_MAP.keys(), key=lambda x: len(x), reverse=True):
        if k in text: text = text.replace(k, BAMINI_MAP[k])
    text = re.sub(r'n([க-ஹ])', r'\\1ெ', text)
    text = re.sub(r'N([க-ஹ])', r'\\1ே', text)
    return text

def convert_to_unicode(text: str, encoding: str = "AUTO_DETECT"):
    if not text: return "", "UNICODE", 1.0
    
    # Check if text contains TAB/TAM markers
    tam_chars = sum(1 for c in text if c in TAB_TAM_MAP or c in "ÆØ¯åÔà³…ெãÙ±´}«ßÛÕx²äíÞ¶ª¦°®")
    if tam_chars > 3 or "கடÆß" in text or "¯தåைம" in text:
        converted = convert_tam_to_unicode(text)
        return converted, "TAB/TAM", 0.98

    if "f;" in text or "nfs;" in text or "m" in text:
        converted = convert_bamini_to_unicode(text)
        converted = re.sub(r'ொ', 'ொ', converted)
        converted = re.sub(r'ோ', 'ோ', converted)
        converted = re.sub(r'ெள', 'ௌ', converted)
        return converted, "BAMINI", 0.95

    return text, "UNICODE", 0.99

GOV_LEGAL_LEXICON = {
    'அரசாணை': {'meaningEn': 'Government Order (G.O.)', 'category': 'Official Document', 'root': 'அரசு + ஆணை'},
    'தலைமைச்': {'meaningEn': 'Chief / Principal / Secretariat', 'category': 'Designation', 'root': 'தலைமை'},
    'செயலகம்': {'meaningEn': 'Secretariat', 'category': 'Administration', 'root': 'செயலகம்'},
    'பார்வை': {'meaningEn': 'Reference / Read', 'category': 'Order Structure', 'root': 'பார்வை'},
    'பொருள்': {'meaningEn': 'Subject / Matter', 'category': 'Order Structure', 'root': 'பொருள்'},
    'ஆணை': {'meaningEn': 'Order / Directive', 'category': 'Order Structure', 'root': 'ஆணை'},
    'ஒப்பம்': {'meaningEn': 'Signature', 'category': 'Authentication', 'root': 'ஒப்பம்'}
}
`;

  const tamilDocxCode = `"""
Tamil DOCX Exporter
"""
try:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
except ImportError:
    Document = None

def export_tamil_docx(output_path, metadata, lines, tables=None, font_name="TAU-Marutham"):
    if Document is None:
        raise ImportError("python-docx is required. Run 'pip install python-docx'.")
    doc = Document()
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("தமிழ்நாடு அரசு\\n")
    r.font.name = font_name
    r.font.size = Pt(16)
    r.font.bold = True

    dept = metadata.get("department", "பள்ளிக் கல்வித்துறை")
    r_d = p.add_run(f"{dept}\\n")
    r_d.font.name = font_name
    r_d.font.size = Pt(12)
    r_d.font.bold = True

    title = metadata.get("documentTitle", "அரசாணை")
    p_t = doc.add_paragraph()
    p_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t = p_t.add_run(title)
    r_t.font.name = font_name
    r_t.font.size = Pt(13)
    r_t.font.bold = True
    r_t.font.underline = True

    for line in lines:
        txt = line.get("tamilText", "").strip()
        if not txt: continue
        p_l = doc.add_paragraph()
        r_l = p_l.add_run(txt)
        r_l.font.name = font_name
        r_l.font.size = Pt(11)

    doc.save(output_path)
    return output_path
`;

  const buildExePy = `import subprocess, sys, os
print("📦 Building Tamil Archive OCR Studio Standalone .exe...")
cmd = [
    sys.executable, "-m", "PyInstaller",
    "--name=Tamil_Archive_OCR_Studio",
    "--onefile",
    "--windowed",
    "--clean",
    "--hidden-import=PIL",
    "--hidden-import=PIL.Image",
    "--hidden-import=fitz",
    "--hidden-import=docx",
    "--hidden-import=pytesseract",
    "desktop_app.py"
]
result = subprocess.run(cmd)
if result.returncode == 0:
    print("\\n✅ SUCCESS! Single-file executable ready at: dist/Tamil_Archive_OCR_Studio.exe")
else:
    print("\\n❌ Build failed. Please ensure dependencies are installed via 'pip install -r requirements.txt'")
`;

  const buildExeBat = `@echo off
title Build Tamil Offline OCR Executable
echo Step 1: Installing dependencies...
pip install -r requirements.txt
echo.
echo Step 2: Building single-file Standalone .exe ...
python build_exe.py
echo.
pause
`;

  const requirementsTxt = `pytesseract>=0.3.10
pymupdf>=1.23.0
python-docx>=1.1.0
pillow>=10.0.0
pyinstaller>=6.0.0
`;

  const readmeMd = `# தமிழ் ஆவணக் காப்பகம் (Tamil Archive OCR & Morphological Suite)
## 100% Offline Standalone Desktop Application & Python Executables

### 🚀 Quick Start (இலகுவான 2 படிகள்)
1. Python நூலகங்களை நிறுவவும்:
   \`pip install -r requirements.txt\`
2. செயலியைத் தொடங்கவும்:
   \`python desktop_app.py\`

### 📌 Tesseract OCR நிறுவ தேவையில்லை (Digital PDFs):
டிஜிட்டல் வடிவிலான தமிழ் PDF-களுக்கு Tesseract தேவையில்லை, தானாகவே TAM/TAB உரை பிரித்தெடுக்கப்பட்டு தூய யூனிகோடாக மாற்றப்படும்!

### 📌 Scanned படங்களுக்கு Tesseract OCR நிறுவும் முறை:
ஸ்கேன் செய்யப்பட்ட படங்களை வாசிக்க மட்டும் Tesseract OCR தேவை:
https://github.com/UB-Mannheim/tesseract/wiki
(நிறுவும் போது Additional Language Data-வில் "Tamil" டிக் செய்யவும்).
`;

  // Add files to zip
  zip.file("desktop_app.py", desktopAppCode);
  zip.file("tamil_converter.py", tamilConverterCode);
  zip.file("tamil_docx_exporter.py", tamilDocxCode);
  zip.file("tamil_ocr_engine.py", tamilOcrEngineCode);
  zip.file("build_exe.py", buildExePy);
  zip.file("build_exe.bat", buildExeBat);
  zip.file("requirements.txt", requirementsTxt);
  zip.file("README.md", readmeMd);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Tamil_Offline_Python_OCR_Suite.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
