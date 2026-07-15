import { doublePrecision, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull(),
  eventTitle: text("event_title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  date: text("date").notNull(),
  receiptPath: text("receipt_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
