import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const blogCategoriesTable = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const blogPostsTable = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull().default("General"),
  author: text("author").default("Woman of Taste Editorial"),
  excerpt: text("excerpt").default(""),
  content: text("content").default(""),
  coverImageUrl: text("cover_image_url").default(""),
  readTime: text("read_time").default("5 min read"),
  metaTitle: text("meta_title").default(""),
  metaDescription: text("meta_description").default(""),
  focusKeyword: text("focus_keyword").default(""),
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
