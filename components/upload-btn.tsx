"use client";

import { useState } from "react";
import { UploadDropzone } from "./uploadthing";
import { useRouter } from "next/navigation";
import { BookOpen, FileUp, Loader2, Sparkles } from "lucide-react";

interface UploadBookProps {
  onSuccess?: () => void;
}

export default function UploadBook({ onSuccess }: UploadBookProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-neutral-900/50 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10" />

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            อัปโหลด E-Book เล่มใหม่ <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </h2>
          <p className="text-sm text-neutral-400">แปลงไฟล์ PDF เป็นเว็บบุ๊คเปิดพลิกได้ 3D</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">ชื่อหนังสือ (Book Title)</label>
          <input
            type="text"
            placeholder="เช่น คู่มือการใช้งาน, นิยายวิทยาศาสตร์..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-2xl bg-neutral-950/60 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Uploadthing Dropzone */}
        {title.trim().length > 0 ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">ไฟล์ PDF (สูงสุด 32MB)</label>
            <div className="border border-dashed border-white/10 rounded-2xl overflow-hidden bg-neutral-950/20">
              <UploadDropzone
                endpoint="pdfUploader"
                onClientUploadComplete={async (res) => {
                  if (!res || res.length === 0) return;
                  
                  setIsSubmitting(true);
                  setError("");
                  
                  const fileData = res[0];
                  
                  try {
                    const response = await fetch("/api/books", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: title,
                        pdfUrl: fileData.url,
                        pdfName: fileData.name,
                        pdfSize: `${(fileData.size / (1024 * 1024)).toFixed(2)} MB`,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error("บันทึกข้อมูลลงฐานข้อมูลไม่สำเร็จ");
                    }

                    setTitle("");
                    router.refresh();
                    if (onSuccess) onSuccess();
                  } catch (err: any) {
                    setError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                onUploadError={(err: Error) => {
                  setError(`อัปโหลดล้มเหลว: ${err.message}`);
                }}
                appearance={{
                  container: "p-8 cursor-pointer hover:bg-neutral-950/40 transition-colors",
                  button: "bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl px-6 py-2.5 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 focus:ring-2 focus:ring-indigo-500/40",
                  label: "text-indigo-400 hover:text-indigo-300 font-medium",
                  allowedContent: "text-neutral-500 text-xs mt-1",
                }}
                content={{
                  label: "ลากไฟล์ PDF มาวางตรงนี้ หรือคลิกเพื่อเลือกไฟล์",
                  allowedContent: "PDF สูงสุด 32MB",
                  button({ ready, isUploading }) {
                    if (isUploading) return <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> กำลังอัปโหลด...</span>;
                    if (ready) return <span className="flex items-center gap-2"><FileUp className="w-4 h-4" /> เลือกไฟล์ PDF</span>;
                    return "กำลังโหลด...";
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-white/5 bg-neutral-950/20 text-center text-neutral-500 text-sm">
            กรุณากรอกชื่อหนังสือด้านบนก่อน เพื่ออัปโหลดไฟล์ PDF
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Submitting loader overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-white font-medium">กำลังเตรียม E-Book และสร้างลิงก์สำหรับเปิดอ่าน...</p>
          </div>
        )}
      </div>
    </div>
  );
}
