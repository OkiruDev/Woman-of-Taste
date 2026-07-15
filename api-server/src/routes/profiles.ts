import { Router } from "express";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";
import { db } from "@workspace/db";
import { userProfilesTable, eventAttendeesTable } from "@workspace/db/schema";
import { userAuthMiddleware } from "./user-auth.js";
import { createTransporter } from "../utils/mailer.js";

const profilesRouter = Router();

const RATE_LIMIT = new Map<number, number>();

function stripAdminFields(profile: any) {
  const { dietaryRequirements, mobileNumber, declinedReason, approvedBy, ...pub } = profile;
  return pub;
}

// GET /api/profile — my profile
profilesRouter.get("/profile", userAuthMiddleware, async (req: any, res) => {
  try {
    const [profile] = await db.select().from(userProfilesTable)
      .where(eq(userProfilesTable.userId, req.user.userId)).limit(1);
    if (!profile) return res.status(404).json({ ok: false, error: "Profile not found." });
    return res.json({ ok: true, profile });
  } catch {
    return res.status(500).json({ ok: false, error: "Failed to fetch profile." });
  }
});

// PATCH /api/profile — update profile fields
profilesRouter.patch("/profile", userAuthMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const [existing] = await db.select().from(userProfilesTable)
      .where(eq(userProfilesTable.userId, userId)).limit(1);
    if (!existing) return res.status(404).json({ ok: false, error: "Profile not found." });

    if (existing.profileStatus === "submitted") {
      return res.status(409).json({ ok: false, error: "Profile is under review and cannot be edited." });
    }

    const allowed = [
      "fullName", "preferredName", "shortBio", "city",
      "professionOrTitle", "companyOrVenture", "linkedinUrl", "instagramHandle",
      "qualifications", "careerHighlights",
      "passions", "currentProjects", "specialSkills",
      "whatYouDo", "whatYouWantNext",
      "whatBringsYou", "dietaryRequirements", "mobileNumber",
      "visibilityPrefs", "hideFromDirectory", "speakerTopic",
    ] as const;

    const updates: Record<string, any> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }

    const [updated] = await db.update(userProfilesTable)
      .set(updates)
      .where(eq(userProfilesTable.userId, userId))
      .returning();

    return res.json({ ok: true, profile: updated });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ ok: false, error: "Failed to update profile." });
  }
});

// POST /api/profile/photo — upload profile photo (base64)
profilesRouter.post("/profile/photo", userAuthMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const { dataUrl } = req.body as { dataUrl?: string };
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      return res.status(400).json({ ok: false, error: "Valid image data URL required." });
    }

    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ ok: false, error: "Invalid image format." });

    const ext = match[1].includes("png") ? "png" : match[1].includes("webp") ? "webp" : "jpg";
    const filename = `profile_${userId}_${randomBytes(8).toString("hex")}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "profiles");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 3 * 1024 * 1024) return res.status(400).json({ ok: false, error: "Image too large (max 3MB)." });

    fs.writeFileSync(path.join(dir, filename), buffer);
    const url = `/uploads/profiles/${filename}`;

    await db.update(userProfilesTable)
      .set({ profilePhotoUrl: url, updatedAt: new Date() })
      .where(eq(userProfilesTable.userId, userId));

    return res.json({ ok: true, url });
  } catch {
    return res.status(500).json({ ok: false, error: "Photo upload failed." });
  }
});

// POST /api/profile/submit — submit profile for review
profilesRouter.post("/profile/submit", userAuthMiddleware, async (req: any, res) => {
  try {
    const { userId, email } = req.user;

    const now = Date.now();
    const lastSubmit = RATE_LIMIT.get(userId) ?? 0;
    if (now - lastSubmit < 5 * 60 * 1000) {
      return res.status(429).json({ ok: false, error: "Please wait 5 minutes before resubmitting." });
    }

    const [profile] = await db.select().from(userProfilesTable)
      .where(eq(userProfilesTable.userId, userId)).limit(1);
    if (!profile) return res.status(404).json({ ok: false, error: "Profile not found." });

    if (profile.profileStatus === "submitted") {
      return res.status(409).json({ ok: false, error: "Profile is already under review." });
    }

    const required = ["fullName", "preferredName", "shortBio", "city", "professionOrTitle"] as const;
    for (const field of required) {
      if (!profile[field]) return res.status(400).json({ ok: false, error: `Please complete: ${field}` });
    }

    RATE_LIMIT.set(userId, now);

    const [updated] = await db.update(userProfilesTable)
      .set({ profileStatus: "submitted", updatedAt: new Date() })
      .where(eq(userProfilesTable.userId, userId))
      .returning();

    await db.insert(eventAttendeesTable).values({
      userId,
      eventId: "high-tea-buitengeluk-jun-2026",
      status: "pending",
    }).onConflictDoNothing();

    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"Woman of Taste" <${process.env["SMTP_USER"]}>`,
        to: email,
        subject: "Your profile has been received — Woman of Taste High Tea",
        html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,20,12,.10)">
