import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  pdfName: text("pdf_name").notNull(),
  pdfSize: text("pdf_size"),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
