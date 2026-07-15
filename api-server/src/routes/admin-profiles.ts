import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable, userProfilesTable, eventAttendeesTable } from "@workspace/db/schema";
import { createTransporter } from "../utils/mailer.js";

const adminProfilesRouter = Router();

function getJwtSecret(): string {
  return process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"] ?? "wot-admin-fallback";
}

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : (req.query?.token as string);
  if (!token) return res.status(401).json({ ok: false, error: "Unauthorized." });
  try {
    const p = jwt.verify(token, getJwtSecret()) as any;
    if (p.role !== "admin") return res.status(401).json({ ok: false, error: "Unauthorized." });
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Unauthorized." });
  }
}

// GET /api/admin/profiles — list all profiles with user email
adminProfilesRouter.get("/admin/profiles", authMiddleware, async (_req, res) => {
  try {
    const profiles = await db.select({
      id: userProfilesTable.id,
      userId: userProfilesTable.userId,
      email: usersTable.email,
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
      dietaryRequirements: userProfilesTable.dietaryRequirements,
      mobileNumber: userProfilesTable.mobileNumber,
      profileStatus: userProfilesTable.profileStatus,
      profileRole: userProfilesTable.profileRole,
      speakerTopic: userProfilesTable.speakerTopic,
      speakerOrder: userProfilesTable.speakerOrder,
      visibilityPrefs: userProfilesTable.visibilityPrefs,
      hideFromDirectory: userProfilesTable.hideFromDirectory,
      approvedAt: userProfilesTable.approvedAt,
      approvedBy: userProfilesTable.approvedBy,
      declinedReason: userProfilesTable.declinedReason,
      createdAt: userProfilesTable.createdAt,
      updatedAt: userProfilesTable.updatedAt,
    }).from(userProfilesTable)
      .innerJoin(usersTable, eq(usersTable.id, userProfilesTable.userId))
      .orderBy(desc(userProfilesTable.updatedAt));

    return res.json({ ok: true, profiles });
  } catch (err) {
    console.error("Admin profiles error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch profiles." });
  }
});

// GET /api/admin/profiles/:id — single profile (full, admin view)
adminProfilesRouter.get("/admin/profiles/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [profile] = await db.select({
      id: userProfilesTable.id,
      userId: userProfilesTable.userId,
      email: usersTable.email,
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
      dietaryRequirements: userProfilesTable.dietaryRequirements,
      mobileNumber: userProfilesTable.mobileNumber,
      profileStatus: userProfilesTable.profileStatus,
      profileRole: userProfilesTable.profileRole,
      speakerTopic: userProfilesTable.speakerTopic,
      speakerOrder: userProfilesTable.speakerOrder,
      visibilityPrefs: userProfilesTable.visibilityPrefs,
      hideFromDirectory: userProfilesTable.hideFromDirectory,
      approvedAt: userProfilesTable.approvedAt,
      approvedBy: userProfilesTable.approvedBy,
      declinedReason: userProfilesTable.declinedReason,
      createdAt: userProfilesTable.createdAt,
    }).from(userProfilesTable)
      .innerJoin(usersTable, eq(usersTable.id, userProfilesTable.userId))
      .where(eq(userProfilesTable.id, id)).limit(1);

    if (!profile) return res.status(404).json({ ok: false, error: "Profile not found." });
    return res.json({ ok: true, profile });
  } catch {
    return res.status(500).json({ ok: false, error: "Failed to fetch profile." });
  }
});

