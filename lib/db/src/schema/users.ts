import { boolean, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  passwordHash: text("password_hash"),
  authProvider: text("auth_provider").notNull(),
  googleId: text("google_id").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export interface VisibilityPrefs {
  showCompany?: boolean;
  showLinkedin?: boolean;
  showInstagram?: boolean;
  showWhatBringsYou?: boolean;
}

export const userProfilesTable = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id)
    .unique(),
  fullName: text("full_name"),
  preferredName: text("preferred_name"),
  profilePhotoUrl: text("profile_photo_url"),
  shortBio: text("short_bio"),
  city: text("city"),
  professionOrTitle: text("profession_or_title"),
  companyOrVenture: text("company_or_venture"),
  linkedinUrl: text("linkedin_url"),
  instagramHandle: text("instagram_handle"),
  whatBringsYou: text("what_brings_you"),
  dietaryRequirements: text("dietary_requirements"),
  mobileNumber: text("mobile_number"),
  profileStatus: text("profile_status").notNull().default("draft"),
  profileRole: text("profile_role").notNull().default("attendee"),
  speakerTopic: text("speaker_topic"),
  speakerOrder: integer("speaker_order"),
  visibilityPrefs: jsonb("visibility_prefs").$type<VisibilityPrefs>().notNull().default({}),
  hideFromDirectory: boolean("hide_from_directory").notNull().default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
  declinedReason: text("declined_reason"),
  qualifications: text("qualifications"),
  careerHighlights: text("career_highlights"),
  passions: text("passions"),
  currentProjects: text("current_projects"),
  specialSkills: text("special_skills"),
  whatYouDo: text("what_you_do"),
  whatYouWantNext: text("what_you_want_next"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const eventAttendeesTable = pgTable(
  "event_attendees",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id),
    eventId: text("event_id").notNull(),
    status: text("status").notNull().default("pending"),
    approvedAt: timestamp("approved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("event_attendees_user_event_unique").on(table.userId, table.eventId)],
);
