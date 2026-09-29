/**
 * DOCX Document Generator for Tamil Unicode Text
 * Built with docx npm package to produce genuine, beautifully formatted Word files (.docx)
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  HeadingLevel,
  ShadingType
} from 'docx';
import { OCRProcessResult, DocxExportConfig, OfficialReplyLetterData } from '../types';

export async function generateTamilDocxBlob(
  result: OCRProcessResult,
  config: DocxExportConfig
): Promise<Blob> {
  const primaryFont = config.fontFamily || 'Tau-marutham';
  const defaultFontSizePt = config.fontSize || 12;
  const halfPoints = defaultFontSizePt * 2; // docx uses half-points (12pt = 24)

  const docChildren: (Paragraph | Table)[] = [];

  // 1. Government / Official Letterhead (if configured)
  if (config.includeHeaderLetterhead) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({
            text: config.letterheadText || 'தமிழ்நாடு அரசு / GOVERNMENT OF TAMIL NADU',
            bold: true,
            size: halfPoints + 6,
            font: primaryFont,
            color: '1A365D'
          })
        ]
      })
    );

    if (config.subLetterheadText) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 180 },
          children: [
            new TextRun({
              text: config.subLetterheadText,
              size: halfPoints,
              font: primaryFont,
              color: '4A5568'
            })
          ]
        })
      );
    }
  }

  // 2. Document Title (Only add if not already the first heading line of the document)
  const firstLineText = result.lines[0]?.tamilText?.trim();
  const isFirstLineTitle = firstLineText && (
    firstLineText === config.documentTitle ||
    firstLineText === result.metadata?.documentTitle ||
    result.lines[0]?.type === 'HEADER'
  );

  if (config.documentTitle && !isFirstLineTitle && config.documentTitle !== 'தமிழ் ஆவணம்' && config.documentTitle !== 'Tamil Document') {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 180 },
        children: [
          new TextRun({
            text: config.documentTitle,
            bold: true,
            size: halfPoints + 4,
            font: primaryFont,
            color: '1A202C'
          })
        ]
      })
    );
  }

  // 3. Metadata Table (Order No, Date, Department, Subject, Reference)
  if (config.includeDocumentMetadata && (result.metadata?.orderNumber || result.metadata?.department || result.metadata?.subject)) {
    const metaRows: TableRow[] = [];

    if (result.metadata.department) {
      metaRows.push(createMetaRow('துறை / Department', result.metadata.department, primaryFont, halfPoints));
    }
    if (result.metadata.orderNumber) {
      metaRows.push(createMetaRow('அரசாணை எண் / Order No', result.metadata.orderNumber, primaryFont, halfPoints));
    }
    if (result.metadata.dateStr) {
      metaRows.push(createMetaRow('நாள் / Date', result.metadata.dateStr, primaryFont, halfPoints));
    }
    if (result.metadata.subject) {
      metaRows.push(createMetaRow('பொருள் / Subject', result.metadata.subject, primaryFont, halfPoints));
    }
    if (result.metadata.reference) {
      metaRows.push(createMetaRow('பார்வை / Reference', result.metadata.reference, primaryFont, halfPoints));
    }

    if (metaRows.length > 0) {
      const metaTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: metaRows
      });
      docChildren.push(metaTable);
      docChildren.push(new Paragraph({ spacing: { before: 180, after: 120 }, children: [] }));
    }
  }

  // 4. Document Body Lines & Tables
  let tableRendered = false;

  for (let i = 0; i < result.lines.length; i++) {
    const line = result.lines[i];
    const textTrim = line.tamilText.trim();

    // Check if line represents a table or if tables should be rendered
    if (line.type === 'TABLE_ROW' || textTrim.includes('|')) {
      // If we haven't rendered structured tables yet and result.tables exists
      if (!tableRendered && result.tables && result.tables.length > 0) {
        for (const tbl of result.tables) {
          if (tbl.caption) {
            docChildren.push(
              new Paragraph({
                spacing: { before: 140, after: 60 },
                children: [
                  new TextRun({
                    text: tbl.caption,
                    bold: true,
                    size: halfPoints,
                    font: primaryFont
                  })
                ]
              })
            );
          }

          const tableRows: TableRow[] = [];
          if (tbl.headers && tbl.headers.length > 0) {
            tableRows.push(
              new TableRow({
                tableHeader: true,
                children: tbl.headers.map(
                  (h) =>
                    new TableCell({
                      shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: h,
                              bold: true,
                              size: halfPoints,
                              font: primaryFont,
                              color: '0F172A'
                            })
                          ]
                        })
                      ]
                    })
                )
              })
            );
          }

          for (const row of tbl.rows) {
            tableRows.push(
              new TableRow({
                children: row.map(
                  (cell) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: cell || ' ',
                              size: halfPoints,
                              font: primaryFont,
                              color: '1E293B'
                            })
                          ]
                        })
                      ]
                    })
                )
              })
            );
          }

          docChildren.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows
            })
          );
          docChildren.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [] }));
        }
        tableRendered = true;
      }
      continue;
    }

    // Centered or Form Header lines (e.g. "உறுதிமொழி படிவம்" or "(அல்லது)")
    const isCenteredHeader =
      line.type === 'HEADER' ||
      i === 0 ||
      textTrim === '(அல்லது)' ||
      textTrim === 'அல்லது' ||
      textTrim.startsWith('உறுதிமொழி படிவம்');

    const isUnderlined =
      textTrim.includes('தேர்வு செய்யப்பட்டிருக்க வேண்டும்') ||
      textTrim.includes('கீழ்க்காணும்');

    if (isCenteredHeader) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 120 },
          children: [
            new TextRun({
              text: line.tamilText,
              bold: true,
              size: i === 0 ? halfPoints + 4 : halfPoints + 1,
              font: primaryFont,
              color: '0F172A'
            })
          ]
        })
      );
    } else if (line.type === 'SIGNATURE') {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 240, after: 80 },
          children: [
            new TextRun({
              text: line.tamilText,
              bold: true,
              size: halfPoints,
              font: primaryFont,
              color: '1E293B'
            })
          ]
        })
      );
    } else if (line.type === 'REFERENCE' || line.type === 'SUBJECT') {
      docChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 80 },
          children: [
            new TextRun({
              text: line.tamilText,
              bold: true,
              size: halfPoints,
              font: primaryFont,
              color: '1E293B'
            })
          ]
        })
      );
    } else {
      // Standard Paragraph
      docChildren.push(
        new Paragraph({
          spacing: { before: 80, after: 80, line: Math.round(config.lineSpacing * 240) },
          children: [
            new TextRun({
              text: line.tamilText,
              bold: isUnderlined,
              underline: isUnderlined ? {} : undefined,
              size: halfPoints,
              font: primaryFont,
              color: '1E293B'
            })
          ]
        })
      );
    }
  }

  // 5. Render Structured Tables (if not yet rendered inline)
  if (!tableRendered && result.tables && result.tables.length > 0) {
    for (const tbl of result.tables) {
      if (tbl.caption) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: tbl.caption,
                bold: true,
                size: halfPoints,
                font: primaryFont
              })
            ]
          })
        );
      }

      const tableRows: TableRow[] = [];

      // Header row
      if (tbl.headers && tbl.headers.length > 0) {
        tableRows.push(
          new TableRow({
            tableHeader: true,
            children: tbl.headers.map(
              (h) =>
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: h,
                          bold: true,
                          size: halfPoints,
                          font: primaryFont,
                          color: '0F172A'
                        })
                      ]
                    })
                  ]
                })
            )
          })
        );
      }

      // Data rows
      for (const row of tbl.rows) {
        tableRows.push(
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell || ' ',
                          size: halfPoints,
                          font: primaryFont,
                          color: '1E293B'
                        })
                      ]
                    })
                  ]
                })
            )
          })
        );
      }

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        })
      );
      docChildren.push(new Paragraph({ spacing: { before: 140, after: 60 }, children: [] }));
    }
  }

  // 6. Optional Pronunciation / Transliteration & Gloss Appendix
  if (config.includePronunciationAppendix) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
        children: [
          new TextRun({
            text: 'இணைப்பு: உச்சரிப்பு மற்றும் அரசு சொல் விளக்கம் (ISO 15919 Appendix & Glossary)',
            bold: true,
            size: halfPoints + 2,
            font: primaryFont,
            color: '2B6CB0'
          })
        ]
      })
    );

    const glossRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell('தமிழ் சொல் / Tamil Term', primaryFont, halfPoints),
          createHeaderCell('ISO 15919 Transliteration', primaryFont, halfPoints),
          createHeaderCell('பொருள் / Official English Meaning', primaryFont, halfPoints)
        ]
      })
    ];

    const uniqueWords = new Map<string, { iso: string; meaning: string }>();
    for (const line of result.lines) {
      for (const w of line.words) {
        if (w.isGovernmentTerm && w.meaningEn && !uniqueWords.has(w.text)) {
          uniqueWords.set(w.text, { iso: w.isoTransliteration, meaning: w.meaningEn });
        }
      }
    }

    for (const [term, data] of uniqueWords.entries()) {
      glossRows.push(
        new TableRow({
          children: [
            createBodyCell(term, primaryFont, halfPoints, true),
            createBodyCell(data.iso, 'Courier New', halfPoints - 2, false),
            createBodyCell(data.meaning, primaryFont, halfPoints - 2, false)
          ]
        })
      );
    }

    if (uniqueWords.size > 0) {
      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: glossRows
        })
      );
    }
  }

  // Create the final Document with clean layout and no unwanted headers/footers
  const doc = new Document({
    title: config.documentTitle || 'Tamil Unicode Document',
    description: 'Converted from legacy Tamil document using OCR ensemble and deterministic font conversion.',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200,
              bottom: 1200,
              left: 1200,
              right: 1200
            }
          }
        },
        children: docChildren
      }
    ]
  });

  return await Packer.toBlob(doc);
}

function createMetaRow(label: string, value: string, font: string, halfPoints: number): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: 'F7FAFC' },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: label,
                bold: true,
                size: halfPoints - 2,
                font,
                color: '4A5568'
              })
            ]
          })
        ]
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: value,
                size: halfPoints - 2,
                font,
                color: '1A202C'
              })
            ]
          })
        ]
      })
    ]
  });
}

function createHeaderCell(text: string, font: string, halfPoints: number): TableCell {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: true,
            size: halfPoints - 2,
            font,
            color: '2D3748'
          })
        ]
      })
    ]
  });
}

function createBodyCell(text: string, font: string, halfPoints: number, bold: boolean): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            size: halfPoints,
            font,
            color: '2D3748'
          })
        ]
      })
    ]
  });
}

/**
 * Generate a Government Standard Official Reply Letter in Tamil Tau-marutham font (.docx)
 * Following Tamil Nadu Secretariat & Collectorate standard formatting:
 * - Proper 1-inch margins
 * - Letterhead, Reference number & Date in 2-column borderless layout
 * - Indented From and To sections
 * - Hanging-indent Subject and References
 * - Justified body paragraphs with 0.5" first-line indent
 * - Right-aligned signature block
 * - Pure Tau-marutham typography
 */
