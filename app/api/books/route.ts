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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing book ID" }, { status: 400 });
    }

    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, id))
      .returning();

    if (!deletedBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Book deleted successfully", book: deletedBook }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting book:", error);
    return NextResponse.json({ error: error.message || "Failed to delete book" }, { status: 500 });
  }
}


