import jwt from "jsonwebtoken";

// Throws instead of falling back to a hardcoded secret — the fallback used to be a fixed
// string ("wot-admin-fallback") committed to the repo, so anyone reading the source could
// forge admin tokens if the env var was ever unset. Callers below fail closed (401/503)
// on this rather than letting it crash the process, since a misconfigured secret shouldn't
// take down the public site along with the admin API.
export function getJwtSecret(): string {
  const secret = process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"];
  if (!secret) {
    throw new Error("JWT_SECRET (or SESSION_SECRET) is not configured.");
  }
  return secret;
}

function extractToken(req: any, allowQueryToken: boolean): string | undefined {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (headerToken) return headerToken;
  return allowQueryToken ? (req.query?.token as string | undefined) : undefined;
}

function verifyAdmin(req: any, res: any, next: any, allowQueryToken: boolean) {
  const token = extractToken(req, allowQueryToken);
  if (!token) return res.status(401).json({ ok: false, error: "Unauthorized." });

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { role?: string };
    if (payload.role !== "admin") return res.status(401).json({ ok: false, error: "Unauthorized." });
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: "Unauthorized." });
  }
}

// Use for all normal admin API calls (fetch/XHR) — token must come via the Authorization header.
export function requireAdminAuth(req: any, res: any, next: any) {
  return verifyAdmin(req, res, next, false);
}

// Use ONLY for endpoints opened via direct navigation (window.open / <a href>), where the
// frontend can't attach an Authorization header — e.g. invoice PDF and CSV export downloads.
export function requireAdminAuthAllowQueryToken(req: any, res: any, next: any) {
  return verifyAdmin(req, res, next, true);
}
