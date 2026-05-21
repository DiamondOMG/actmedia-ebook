"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Loader2,
  Download,
  BookOpen
} from "lucide-react";

// Configure pdfjs worker from standard unpkg CDN to ensure smooth client-side parsing
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookViewProps {
  pdfUrl: string;
  title: string;
}

interface PageProps {
  pageNumber: number;
  width: number;
  height: number;
}

// Wrapper component to forward ref to react-pageflip
const BookPage = forwardRef<HTMLDivElement, PageProps>((props, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white shadow-2xl flex items-center justify-center overflow-hidden border border-neutral-200"
      style={{ width: props.width, height: props.height }}
    >
      <Page
        pageNumber={props.pageNumber}
        width={props.width}
        height={props.height}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        loading={
          <div className="flex items-center justify-center bg-white" style={{ width: props.width, height: props.height }}>
            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
          </div>
        }
      />
    </div>
  );
});
BookPage.displayName = "BookPage";

export default function BookView({ pdfUrl, title }: BookViewProps) {
  const router = useRouter();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Custom sizing for responsiveness - maximize PDF display
  const [pageWidth, setPageWidth] = useState(450);
  const [pageHeight, setPageHeight] = useState(636);

  useEffect(() => {
    setIsMounted(true);
    
    // Resize handler to maximize PDF size based on available viewport
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Reserve space for header (56px) + small overlay padding
      const availableHeight = h - 80;
      const aspectRatio = 1.414; // A4
      // Calculate width from height to maximize vertical usage
      const widthFromHeight = Math.floor(availableHeight / aspectRatio);
      
      let maxWidth: number;
      if (w < 640) {
        maxWidth = w - 16; // Mobile - nearly full width
      } else if (w < 1024) {
        maxWidth = Math.min(widthFromHeight, w - 80);
      } else {
        maxWidth = Math.min(widthFromHeight, w - 160, 700);
      }
      
      const finalWidth = Math.max(300, maxWidth);
      setPageWidth(finalWidth);
      setPageHeight(Math.floor(finalWidth * aspectRatio));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const flipPrev = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const flipNext = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-neutral-400 font-medium animate-pulse">กำลังเตรียมโปรแกรมอ่าน E-Book...</p>
      </div>
    );
  }

  // pageHeight is now computed in resize handler

  return (
    <div 
      ref={containerRef}
      className={`h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 flex flex-col ${
        isFullscreen ? "p-2" : "py-2 px-2 md:px-4"
      } select-none transition-colors relative overflow-hidden`}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .react-pdf__Page__canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
        .react-pdf__Page {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background-color: transparent !important;
        }
      `}} />

      {/* Dynamic light sources */}
      <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

      {/* Top Navigation Header */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 mb-2 z-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">กลับหน้าแรก</span>
        </button>

        <div className="flex-1 text-center max-w-lg">
          <h1 className="text-lg md:text-xl font-bold text-white truncate drop-shadow-md">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={pdfUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md transition-all"
            title="ดาวน์โหลดไฟล์ PDF"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md transition-all"
            title={isFullscreen ? "ออกจากโหมดเต็มหน้าจอ" : "เต็มหน้าจอ"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main E-book Flipbook Container */}
      <div className="flex-1 flex items-center justify-center z-10 w-full max-w-7xl mx-auto overflow-hidden min-h-0">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-neutral-400 font-medium animate-pulse">กำลังโหลดไฟล์ PDF...</p>
            </div>
          }
          error={
            <div className="p-8 text-center text-rose-400 bg-rose-500/10 rounded-2xl border border-rose-500/20 max-w-md mx-auto">
              ไม่สามารถโหลดไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง
            </div>
          }
        >
          {numPages && (
            <div className="relative">
              {/* @ts-ignore */}
              <HTMLFlipBook
                width={pageWidth}
                height={pageHeight}
                size="fixed"
                minWidth={300}
                maxWidth={900}
                minHeight={400}
                maxHeight={1400}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={handlePageFlip}
                usePortrait={true}
                flippingTime={600}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                drawShadow={true}
                className="mx-auto rounded-xl overflow-hidden shadow-2xl"
                ref={bookRef}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <BookPage
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={pageWidth}
                    height={pageHeight}
                  />
                ))}
              </HTMLFlipBook>

              {/* Prev Button Trigger */}
              {currentPage > 0 && (
                <button
                  onClick={flipPrev}
                  className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-indigo-600/90 text-white flex items-center justify-center border border-white/10 hover:border-indigo-400 shadow-xl hidden lg:flex transition-all active:scale-95"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button Trigger */}
              {currentPage < numPages - 1 && (
                <button
                  onClick={flipNext}
                  className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-indigo-600/90 text-white flex items-center justify-center border border-white/10 hover:border-indigo-400 shadow-xl hidden lg:flex transition-all active:scale-95"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              {/* Page number overlay - small badge on bottom-right of PDF */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] font-medium text-neutral-300 pointer-events-none z-20">
                {currentPage + 1} / {numPages}
              </div>
            </div>
          )}
        </Document>
      </div>

      {/* Compact Floating Controller - bottom center */}
      {numPages && (
        <div className="w-full flex justify-center mt-2 z-10">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-neutral-900/70 border border-white/10 backdrop-blur-xl shadow-2xl">
            <button
              onClick={flipPrev}
              disabled={currentPage === 0}
              className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 rounded-lg text-white transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={flipNext}
              disabled={currentPage >= numPages - 1}
              className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 rounded-lg text-white transition-all active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/10" />

            {/* Quick Page Jumper */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-neutral-500">ไปหน้า</span>
              <input
                type="number"
                min={1}
                max={numPages}
                defaultValue={currentPage + 1}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= numPages && bookRef.current) {
                    bookRef.current.pageFlip().turnToPage(val - 1);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    if (val >= 1 && val <= numPages && bookRef.current) {
                      bookRef.current.pageFlip().turnToPage(val - 1);
                    }
                  }
                }}
                className="w-12 px-1.5 py-0.5 text-center bg-neutral-950/60 border border-white/10 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
