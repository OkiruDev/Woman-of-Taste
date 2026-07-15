import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import newsletterRouter from "./newsletter";
import chatRouter from "./chat";
import ticketsRouter from "./tickets";
import bookingsRouter from "./bookings";
import adminRouter from "./admin";
import contactsRouter from "./contacts";
import { blogPublicRouter, blogAdminRouter } from "./blog-admin";
import emailRouter from "./email-campaigns";
import statsRouter from "./admin-stats";
import contentGenRouter from "./content-gen";
import websiteAnalyticsRouter from "./analytics-website";
import { placesPublicRouter, placesAdminRouter } from "./places";
import refundsRouter from "./refunds";
import financeRouter from "./finance";
import userAuthRouter from "./user-auth";
import profilesRouter from "./profiles";
import adminProfilesRouter from "./admin-profiles";
import aiProfileAssistRouter from "./ai-profile-assist";
import eventProjectsRouter from "./event-projects";
import contentPipelineRouter from "./content-pipeline";

// Routers reachable from the public site (womanoftaste.co.za) — no admin auth required
// to reach them (individual routes may still gate on customer login, e.g. userAuthRouter).
const publicRouter: IRouter = Router();
publicRouter.use(healthRouter);
publicRouter.use(contactRouter);
publicRouter.use(newsletterRouter);
publicRouter.use(chatRouter);
publicRouter.use(ticketsRouter);
publicRouter.use(bookingsRouter);
publicRouter.use(userAuthRouter);
publicRouter.use(profilesRouter);
publicRouter.use(aiProfileAssistRouter);
publicRouter.use(placesPublicRouter);
publicRouter.use(blogPublicRouter);

// Routers reachable only from the admin portal (admin.womanoftaste.co.za) — every route in
// these files is already gated by requireAdminAuth (see middlewares/adminAuth.ts).
const adminApiRouter: IRouter = Router();
adminApiRouter.use(healthRouter);
adminApiRouter.use(adminRouter);
adminApiRouter.use(adminProfilesRouter);
adminApiRouter.use(statsRouter);
adminApiRouter.use(websiteAnalyticsRouter);
adminApiRouter.use(blogAdminRouter);
adminApiRouter.use(contactsRouter);
adminApiRouter.use(contentGenRouter);
adminApiRouter.use(contentPipelineRouter);
adminApiRouter.use(emailRouter);
adminApiRouter.use(placesAdminRouter);
adminApiRouter.use(refundsRouter);
adminApiRouter.use(financeRouter);
adminApiRouter.use(eventProjectsRouter);

export { publicRouter, adminApiRouter };
