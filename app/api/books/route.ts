import { NextResponse } from "next/server";
import { db } from "@/db";
import { books } from "@/db/schema";
import { desc } from "drizzle-orm";

const MAX_TITLE_LENGTH = 200;
const MAX_FILENAME_LENGTH = 500;
const ALLOWED_URL_PREFIXES = ["https://utfs.io/", "https://uploadthing.com/"];

function isValidPdfUrl(url: string): boolean {
  return ALLOWED_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export async function GET() {
  try {
    const allBooks = await db.select().from(books).orderBy(desc(books.createdAt));
    return NextResponse.json(allBooks);
  } catch (error: any) {
    console.error("Error fetching books:", error);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, pdfUrl, pdfName, pdfSize } = body;

    // Validate required fields
    if (!pdfUrl || typeof pdfUrl !== "string") {
      return NextResponse.json({ error: "Missing or invalid pdfUrl" }, { status: 400 });
    }
    if (!pdfName || typeof pdfName !== "string") {
      return NextResponse.json({ error: "Missing or invalid pdfName" }, { status: 400 });
    }

    // Validate URL is from uploadthing only (prevent arbitrary URL injection)
    if (!isValidPdfUrl(pdfUrl)) {
      return NextResponse.json({ error: "Invalid pdfUrl origin" }, { status: 400 });
    }

    // Enforce length limits
    if (pdfUrl.length > 1000) {
      return NextResponse.json({ error: "pdfUrl too long" }, { status: 400 });
    }
    if (pdfName.length > MAX_FILENAME_LENGTH) {
      return NextResponse.json({ error: "pdfName too long" }, { status: 400 });
    }
    if (title && typeof title === "string" && title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: "title too long" }, { status: 400 });
    }

    // pdfSize is stored as text in schema — validate it's a reasonable numeric string if provided
    const safePdfSize =
      pdfSize && typeof pdfSize === "string" && /^\d+$/.test(pdfSize) ? pdfSize : null;

    let finalTitle = typeof title === "string" ? title.trim() : "";
    if (!finalTitle) {
      const allBooks = await db.select({ id: books.id }).from(books);
      finalTitle = `ebook${allBooks.length + 1}`;
    }

    const [newBook] = await db
      .insert(books)
      .values({
        title: finalTitle,
        pdfUrl,
        pdfName,
        pdfSize: safePdfSize,
      })
      .returning();

    return NextResponse.json(newBook, { status: 201 });
  } catch (error: any) {
    console.error("Error creating book:", error);
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}



