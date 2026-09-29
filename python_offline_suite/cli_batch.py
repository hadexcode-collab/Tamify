"""
Command-Line Interface (CLI) Batch Processor for Tamil Archive OCR
Converts entire folders of Tamil PDFs / Images / Legacy text files into Unicode & DOCX offline.

Usage:
    python cli_batch.py --input-dir ./scanned_pdfs --output-dir ./converted_docs --export docx
"""

import os
import argparse
import time
from tamil_ocr_engine import run_offline_ocr
from tamil_docx_exporter import export_tamil_docx

def main():
    parser = argparse.ArgumentParser(description="Tamil Offline OCR & DOCX Batch Processor")
    parser.add_argument("--input-dir", "-i", required=True, help="Path to input directory containing PDFs/Images")
    parser.add_argument("--output-dir", "-o", default="./output_docx", help="Path to output directory")
    parser.add_argument("--encoding", "-e", default="AUTO_DETECT", choices=["AUTO_DETECT", "BAMINI", "TAM", "TAB", "VAANAVIL", "UNICODE"], help="Legacy font encoding standard")
    parser.add_argument("--format", "-f", default="docx", choices=["docx", "txt", "json", "all"], help="Export format")

    args = parser.parse_args()

    if not os.path.exists(args.input_dir):
        print(f"Error: Input directory '{args.input_dir}' not found.")
        return

    os.makedirs(args.output_dir, exist_ok=True)

    supported_exts = ('.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.webp', '.txt')
    files_to_process = []

    for root, _, files in os.walk(args.input_dir):
        for f in files:
            if f.lower().endswith(supported_exts):
                files_to_process.append(os.path.join(root, f))

    total = len(files_to_process)
    print(f"==================================================")
    print(f"🚀 Tamil Offline Batch OCR Processor")
    print(f"Found {total} files in '{args.input_dir}'")
    print(f"Output directory: '{args.output_dir}'")
    print(f"==================================================")

    start_time = time.time()
    success_count = 0

    for idx, file_path in enumerate(files_to_process):
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        print(f"[{idx+1}/{total}] Processing: {os.path.basename(file_path)}...", end="", flush=True)

        try:
            res = run_offline_ocr(file_path, args.encoding)

            if args.format in ['docx', 'all']:
                docx_path = os.path.join(args.output_dir, f"{base_name}_Converted.docx")
                export_tamil_docx(
                    output_path=docx_path,
                    metadata=res.get("metadata", {}),
                    lines=res.get("lines", []),
                    tables=res.get("tables", [])
                )

            if args.format in ['txt', 'all']:
                txt_path = os.path.join(args.output_dir, f"{base_name}_Unicode.txt")
                with open(txt_path, "w", encoding="utf-8") as tf:
                    tf.write(res.get("fullUnicodeText", ""))

            print(" [OK]")
            success_count += 1
        except Exception as e:
            print(f" [FAILED: {e}]")

    elapsed = round(time.time() - start_time, 2)
    print(f"==================================================")
    print(f"Completed {success_count}/{total} files in {elapsed}s.")
    print(f"Results saved to: {os.path.abspath(args.output_dir)}")
    print(f"==================================================")

if __name__ == "__main__":
    main()