async function sendStatusEmail(email: string, profile: any, status: "approved" | "declined" | "waitlisted") {
  const transporter = createTransporter();
  if (!transporter) return;

  const name = profile.preferredName ?? profile.fullName ?? "there";

  const templates: Record<string, { subject: string; body: string }> = {
    approved: {
      subject: "You're in — High Tea at Buitengeluk 🫖",
      body: `<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8">Dear <strong>${name}</strong>,</p>
<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8">We are delighted to confirm your place at <strong>High Tea at Buitengeluk</strong> on 16 June 2026.</p>
<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8">You now have access to the attendee room — visit your event page to meet the other women joining us.</p>
<p style="font-family:Arial,sans-serif;font-size:14px;color:#7a6a54">We look forward to welcoming you.<br><strong>Patience Bwanya (PashieB)</strong><br>Woman of Taste</p>`,
    },
    declined: {
      subject: "Your High Tea application — Woman of Taste",
      body: `<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8">Dear <strong>${name}</strong>,</p>
<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8">Thank you for applying to join us at the High Tea at Buitengeluk. After careful consideration, we are unable to confirm your place for this event.</p>
<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8">We host events regularly and hope to welcome you at a future Woman of Taste gathering.</p>
<p style="font-family:Arial,sans-serif;font-size:14px;color:#7a6a54">With warmth,<br><strong>Patience Bwanya (PashieB)</strong><br>Woman of Taste</p>`,
    },
    waitlisted: {
      subject: "You're on the waitlist — High Tea at Buitengeluk",
      body: `<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8">Dear <strong>${name}</strong>,</p>
<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8">Thank you for applying. We have added you to the waitlist for the <strong>High Tea at Buitengeluk</strong> on 16 June 2026.</p>
<p style="font-family:Arial,sans-serif;font-size:15px;color:#3a2e20;line-height:1.8">If a place becomes available, you will be the first to know.</p>
<p style="font-family:Arial,sans-serif;font-size:14px;color:#7a6a54">With warmth,<br><strong>Patience Bwanya (PashieB)</strong><br>Woman of Taste</p>`,
    },
  };

  const t = templates[status];
  await transporter.sendMail({
    from: `"Woman of Taste" <${process.env["SMTP_USER"]}>`,
    to: email,
    subject: t.subject,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,20,12,.10)">
<tr><td style="background:linear-gradient(135deg,#1c2d5e,#2a3d78);padding:36px 48px;text-align:center">
<img src="https://womanoftaste.co.za/wot-logo.png" alt="Woman of Taste" width="52" style="display:block;margin:0 auto 14px;opacity:.9">
<h1 style="font-family:Georgia,serif;font-size:22px;font-weight:300;color:#f8f4ee;margin:0">High Tea at Buitengeluk</h1>
</td></tr>
<tr><td style="padding:36px 48px">${t.body}</td></tr>
</table></td></tr></table></body></html>`,
  }).catch(console.error);
}

// POST /api/admin/profiles/:id/approve
adminProfilesRouter.post("/admin/profiles/:id/approve", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [profile] = await db.select({ userId: userProfilesTable.userId, preferredName: userProfilesTable.preferredName, fullName: userProfilesTable.fullName })
      .from(userProfilesTable).where(eq(userProfilesTable.id, id)).limit(1);
    if (!profile) return res.status(404).json({ ok: false, error: "Profile not found." });

    const [user] = await db.select({ email: usersTable.email })
      .from(usersTable).where(eq(usersTable.id, profile.userId)).limit(1);

    await db.update(userProfilesTable)
      .set({ profileStatus: "approved", approvedAt: new Date(), approvedBy: "admin", updatedAt: new Date() })
      .where(eq(userProfilesTable.id, id));

    await db.update(eventAttendeesTable)
      .set({ status: "approved", approvedAt: new Date() })
      .where(eq(eventAttendeesTable.userId, profile.userId));

    if (user?.email) await sendStatusEmail(user.email, profile, "approved");

    return res.json({ ok: true });
  } catch (err) {
    console.error("Approve error:", err);
    return res.status(500).json({ ok: false, error: "Failed to approve." });
  }
});

// POST /api/admin/profiles/:id/decline
adminProfilesRouter.post("/admin/profiles/:id/decline", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { reason } = req.body as { reason?: string };
    const [profile] = await db.select({ userId: userProfilesTable.userId, preferredName: userProfilesTable.preferredName, fullName: userProfilesTable.fullName })
      .from(userProfilesTable).where(eq(userProfilesTable.id, id)).limit(1);
    if (!profile) return res.status(404).json({ ok: false, error: "Profile not found." });

    const [user] = await db.select({ email: usersTable.email })
      .from(usersTable).where(eq(usersTable.id, profile.userId)).limit(1);

    await db.update(userProfilesTable)
      .set({ profileStatus: "declined", declinedReason: reason ?? null, updatedAt: new Date() })
      .where(eq(userProfilesTable.id, id));

    await db.update(eventAttendeesTable)
      .set({ status: "declined" })
      .where(eq(eventAttendeesTable.userId, profile.userId));

    if (user?.email) await sendStatusEmail(user.email, profile, "declined");

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Failed to decline." });
  }
});

// POST /api/admin/profiles/:id/waitlist
adminProfilesRouter.post("/admin/profiles/:id/waitlist", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [profile] = await db.select({ userId: userProfilesTable.userId, preferredName: userProfilesTable.preferredName, fullName: userProfilesTable.fullName })
      .from(userProfilesTable).where(eq(userProfilesTable.id, id)).limit(1);
    if (!profile) return res.status(404).json({ ok: false, error: "Profile not found." });

    const [user] = await db.select({ email: usersTable.email })
      .from(usersTable).where(eq(usersTable.id, profile.userId)).limit(1);

    await db.update(userProfilesTable)
      .set({ profileStatus: "waitlisted", updatedAt: new Date() })
      .where(eq(userProfilesTable.id, id));

    if (user?.email) await sendStatusEmail(user.email, profile, "waitlisted");

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Failed to waitlist." });
  }
});

// PATCH /api/admin/profiles/:id/role — elevate to speaker/host
adminProfilesRouter.patch("/admin/profiles/:id/role", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { profileRole, speakerTopic, speakerOrder } = req.body as any;
    await db.update(userProfilesTable)
      .set({ profileRole, speakerTopic: speakerTopic ?? null, speakerOrder: speakerOrder ?? null, updatedAt: new Date() })
      .where(eq(userProfilesTable.id, id));
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Failed to update role." });
  }
});

export default adminProfilesRouter;