<tr><td style="background:linear-gradient(135deg,#1c2d5e,#2a3d78);padding:40px 48px;text-align:center">
<img src="https://womanoftaste.co.za/wot-logo.png" alt="Woman of Taste" width="56" style="display:block;margin:0 auto 16px;opacity:.9">
<h1 style="font-family:Georgia,serif;font-size:24px;font-weight:300;color:#f8f4ee;margin:0">Application Received</h1>
</td></tr>
<tr><td style="padding:40px 48px">
<p style="font-family:Georgia,serif;font-size:18px;font-style:italic;color:#1c2d5e;margin:0 0 20px">Dear ${profile.preferredName ?? profile.fullName},</p>
<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8;margin:0 0 16px">Thank you for submitting your profile for the <strong>High Tea at Buitengeluk</strong> on 16 June 2026.</p>
<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8;margin:0 0 24px">The Woman of Taste team will review your application and confirm within 48 hours. We look forward to welcoming you.</p>
<p style="font-family:Arial,sans-serif;font-size:14px;color:#7a6a54;margin:0">With warmth,<br><strong>Patience Bwanya (PashieB)</strong><br>Woman of Taste</p>
</td></tr>
</table></td></tr></table></body></html>`,
      }).catch(console.error);
    }

    return res.json({ ok: true, profile: updated });
  } catch (err) {
    console.error("Submit error:", err);
    return res.status(500).json({ ok: false, error: "Submission failed." });
  }
});

// GET /api/events/:eventId/attendees — gated attendee directory
profilesRouter.get("/events/:eventId/attendees", userAuthMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const { eventId } = req.params;

    const [myAttendance] = await db.select().from(eventAttendeesTable)
      .where(eq(eventAttendeesTable.userId, userId)).limit(1);

    const [myProfile] = await db.select().from(userProfilesTable)
      .where(eq(userProfilesTable.userId, userId)).limit(1);

    if (!myAttendance || myProfile?.profileStatus !== "approved") {
      return res.status(403).json({ ok: false, error: "Directory access is for approved attendees only." });
    }

    const attendees = await db.select({
      id: userProfilesTable.id,
      userId: userProfilesTable.userId,
      fullName: userProfilesTable.fullName,
      preferredName: userProfilesTable.preferredName,
      profilePhotoUrl: userProfilesTable.profilePhotoUrl,
      shortBio: userProfilesTable.shortBio,
      city: userProfilesTable.city,
      professionOrTitle: userProfilesTable.professionOrTitle,
      companyOrVenture: userProfilesTable.companyOrVenture,
      linkedinUrl: userProfilesTable.linkedinUrl,
      instagramHandle: userProfilesTable.instagramHandle,
      whatBringsYou: userProfilesTable.whatBringsYou,
      profileRole: userProfilesTable.profileRole,
      profileStatus: userProfilesTable.profileStatus,
      speakerTopic: userProfilesTable.speakerTopic,
      speakerOrder: userProfilesTable.speakerOrder,
      visibilityPrefs: userProfilesTable.visibilityPrefs,
      hideFromDirectory: userProfilesTable.hideFromDirectory,
    }).from(userProfilesTable)
      .innerJoin(eventAttendeesTable, eq(eventAttendeesTable.userId, userProfilesTable.userId))
      .where(eq(eventAttendeesTable.eventId, eventId));

    const visible = attendees.filter(a =>
      a.profileStatus === "approved" && !a.hideFromDirectory
    ).map(a => {
      const prefs: any = a.visibilityPrefs ?? {};
      return {
        ...a,
        companyOrVenture: prefs.showCompany !== false ? a.companyOrVenture : null,
        linkedinUrl: prefs.showLinkedin !== false ? a.linkedinUrl : null,
        instagramHandle: prefs.showInstagram !== false ? a.instagramHandle : null,
        whatBringsYou: prefs.showWhatBringsYou === true ? a.whatBringsYou : null,
      };
    });

    visible.sort((a, b) => {
      const roleOrder: Record<string, number> = { host: 0, speaker: 1, attendee: 2 };
      const ro = (roleOrder[a.profileRole ?? "attendee"] ?? 2) - (roleOrder[b.profileRole ?? "attendee"] ?? 2);
      if (ro !== 0) return ro;
      if (a.profileRole === "speaker" && b.profileRole === "speaker") {
        return (a.speakerOrder ?? 99) - (b.speakerOrder ?? 99);
      }
      return (a.preferredName ?? "").localeCompare(b.preferredName ?? "");
    });

    return res.json({ ok: true, attendees: visible });
  } catch (err) {
    console.error("Directory error:", err);
    return res.status(500).json({ ok: false, error: "Failed to load directory." });
  }
});

export default profilesRouter;
