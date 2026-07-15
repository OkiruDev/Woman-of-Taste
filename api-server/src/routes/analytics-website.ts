import { Router } from "express";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import jwt from "jsonwebtoken";

const websiteAnalyticsRouter = Router();

function getJwtSecret() {
  return process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"] ?? "wot-admin-fallback";
}

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.query?.token;
  if (!token) return res.status(401).json({ ok: false, error: "Unauthorized." });
  try { jwt.verify(token, getJwtSecret()); next(); } catch { return res.status(401).json({ ok: false, error: "Unauthorized." }); }
}

function getGA4Client() {
  const credRaw = process.env["GA4_CREDENTIALS"];
  const propertyId = process.env["GA4_PROPERTY_ID"];
  if (!credRaw || !propertyId) return null;
  try {
    const credentials = JSON.parse(credRaw);
    const client = new BetaAnalyticsDataClient({ credentials });
    return { client, propertyId };
  } catch {
    return null;
  }
}

// GET /api/admin/analytics/website — GA4 website stats
websiteAnalyticsRouter.get("/admin/analytics/website", authMiddleware, async (_req, res) => {
  const ga = getGA4Client();
  if (!ga) {
    return res.json({ ok: false, configured: false });
  }

  try {
    const { client, propertyId } = ga;

    const [summary, topPages, sources, daily] = await Promise.all([
      // Summary metrics — last 30 days
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
          { name: "newUsers" },
        ],
      }),

      // Top pages — last 30 days
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 8,
      }),

      // Traffic sources — last 30 days
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 8,
      }),

      // Daily sessions — last 14 days
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "13daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
    ]);

    const sumRow = summary[0]?.rows?.[0];
    const metrics = {
      sessions: Number(sumRow?.metricValues?.[0]?.value ?? 0),
      users: Number(sumRow?.metricValues?.[1]?.value ?? 0),
      pageViews: Number(sumRow?.metricValues?.[2]?.value ?? 0),
      bounceRate: Math.round(Number(sumRow?.metricValues?.[3]?.value ?? 0) * 100),
      avgSessionDuration: Math.round(Number(sumRow?.metricValues?.[4]?.value ?? 0)),
      newUsers: Number(sumRow?.metricValues?.[5]?.value ?? 0),
    };

    const pages = (topPages[0]?.rows ?? []).map(r => ({
      path: r.dimensionValues?.[0]?.value ?? "/",
      views: Number(r.metricValues?.[0]?.value ?? 0),
      users: Number(r.metricValues?.[1]?.value ?? 0),
    }));

    const trafficSources = (sources[0]?.rows ?? []).map(r => ({
      channel: r.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
    }));

    const dailyTrend = (daily[0]?.rows ?? []).map(r => {
      const d = r.dimensionValues?.[0]?.value ?? "";
      const label = d.length === 8
        ? `${d.slice(6, 8)}/${d.slice(4, 6)}`
        : d;
      return {
        date: label,
        sessions: Number(r.metricValues?.[0]?.value ?? 0),
        users: Number(r.metricValues?.[1]?.value ?? 0),
      };
    });

    return res.json({ ok: true, configured: true, metrics, pages, trafficSources, dailyTrend });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "GA4 API error";
    console.error("[analytics-website] GA4 error:", msg);
    return res.status(500).json({ ok: false, configured: true, error: msg });
  }
});

export default websiteAnalyticsRouter;
