import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export interface PlaceMustTryItem {
  name: string;
  note: string;
}

export const placesTable = pgTable("places", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline").default(""),
  category: text("category").notNull().default("Restaurant"),
  cuisine: text("cuisine").default(""),
  neighborhood: text("neighborhood").default(""),
  city: text("city").notNull().default("Johannesburg"),
  address: text("address").default(""),
  priceRange: text("price_range").notNull().default("RR"),
  tiktokViews: integer("tiktok_views").notNull().default(0),
  tiktokUrl: text("tiktok_url").default("https://www.tiktok.com/@pashieb_the_wot"),
  coverImage: text("cover_image").default(""),
  excerpt: text("excerpt").default(""),
  description: text("description").default(""),
  highlights: text("highlights").array().notNull().default([]),
  mustTry: jsonb("must_try").$type<PlaceMustTryItem[]>().notNull().default([]),
  vibe: text("vibe").default(""),
  perfectFor: text("perfect_for").array().notNull().default([]),
  tags: text("tags").array().notNull().default([]),
  seoKeywords: text("seo_keywords").array().notNull().default([]),
  openingHours: text("opening_hours").default(""),
  reservations: boolean("reservations").notNull().default(false),
  website: text("website").default(""),
  instagramHandle: text("instagram_handle").default(""),
  status: text("status").notNull().default("published"),
  featured: boolean("featured").notNull().default(false),
  datePosted: text("date_posted"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
