"use client";

import { useState } from "react";
import { UploadButton } from "./uploadthing";
import { useRouter } from "next/navigation";
import { BookOpen, FileUp, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface UploadBookProps {
  onSuccess?: () => void;
}

export default function UploadBook({ onSuccess }: UploadBookProps) {
  const [title, setTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleConvert = async () => {
    if (!uploadedFile) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          pdfUrl: uploadedFile.url,
          pdfName: uploadedFile.name,
          pdfSize: uploadedFile.size,
        }),
      });

      if (!response.ok) {
        throw new Error("บันทึกข้อมูลลงฐานข้อมูลไม่สำเร็จ");
      }

      // Reset state on success
      setTitle("");
      setUploadedFile(null);
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 md:p-8 rounded-[30px] bg-white border border-indigo-50 shadow-[0_15px_40px_rgba(79,70,229,0.1)] relative overflow-hidden flex flex-col gap-5">
      {/* Decorative bright spots (subtle and compact) */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100/30 rounded-full blur-[80px] -z-10" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-50/30 rounded-full blur-[80px] -z-10" />

      {/* Header Info (Compact but clear) */}
      <div className="flex items-center gap-3 border-b border-indigo-50 pb-4">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-600/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-neutral-900 flex items-center gap-1.5 tracking-tight">
            สร้าง E-Book ใน 3 ขั้นตอน <Sparkles className="w-5 h-5 text-indigo-600" />
          </h2>
          <p className="text-xs text-neutral-400 font-bold">รวดเร็ว ปลอดภัย ไม่ซับซ้อน</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* STEP 1: TITLE INPUT (COMPACT) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">ขั้นตอนที่ 1</span>
            <span className="text-xs text-neutral-400 font-bold">ตั้งชื่อหนังสือ</span>
          </div>
          <input
            type="text"
            placeholder="กรอกชื่อหนังสือ..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting || isUploading}
            className="w-full px-4 py-3 text-sm md:text-base rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-semibold"
          />
        </div>

        {/* STEP 2: UPLOAD PDF (COMPACT - USING UPLOADBUTTON) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">ขั้นตอนที่ 2</span>
            <span className="text-xs text-neutral-400 font-bold">อัปโหลดไฟล์ PDF</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-dashed border-indigo-100 bg-indigo-50/10 min-h-[120px] text-center">
            {uploadedFile ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
                <div className="max-w-md truncate text-xs font-bold px-4">
                  {uploadedFile.name} ({uploadedFile.size})
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-neutral-500 font-bold px-1 text-center">
                <FileUp className="w-7 h-7 text-indigo-400 mb-1" />
                <span className="text-xs">
                  {isUploading ? "กำลังอัปโหลดไฟล์..." : "กรุณาเลือกไฟล์ PDF (สูงสุด 32MB)"}
                </span>
              </div>
            )}

            <div className="flex justify-center w-full mt-1">
              <UploadButton
                endpoint="pdfUploader"
                onUploadBegin={() => {
                  setIsUploading(true);
                  setError("");
                }}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  if (!res || res.length === 0) return;
                  const fileData = res[0];
                  setUploadedFile({
                    url: fileData.url,
                    name: fileData.name,
                    size: `${(fileData.size / (1024 * 1024)).toFixed(2)} MB`,
                  });
                }}
                onUploadError={(err: Error) => {
                  setIsUploading(false);
                  setError(`อัปโหลดล้มเหลว: ${err.message}`);
                }}
                appearance={{
                  allowedContent: "hidden", // Hide extra allowed text to save space
                  button: `text-xs font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 ${
                    uploadedFile 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/15"
                  }`,
                }}
                content={{
                  button({ ready, isUploading }) {
                    if (isUploading) return <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> กำลังอัปโหลด...</span>;
                    if (uploadedFile) return "เปลี่ยนไฟล์ PDF";
                    if (ready) return <span className="flex items-center gap-1"><FileUp className="w-3.5 h-3.5" /> เลือกไฟล์ PDF</span>;
                    return "กำลังโหลด...";
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* STEP 3: CONVERT BUTTON (SEPARATE STEPS / EXPLICIT ACTION) */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">ขั้นตอนที่ 3</span>
            <span className="text-xs text-neutral-400 font-bold">ยืนยันการแปลงไฟล์</span>
          </div>

          <button
            onClick={handleConvert}
            disabled={!uploadedFile || isSubmitting || isUploading}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
              uploadedFile && !isUploading
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:shadow-indigo-600/40 cursor-pointer"
                : "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed shadow-none"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังเขียนสเกลเว็บบุ๊ค...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                แปลงเป็น E-BOOK ทันที!
              </>
            )}
          </button>
        </div>

        {/* Error message card */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}
      </div>

      {/* Uploading loader Overlay (Very neat) */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-50">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <h3 className="text-lg font-black text-neutral-900">กำลังจัดพิมพ์เว็บบุ๊ค...</h3>
          <p className="text-xs text-neutral-500 font-bold">บันทึกข้อมูลเข้าฐานข้อมูลและลิ้งก์ 3D</p>
        </div>
      )}
    </div>
  );
}
