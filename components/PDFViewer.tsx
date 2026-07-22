"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl?: string;
  bookTitle?: string;
  className?: string;
}

export default function PDFViewer({
  pdfUrl = "/textbooks/infinity-science-1.pdf",
  bookTitle = "Textbook",
  className,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  };

  return (
    <div className={cn("flex flex-col h-full bg-[#0d0d1a] rounded-2xl border border-white/10 overflow-hidden", className)}>
      {/* PDF Controls Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <BookOpen className="w-4 h-4 text-teal-400" />
          <span className="font-semibold text-white truncate max-w-[200px]">{bookTitle}</span>
          {numPages && (
            <span className="text-xs text-gray-500">({numPages} pages)</span>
          )}
        </div>

        {/* Page controls */}
        {numPages && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-gray-300">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-gray-400 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Document Render Area */}
      <div className="flex-1 overflow-auto flex justify-center items-start p-4 scrollbar-thin scrollbar-thumb-white/10">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
              <FileText className="w-8 h-8 text-teal-400 animate-pulse" />
              <span className="text-sm">Loading Textbook PDF...</span>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-64 text-red-400 gap-2">
              <span className="text-sm">Failed to load textbook PDF.</span>
              <span className="text-xs text-gray-500">Ensure the PDF is hosted at {pdfUrl}</span>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            className="shadow-2xl rounded-lg overflow-hidden"
          />
        </Document>
      </div>
    </div>
  );
}
