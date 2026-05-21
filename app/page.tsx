import { db } from "@/db";
import { books } from "@/db/schema";
import { desc } from "drizzle-orm";
import UploadBook from "@/components/upload-btn";
import Link from "next/link";
import { Book, Calendar, ExternalLink, HardDrive, Sparkles } from "lucide-react";

export const revalidate = 0; // Ensure fresh SSR data fetching on every page request

export default async function Home() {
  let allBooks: any[] = [];
  try {
    allBooks = await db.select().from(books).orderBy(desc(books.createdAt));
  } catch (error) {
    console.error("Error fetching books server-side:", error);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" /> E-Book Flipbook Converter
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            ACT Media E-Book
          </h1>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-base">
            เปลี่ยนไฟล์เอกสาร PDF ทั่วไป ให้กลายเป็นเว็บบุ๊คเปิดพลิกหน้า 3D อัจฉริยะ โหลดเร็ว สวยงาม และแชร์ต่อได้ทันที
          </p>
        </div>

        {/* Dynamic Grid: Upload Form & Books List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload Form */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
            <UploadBook />
          </div>

          {/* Right Column: Books List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Book className="w-5 h-5 text-indigo-400" />
                คลัง E-Book ทั้งหมด ({allBooks.length})
              </h2>
            </div>

            {allBooks.length === 0 ? (
              <div className="p-16 rounded-3xl border border-white/5 bg-neutral-900/20 backdrop-blur-sm text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-800/40 rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <Book className="w-8 h-8 text-neutral-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-neutral-300">ยังไม่มีหนังสือในคลัง</h3>
                  <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                    กรอกชื่อหนังสือและอัปโหลดไฟล์ PDF จากกล่องเครื่องมือซ้ายมือเพื่อเริ่มใช้งาน
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allBooks.map((book) => (
                  <div
                    key={book.id}
                    className="group relative rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/30 p-6 backdrop-blur-md transition-all duration-350 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Glowing highlight corner */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors" />

                    <div className="flex flex-col h-full justify-between gap-6">
                      <div className="space-y-3">
                        <span className="inline-block p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Book className="w-5 h-5" />
                        </span>
                        
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {book.title}
                          </h3>
                          <p className="text-xs text-neutral-400 truncate">
                            ไฟล์: {book.pdfName}
                          </p>
                        </div>
                      </div>

                      {/* Footer statistics */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(book.createdAt).toLocaleDateString("th-TH")}</span>
                        </div>
                        {book.pdfSize && (
                          <div className="flex items-center gap-1">
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>{book.pdfSize}</span>
                          </div>
                        )}
                      </div>

                      {/* Launch Book Button */}
                      <Link
                        href={`/books/${book.id}`}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 text-white font-medium text-sm transition-all active:scale-95 group-hover:shadow-lg"
                      >
                        เปิดอ่าน E-Book <ExternalLink className="w-4 h-4" />
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
