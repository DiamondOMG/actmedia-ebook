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
  
  // Custom sizing for responsiveness
  const [pageWidth, setPageWidth] = useState(450);

  useEffect(() => {
    setIsMounted(true);
    
    // Resize handler to adjust book page size based on window width
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setPageWidth(w - 32); // Mobile width
      } else if (w < 1024) {
        setPageWidth(380);
      } else {
        setPageWidth(480); // Default desktop width
      }
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

  const pageHeight = pageWidth * 1.414; // A4 Aspect Ratio

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 flex flex-col ${
        isFullscreen ? "p-4" : "py-6 px-4 md:px-8"
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
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 mb-6 z-10">
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
      <div className="flex-1 flex items-center justify-center z-10 w-full max-w-7xl mx-auto overflow-hidden">
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
                size="stretch"
                minWidth={300}
                maxWidth={800}
                minHeight={400}
                maxHeight={1200}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={handlePageFlip}
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
            </div>
          )}
        </Document>
      </div>

      {/* Floating Controller Bottom Bar */}
      {numPages && (
        <div className="w-full max-w-md mx-auto mt-6 z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-4">
              <button
                onClick={flipPrev}
                disabled={currentPage === 0}
                className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 rounded-xl text-white transition-all active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>
                  หน้า {currentPage + 1} / {numPages}
                </span>
              </div>

              <button
                onClick={flipNext}
                disabled={currentPage >= numPages - 1}
                className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 rounded-xl text-white transition-all active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Page Jumper */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">ไปที่หน้า:</span>
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
                className="w-16 px-2 py-1 text-center bg-neutral-950/60 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
