import { doublePrecision, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { bookingsTable } from "./bookings.js";

export const refundRequestsTable = pgTable("refund_requests", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookingsTable.id),
  invoiceNumber: text("invoice_number").notNull(),
  firstName: text("first_name").notNull(),
  surname: text("surname").notNull(),
  email: text("email").notNull(),
  eventTitle: text("event_title").notNull(),
  eventDate: text("event_date").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").notNull().default("PENDING_DETAILS"),
  accountHolder: text("account_holder"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  branchCode: text("branch_code"),
  accountType: text("account_type"),
  submittedAt: timestamp("submitted_at"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
