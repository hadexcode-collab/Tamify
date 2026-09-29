import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  RotateCw,
  RotateCcw,
  Trash2,
  Plus,
  Type,
  PenTool,
  Highlighter,
  Square,
  Minus,
  CheckCircle,
  Eye,
  Eraser,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Printer,
  ChevronLeft,
  ChevronRight,
  Stamp,
  FileDown,
  Layers,
  Image as ImageIcon,
  Copy,
  ClipboardPaste,
  Scissors,
  Bold,
  Italic,
  Sliders,
  Move,
  Lock,
  Unlock,
  Scaling,
  RefreshCw,
  Crop,
  FileSpreadsheet
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { SAMPLE_DOCUMENTS } from '../lib/sampleDocuments';
import { OCRProcessResult } from '../types';
import { executePdfToExcelConversion } from '../lib/excelGenerator';

// Configure pdfjs worker
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker setup:', e);
}

export type EditorTool =
  | 'select'
  | 'text'
  | 'pen'
  | 'highlighter'
  | 'redact-black'
  | 'redact-white'
  | 'rectangle'
  | 'arrow'
  | 'stamp'
  | 'image'
  | 'eraser';

export interface TextAnnotation {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  backgroundColor?: string;
  bold?: boolean;
}

export interface ImageAnnotation {
  id: string;
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
  name: string;
  originalWidth?: number;
  originalHeight?: number;
  lockAspectRatio?: boolean;
}

export type ResizeHandleType = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'w' | 'e';

export interface ResizeState {
  handle: ResizeHandleType;
  startMouseX: number;
  startMouseY: number;
  origX: number;
  origY: number;
  origWidth: number;
  origHeight: number;
  aspectRatio: number;
  lockAspectRatio: boolean;
}

export const getResizeHandles = (b: { x: number; y: number; width: number; height: number }) => {
  return {
    nw: { x: b.x, y: b.y, cursor: 'nwse-resize' as const },
    ne: { x: b.x + b.width, y: b.y, cursor: 'nesw-resize' as const },
    se: { x: b.x + b.width, y: b.y + b.height, cursor: 'nwse-resize' as const },
    sw: { x: b.x, y: b.y + b.height, cursor: 'nesw-resize' as const },
    n: { x: b.x + b.width / 2, y: b.y, cursor: 'ns-resize' as const },
    s: { x: b.x + b.width / 2, y: b.y + b.height, cursor: 'ns-resize' as const },
    w: { x: b.x, y: b.y + b.height / 2, cursor: 'ew-resize' as const },
    e: { x: b.x + b.width, y: b.y + b.height / 2, cursor: 'ew-resize' as const }
  };
};

export const getHandleUnderMouse = (
  x: number,
  y: number,
  b: { x: number; y: number; width: number; height: number },
  zoom: number
): ResizeHandleType | null => {
  const handles = getResizeHandles(b);
  const hitRadius = Math.max(6, 9 / zoom);
  for (const [key, pt] of Object.entries(handles) as [ResizeHandleType, { x: number; y: number }][]) {
    if (Math.abs(x - pt.x) <= hitRadius && Math.abs(y - pt.y) <= hitRadius) {
      return key;
    }
  }
  return null;
};

