import { db } from "@/db";
import { books } from "@/db/schema";
import { desc } from "drizzle-orm";
import UploadBook from "@/components/upload-btn";
import Link from "next/link";
import { Book, Calendar, ExternalLink, HardDrive, Sparkles } from "lucide-react";

export const revalidate = 0; // Disable static cache to ensure newly uploaded books display instantly

export default async function Home() {
  let allBooks: any[] = [];
  try {
    allBooks = await db.select().from(books).orderBy(desc(books.createdAt));
  } catch (error) {
    console.error("Error fetching books server-side:", error);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/50 text-neutral-800 py-8 px-4 md:px-8 relative overflow-hidden">
      {/* Decorative bright gradient spots */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Brand Header (Compact) */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-indigo-100 shadow-sm shadow-indigo-100/20 text-xs font-bold text-indigo-600">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" /> E-Book Flipbook Converter
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-800 bg-clip-text text-transparent">
            ACT Media E-Book
          </h1>
          
          <p className="text-neutral-500 max-w-lg mx-auto text-xs md:text-sm font-medium leading-relaxed">
            เปลี่ยนไฟล์เอกสาร PDF ทั่วไป ให้กลายเป็นเว็บบุ๊คเปิดพลิกหน้า 3D อัจฉริยะ โหลดเร็ว สวยงาม และแชร์ต่อได้ทันที
          </p>
        </div>

        {/* Dynamic Grid: Upload Form & Books List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Upload Form (Sleek light design) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-4">
            <UploadBook />
          </div>

          {/* Right Column: Books List (Clean list layouts) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
              <h2 className="text-lg md:text-xl font-black text-neutral-900 flex items-center gap-2">
                <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                  <Book className="w-5 h-5" />
                </span>
                คลัง E-Book ทั้งหมด ({allBooks.length})
              </h2>
            </div>

            {allBooks.length === 0 ? (
              <div className="p-10 rounded-[24px] border-2 border-dashed border-neutral-200 bg-white text-center space-y-4 shadow-sm shadow-neutral-100">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto border border-neutral-100">
                  <Book className="w-8 h-8 text-neutral-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-neutral-700">คลังหนังสือยังว่างอยู่</h3>
                  <p className="text-xs md:text-sm text-neutral-400 max-w-sm mx-auto font-medium">
                    กรอกชื่อหนังสือและอัปโหลดไฟล์ PDF ในข้อ 1 และ 2 ซ้ายมือ เพื่อเริ่มสร้างหนังสือเล่มแรกของคุณได้เลย!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allBooks.map((book) => (
                  <div
                    key={book.id}
                    className="group relative rounded-[24px] bg-white border border-neutral-200/80 hover:border-indigo-300 p-5 md:p-6 transition-all duration-300 shadow-[0_5px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.06)] hover:-translate-y-1 overflow-hidden flex flex-col justify-between h-[210px]"
                  >
                    {/* Corner gradient decor */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50/40 rounded-full blur-xl group-hover:bg-indigo-50/80 transition-colors" />

                    <div className="space-y-3">
                      {/* Icon & Title */}
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                          <Book className="w-4 h-4" />
                        </span>
                        
                        <h3 className="text-xl font-black text-neutral-900 group-hover:text-indigo-700 transition-colors line-clamp-1 flex-1 tracking-tight">
                          {book.title}
                        </h3>
                      </div>

                      {/* File information */}
                      <p className="text-sm font-semibold text-neutral-400 truncate">
                        ไฟล์: <span className="text-neutral-600 font-bold">{book.pdfName}</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Footer statistics */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px] font-bold text-neutral-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{new Date(book.createdAt).toLocaleDateString("th-TH")}</span>
                        </div>
                        {book.pdfSize && (
                          <div className="flex items-center gap-1">
                            <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{book.pdfSize}</span>
                          </div>
                        )}
                      </div>

                      {/* Launch Book Button (COMPACT UX) */}
                      <Link
                        href={`/books/${book.id}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-indigo-600 text-white font-extrabold text-xs transition-all active:scale-95 shadow-sm hover:shadow-indigo-600/25"
                      >
                        เปิดอ่าน E-Book <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
