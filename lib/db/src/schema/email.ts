import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { contactsTable } from "./contacts.js";

export const emailCampaignsTable = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  previewText: text("preview_text").default(""),
  body: text("body").notNull().default(""),
  recipientType: text("recipient_type").notNull().default("all"),
  recipientFilter: text("recipient_filter").default(""),
  manualEmails: text("manual_emails").default(""),
  status: text("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  isTemplate: boolean("is_template").notNull().default(false),
  templateName: text("template_name").default(""),
  sentAt: timestamp("sent_at"),
  recipientsCount: integer("recipients_count").notNull().default(0),
  opensCount: integer("opens_count").notNull().default(0),
  clicksCount: integer("clicks_count").notNull().default(0),
  optOutsCount: integer("opt_outs_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const emailSendsTable = pgTable("email_sends", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id")
    .notNull()
    .references(() => emailCampaignsTable.id),
  contactId: integer("contact_id").references(() => contactsTable.id),
  email: text("email").notNull(),
  status: text("status").notNull().default("sent"),
  unsubscribeToken: text("unsubscribe_token"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const emailEventsTable = pgTable("email_events", {
  id: serial("id").primaryKey(),
  sendId: integer("send_id")
    .notNull()
    .references(() => emailSendsTable.id),
  campaignId: integer("campaign_id")
    .notNull()
    .references(() => emailCampaignsTable.id),
  eventType: text("event_type").notNull(),
  ipAddress: text("ip_address").default(""),
  linkUrl: text("link_url"),
  linkId: text("link_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