export async function generateOfficialReplyLetterDocx(
  letter: OfficialReplyLetterData,
  options?: {
    fontFamily?: string;
    fontSizePt?: number;
  }
): Promise<Blob> {
  const primaryFont = options?.fontFamily || letter.fontFamily || 'Tau-marutham';
  const defaultFontSizePt = options?.fontSizePt || letter.fontSizePt || 12;
  const halfPoints = defaultFontSizePt * 2; // docx half-points (12pt = 24 half-points)

  const docChildren: (Paragraph | Table)[] = [];
  const isModelLayout = letter.formatStyle !== 'SECRETARIAT_STANDARD';

  if (isModelLayout) {
    // =========================================================================
    // MODEL LAYOUT (HM to DEO Official Format):
    // 1. Top Section: 2-Column Table (Left: அனுப்புநர், Right: பெறுநர்)
    // =========================================================================
    const fromLines: string[] = [];
    if (letter.fromPersonName) fromLines.push(letter.fromPersonName);
    if (letter.fromDesignation) fromLines.push(letter.fromDesignation);
    if (letter.fromDepartment) fromLines.push(letter.fromDepartment);
    if (letter.fromPlace) {
      letter.fromPlace.split('\n').map(s => s.trim()).filter(Boolean).forEach(part => {
        fromLines.push(part);
      });
    }

    const toLines: string[] = [];
    if (letter.toDesignation) toLines.push(letter.toDesignation);
    if (letter.toDepartment) toLines.push(letter.toDepartment);
    if (letter.toPlace) {
      letter.toPlace.split('\n').map(s => s.trim()).filter(Boolean).forEach(part => {
        toLines.push(part);
      });
    }

    const headerTwoColTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            // Left Cell: அனுப்புநர்
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 60 },
                  children: [
                    new TextRun({
                      text: 'அனுப்புநர்',
                      bold: true,
                      size: halfPoints,
                      font: primaryFont,
                      color: '000000'
                    })
                  ]
                }),
                ...fromLines.map((line) =>
                  new Paragraph({
                    spacing: { before: 10, after: 20, line: 240 },
                    children: [
                      new TextRun({
                        text: line,
                        size: halfPoints,
                        font: primaryFont,
                        color: '000000'
                      })
                    ]
                  })
                )
              ]
            }),
            // Right Cell: பெறுநர்
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 60 },
                  children: [
                    new TextRun({
                      text: 'பெறுநர்',
                      bold: true,
                      size: halfPoints,
                      font: primaryFont,
                      color: '000000'
                    })
                  ]
                }),
                ...toLines.map((line) =>
                  new Paragraph({
                    spacing: { before: 10, after: 20, line: 240 },
                    children: [
                      new TextRun({
                        text: line,
                        size: halfPoints,
                        font: primaryFont,
                        color: '000000'
                      })
                    ]
                  })
                )
              ]
            })
          ]
        })
      ]
    });
    docChildren.push(headerTwoColTable);

    // Spacing before boxed line
    docChildren.push(new Paragraph({ spacing: { before: 80, after: 80 }, children: [] }));

    // =========================================================================
    // 2. Framed Box: [ ந.க.எண்: ...              நாள்: ... ]
    // =========================================================================
    const refDateBoxTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 6, color: '1E293B' },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: '1E293B' },
        left: { style: BorderStyle.SINGLE, size: 6, color: '1E293B' },
        right: { style: BorderStyle.SINGLE, size: 6, color: '1E293B' },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 80, after: 80 },
                  children: [
                    new TextRun({
                      text: `ந.க.எண்: ${letter.letterRefNumber || ''}`,
                      bold: true,
                      size: halfPoints,
                      font: primaryFont,
                      color: '000000'
                    })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 80, after: 80 },
                  children: [
                    new TextRun({
                      text: `நாள்: ${letter.letterDate || ''}`,
                      bold: true,
                      size: halfPoints,
                      font: primaryFont,
                      color: '000000'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
    docChildren.push(refDateBoxTable);

    // Spacing after box
    docChildren.push(new Paragraph({ spacing: { before: 140, after: 40 }, children: [] }));
  } else {
    // Secretariat Standard Layout
    if (letter.letterheadGov) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: letter.letterheadGov,
              bold: true,
              size: halfPoints + 4,
              font: primaryFont,
              color: '0F172A'
            })
          ]
        })
      );
    }

    if (letter.letterheadDept) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 20, after: 30 },
          children: [
            new TextRun({
              text: letter.letterheadDept,
              bold: true,
              size: halfPoints + 2,
              font: primaryFont,
              color: '1E293B'
            })
          ]
        })
      );
    }

    if (letter.letterheadOffice) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 10, after: 120 },
          children: [
            new TextRun({
              text: letter.letterheadOffice,
              size: halfPoints,
              font: primaryFont,
              color: '334155'
            })
          ]
        })
      );
    }

    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '94A3B8' },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  spacing: { before: 60, after: 80 },
                  children: [
                    new TextRun({
                      text: `கடித ந.க. எண்: ${letter.letterRefNumber || ''}`,
                      bold: true,
                      size: halfPoints,
                      font: primaryFont,
                      color: '0F172A'
                    })
                  ]
                })
              ]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 60, after: 80 },
                  children: [
                    new TextRun({
                      text: `நாள்: ${letter.letterDate || ''}`,
                      bold: true,
                      size: halfPoints,
                      font: primaryFont,
                      color: '0F172A'
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
    docChildren.push(metaTable);

    // அனுப்புநர்
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 180, after: 40 },
        children: [
          new TextRun({
            text: 'அனுப்புநர்:',
            bold: true,
            size: halfPoints,
            font: primaryFont,
            color: '0F172A'
          })
        ]
      })
    );

    const fromLines = [
      letter.fromPersonName,
      letter.fromDesignation,
      letter.fromDepartment,
      letter.fromPlace
    ].filter(Boolean) as string[];

    for (const line of fromLines) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          indent: { left: 720 },
          spacing: { before: 20, after: 20, line: 260 },
          children: [
            new TextRun({
              text: line,
              size: halfPoints,
              font: primaryFont,
              color: '1E293B'
            })
          ]
        })
      );
    }

    // பெறுநர்
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 140, after: 40 },
        children: [
          new TextRun({
            text: 'பெறுநர்:',
            bold: true,
            size: halfPoints,
            font: primaryFont,
            color: '0F172A'
          })
        ]
      })
    );

    const toLines = [
      letter.toDesignation,
      letter.toDepartment,
      letter.toPlace
    ].filter(Boolean);

    for (const line of toLines) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          indent: { left: 720 },
          spacing: { before: 20, after: 20, line: 260 },
          children: [
            new TextRun({
              text: line,
              size: halfPoints,
              font: primaryFont,
              color: '1E293B'
            })
          ]
        })
      );
    }
  }

  // =========================================================================
  // 3. பொருள் (Subject) with Hanging Indent
  // =========================================================================
  if (letter.subject) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 900, hanging: 900 },
        spacing: { before: 120, after: 80, line: 280 },
        children: [
          new TextRun({
            text: 'பொருள்:\t',
            bold: true,
            size: halfPoints,
            font: primaryFont,
            color: '000000'
          }),
          new TextRun({
            text: letter.subject,
            size: halfPoints,
            font: primaryFont,
            color: '000000'
          })
        ]
      })
    );
  }

  // =========================================================================
  // 4. பார்வை (Reference) with Hanging Indent
  // =========================================================================
  if (letter.references && letter.references.length > 0) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 900, hanging: 900 },
        spacing: { before: 60, after: 40, line: 280 },
        children: [
          new TextRun({
            text: 'பார்வை:\t',
            bold: true,
            size: halfPoints,
            font: primaryFont,
            color: '000000'
          }),
          new TextRun({
            text: letter.references[0],
            size: halfPoints,
            font: primaryFont,
            color: '000000'
          })
        ]
      })
    );

    for (let r = 1; r < letter.references.length; r++) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 900 },
          spacing: { before: 20, after: 40, line: 280 },
          children: [
            new TextRun({
              text: letter.references[r],
              size: halfPoints,
              font: primaryFont,
              color: '000000'
            })
          ]
        })
      );
    }

    // Centered Asterisks Divider **********
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 120 },
        children: [
          new TextRun({
            text: '**********',
            bold: true,
            size: halfPoints,
            font: primaryFont,
            color: '000000'
          })
        ]
      })
    );
  }

  // =========================================================================
  // 5. Salutation (ஐயா, / மதிப்புடையீர்,)
  // =========================================================================
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 100, after: 80 },
      children: [
        new TextRun({
          text: letter.salutation || 'ஐயா,',
          bold: true,
          size: halfPoints,
          font: primaryFont,
          color: '000000'
        })
      ]
    })
  );

  // =========================================================================
  // 6. Body Paragraphs (Justified, First-Line Indent 720 dxa, 1.15 line spacing)
  // =========================================================================
  const paragraphs = letter.bodyParagraphs && letter.bodyParagraphs.length > 0
    ? letter.bodyParagraphs
    : ['பார்வையில் குறிப்பிடப்பட்டுள்ள தங்களின் கடிதம் பெறப்பட்டு கவனமுடன் பரிசீலிக்கப்பட்டது.'];

  paragraphs.forEach((pText) => {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 720 },
        spacing: { before: 80, after: 100, line: 280 },
        children: [
          new TextRun({
            text: pText,
            size: halfPoints,
            font: primaryFont,
            color: '000000'
          })
        ]
      })
    );
  });

  // =========================================================================
  // 7. Bottom Section: Left: இணைப்பு | Right: Signatory (தலைமை ஆசிரியர்)
  // =========================================================================
  if (isModelLayout) {
    const encParagraphs: Paragraph[] = [];
    if (letter.enclosures && letter.enclosures.length > 0) {
      if (letter.enclosures.length === 1) {
        const rawEnc = letter.enclosures[0].replace(/^இணைப்பு\s*[:.-]\s*/, '').replace(/^[0-9.]+\s*/, '');
        encParagraphs.push(
          new Paragraph({
            spacing: { before: 240, after: 20 },
            children: [
              new TextRun({
                text: `இணைப்பு : ${rawEnc}`,
                size: halfPoints,
                font: primaryFont,
                color: '000000'
              })
            ]
          })
        );
      } else {
        encParagraphs.push(
          new Paragraph({
            spacing: { before: 240, after: 20 },
            children: [
              new TextRun({
                text: 'இணைப்பு :',
                bold: true,
                size: halfPoints,
                font: primaryFont,
                color: '000000'
              })
            ]
          })
        );
        for (let i = 0; i < letter.enclosures.length; i++) {
          encParagraphs.push(
            new Paragraph({
              indent: { left: 360 },
              spacing: { before: 10, after: 20 },
              children: [
                new TextRun({
                  text: letter.enclosures[i],
                  size: halfPoints,
                  font: primaryFont,
                  color: '000000'
                })
              ]
            })
          );
        }
      }
    } else {
      encParagraphs.push(new Paragraph({ children: [] }));
    }

    const hmAddressLines: string[] = [];
    if (letter.fromDepartment) hmAddressLines.push(letter.fromDepartment);
    if (letter.fromPlace) {
      letter.fromPlace.split('\n').map(s => s.trim()).filter(Boolean).forEach(part => {
        hmAddressLines.push(part);
      });
    }

    const bottomTwoColTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE }
      },
      rows: [
        new TableRow({
          children: [
            // Left: இணைப்பு
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: encParagraphs
            }),
            // Right: தலைமை ஆசிரியர் & பள்ளி முகவரி (HM Designation, School Name & Address)
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 240, after: 30 },
                  children: [
                    new TextRun({
                      text: letter.signatoryDesignation || 'தலைமை ஆசிரியர்',
                      bold: true,
                      size: halfPoints,
                      font: primaryFont,
                      color: '000000'
                    })
                  ]
                }),
                ...hmAddressLines.map((line) =>
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 10, after: 20, line: 240 },
                    children: [
                      new TextRun({
                        text: line,
                        size: halfPoints,
                        font: primaryFont,
                        color: '000000'
                      })
                    ]
                  })
                )
              ]
            })
          ]
        })
      ]
    });
    docChildren.push(bottomTwoColTable);
  } else {
    // Secretariat Standard Signatory
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 240, after: 40 },
        children: [
          new TextRun({
            text: letter.closing || 'தங்கள் உண்மையுள்ள,',
            bold: true,
            size: halfPoints,
            font: primaryFont,
            color: '0F172A'
          })
        ]
      })
    );

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 360, after: 40 },
        children: [
          new TextRun({
            text: `(${letter.signatoryName || 'கையொப்பம்'})`,
            bold: true,
            size: halfPoints,
            font: primaryFont,
            color: '0F172A'
          })
        ]
      })
    );

    if (letter.signatoryDesignation) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 20, after: 120 },
          children: [
            new TextRun({
              text: letter.signatoryDesignation,
              size: halfPoints,
              font: primaryFont,
              color: '334155'
            })
          ]
        })
      );
    }

    if (letter.enclosures && letter.enclosures.length > 0) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 180, after: 40 },
          children: [
            new TextRun({
              text: 'இணைப்பு:',
              bold: true,
              size: halfPoints,
              font: primaryFont,
              color: '0F172A'
            })
          ]
        })
      );
      for (const enc of letter.enclosures) {
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 720 },
            spacing: { before: 20, after: 20, line: 260 },
            children: [
              new TextRun({
                text: enc,
                size: halfPoints,
                font: primaryFont,
                color: '1E293B'
              })
            ]
          })
        );
      }
    }
  }

  // Copy to (நகல்) if present
  if (letter.copyTo && letter.copyTo.length > 0) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 180, after: 40 },
        children: [
          new TextRun({
            text: 'நகல்:',
            bold: true,
            size: halfPoints,
            font: primaryFont,
            color: '0F172A'
          })
        ]
      })
    );
    for (const cp of letter.copyTo) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          indent: { left: 720 },
          spacing: { before: 20, after: 20, line: 260 },
          children: [
            new TextRun({
              text: cp,
              size: halfPoints,
              font: primaryFont,
              color: '1E293B'
            })
          ]
        })
      );
    }
  }

  // Document setup with standard margins: 1440 dxa = 1 inch
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: docChildren
      }
    ]
  });

  return await Packer.toBlob(doc);
}

