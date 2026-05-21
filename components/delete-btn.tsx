"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteBookButtonProps {
  bookId: number;
  bookTitle: string;
}

export default function DeleteBookButton({ bookId, bookTitle }: DeleteBookButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirmOpen) {
      setConfirmOpen(true);
      // Auto cancel after 4 seconds if not clicked again
      setTimeout(() => setConfirmOpen(false), 4000);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/books?id=${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("ลบหนังสือไม่สำเร็จ");
      }

      router.refresh();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบหนังสือ");
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title={confirmOpen ? "คลิกอีกครั้งเพื่อยืนยันการลบ" : "ลบหนังสือ"}
      className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
        confirmOpen
          ? "bg-rose-500 text-white scale-105 shadow-md shadow-rose-500/20 active:scale-95"
          : "bg-indigo-50/50 hover:bg-rose-50 text-indigo-400 hover:text-rose-600 border border-indigo-100/30 hover:border-rose-100 hover:-translate-y-0.5"
      }`}
    >
      {isDeleting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : confirmOpen ? (
        <span className="text-[10px] font-black px-1.5 flex items-center gap-1 animate-pulse">
          ลบ?
        </span>
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
