import { Router } from "express";
import { eq, or } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, userProfilesTable } from "@workspace/db/schema";
import { getJwtSecret } from "../middlewares/adminAuth.js";

const userAuthRouter = Router();

export function getUserFromToken(token?: string): { userId: number; email: string | null } | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getJwtSecret()) as any;
    if (payload.role !== "user") return null;
    return { userId: payload.userId, email: payload.email ?? null };
  } catch {
    return null;
  }
}

export function userAuthMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const user = getUserFromToken(token);
  if (!user) return res.status(401).json({ ok: false, error: "Not authenticated." });
  req.user = user;
  next();
}

function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s\-().]/g, "");
  if (p.startsWith("0") && p.length === 10) p = "+27" + p.slice(1);
  if (!p.startsWith("+")) p = "+" + p;
  return p;
}

function isEmail(v: string): boolean {
  return v.includes("@");
}

// POST /api/auth/register
userAuthRouter.post("/auth/register", async (req, res) => {
  try {
    const { email, phone, password } = req.body as { email?: string; phone?: string; password?: string };

    if (!password || password.length < 8) {
      return res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });
    }

    const hasEmail = email && email.trim().length > 0;
    const hasPhone = phone && phone.trim().length > 0;

    if (!hasEmail && !hasPhone) {
      return res.status(400).json({ ok: false, error: "Email or mobile number required." });
    }

    const normalizedEmail = hasEmail ? email!.toLowerCase().trim() : null;
    const normalizedPhone = hasPhone ? normalizePhone(phone!.trim()) : null;

    const existing = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(
        normalizedEmail && normalizedPhone
          ? or(eq(usersTable.email, normalizedEmail), eq(usersTable.phone, normalizedPhone))
          : normalizedEmail
          ? eq(usersTable.email, normalizedEmail)
          : eq(usersTable.phone, normalizedPhone!)
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ ok: false, error: "An account with this email or number already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      authProvider: normalizedEmail ? "email" : "phone",
    }).returning();

    await db.insert(userProfilesTable).values({ userId: user.id });

    const token = jwt.sign(
      { role: "user", userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: "30d" }
    );
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ ok: false, error: "Registration failed." });
  }
});

// POST /api/auth/login
userAuthRouter.post("/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body as { identifier?: string; password?: string };

    if (!identifier || !password) {
      return res.status(400).json({ ok: false, error: "Email/phone and password required." });
    }

    let user;
    if (isEmail(identifier)) {
      const [found] = await db.select().from(usersTable)
        .where(eq(usersTable.email, identifier.toLowerCase().trim())).limit(1);
      user = found;
    } else {
      const normalized = normalizePhone(identifier.trim());
      const [found] = await db.select().from(usersTable)
        .where(eq(usersTable.phone, normalized)).limit(1);
      user = found;
    }

    if (!user || !user.passwordHash) {
      return res.status(401).json({ ok: false, error: "Invalid email/phone or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ ok: false, error: "Invalid email/phone or password." });

    const token = jwt.sign(
      { role: "user", userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: "30d" }
    );
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ ok: false, error: "Login failed." });
  }
});

// POST /api/auth/google — verify Google ID token, create or login user
userAuthRouter.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body as { credential?: string };
    if (!credential) return res.status(400).json({ ok: false, error: "Google credential required." });

    const clientId = process.env["GOOGLE_CLIENT_ID"];
    if (!clientId) return res.status(503).json({ ok: false, error: "Google sign-in not configured." });

    // Verify via Google tokeninfo endpoint
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!verifyRes.ok) return res.status(401).json({ ok: false, error: "Invalid Google credential." });

    const payload = await verifyRes.json() as any;

    if (payload.aud !== clientId) {
      return res.status(401).json({ ok: false, error: "Google credential audience mismatch." });
    }

    const googleId: string = payload.sub;
    const email: string | null = payload.email ?? null;
    const displayName: string | null = payload.name ?? null;
    const avatarUrl: string | null = payload.picture ?? null;

    // Find existing by googleId or email
    let user;
    const [byGoogleId] = await db.select().from(usersTable)
      .where(eq(usersTable.googleId, googleId)).limit(1);
    user = byGoogleId;

    if (!user && email) {
      const [byEmail] = await db.select().from(usersTable)
        .where(eq(usersTable.email, email.toLowerCase())).limit(1);
      if (byEmail) {
        // Link Google to existing account
        await db.update(usersTable).set({ googleId, displayName, avatarUrl, updatedAt: new Date() })
          .where(eq(usersTable.id, byEmail.id));
        user = { ...byEmail, googleId, displayName, avatarUrl };
      }
    }

    if (!user) {
      const [created] = await db.insert(usersTable).values({
        email: email ? email.toLowerCase() : null,
        googleId,
        authProvider: "google",
        displayName,
        avatarUrl,
      }).returning();
      user = created;
      await db.insert(userProfilesTable).values({
        userId: user.id,
        fullName: displayName,
        preferredName: displayName?.split(" ")[0] ?? null,
        profilePhotoUrl: avatarUrl,
      });
    }

    const token = jwt.sign(
      { role: "user", userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: "30d" }
    );
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, phone: user.phone, displayName: user.displayName } });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ ok: false, error: "Google sign-in failed." });
  }
});

// GET /api/auth/me
userAuthRouter.get("/auth/me", userAuthMiddleware, async (req: any, res) => {
  try {
    const { userId } = req.user;
    const [user] = await db.select({
      id: usersTable.id,
      email: usersTable.email,
      phone: usersTable.phone,
      displayName: usersTable.displayName,
      avatarUrl: usersTable.avatarUrl,
      authProvider: usersTable.authProvider,
    }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (!user) return res.status(404).json({ ok: false, error: "User not found." });

    const [profile] = await db.select().from(userProfilesTable)
      .where(eq(userProfilesTable.userId, userId)).limit(1);

    return res.json({ ok: true, user, profile: profile ?? null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to fetch user." });
  }
});

export default userAuthRouter;
