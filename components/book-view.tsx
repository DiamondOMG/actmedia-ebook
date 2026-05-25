"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download
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
      data-density="soft"
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
  const [isMounted, setIsMounted] = useState(false);
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Custom sizing for responsiveness - maximize PDF display
  const [pageWidth, setPageWidth] = useState(450);
  const [pageHeight, setPageHeight] = useState(636);
  const [aspectRatio, setAspectRatio] = useState(1.414); // Default to A4
  const [isPortrait, setIsPortrait] = useState(true);
  const aspectRef = useRef(1.414);

  // Resize handler to maximize PDF size based on available viewport and aspect ratio
  const handleResize = React.useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Reserve minimal space for overlay badges (10px padding top/bottom)
    const availableHeight = h - 20;
    const currentRatio = aspectRef.current;
    
    // Determine margins based on screen size
    let horizontalMargin = 20; // Default margin
    if (w >= 1024) {
      horizontalMargin = 80;
    } else if (w >= 640) {
      horizontalMargin = 40;
    }
    
    // Show 1 page on mobile/small screens (portrait), 2 pages on tablet/desktop (landscape)
    const activePortrait = w < 768;
    setIsPortrait(activePortrait);
    
    const maxAvailableWidth = activePortrait ? (w - horizontalMargin) : (w - horizontalMargin) / 2;
    
    // Calculate the width that would perfectly match the available height
    const widthFromHeight = Math.floor(availableHeight / currentRatio);
    
    // Choose the smaller width to ensure it fits both width and height boundaries perfectly
    let finalWidth = Math.min(maxAvailableWidth, widthFromHeight);
    
    // Cap at a reasonable maximum width for desktop
    if (w >= 1024) {
      finalWidth = Math.min(finalWidth, 550);
    }
    
    // Set a minimum fallback width
    finalWidth = Math.max(200, finalWidth);
    
    setPageWidth(finalWidth);
    setPageHeight(Math.floor(finalWidth * currentRatio));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Recalculate sizes when aspect ratio is loaded/updated
  useEffect(() => {
    handleResize();
  }, [aspectRatio, handleResize]);

  const onDocumentLoadSuccess = async (pdf: any) => {
    setNumPages(pdf.numPages);
    try {
      // Fetch the first page to get actual aspect ratio dynamically
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      const ratio = viewport.height / viewport.width;
      if (ratio && !isNaN(ratio)) {
        aspectRef.current = ratio;
        setAspectRatio(ratio);
      }
    } catch (error) {
      console.error("Error detecting PDF aspect ratio:", error);
    }
  };

  const handlePageFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  // Remove fullscreen logic - not needed since we're already full viewport

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
      className="h-screen bg-neutral-950 flex items-center justify-center select-none relative overflow-hidden"
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

      {/* Back button - top left overlay */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-3 left-3 z-30 p-2 text-neutral-400 hover:text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all"
        title="กลับหน้าแรก"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Download button - top right overlay */}
      <a
        href={pdfUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 z-30 p-2 text-neutral-400 hover:text-white bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-all"
        title="ดาวน์โหลดไฟล์ PDF"
      >
        <Download className="w-5 h-5" />
      </a>

      {/* Main E-book Flipbook Container - full viewport */}
      <div className="w-full h-full flex items-center justify-center">
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
                key={isPortrait ? "portrait" : "landscape"}
                startPage={currentPage}
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
                usePortrait={isPortrait}
                flippingTime={600}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                drawShadow={true}
                className="mx-auto overflow-hidden shadow-2xl"
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
              {/* Page number overlay - bottom center of PDF */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[11px] font-medium text-neutral-400 pointer-events-none z-20">
                {currentPage + 1} / {numPages}
              </div>
            </div>
          )}
        </Document>
      </div>
    </div>
  );
}
