"""
Tamil Government Order DOCX Exporter
Generates standardized Tamil Government Order Word documents (.docx)
with correct typographic hierarchy, metadata blocks, references, tables, and signature blocks.
"""

from typing import Dict, List, Any, Optional
import os

try:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import nsdecls, qn
except ImportError:
    # Graceful message if python-docx isn't installed yet
    pass

def set_cell_background(cell, fill_hex="F1F5F9"):
    """Set background shading on a Word table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Set inner padding on a Word table cell in dxa (1/20 pt)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def export_tamil_docx(
    output_path: str,
    metadata: Dict[str, Any],
    lines: List[Dict[str, Any]],
    tables: Optional[List[Dict[str, Any]]] = None,
    font_name: str = "TAU-Marutham"
) -> str:
    """
    Generates a professionally structured Tamil Government Order (.docx)
    """
    doc = Document()

    # Set 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # 1. State Emblem & Government Header
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_header.paragraph_format.space_after = Pt(2)
    p_header.paragraph_format.line_spacing = 1.15
    run_gov = p_header.add_run("தமிழ்நாடு அரசு\n")
    run_gov.font.name = font_name
    run_gov.font.size = Pt(16)
    run_gov.font.bold = True
    run_gov.font.color.rgb = RGBColor(15, 23, 42)

    dept_name = metadata.get("department", "பள்ளிக் கல்வித்துறை")
    run_dept = p_header.add_run(f"{dept_name}\n")
    run_dept.font.name = font_name
    run_dept.font.size = Pt(12)
    run_dept.font.bold = True

    # 2. Document Title / G.O. Ms Number Box
    doc_title = metadata.get("documentTitle") or metadata.get("orderNumber") or "அரசாணை (நிலை) எண். 143"
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(4)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run(f"{doc_title}")
    run_title.font.name = font_name
    run_title.font.size = Pt(13)
    run_title.font.bold = True
    run_title.font.underline = True

    # 3. Date & Place
    date_place_text = []
    if metadata.get("place"):
        date_place_text.append(metadata["place"])
    if metadata.get("dateStr"):
        date_place_text.append(f"நாள்: {metadata['dateStr']}")
    
    if date_place_text:
        p_dp = doc.add_paragraph()
        p_dp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_dp.paragraph_format.space_after = Pt(12)
        run_dp = p_dp.add_run(", ".join(date_place_text))
        run_dp.font.name = font_name
        run_dp.font.size = Pt(10.5)
        run_dp.font.italic = True

    # 4. Subject (பொருள்) Block
    if metadata.get("subject"):
        p_subj = doc.add_paragraph()
        p_subj.paragraph_format.space_after = Pt(6)
        p_subj.paragraph_format.left_indent = Inches(0.4)
        run_subj_lbl = p_subj.add_run("பொருள்: ")
        run_subj_lbl.font.name = font_name
        run_subj_lbl.font.size = Pt(11)
        run_subj_lbl.font.bold = True

        run_subj_val = p_subj.add_run(metadata["subject"])
        run_subj_val.font.name = font_name
        run_subj_val.font.size = Pt(11)

    # 5. Reference (பார்வை) Block
    if metadata.get("reference"):
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.space_after = Pt(14)
        p_ref.paragraph_format.left_indent = Inches(0.4)
        run_ref_lbl = p_ref.add_run("பார்வை: ")
        run_ref_lbl.font.name = font_name
        run_ref_lbl.font.size = Pt(11)
        run_ref_lbl.font.bold = True

        run_ref_val = p_ref.add_run(metadata["reference"])
        run_ref_val.font.name = font_name
        run_ref_val.font.size = Pt(11)

    # 6. Main Body Content (Paragraphs & Lines)
    for line in lines:
        text = line.get("tamilText", "").strip()
        if not text:
            continue
        
        line_type = line.get("type", "PARAGRAPH")
        
        if line_type == "HEADER":
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(text)
            run.font.name = font_name
            run.font.size = Pt(12)
            run.font.bold = True
        elif line_type == "SUBJECT" or line_type == "REFERENCE":
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.4)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(text)
            run.font.name = font_name
            run.font.size = Pt(11)
            run.font.bold = True
        elif line_type == "SIGNATURE":
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(text)
            run.font.name = font_name
            run.font.size = Pt(11)
            run.font.bold = True
        else:
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.2
            run = p.add_run(text)
            run.font.name = font_name
            run.font.size = Pt(11)

    # 7. Tables (if any)
    if tables:
        for t_data in tables:
            headers = t_data.get("headers", [])
            rows = t_data.get("rows", [])
            if not headers and not rows:
                continue

            caption = t_data.get("caption")
            if caption:
                p_cap = doc.add_paragraph()
                p_cap.paragraph_format.space_before = Pt(10)
                p_cap.paragraph_format.space_after = Pt(3)
                r_cap = p_cap.add_run(caption)
                r_cap.font.name = font_name
                r_cap.font.size = Pt(10.5)
                r_cap.font.bold = True

            col_count = max(len(headers), max((len(r) for r in rows), default=0))
            if col_count == 0:
                continue

            table = doc.add_table(rows=0, cols=col_count)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            table.autofit = False

            # Add Header Row
            if headers:
                hdr_cells = table.add_row().cells
                for i, h_text in enumerate(headers):
                    if i < col_count:
                        hdr_cells[i].text = str(h_text)
                        set_cell_background(hdr_cells[i], "E2E8F0")
                        set_cell_margins(hdr_cells[i])
                        for p in hdr_cells[i].paragraphs:
                            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                            for r in p.runs:
                                r.font.name = font_name
                                r.font.size = Pt(10)
                                r.font.bold = True

            # Add Data Rows
            for row_vals in rows:
                row_cells = table.add_row().cells
                for i, cell_val in enumerate(row_vals):
                    if i < col_count:
                        row_cells[i].text = str(cell_val)
                        set_cell_margins(row_cells[i])
                        for p in row_cells[i].paragraphs:
                            for r in p.runs:
                                r.font.name = font_name
                                r.font.size = Pt(9.5)

    # 8. Signature Block
    signatory = metadata.get("signatory")
    if signatory:
        p_sig = doc.add_paragraph()
        p_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_sig.paragraph_format.space_before = Pt(20)
        p_sig.paragraph_format.space_after = Pt(2)
        r_sig_order = p_sig.add_run("(ஆளுநரின் ஆணைப்படி)\n\n\n")
        r_sig_order.font.name = font_name
        r_sig_order.font.size = Pt(11)
        r_sig_order.font.italic = True

        r_sig = p_sig.add_run(f"{signatory}\nஅரசு முதன்மைச் செயலாளர்")
        r_sig.font.name = font_name
        r_sig.font.size = Pt(11.5)
        r_sig.font.bold = True

    # 9. Seal / Metadata Footer
    seal_text = metadata.get("sealText")
    if seal_text:
        p_seal = doc.add_paragraph()
        p_seal.paragraph_format.space_before = Pt(16)
        r_seal = p_seal.add_run(f"// உண்மை நகல் //\n{seal_text}")
        r_seal.font.name = font_name
        r_seal.font.size = Pt(9.5)
        r_seal.font.italic = True
        r_seal.font.color.rgb = RGBColor(100, 116, 139)

    doc.save(output_path)
    return output_path
