import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { blogPostsTable } from "./blog.js";
import { emailCampaignsTable } from "./email.js";

export const contentDirectionTable = pgTable("content_direction", {
  id: integer("id").primaryKey(),
  focusAreas: jsonb("focus_areas").$type<string[]>().notNull().default([]),
  tiktokThemes: text("tiktok_themes").default(""),
  trendingTopics: text("trending_topics").default(""),
  contentPillars: jsonb("content_pillars").$type<string[]>().notNull().default([]),
  targetKeywords: text("target_keywords").default(""),
  locationFocus: text("location_focus").default("Johannesburg"),
  seoAudience: text("seo_audience").default(""),
  notes: text("notes").default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contentPipelineWeeksTable = pgTable("content_pipeline_weeks", {
  id: serial("id").primaryKey(),
  weekOf: text("week_of").notNull(),
  blogPostId: integer("blog_post_id").references(() => blogPostsTable.id),
  emailCampaignId: integer("email_campaign_id").references(() => emailCampaignsTable.id),
  status: text("status").notNull().default("pending_approval"),
  blogTopic: text("blog_topic"),
  emailTopic: text("email_topic"),
  seoKeyword: text("seo_keyword"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
