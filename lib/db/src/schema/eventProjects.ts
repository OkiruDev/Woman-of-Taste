import { boolean, doublePrecision, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const eventProjectsTable = pgTable("event_projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date"),
  venue: text("venue"),
  venueContact: text("venue_contact"),
  capacity: integer("capacity"),
  status: text("status").notNull().default("planning"),
  totalBudget: doublePrecision("total_budget"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const eventMilestonesTable = pgTable("event_milestones", {
  id: serial("id").primaryKey(),
  eventProjectId: integer("event_project_id")
    .notNull()
    .references(() => eventProjectsTable.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("pending"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const eventBudgetItemsTable = pgTable("event_budget_items", {
  id: serial("id").primaryKey(),
  eventProjectId: integer("event_project_id")
    .notNull()
    .references(() => eventProjectsTable.id),
  category: text("category").notNull(),
  description: text("description").notNull(),
  estimatedAmount: doublePrecision("estimated_amount").notNull().default(0),
  actualAmount: doublePrecision("actual_amount"),
  paid: boolean("paid").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
