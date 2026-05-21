import { db } from "@/db";
import { books } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import BookView from "@/components/book-view";

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
  } catch (error) {
    console.error("Error loading book page:", error);
    notFound();
  }

  return <BookView pdfUrl={bookData.pdfUrl} title={bookData.title} />;
}
