import { NextResponse } from "next/server";
import { db } from "@/db";
import { books } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allBooks = await db.select().from(books).orderBy(desc(books.createdAt));
    return NextResponse.json(allBooks);
  } catch (error: any) {
    console.error("Error fetching books:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, pdfUrl, pdfName, pdfSize } = body;

    if (!pdfUrl || !pdfName) {
      return NextResponse.json({ error: "Missing required fields (pdfUrl, pdfName)" }, { status: 400 });
    }

    let finalTitle = title?.trim();
    if (!finalTitle) {
      const allBooks = await db.select({ id: books.id }).from(books);
      finalTitle = `test${allBooks.length + 1}`;
    }

    const [newBook] = await db
      .insert(books)
      .values({
        title: finalTitle,
        pdfUrl,
        pdfName,
        pdfSize,
      })
      .returning();


    return NextResponse.json(newBook, { status: 201 });
  } catch (error: any) {
    console.error("Error creating book:", error);
    return NextResponse.json({ error: error.message || "Failed to create book" }, { status: 500 });
  }
}



