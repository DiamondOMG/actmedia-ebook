"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const BookView = dynamic(() => import("@/components/book-view"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      <p className="text-neutral-400 font-medium animate-pulse">กำลังเตรียมโปรแกรมอ่าน E-Book...</p>
    </div>
  ),
});

interface BookViewLoaderProps {
  pdfUrl: string;
  title: string;
}

export default function BookViewLoader({ pdfUrl, title }: BookViewLoaderProps) {
  return <BookView pdfUrl={pdfUrl} title={title} />;
}
