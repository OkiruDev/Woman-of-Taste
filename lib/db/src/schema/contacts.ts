import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const contactsTable = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull().default(""),
  email: text("email").notNull().unique(),
  phone: text("phone").default(""),
  company: text("company").default(""),
  source: text("source").notNull().default("manual"),
  tags: text("tags").default(""),
  notes: text("notes").default(""),
  optedOut: boolean("opted_out").notNull().default(false),
  emailsReceived: integer("emails_received").notNull().default(0),
  lastEmailSentAt: timestamp("last_email_sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  actionType: text("action_type").notNull(),
  description: text("description").notNull(),
  entityType: text("entity_type").default(""),
  entityId: text("entity_id").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
