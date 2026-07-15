// The admin portal is a separate deployment/origin, so links to it from public pages
// (e.g. after a staff member approves/declines a booking via an emailed link) must be
// absolute — a same-origin client-side navigate() or <Link> won't reach it.
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? "https://admin.womanoftaste.co.za";