export interface DrawingAnnotation {
  id: string;
  type: 'pen' | 'highlighter';
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface ShapeAnnotation {
  id: string;
  type: 'rectangle' | 'redact-black' | 'redact-white' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fill?: string;
  strokeWidth?: number;
}

export interface StampAnnotation {
  id: string;
  type: 'stamp';
  x: number;
  y: number;
  width: number;
  height: number;
  stampType: 'APPROVED' | 'VERIFIED' | 'GOVT_SEAL' | 'CONFIDENTIAL' | 'DRAFT' | 'URGENT';
  textTamil: string;
  textEng: string;
  color: string;
}

export type PageAnnotation =
  | TextAnnotation
  | ImageAnnotation
  | DrawingAnnotation
  | ShapeAnnotation
  | StampAnnotation;

export interface EditorPage {
  pageNumber: number;
  rotation: number; // 0, 90, 180, 270
  canvasDataUrl?: string;
  annotations: PageAnnotation[];
  width: number;
  height: number;
}

interface PdfEditorWorkspaceProps {
  onProcessPageOCR?: (imageBase64: string, hint?: string) => void;
  isProcessingOCR?: boolean;
}

export const AVAILABLE_FONTS = [
  { id: 'Tau-marutham', name: 'Tau-marutham (மருதம் - Default)', label: 'மருதம்' },
  { id: 'Latha', name: 'Latha (லதா)', label: 'லதா' },
  { id: 'Vijaya', name: 'Vijaya (விஜயா)', label: 'விஜயா' },
  { id: 'Nirmala UI', name: 'Nirmala UI (நிர்மலா)', label: 'நிர்மலா' },
  { id: 'Kavivanar', name: 'Kavivanar (கவிவாணர்)', label: 'கவிவாணர்' },
  { id: 'Mukta Malar', name: 'Mukta Malar (முக்தா மலர்)', label: 'முக்தா மலர்' },
  { id: 'Noto Sans Tamil', name: 'Noto Sans Tamil (நோட்டோ தமிழ்)', label: 'நோட்டோ' },
  { id: 'Bamini', name: 'Bamini (பாமினி)', label: 'பாமினி' },
  { id: 'Arial', name: 'Arial Unicode MS', label: 'Arial' },
  { id: 'Times New Roman', name: 'Times New Roman', label: 'Times' }
];

export const PdfEditorWorkspace: React.FC<PdfEditorWorkspaceProps> = ({
  onProcessPageOCR,
  isProcessingOCR = false
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<any>(null);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [documentTitle, setDocumentTitle] = useState<string>('Document_Edit');

  // Tool & Styling State (Font Selection before editing)
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [fontFamily, setFontFamily] = useState<string>('Tau-marutham');
  const [fontSize, setFontSize] = useState<number>(20);
  const [isBold, setIsBold] = useState<boolean>(true);
  const [textColor, setTextColor] = useState<string>('#000000');
  const [penColor, setPenColor] = useState<string>('#E53E3E');
  const [highlightColor, setHighlightColor] = useState<string>('#ECC94B');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [selectedStamp, setSelectedStamp] = useState<StampAnnotation['stampType']>('APPROVED');

  // Clipboard & Selection State
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [clipboardAnnotation, setClipboardAnnotation] = useState<PageAnnotation | null>(null);
  const [isDraggingAnnotation, setIsDraggingAnnotation] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeSession, setResizeSession] = useState<ResizeState | null>(null);

  // Zoom & View
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Canvas Refs
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Drawing in progress
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapePreview, setShapePreview] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Text inline input state
  const [activeTextInput, setActiveTextInput] = useState<{ x: number; y: number; text: string; id?: string } | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load PDF ArrayBuffer into PDF.js
  const loadPdfFromBytes = async (arrayBuffer: ArrayBuffer, title: string) => {
    setIsLoadingPdf(true);
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const doc = await loadingTask.promise;
      setPdfDocProxy(doc);
      setDocumentTitle(title.replace(/\.[^/.]+$/, ''));

      const loadedPages: EditorPage[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        loadedPages.push({
          pageNumber: i,
          rotation: 0,
          annotations: [],
          width: viewport.width,
          height: viewport.height
        });
      }

      setPages(loadedPages);
      setCurrentPageIndex(0);
      showToast(`PDF ஏற்றப்பட்டது (${doc.numPages} பக்கங்கள்)`);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      showToast('PDF ஏற்ற முடியவில்லை. மற்ற கோப்பைத் தேர்ந்தெடுக்கவும்.');
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Handle PDF/Doc File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFile(file);

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) {
          loadPdfFromBytes(event.target.result, file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setPages([
            {
              pageNumber: 1,
              rotation: 0,
              canvasDataUrl: event.target?.result as string,
              annotations: [],
              width: img.width || 800,
              height: img.height || 1100
            }
          ]);
          setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
          setCurrentPageIndex(0);
          showToast('படம் ஏற்றப்பட்டது');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Add Image / Signature / Seal Overlay
  const handleImageInsertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Compute reasonable scaled size for insertion
        let w = img.width;
        let h = img.height;
        const maxDim = 250;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const newImageAnn: ImageAnnotation = {
          id: `img-${Date.now()}`,
          type: 'image',
          x: 100,
          y: 100,
          width: w,
          height: h,
          originalWidth: img.width,
          originalHeight: img.height,
          lockAspectRatio: true,
          dataUrl,
          name: file.name
        };

        addAnnotationToCurrentPage(newImageAnn);
        setSelectedAnnotationId(newImageAnn.id);
        setActiveTool('select');
        showToast(`படம் சேர்க்கப்பட்டது: ${file.name}`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // Reset file input value so same image can be re-added
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Load Sample Document as PDF
  const handleLoadSample = async (sampleId: string) => {
    const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (!sample) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#2B6CB0';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.fillStyle = 'rgba(43, 108, 176, 0.04)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1A202C';
    ctx.font = `bold 28px "${fontFamily}", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(sample.tamilTitle, canvas.width / 2, 100);

    ctx.font = `bold 20px "${fontFamily}", Arial, sans-serif`;
    ctx.fillStyle = '#4A5568';
    ctx.fillText(sample.title, canvas.width / 2, 140);

    ctx.fillStyle = '#2B6CB0';
    ctx.fillRect(80, 160, canvas.width - 160, 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#2D3748';
    ctx.font = `20px "${fontFamily}", Arial, sans-serif`;

    const lines = sample.rawText.split('\n');
    let yPos = 210;
    const lineHeight = 32;

    for (const line of lines) {
      if (yPos > canvas.height - 100) break;
      if (line.trim().startsWith('Q.No') || line.includes('|')) {
        ctx.fillStyle = '#1A365D';
        ctx.font = 'bold 18px monospace';
      } else if (line.trim().startsWith('PART') || line.trim().startsWith('அரசாணை')) {
        ctx.fillStyle = '#C53030';
        ctx.font = `bold 22px "${fontFamily}", Arial, sans-serif`;
      } else {
        ctx.fillStyle = '#2D3748';
        ctx.font = `20px "${fontFamily}", Arial, sans-serif`;
      }

      ctx.fillText(line.slice(0, 80), 80, yPos);
      yPos += lineHeight;
    }

    const dataUrl = canvas.toDataURL('image/png');
    setPages([
      {
        pageNumber: 1,
        rotation: 0,
        canvasDataUrl: dataUrl,
        annotations: [],
        width: canvas.width,
        height: canvas.height
      }
    ]);
    setDocumentTitle(sample.title);
    setCurrentPageIndex(0);
    showToast(`மாதிரி ஆவணம் ஏற்றப்பட்டது: ${sample.title}`);
  };

  // Render Base PDF page onto baseCanvas
  useEffect(() => {
    const renderPage = async () => {
      if (!pages.length) return;
      const currentPage = pages[currentPageIndex];
      if (!currentPage) return;

      const baseCanvas = baseCanvasRef.current;
      if (!baseCanvas) return;
      const ctx = baseCanvas.getContext('2d');
      if (!ctx) return;

      if (pdfDocProxy && currentPage.pageNumber) {
        try {
          const page = await pdfDocProxy.getPage(currentPage.pageNumber);
          const viewport = page.getViewport({
            scale: 1.5 * zoomLevel,
            rotation: currentPage.rotation
          });

          baseCanvas.width = viewport.width;
          baseCanvas.height = viewport.height;

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };
          await page.render(renderContext).promise;
        } catch (e) {
          console.error('Error rendering page:', e);
        }
      } else if (currentPage.canvasDataUrl) {
        const img = new Image();
        img.onload = () => {
          const w = (currentPage.width || img.width) * zoomLevel;
          const h = (currentPage.height || img.height) * zoomLevel;
          baseCanvas.width = w;
          baseCanvas.height = h;

          ctx.save();
          if (currentPage.rotation !== 0) {
            ctx.translate(w / 2, h / 2);
            ctx.rotate((currentPage.rotation * Math.PI) / 180);
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
          } else {
            ctx.drawImage(img, 0, 0, w, h);
          }
          ctx.restore();
        };
        img.src = currentPage.canvasDataUrl;
      }

      if (drawingCanvasRef.current) {
        drawingCanvasRef.current.width = baseCanvas.width;
        drawingCanvasRef.current.height = baseCanvas.height;
        drawAnnotations();
      }
    };

    renderPage();
  }, [currentPageIndex, pages, zoomLevel, pdfDocProxy]);

  // Redraw all annotations on drawingCanvas
  const drawAnnotations = () => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;

    for (const ann of currentPage.annotations) {
      ctx.save();

      if (ann.type === 'pen') {
        if (ann.points.length < 2) continue;
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.strokeWidth * zoomLevel;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = ann.opacity || 1.0;
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x * zoomLevel, ann.points[0].y * zoomLevel);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x * zoomLevel, ann.points[i].y * zoomLevel);
        }
        ctx.stroke();
      } else if (ann.type === 'highlighter') {
        if (ann.points.length < 2) continue;
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = (ann.strokeWidth || 16) * zoomLevel;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x * zoomLevel, ann.points[0].y * zoomLevel);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x * zoomLevel, ann.points[i].y * zoomLevel);
        }
        ctx.stroke();
      } else if (ann.type === 'redact-black') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(
          ann.x * zoomLevel,
          ann.y * zoomLevel,
          ann.width * zoomLevel,
          ann.height * zoomLevel
        );
      } else if (ann.type === 'redact-white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(
          ann.x * zoomLevel,
          ann.y * zoomLevel,
          ann.width * zoomLevel,
          ann.height * zoomLevel
        );
      } else if (ann.type === 'rectangle') {
        ctx.strokeStyle = ann.color || '#E53E3E';
        ctx.lineWidth = (ann.strokeWidth || 2) * zoomLevel;
        ctx.strokeRect(
          ann.x * zoomLevel,
          ann.y * zoomLevel,
          ann.width * zoomLevel,
          ann.height * zoomLevel
        );
      } else if (ann.type === 'arrow') {
        ctx.strokeStyle = ann.color || '#E53E3E';
        ctx.fillStyle = ann.color || '#E53E3E';
        ctx.lineWidth = (ann.strokeWidth || 3) * zoomLevel;

        const fromX = ann.x * zoomLevel;
        const fromY = ann.y * zoomLevel;
        const toX = (ann.x + ann.width) * zoomLevel;
        const toY = (ann.y + ann.height) * zoomLevel;

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        const angle = Math.atan2(toY - fromY, toX - fromX);
        const headLength = 12 * zoomLevel;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
          toX - headLength * Math.cos(angle - Math.PI / 6),
          toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          toX - headLength * Math.cos(angle + Math.PI / 6),
          toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      } else if (ann.type === 'stamp') {
        const sx = ann.x * zoomLevel;
        const sy = ann.y * zoomLevel;
        const sw = ann.width * zoomLevel;
        const sh = ann.height * zoomLevel;

        ctx.strokeStyle = ann.color;
        ctx.lineWidth = 3 * zoomLevel;
        ctx.fillStyle = `${ann.color}15`;
        ctx.fillRect(sx, sy, sw, sh);
        ctx.strokeRect(sx, sy, sw, sh);

        ctx.strokeStyle = ann.color;
        ctx.lineWidth = 1 * zoomLevel;
        ctx.setLineDash([4 * zoomLevel, 4 * zoomLevel]);
        ctx.strokeRect(sx + 4, sy + 4, sw - 8, sh - 8);
        ctx.setLineDash([]);

        ctx.fillStyle = ann.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${Math.round(14 * zoomLevel)}px "${fontFamily || 'Tau-marutham'}", Arial, sans-serif`;
        ctx.fillText(ann.textTamil, sx + sw / 2, sy + sh / 2 - 8 * zoomLevel);

        ctx.font = `bold ${Math.round(11 * zoomLevel)}px Arial, sans-serif`;
        ctx.fillText(ann.textEng, sx + sw / 2, sy + sh / 2 + 10 * zoomLevel);
      } else if (ann.type === 'image') {
        const img = new Image();
        img.src = ann.dataUrl;
        if (img.complete) {
          ctx.drawImage(
            img,
            ann.x * zoomLevel,
            ann.y * zoomLevel,
            ann.width * zoomLevel,
            ann.height * zoomLevel
          );
        } else {
          img.onload = () => {
            drawAnnotations();
          };
        }
      } else if (ann.type === 'text') {
        ctx.fillStyle = ann.color || '#000000';
        ctx.font = `${ann.bold ? 'bold ' : ''}${Math.round(ann.fontSize * zoomLevel)}px "${ann.fontFamily || fontFamily || 'Tau-marutham'}", Arial, sans-serif`;
        ctx.textBaseline = 'top';
        if (ann.backgroundColor) {
          ctx.save();
          ctx.fillStyle = ann.backgroundColor;
          const textMetrics = ctx.measureText(ann.text);
          ctx.fillRect(
            ann.x * zoomLevel - 2,
            ann.y * zoomLevel - 2,
            textMetrics.width + 4,
            ann.fontSize * zoomLevel + 4
          );
          ctx.restore();
        }
        ctx.fillText(ann.text, ann.x * zoomLevel, ann.y * zoomLevel);
      }

      // Selection Box indicator & Resize Handles
      if (selectedAnnotationId === ann.id) {
        const bound = getAnnotationBoundingBox(ann);
        const isResizable =
          ann.type === 'image' ||
          ann.type === 'rectangle' ||
          ann.type === 'stamp' ||
          ann.type === 'redact-black' ||
          ann.type === 'redact-white';

        ctx.save();
        ctx.strokeStyle = ann.type === 'image' ? '#38BDF8' : '#00FF66';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
          bound.x * zoomLevel - 2,
          bound.y * zoomLevel - 2,
          bound.width * zoomLevel + 4,
          bound.height * zoomLevel + 4
        );
        ctx.setLineDash([]);

        // Dimension Pill Badge
        const sizeText = `${Math.round(bound.width)} × ${Math.round(bound.height)} px${ann.type === 'image' ? ' (படம்)' : ''}`;
        ctx.font = 'bold 10px monospace';
        const textWidth = ctx.measureText(sizeText).width;
        const pillX = bound.x * zoomLevel + (bound.width * zoomLevel - (textWidth + 14)) / 2;
        const pillY = (bound.y * zoomLevel) - 22 > 0 ? bound.y * zoomLevel - 22 : (bound.y + bound.height) * zoomLevel + 6;

        ctx.fillStyle = '#0F1115';
        ctx.strokeStyle = ann.type === 'image' ? '#38BDF8' : '#00FF66';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(pillX, pillY, textWidth + 14, 18, 4);
        } else {
          ctx.rect(pillX, pillY, textWidth + 14, 18);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = ann.type === 'image' ? '#38BDF8' : '#00FF66';
        ctx.textBaseline = 'middle';
        ctx.fillText(sizeText, pillX + 7, pillY + 9);

        // 8 Interactive Resize Handles
        if (isResizable) {
          const handles = getResizeHandles(bound);
          const handleSize = 8;
          for (const [, pt] of Object.entries(handles)) {
            const hx = pt.x * zoomLevel;
            const hy = pt.y * zoomLevel;
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = ann.type === 'image' ? '#0284C7' : '#16A34A';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
            ctx.fill();
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      ctx.restore();
    }
  };

  const getAnnotationBoundingBox = (ann: PageAnnotation) => {
    if (ann.type === 'text') {
      return { x: ann.x, y: ann.y, width: Math.max(40, ann.text.length * (ann.fontSize * 0.6)), height: ann.fontSize * 1.3 };
    }
    if (
      ann.type === 'rectangle' ||
      ann.type === 'redact-black' ||
      ann.type === 'redact-white' ||
      ann.type === 'arrow' ||
      ann.type === 'stamp' ||
      ann.type === 'image'
    ) {
      return { x: ann.x, y: ann.y, width: ann.width, height: ann.height };
    }
    if (ann.type === 'pen' || ann.type === 'highlighter') {
      const xs = ann.points.map((p) => p.x);
      const ys = ann.points.map((p) => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return { x: minX, y: minY, width: maxX - minX || 10, height: maxY - minY || 10 };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  };

  // Keyboard Shortcuts: Delete, Copy, Paste, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in textarea or input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAnnotationId) {
          e.preventDefault();
          handleEraseSelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedAnnotationId) {
          e.preventDefault();
          handleCopySelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (clipboardAnnotation) {
          e.preventDefault();
          handlePasteAnnotation();
        }
      } else if (e.key === 'Escape') {
        setSelectedAnnotationId(null);
        setActiveTextInput(null);
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, clipboardAnnotation, pages, currentPageIndex]);

  // Handle Mouse Events on Drawing Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    if (activeTool === 'select') {
      const currentPage = pages[currentPageIndex];
      if (!currentPage) return;

      // 1. Check if clicking on an interactive resize handle of selected annotation
      if (selectedAnnotationId) {
        const selectedAnn = currentPage.annotations.find((a) => a.id === selectedAnnotationId);
        if (
          selectedAnn &&
          (selectedAnn.type === 'image' ||
            selectedAnn.type === 'rectangle' ||
            selectedAnn.type === 'stamp' ||
            selectedAnn.type === 'redact-black' ||
            selectedAnn.type === 'redact-white')
        ) {
          const bound = getAnnotationBoundingBox(selectedAnn);
          const handle = getHandleUnderMouse(x, y, bound, zoomLevel);
          if (handle) {
            setIsResizing(true);
            setResizeSession({
              handle,
              startMouseX: x,
              startMouseY: y,
              origX: bound.x,
              origY: bound.y,
              origWidth: bound.width,
              origHeight: bound.height,
              aspectRatio: bound.width / Math.max(1, bound.height),
              lockAspectRatio: selectedAnn.type === 'image' ? selectedAnn.lockAspectRatio !== false : false
            });
            return;
          }
        }
      }

      // 2. Otherwise hit test annotations to select or drag
      const clickedAnn = [...currentPage.annotations].reverse().find((ann) => {
        const b = getAnnotationBoundingBox(ann);
        return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
      });

      if (clickedAnn) {
        setSelectedAnnotationId(clickedAnn.id);
        setIsDraggingAnnotation(true);
        const b = getAnnotationBoundingBox(clickedAnn);
        setDragOffset({ x: x - b.x, y: y - b.y });
      } else {
        setSelectedAnnotationId(null);
      }
      return;
    }

    if (activeTool === 'text') {
      setActiveTextInput({ x, y, text: '' });
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setIsDrawing(true);
      setCurrentPoints([{ x, y }]);
    } else if (
      activeTool === 'rectangle' ||
      activeTool === 'redact-black' ||
      activeTool === 'redact-white' ||
      activeTool === 'arrow'
    ) {
      setIsDrawing(true);
      setShapeStart({ x, y });
      setShapePreview({ x, y, width: 0, height: 0 });
    } else if (activeTool === 'stamp') {
      const stampMeta = getStampMetadata(selectedStamp);
      const newStamp: StampAnnotation = {
        id: `stamp-${Date.now()}`,
        type: 'stamp',
        x: x - 90,
        y: y - 30,
        width: 180,
        height: 60,
        stampType: selectedStamp,
        textTamil: stampMeta.tamil,
        textEng: stampMeta.eng,
        color: stampMeta.color
      };
      addAnnotationToCurrentPage(newStamp);
      setActiveTool('select');
      setSelectedAnnotationId(newStamp.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    // Handle Active Resizing
    if (isResizing && resizeSession && selectedAnnotationId) {
      const dx = x - resizeSession.startMouseX;
      const dy = y - resizeSession.startY;
      const { handle, origX, origY, origWidth, origHeight, aspectRatio, lockAspectRatio } = resizeSession;
      const keepRatio = lockAspectRatio || e.shiftKey;

      let newX = origX;
      let newY = origY;
      let newW = origWidth;
      let newH = origHeight;

      if (handle === 'se') {
        newW = Math.max(20, origWidth + dx);
        newH = keepRatio ? Math.max(20, Math.round(newW / aspectRatio)) : Math.max(20, origHeight + dy);
      } else if (handle === 'e') {
        newW = Math.max(20, origWidth + dx);
        if (keepRatio) {
          newH = Math.max(20, Math.round(newW / aspectRatio));
          newY = origY + (origHeight - newH) / 2;
        }
      } else if (handle === 's') {
        newH = Math.max(20, origHeight + dy);
        if (keepRatio) {
          newW = Math.max(20, Math.round(newH * aspectRatio));
          newX = origX + (origWidth - newW) / 2;
        }
      } else if (handle === 'sw') {
        newW = Math.max(20, origWidth - dx);
        newX = origX + (origWidth - newW);
        newH = keepRatio ? Math.max(20, Math.round(newW / aspectRatio)) : Math.max(20, origHeight + dy);
      } else if (handle === 'w') {
        newW = Math.max(20, origWidth - dx);
        newX = origX + (origWidth - newW);
        if (keepRatio) {
          newH = Math.max(20, Math.round(newW / aspectRatio));
          newY = origY + (origHeight - newH) / 2;
        }
      } else if (handle === 'ne') {
        newW = Math.max(20, origWidth + dx);
        newH = keepRatio ? Math.max(20, Math.round(newW / aspectRatio)) : Math.max(20, origHeight - dy);
        newY = origY + (origHeight - newH);
      } else if (handle === 'n') {
        newH = Math.max(20, origHeight - dy);
        newY = origY + (origHeight - newH);
        if (keepRatio) {
          newW = Math.max(20, Math.round(newH * aspectRatio));
          newX = origX + (origWidth - newW) / 2;
        }
      } else if (handle === 'nw') {
        newW = Math.max(20, origWidth - dx);
        newX = origX + (origWidth - newW);
        newH = keepRatio ? Math.max(20, Math.round(newW / aspectRatio)) : Math.max(20, origHeight - dy);
        newY = origY + (origHeight - newH);
      }

      setPages((prev) =>
        prev.map((p, idx) => {
          if (idx !== currentPageIndex) return p;
          return {
            ...p,
            annotations: p.annotations.map((ann) => {
              if (ann.id !== selectedAnnotationId) return ann;
              if (
                ann.type === 'image' ||
                ann.type === 'rectangle' ||
                ann.type === 'stamp' ||
                ann.type === 'redact-black' ||
                ann.type === 'redact-white'
              ) {
                return {
                  ...ann,
                  x: Math.round(newX),
                  y: Math.round(newY),
                  width: Math.round(newW),
                  height: Math.round(newH)
                };
              }
              return ann;
            })
          };
        })
      );
      return;
    }

    // Handle Active Dragging
    if (isDraggingAnnotation && selectedAnnotationId) {
      setPages((prev) =>
        prev.map((p, idx) => {
          if (idx !== currentPageIndex) return p;
          return {
            ...p,
            annotations: p.annotations.map((ann) => {
              if (ann.id !== selectedAnnotationId) return ann;
              if (ann.type === 'pen' || ann.type === 'highlighter') {
                const b = getAnnotationBoundingBox(ann);
                const dx = x - dragOffset.x - b.x;
                const dy = y - dragOffset.y - b.y;
                return {
                  ...ann,
                  points: ann.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy }))
                };
              }
              return {
                ...ann,
                x: x - dragOffset.x,
                y: y - dragOffset.y
              };
            })
          };
        })
      );
      return;
    }

    // Update cursor feedback on hover
    if (activeTool === 'select' && !isDraggingAnnotation && !isResizing) {
      const currentPage = pages[currentPageIndex];
      if (currentPage && selectedAnnotationId) {
        const selectedAnn = currentPage.annotations.find((a) => a.id === selectedAnnotationId);
        if (
          selectedAnn &&
          (selectedAnn.type === 'image' ||
            selectedAnn.type === 'rectangle' ||
            selectedAnn.type === 'stamp' ||
            selectedAnn.type === 'redact-black' ||
            selectedAnn.type === 'redact-white')
        ) {
          const bound = getAnnotationBoundingBox(selectedAnn);
          const handle = getHandleUnderMouse(x, y, bound, zoomLevel);
          if (handle) {
            const handles = getResizeHandles(bound);
            canvas.style.cursor = handles[handle].cursor;
            return;
          }
        }
      }
      const clickedAnn = currentPage?.annotations.find((ann) => {
        const b = getAnnotationBoundingBox(ann);
        return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
      });
      canvas.style.cursor = clickedAnn ? 'move' : 'default';
    }

    if (!isDrawing) return;

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setCurrentPoints((prev) => [...prev, { x, y }]);

      const ctx = canvas.getContext('2d');
      if (ctx && currentPoints.length > 0) {
        ctx.save();
        ctx.strokeStyle = activeTool === 'pen' ? penColor : highlightColor;
        ctx.lineWidth = (activeTool === 'pen' ? strokeWidth : 16) * zoomLevel;
        ctx.lineCap = activeTool === 'pen' ? 'round' : 'square';
        ctx.globalAlpha = activeTool === 'pen' ? 1.0 : 0.35;
        const lastPt = currentPoints[currentPoints.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPt.x * zoomLevel, lastPt.y * zoomLevel);
        ctx.lineTo(x * zoomLevel, y * zoomLevel);
        ctx.stroke();
        ctx.restore();
      }
    } else if (shapeStart) {
      const sx = Math.min(shapeStart.x, x);
      const sy = Math.min(shapeStart.y, y);
      const sw = Math.abs(x - shapeStart.x);
      const sh = Math.abs(y - shapeStart.y);
      setShapePreview({ x: sx, y: sy, width: sw, height: sh });

      drawAnnotations();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.strokeStyle =
          activeTool === 'redact-black'
            ? '#000000'
            : activeTool === 'redact-white'
            ? '#CBD5E0'
            : '#E53E3E';
        ctx.lineWidth = 2 * zoomLevel;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(sx * zoomLevel, sy * zoomLevel, sw * zoomLevel, sh * zoomLevel);
        ctx.restore();
      }
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      setResizeSession(null);
      drawAnnotations();
      return;
    }

    if (isDraggingAnnotation) {
      setIsDraggingAnnotation(false);
      drawAnnotations();
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      if (currentPoints.length > 1) {
        const newDrawing: DrawingAnnotation = {
          id: `draw-${Date.now()}`,
          type: activeTool,
          points: currentPoints,
          color: activeTool === 'pen' ? penColor : highlightColor,
          strokeWidth: activeTool === 'pen' ? strokeWidth : 16,
          opacity: activeTool === 'pen' ? 1.0 : 0.35
        };
        addAnnotationToCurrentPage(newDrawing);
      }
      setCurrentPoints([]);
    } else if (shapeStart && shapePreview && shapePreview.width > 5 && shapePreview.height > 5) {
      const newShape: ShapeAnnotation = {
        id: `shape-${Date.now()}`,
        type: activeTool as ShapeAnnotation['type'],
        x: shapePreview.x,
        y: shapePreview.y,
        width: shapePreview.width,
        height: shapePreview.height,
        color:
          activeTool === 'redact-black'
            ? '#000000'
            : activeTool === 'redact-white'
            ? '#FFFFFF'
            : '#E53E3E',
        strokeWidth: 2
      };
      addAnnotationToCurrentPage(newShape);
      setShapeStart(null);
      setShapePreview(null);
    }
  };

  // Add annotation to current page state
  const addAnnotationToCurrentPage = (ann: PageAnnotation) => {
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return {
          ...p,
          annotations: [...p.annotations, ann]
        };
      })
    );
  };

  // Helper Stamp Info
  const getStampMetadata = (type: StampAnnotation['stampType']) => {
    switch (type) {
      case 'APPROVED':
        return { tamil: 'அங்கீகரிக்கப்பட்டது', eng: 'APPROVED', color: '#16A34A' };
      case 'VERIFIED':
        return { tamil: 'சரிபார்க்கப்பட்டது', eng: 'VERIFIED', color: '#2563EB' };
      case 'GOVT_SEAL':
        return { tamil: 'அரசு முத்திரை', eng: 'OFFICIAL SEAL', color: '#DC2626' };
      case 'CONFIDENTIAL':
        return { tamil: 'ரகசியம்', eng: 'CONFIDENTIAL', color: '#9333EA' };
      case 'DRAFT':
        return { tamil: 'வரைவு நகல்', eng: 'DRAFT COPY', color: '#6B7280' };
      case 'URGENT':
        return { tamil: 'அவசரம்', eng: 'URGENT', color: '#EA580C' };
    }
  };

  // Erase Selection Button Action
  const handleEraseSelected = () => {
    if (!selectedAnnotationId) return;
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return {
          ...p,
          annotations: p.annotations.filter((a) => a.id !== selectedAnnotationId)
        };
      })
    );
    setSelectedAnnotationId(null);
    showToast('தேர்ந்தெடுத்த குறிப்பு அழிக்கப்பட்டது (Erased)');
  };

  // Copy Selection Button Action
  const handleCopySelected = () => {
    if (!selectedAnnotationId) return;
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;

    const annToCopy = currentPage.annotations.find((a) => a.id === selectedAnnotationId);
    if (annToCopy) {
      setClipboardAnnotation(JSON.parse(JSON.stringify(annToCopy)));
      showToast('குறிப்பு நகலெடுக்கப்பட்டது (Copied)');
    }
  };

  // Paste Annotation Action
  const handlePasteAnnotation = () => {
    if (!clipboardAnnotation) return;

    const newId = `${clipboardAnnotation.type}-${Date.now()}`;
    let pastedAnn: PageAnnotation;

    if (clipboardAnnotation.type === 'pen' || clipboardAnnotation.type === 'highlighter') {
      pastedAnn = {
        ...clipboardAnnotation,
        id: newId,
        points: clipboardAnnotation.points.map((pt) => ({ x: pt.x + 25, y: pt.y + 25 }))
      };
    } else {
      pastedAnn = {
        ...clipboardAnnotation,
        id: newId,
        x: (clipboardAnnotation.x || 50) + 25,
        y: (clipboardAnnotation.y || 50) + 25
      };
    }

    addAnnotationToCurrentPage(pastedAnn);
    setSelectedAnnotationId(newId);
    setActiveTool('select');
    showToast('ஒட்டப்பட்டது (Pasted)');
  };

  // Image Resize & Dimension Controls
  const handleUpdateImageWidth = (newW: number) => {
    if (!selectedAnnotationId || isNaN(newW) || newW < 10) return;
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return {
          ...p,
          annotations: p.annotations.map((ann) => {
            if (ann.id !== selectedAnnotationId || ann.type !== 'image') return ann;
            const aspect = ann.width / Math.max(1, ann.height);
            const lock = ann.lockAspectRatio !== false;
            const finalW = Math.round(newW);
            const finalH = lock ? Math.round(finalW / aspect) : ann.height;
            return { ...ann, width: finalW, height: Math.max(10, finalH) };
          })
        };
      })
    );
  };

  const handleUpdateImageHeight = (newH: number) => {
    if (!selectedAnnotationId || isNaN(newH) || newH < 10) return;
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return {
          ...p,
          annotations: p.annotations.map((ann) => {
            if (ann.id !== selectedAnnotationId || ann.type !== 'image') return ann;
            const aspect = ann.width / Math.max(1, ann.height);
            const lock = ann.lockAspectRatio !== false;
            const finalH = Math.round(newH);
            const finalW = lock ? Math.round(finalH * aspect) : ann.width;
            return { ...ann, height: finalH, width: Math.max(10, finalW) };
          })
        };
      })
    );
  };

  const handleScaleImageByFactor = (factor: number) => {
    if (!selectedAnnotationId) return;
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return {
          ...p,
          annotations: p.annotations.map((ann) => {
            if (ann.id !== selectedAnnotationId || ann.type !== 'image') return ann;
            const newW = Math.max(20, Math.round(ann.width * factor));
            const newH = Math.max(20, Math.round(ann.height * factor));
            return { ...ann, width: newW, height: newH };
          })
        };
      })
    );
    showToast(`படம் அளவு மாற்றப்பட்டது (${Math.round(factor * 100)}%)`);
  };

  const handleSetImagePreset = (targetW: number, targetH: number) => {
    if (!selectedAnnotationId) return;
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return {
          ...p,
          annotations: p.annotations.map((ann) => {
            if (ann.id !== selectedAnnotationId || ann.type !== 'image') return ann;
            return { ...ann, width: targetW, height: targetH };
          })
        };
      })
    );
    showToast(`அளவு மாற்றப்பட்டது: ${targetW} × ${targetH} px`);
  };

  const handleResetImageOriginalSize = () => {
    if (!selectedAnnotationId) return;
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return {
          ...p,
          annotations: p.annotations.map((ann) => {
            if (ann.id !== selectedAnnotationId || ann.type !== 'image') return ann;
            const w = ann.originalWidth || 200;
            const h = ann.originalHeight || 200;
            return { ...ann, width: w, height: h };
          })
        };
      })
    );
    showToast('படத்தின் அசல் அளவுக்கு மாற்றப்பட்டது (Original Size)');
  };

  const handleToggleLockAspectRatio = () => {
    if (!selectedAnnotationId) return;
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return {
          ...p,
          annotations: p.annotations.map((ann) => {
            if (ann.id !== selectedAnnotationId || ann.type !== 'image') return ann;
            const newLocked = ann.lockAspectRatio === false;
            return { ...ann, lockAspectRatio: newLocked };
          })
        };
      })
    );
  };

  // Rotate Current Page 90 deg
  const handleRotateCurrentPage = () => {
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return {
          ...p,
          rotation: (p.rotation + 90) % 360
        };
      })
    );
    showToast(`பக்கம் ${currentPageIndex + 1} சுழற்றப்பட்டது (90°)`);
  };

  // Delete Current Page
  const handleDeleteCurrentPage = () => {
    if (pages.length <= 1) {
      showToast('குறைந்தது ஒரு பக்கம் இருக்க வேண்டும்');
      return;
    }
    setPages((prev) => prev.filter((_, idx) => idx !== currentPageIndex));
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
    showToast('பக்கம் நீக்கப்பட்டது');
  };

  // Add Blank Page
  const handleAddBlankPage = () => {
    const newPage: EditorPage = {
      pageNumber: pages.length + 1,
      rotation: 0,
      annotations: [],
      width: 1000,
      height: 1400
    };
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    showToast('புதிய வெற்றுப் பக்கம் சேர்க்கப்பட்டது');
  };

  // Clear Annotations on Current Page
  const handleClearCurrentPageAnnotations = () => {
    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx !== currentPageIndex) return p;
        return { ...p, annotations: [] };
      })
    );
    setSelectedAnnotationId(null);
    showToast('இப்பக்கத்தின் அனைத்து திருத்தங்களும் அழிக்கப்பட்டன');
  };

  // Export Flattened PDF using pdf-lib
  const handleExportEditedPdf = async () => {
    try {
      showToast('திருத்தப்பட்ட PDF தயாராகிறது...');
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        const compositeCanvas = document.createElement('canvas');
        const baseCanvas = baseCanvasRef.current;

        if (i === currentPageIndex && baseCanvas) {
          compositeCanvas.width = baseCanvas.width;
          compositeCanvas.height = baseCanvas.height;
          const cCtx = compositeCanvas.getContext('2d');
          if (cCtx) {
            cCtx.drawImage(baseCanvas, 0, 0);
            if (drawingCanvasRef.current) {
              cCtx.drawImage(drawingCanvasRef.current, 0, 0);
            }
          }
        } else {
          compositeCanvas.width = p.width || 1000;
          compositeCanvas.height = p.height || 1400;
          const cCtx = compositeCanvas.getContext('2d');
          if (cCtx) {
            cCtx.fillStyle = '#FFFFFF';
            cCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
            if (p.canvasDataUrl) {
              const img = new Image();
              img.src = p.canvasDataUrl;
              cCtx.drawImage(img, 0, 0, compositeCanvas.width, compositeCanvas.height);
            }
          }
        }

        const imgDataUrl = compositeCanvas.toDataURL('image/jpeg', 0.92);
        const imageBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
        const jpgImage = await pdfDoc.embedJpg(imageBytes);

        const page = pdfDoc.addPage([compositeCanvas.width, compositeCanvas.height]);
        page.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: compositeCanvas.width,
          height: compositeCanvas.height
        });

        if (p.rotation !== 0) {
          page.setRotation(degrees(p.rotation));
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle}_Edited_Nitro.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('திருத்தப்பட்ட PDF வெற்றிகரமாக பதிவிறக்கப்பட்டது!');
    } catch (e: any) {
      console.error('Error generating PDF:', e);
      showToast('PDF ஏற்றுமதியில் பிழை ஏற்பட்டது.');
    }
  };

  // Convert Current Page to OCR DOCX
  const handleConvertCurrentPageToOCR = () => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas || !onProcessPageOCR) return;

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = baseCanvas.width;
    compositeCanvas.height = baseCanvas.height;
    const cCtx = compositeCanvas.getContext('2d');
    if (!cCtx) return;

    cCtx.drawImage(baseCanvas, 0, 0);
    if (drawingCanvasRef.current) {
      cCtx.drawImage(drawingCanvasRef.current, 0, 0);
    }

    const dataUrl = compositeCanvas.toDataURL('image/jpeg', 0.95);
    const base64Clean = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    onProcessPageOCR(base64Clean, `${documentTitle} - பக்கம் ${currentPageIndex + 1}`);
    showToast('பக்கம் OCR மற்றும் Word DOCX மாற்றத்திற்கு அனுப்பப்படுகிறது...');
  };

  // Convert Current Page directly to Excel (.xlsx)
  const handleConvertCurrentPageToExcel = async () => {
    const baseCanvas = baseCanvasRef.current;
    if (!baseCanvas) return;

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = baseCanvas.width;
    compositeCanvas.height = baseCanvas.height;
    const cCtx = compositeCanvas.getContext('2d');
    if (!cCtx) return;

    cCtx.drawImage(baseCanvas, 0, 0);
    if (drawingCanvasRef.current) {
      cCtx.drawImage(drawingCanvasRef.current, 0, 0);
    }

    try {
      showToast('பக்கம் எக்செல் (.xlsx) அட்டவணையாக மாற்றப்படுகிறது...');
      const dataUrl = compositeCanvas.toDataURL('image/jpeg', 0.95);
      await executePdfToExcelConversion(dataUrl, {
        fileName: `${documentTitle}_பக்கம்_${currentPageIndex + 1}`,
        autoDownload: true,
        onProgress: (msg) => {
          showToast(msg);
        }
      });
      showToast('Excel (.xlsx) கோப்பு வெற்றிகரமாக பதிவிறக்கப்பட்டது!');
    } catch (err: any) {
      console.error('Failed to convert page to Excel:', err);
      showToast('எக்செல் மாற்றத்தில் பிழை: ' + (err.message || ''));
    }
  };

  const currentPage = pages[currentPageIndex];
  const selectedAnnotation = currentPage?.annotations.find((a) => a.id === selectedAnnotationId);
  const selectedImageAnn = selectedAnnotation?.type === 'image' ? (selectedAnnotation as ImageAnnotation) : null;

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12141A] border border-[#00FF66] text-white px-4 py-3 rounded shadow-2xl text-xs font-mono flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#00FF66]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Inputs for Document & Image Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageInsertUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Nitro PDF Top Header & Ribbon */}
      <div className="bg-[#12141A] border border-white/10 p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Document Info & Load Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse"></span>
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>NITRO PDF EDITOR</span>
              <span className="text-[10px] text-[#00FF66] bg-[#00FF66]/10 px-1.5 py-0.5 border border-[#00FF66]/30 font-mono">
                STUDIO PRO
              </span>
            </h2>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block"></div>

          {/* Quick File Select */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/5 hover:bg-white/10 border border-white/20 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>PDF / படம் திறக்க</span>
          </button>

          {/* Add Image / Seal Button */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className="bg-white/5 hover:bg-white/10 border border-[#38BDF8]/40 text-[#38BDF8] px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
            title="Insert Image, Logo, Seal, or Signature onto PDF"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>படம் சேர்க்க (Add Image)</span>
          </button>

          {/* Quick Sample Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) handleLoadSample(e.target.value);
            }}
            defaultValue=""
            className="bg-[#0A0B0E] border border-white/20 px-2.5 py-1.5 text-xs text-[#FFB800] font-mono outline-none cursor-pointer"
          >
            <option value="" disabled>
              மாதிரி ஆவணங்கள் (Samples)...
            </option>
            {SAMPLE_DOCUMENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tamilTitle.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>

        {/* Right: Export & Convert Actions */}
        <div className="flex items-center gap-2">
          {pages.length > 0 && (
            <>
              {onProcessPageOCR && (
                <button
                  onClick={handleConvertCurrentPageToOCR}
                  disabled={isProcessingOCR}
                  className="bg-[#1E293B] hover:bg-[#334155] border border-emerald-500/50 text-emerald-300 font-bold px-3 py-1.5 text-xs tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Convert this edited page directly to Tamil Unicode Word DOCX"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isProcessingOCR ? 'OCR இயங்குகிறது...' : 'Word (.docx) மாற்று'}</span>
                </button>
              )}

              <button
                id="btn-pdf-editor-convert-excel"
                onClick={handleConvertCurrentPageToExcel}
                className="bg-[#12241F] hover:bg-[#1A332B] border border-emerald-500/60 text-emerald-300 font-bold px-3 py-1.5 text-xs tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Convert this edited page directly to Microsoft Excel (.xlsx) spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Excel (.xlsx) மாற்று</span>
              </button>

              <button
                onClick={handleExportEditedPdf}
                className="bg-[#00FF66] hover:bg-[#00e65c] text-black font-black px-4 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Download the modified PDF with all notes, signatures, images and stamps"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF பதிவிறக்கு (Save PDF)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main PDF Editor Tool Ribbon */}
      {pages.length > 0 && (
        <div className="bg-[#0F1115] border border-white/10 p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Section 1: Pre-Edit Font Selection & Typography */}
          <div className="flex items-center gap-2 bg-[#161922] p-1.5 border border-white/10">
            <span className="text-[11px] font-mono text-gray-400 font-bold uppercase flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-[#00FF66]" />
              <span className="hidden sm:inline">எழுத்துரு (Font):</span>
            </span>

            {/* Font Selection Dropdown (Available before editing) */}
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                // Also update selected text annotation if any is active
                if (selectedAnnotationId) {
                  setPages((prev) =>
                    prev.map((p, idx) => {
                      if (idx !== currentPageIndex) return p;
                      return {
                        ...p,
                        annotations: p.annotations.map((ann) =>
                          ann.id === selectedAnnotationId && ann.type === 'text'
                            ? { ...ann, fontFamily: e.target.value }
                            : ann
                        )
                      };
                    })
                  );
                }
              }}
              className="bg-[#0A0B0E] border border-[#00FF66]/40 px-2 py-1 text-xs text-[#00FF66] font-mono outline-none cursor-pointer max-w-[170px]"
              title="Select Tamil / English font before adding text or for selected text"
            >
              {AVAILABLE_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            {/* Font Size */}
            <input
              type="number"
              min="10"
              max="96"
              value={fontSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setFontSize(newSize);
                if (selectedAnnotationId) {
                  setPages((prev) =>
                    prev.map((p, idx) => {
                      if (idx !== currentPageIndex) return p;
                      return {
                        ...p,
                        annotations: p.annotations.map((ann) =>
                          ann.id === selectedAnnotationId && ann.type === 'text'
                            ? { ...ann, fontSize: newSize }
                            : ann
                        )
                      };
                    })
                  );
                }
              }}
              className="w-14 bg-[#0A0B0E] border border-white/20 px-1.5 py-1 text-xs text-white font-mono outline-none text-center"
              title="Font Size (Pt)"
            />

            {/* Bold Toggle */}
            <button
              onClick={() => {
                const toggled = !isBold;
                setIsBold(toggled);
                if (selectedAnnotationId) {
                  setPages((prev) =>
                    prev.map((p, idx) => {
                      if (idx !== currentPageIndex) return p;
                      return {
                        ...p,
                        annotations: p.annotations.map((ann) =>
                          ann.id === selectedAnnotationId && ann.type === 'text'
                            ? { ...ann, bold: toggled }
                            : ann
                        )
                      };
                    })
                  );
                }
              }}
              className={`px-2 py-1 border text-xs font-bold cursor-pointer transition-colors ${
                isBold
                  ? 'bg-[#00FF66] text-black border-[#00FF66]'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:text-white'
              }`}
              title="Toggle Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Text Color Picker */}
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setTextColor(newColor);
                if (selectedAnnotationId) {
                  setPages((prev) =>
                    prev.map((p, idx) => {
                      if (idx !== currentPageIndex) return p;
                      return {
                        ...p,
                        annotations: p.annotations.map((ann) =>
                          ann.id === selectedAnnotationId && (ann.type === 'text' || ann.type === 'rectangle' || ann.type === 'arrow')
                            ? { ...ann, color: newColor }
                            : ann
                        )
                      };
                    })
                  );
                }
              }}
              className="w-7 h-7 bg-transparent border-0 cursor-pointer"
              title="Text / Outline Color"
            />
          </div>

          {/* Section 2: Nitro Tools Ribbon */}
          <div className="flex items-center gap-1 bg-[#161922] p-1 border border-white/10">
            <button
              onClick={() => setActiveTool('select')}
              className={`p-1.5 rounded-none flex items-center gap-1 cursor-pointer transition-all ${
                activeTool === 'select'
                  ? 'bg-[#00FF66] text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              title="Select / Move Elements (Shortcut: Esc)"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">தேர்வு</span>
            </button>

            <button
              onClick={() => setActiveTool('text')}
              className={`p-1.5 rounded-none flex items-center gap-1 cursor-pointer transition-all ${
                activeTool === 'text'
                  ? 'bg-[#00FF66] text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              title="Add Text / Typewriter anywhere on PDF"
            >
              <Type className="w-4 h-4" />
              <span className="hidden md:inline">உரை (Text)</span>
            </button>

            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-1.5 rounded-none flex items-center gap-1 cursor-pointer text-[#38BDF8] hover:text-white hover:bg-white/5 transition-all"
              title="Insert Image, Logo, Seal, or Signature"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden md:inline">படம் (Image)</span>
            </button>

            <button
              onClick={() => setActiveTool('highlighter')}
              className={`p-1.5 rounded-none flex items-center gap-1 cursor-pointer transition-all ${
                activeTool === 'highlighter'
                  ? 'bg-[#ECC94B] text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              title="Highlight Text with translucent marker"
            >
              <Highlighter className="w-4 h-4" />
              <span className="hidden md:inline">ஹைலைட்டர்</span>
            </button>

            <button
              onClick={() => setActiveTool('pen')}
              className={`p-1.5 rounded-none flex items-center gap-1 cursor-pointer transition-all ${
                activeTool === 'pen'
                  ? 'bg-[#00FF66] text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              title="Freehand Pen / Annotation"
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden md:inline">பேனா (Pen)</span>
            </button>

            <button
              onClick={() => setActiveTool('redact-black')}
              className={`p-1.5 rounded-none flex items-center gap-1 cursor-pointer transition-all ${
                activeTool === 'redact-black'
                  ? 'bg-black text-white font-bold border border-white/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              title="Redact / Blackout sensitive details"
            >
              <Square className="w-4 h-4 fill-black" />
              <span className="hidden md:inline">Blackout</span>
            </button>

            <button
              onClick={() => setActiveTool('redact-white')}
              className={`p-1.5 rounded-none flex items-center gap-1 cursor-pointer transition-all ${
                activeTool === 'redact-white'
                  ? 'bg-white text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              title="Whiteout background / Clean scan"
            >
              <Square className="w-4 h-4 fill-white" />
              <span className="hidden md:inline">Whiteout</span>
            </button>

            <button
              onClick={() => setActiveTool('rectangle')}
              className={`p-1.5 rounded-none flex items-center gap-1 cursor-pointer transition-all ${
                activeTool === 'rectangle'
                  ? 'bg-[#00FF66] text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              title="Draw Box / Rectangle"
            >
              <Square className="w-4 h-4" />
              <span className="hidden md:inline">சதுரம்</span>
            </button>

            <button
              onClick={() => setActiveTool('stamp')}
              className={`p-1.5 rounded-none flex items-center gap-1 cursor-pointer transition-all ${
                activeTool === 'stamp'
                  ? 'bg-[#00FF66] text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              title="Add Official Rubber Stamp (APPROVED, VERIFIED, SEAL)"
            >
              <Stamp className="w-4 h-4" />
              <span className="hidden md:inline">முத்திரை (Stamp)</span>
            </button>
          </div>

          {/* Section 3: Copy, Paste, Erase Selection Actions */}
          <div className="flex items-center gap-1 bg-[#161922] p-1 border border-white/10">
            {/* Copy Button */}
            <button
              onClick={handleCopySelected}
              disabled={!selectedAnnotationId}
              className="p-1.5 flex items-center gap-1 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 cursor-pointer transition-all"
              title="Copy Selected Item (Ctrl+C)"
            >
              <Copy className="w-4 h-4 text-[#38BDF8]" />
              <span className="hidden sm:inline">நகலெடு (Copy)</span>
            </button>

            {/* Paste Button */}
            <button
              onClick={handlePasteAnnotation}
              disabled={!clipboardAnnotation}
              className="p-1.5 flex items-center gap-1 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 cursor-pointer transition-all"
              title="Paste Copied Item (Ctrl+V)"
            >
              <ClipboardPaste className="w-4 h-4 text-[#00FF66]" />
              <span className="hidden sm:inline">ஒட்டு (Paste)</span>
            </button>

            {/* Erase Selection Button */}
            <button
              onClick={handleEraseSelected}
              disabled={!selectedAnnotationId}
              className="p-1.5 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 disabled:opacity-30 cursor-pointer transition-all"
              title="Erase Selection (Delete / Backspace)"
            >
              <Eraser className="w-4 h-4 text-rose-400" />
              <span className="font-bold">தேர்வை அழி (Erase)</span>
            </button>
          </div>

          {/* Section 4: Page Management & Zoom */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRotateCurrentPage}
              className="bg-white/5 hover:bg-white/10 p-1.5 border border-white/10 text-gray-300 hover:text-white cursor-pointer"
              title="Rotate Page 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleClearCurrentPageAnnotations}
              className="bg-white/5 hover:bg-white/10 p-1.5 border border-white/10 text-gray-300 hover:text-white cursor-pointer"
              title="Clear all drawings and annotations on this page"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-white/10 mx-1"></div>

            {/* Zoom Controls */}
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
              className="bg-white/5 hover:bg-white/10 p-1.5 border border-white/10 text-gray-300 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-gray-400 w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
              className="bg-white/5 hover:bg-white/10 p-1.5 border border-white/10 text-gray-300 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor Body: Page Thumbnails Panel + Main Canvas Stage */}
      {pages.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Thumbnail Strip (Nitro PDF Page Drawer) */}
          <div className="lg:col-span-3 bg-[#12141A] border border-white/10 p-4 space-y-4 max-h-[700px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00FF66]" />
                <span>பக்கங்கள் ({pages.length})</span>
              </span>
              <button
                onClick={handleAddBlankPage}
                className="text-[11px] bg-white/5 hover:bg-white/10 border border-white/15 text-[#00FF66] px-2 py-0.5 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>வெற்றுப் பக்கம்</span>
              </button>
            </div>

            <div className="space-y-3">
              {pages.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentPageIndex(idx);
                    setSelectedAnnotationId(null);
                  }}
                  className={`p-2.5 border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    currentPageIndex === idx
                      ? 'border-[#00FF66] bg-[#00FF66]/10 shadow-lg'
                      : 'border-white/10 bg-[#0A0B0E] hover:border-white/30'
                  }`}
                >
                  <div className="w-full aspect-[1/1.4] bg-white/10 border border-white/15 flex items-center justify-center relative overflow-hidden">
                    <span className="text-xs font-mono text-gray-400 font-bold">
                      பக்கம் {idx + 1}
                    </span>
                    {p.annotations.length > 0 && (
                      <span className="absolute bottom-1 right-1 bg-[#00FF66] text-black text-[9px] font-bold px-1 font-mono">
                        {p.annotations.length} குறிப்புகள்
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full text-[11px] font-mono text-gray-400">
                    <span>
                      Page {idx + 1} of {pages.length}
                    </span>
                    {p.rotation !== 0 && <span>{p.rotation}°</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Visual Canvas Stage */}
          <div className="lg:col-span-9 bg-[#0A0B0E] border border-white/10 p-6 flex flex-col items-center justify-start min-h-[700px] overflow-auto relative">
            {/* Dedicated Selected Image / Overlay Resize Toolbar */}
            {selectedImageAnn && (
              <div className="w-full max-w-4xl bg-[#12141A] border-2 border-[#38BDF8] p-3 mb-4 rounded shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                {/* Image info & dimensions */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-[#1E293B] px-2.5 py-1.5 rounded border border-[#38BDF8]/30">
                    <ImageIcon className="w-4 h-4 text-[#38BDF8]" />
                    <span className="font-bold text-white font-mono text-[11px] truncate max-w-[130px]" title={selectedImageAnn.name}>
                      {selectedImageAnn.name || 'படம் (Image)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0A0B0E] px-2 py-1 border border-white/10 rounded">
                    <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">அகலம்:</span>
                    <input
                      type="number"
                      min={20}
                      max={2000}
                      value={Math.round(selectedImageAnn.width)}
                      onChange={(e) => handleUpdateImageWidth(parseInt(e.target.value, 10))}
                      className="w-16 bg-[#161922] border border-white/20 px-1.5 py-0.5 text-xs text-[#38BDF8] font-mono font-bold outline-none focus:border-[#38BDF8]"
                    />
                    <span className="text-gray-500 text-[10px]">px</span>

                    {/* Aspect Ratio Lock Button */}
                    <button
                      onClick={handleToggleLockAspectRatio}
                      className={`p-1 border rounded transition-all cursor-pointer ${
                        selectedImageAnn.lockAspectRatio !== false
                          ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                      title={
                        selectedImageAnn.lockAspectRatio !== false
                          ? 'விகிதக் கட்டுப்பாடு இயக்கத்தில் உள்ளது (Aspect Ratio Locked)'
                          : 'விகிதக் கட்டுப்பாடு முடக்கப்பட்டுள்ளது (Aspect Ratio Unlocked)'
                      }
                    >
                      {selectedImageAnn.lockAspectRatio !== false ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <span className="text-[10px] font-mono text-gray-400 font-bold uppercase ml-1">உயரம்:</span>
                    <input
                      type="number"
                      min={20}
                      max={2000}
                      value={Math.round(selectedImageAnn.height)}
                      onChange={(e) => handleUpdateImageHeight(parseInt(e.target.value, 10))}
                      className="w-16 bg-[#161922] border border-white/20 px-1.5 py-0.5 text-xs text-[#38BDF8] font-mono font-bold outline-none focus:border-[#38BDF8]"
                    />
                    <span className="text-gray-500 text-[10px]">px</span>
                  </div>
                </div>

                {/* Scaling & Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#161922] p-1 border border-white/10 rounded">
                    <span className="text-[10px] font-mono text-gray-400 font-bold px-1 flex items-center gap-1">
                      <Scaling className="w-3 h-3 text-[#38BDF8]" />
                      <span>அளவு:</span>
                    </span>
                    <button
                      onClick={() => handleScaleImageByFactor(0.75)}
                      className="bg-white/5 hover:bg-white/15 px-1.5 py-0.5 text-[11px] font-mono text-gray-300 hover:text-white border border-white/10 rounded cursor-pointer"
                      title="Shrink by 25%"
                    >
                      -25%
                    </button>
                    <button
                      onClick={() => handleScaleImageByFactor(0.9)}
                      className="bg-white/5 hover:bg-white/15 px-1.5 py-0.5 text-[11px] font-mono text-gray-300 hover:text-white border border-white/10 rounded cursor-pointer"
                      title="Shrink by 10%"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => handleScaleImageByFactor(1.1)}
                      className="bg-white/5 hover:bg-white/15 px-1.5 py-0.5 text-[11px] font-mono text-gray-300 hover:text-white border border-white/10 rounded cursor-pointer"
                      title="Enlarge by 10%"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => handleScaleImageByFactor(1.25)}
                      className="bg-white/5 hover:bg-white/15 px-1.5 py-0.5 text-[11px] font-mono text-gray-300 hover:text-white border border-white/10 rounded cursor-pointer"
                      title="Enlarge by 25%"
                    >
                      +25%
                    </button>
                  </div>

                  {/* Standard Presets */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSetImagePreset(120, 120)}
                      className="bg-[#1E293B] hover:bg-[#334155] border border-white/10 text-gray-200 px-2 py-1 text-[10px] font-mono rounded cursor-pointer"
                      title="முத்திரை / சீல் அளவு (Seal 120x120)"
                    >
                      முத்திரை
                    </button>
                    <button
                      onClick={() => handleSetImagePreset(180, 70)}
                      className="bg-[#1E293B] hover:bg-[#334155] border border-white/10 text-gray-200 px-2 py-1 text-[10px] font-mono rounded cursor-pointer"
                      title="கையொப்பம் அளவு (Signature 180x70)"
                    >
                      கையொப்பம்
                    </button>
                    <button
                      onClick={() => handleSetImagePreset(140, 180)}
                      className="bg-[#1E293B] hover:bg-[#334155] border border-white/10 text-gray-200 px-2 py-1 text-[10px] font-mono rounded cursor-pointer"
                      title="புகைப்படம் / பாஸ்போர்ட் அளவு (Photo 140x180)"
                    >
                      புகைப்படம்
                    </button>
                  </div>

                  {/* Reset & Delete Actions */}
                  <button
                    onClick={handleResetImageOriginalSize}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white p-1.5 rounded cursor-pointer"
                    title="Reset to Original Dimensions (அசல் அளவு)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleEraseSelected}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 p-1.5 rounded cursor-pointer"
                    title="Delete Image (நீக்கு)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Stage Container */}
            <div
              ref={canvasContainerRef}
              className="relative shadow-2xl border border-white/20 bg-white"
              style={{
                width: baseCanvasRef.current ? baseCanvasRef.current.width : 'auto',
                height: baseCanvasRef.current ? baseCanvasRef.current.height : 'auto'
              }}
            >
              {/* PDF / Document Image Base Canvas */}
              <canvas ref={baseCanvasRef} className="block" />

              {/* Interactive Nitro Annotation & Drawing Canvas */}
              <canvas
                ref={drawingCanvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={`absolute top-0 left-0 ${
                  activeTool === 'select'
                    ? 'cursor-default'
                    : activeTool === 'text'
                    ? 'cursor-text'
                    : activeTool === 'pen' || activeTool === 'highlighter'
                    ? 'cursor-crosshair'
                    : 'cursor-crosshair'
                }`}
              />

              {/* Inline Typewriter Popup when clicking */}
              {activeTextInput && (
                <div
                  className="absolute z-30 bg-[#12141A] border-2 border-[#00FF66] p-2 shadow-2xl flex flex-col gap-2 min-w-[260px]"
                  style={{
                    left: `${activeTextInput.x * zoomLevel}px`,
                    top: `${activeTextInput.y * zoomLevel}px`
                  }}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span className="text-[#00FF66] font-bold">
                      உரை உள்ளீடு ({fontFamily})
                    </span>
                    <button
                      onClick={() => setActiveTextInput(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    autoFocus
                    rows={2}
                    value={activeTextInput.text}
                    onChange={(e) =>
                      setActiveTextInput({ ...activeTextInput, text: e.target.value })
                    }
                    placeholder="இங்கே தட்டச்சு செய்யவும்..."
                    className="w-full bg-[#0A0B0E] border border-white/20 p-2 text-xs text-white outline-none focus:border-[#00FF66] resize-none"
                    style={{ fontFamily, fontSize: `${fontSize}px` }}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveTextInput(null)}
                      className="text-[10px] text-gray-400 px-2 py-1 hover:text-white cursor-pointer"
                    >
                      ரத்து
                    </button>
                    <button
                      onClick={() => {
                        if (activeTextInput.text.trim()) {
                          const newText: TextAnnotation = {
                            id: `text-${Date.now()}`,
                            type: 'text',
                            x: activeTextInput.x,
                            y: activeTextInput.y,
                            text: activeTextInput.text,
                            fontSize: fontSize,
                            color: textColor,
                            fontFamily: fontFamily,
                            bold: isBold
                          };
                          addAnnotationToCurrentPage(newText);
                          setSelectedAnnotationId(newText.id);
                        }
                        setActiveTextInput(null);
                        setActiveTool('select');
                      }}
                      className="text-[10px] bg-[#00FF66] text-black font-bold px-3 py-1 cursor-pointer"
                    >
                      சேர் (Insert)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Page Navigation Strip */}
            <div className="mt-4 flex items-center gap-4 bg-[#12141A] border border-white/10 px-4 py-2 text-xs font-mono text-gray-300">
              <button
                onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                disabled={currentPageIndex === 0}
                className="hover:text-white disabled:opacity-30 cursor-pointer p-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                பக்கம் <strong className="text-white">{currentPageIndex + 1}</strong> / {pages.length}
              </span>
              <button
                onClick={() => setCurrentPageIndex((p) => Math.min(pages.length - 1, p + 1))}
                disabled={currentPageIndex === pages.length - 1}
                className="hover:text-white disabled:opacity-30 cursor-pointer p-1"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State & Upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/20 hover:border-[#00FF66] bg-[#12141A] p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
        >
          <div className="w-16 h-16 bg-white/5 group-hover:bg-[#00FF66]/10 text-gray-400 group-hover:text-[#00FF66] flex items-center justify-center rounded-xl border border-white/10 mb-4 transition-colors">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-white uppercase group-hover:text-[#00FF66] tracking-wider">
            PDF ஆவணத்தை இங்கே பதிவேற்றவும் (NITRO PDF EDIT)
          </h3>
          <p className="text-xs text-gray-400 mt-1.5 font-mono max-w-lg">
            எழுத்துரு தேர்வு செய்து தட்டச்சு செய்ய, படங்கள்/முத்திரைகள் சேர்க்க, நகலெடுக்க (Copy) மற்றும் ஒட்ட (Paste), தவறுகளை Whiteout/Erase செய்ய அல்லது மாதிரி ஆவணங்களை சோதிக்கலாம்.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {SAMPLE_DOCUMENTS.slice(0, 3).map((sample) => (
              <button
                key={sample.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSample(sample.id);
                }}
                className="bg-white/5 hover:bg-white/15 border border-white/20 text-xs text-[#FFB800] px-3 py-1.5 font-mono cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{sample.tamilTitle.slice(0, 24)}...</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
