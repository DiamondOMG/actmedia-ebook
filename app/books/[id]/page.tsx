import { db } from "@/db";
import { books } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import BookViewLoader from "@/components/book-view-loader";

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;

  let bookData;
  try {
    const results = await db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    if (results.length === 0) {
      notFound();
    }
    bookData = results[0];
    
    // Increment view count asynchronously
    await db
      .update(books)
      .set({ views: sql`${books.views} + 1` })
      .where(eq(books.id, id));
  } catch (error) {
    console.error("Error loading book page:", error);
    notFound();
  }

  return <BookViewLoader pdfUrl={bookData.pdfUrl} title={bookData.title} />;
}
