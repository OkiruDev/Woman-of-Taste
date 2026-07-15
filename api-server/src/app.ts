import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { publicRouter, adminApiRouter } from "./routes";
import { startScheduler } from "./utils/scheduler.js";
import { seedBlogPosts } from "./utils/blogSeeder.js";
import { syncNewsletterToContacts } from "./routes/newsletter.js";

export type AppRole = "public" | "admin";

export function createApp(role: AppRole): Express {
  const app: Express = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Legacy local-disk uploads (pre object-storage). New uploads go straight to the bucket.
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

  app.use("/api", role === "admin" ? adminApiRouter : publicRouter);

  const distName = role === "admin" ? "admin" : "public";
  const shellFile = role === "admin" ? "admin.html" : "index.html";
  const frontendDist = path.resolve(process.cwd(), "woman-of-taste", "dist", distName);
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => {
      res.sendFile(path.join(frontendDist, shellFile));
    });
  }

  if (role === "public") {
    // Start the follow-up scheduler
    startScheduler();

    // Seed blog posts on startup (runs once if table is empty)
    seedBlogPosts().catch(console.error);

    // Sync newsletter subscribers → contacts table on startup
    syncNewsletterToContacts().catch(console.error);
  }

  return app;
}
