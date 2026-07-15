# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── woman-of-taste/     # Woman of Taste premium lifestyle website (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Woman of Taste Website (`artifacts/woman-of-taste`)

Premium multi-page lifestyle brand website for **Woman of Taste** (womanoftaste.co.za).

**Brand:** Elegant, feminine, premium editorial lifestyle brand. Tagline: "Savory and Soulful".

**Tech:** React + Vite + Tailwind CSS + Framer Motion + Wouter (routing)

**Core Pages:**
- `/` — Home (events-focused hero, "Book Your Experience" CTA)
- `/about` — About Us
- `/restaurants` — Restaurant reviews listing page (SEO-optimised, filters by city/type, JSON-LD schema, 10 restaurants)
- `/restaurants/:slug` — Individual restaurant detail page (full review, dish highlights, vibe, must-order, related, JSON-LD Restaurant + Review + BreadcrumbList schema)
- `/journal` — Journal / Blog listing (loads from PostgreSQL via `/api/blog`)
- `/journal/:slug` — Single journal post
- `/events` — All Events hub
- `/events/:id` — Event detail page
- `/partnerships` — Partnerships
- `/contact` — Contact
- `/admin/login` — Admin login (password-protected, JWT, 8h session)
- `/admin` — Admin dashboard (stats, quick actions, activity feed)
- `/admin/contacts` — CRM contacts list (search, paginate, export CSV, add, sync bookings)
- `/admin/contacts/:id` — Contact profile (edit, bookings history, opt-out toggle)
- `/admin/email/compose` — Email campaign composer (draft, preview, test send, broadcast)
- `/admin/email/history` — Sent campaigns with open/click/opt-out stats
- `/admin/email/drafts` — Saved drafts
- `/admin/email/templates` — Reusable email templates
- `/admin/blog` — Blog manager (list, publish/unpublish, archive)
- `/admin/blog/new` — New blog post editor (rich text, SEO, image upload)
- `/admin/blog/:id/edit` — Edit existing blog post
- `/admin/bookings` — Booking management (stats, actions, notes, invoices)
- `/admin/attendance` — Live event attendance: QR scanner (camera + jsQR) + guest register with check-in tracking
- `/admin/analytics` — Email analytics + GA4/TikTok/Instagram setup panels
- `/admin/settings` — Site settings, email config, integrations, password
- `/ticket/:qrToken` — Guest cinema-style ticket page (dark cinematic theme, animated tear-off stub, QR code)

**SEO Location Pages:**
- `/events/johannesburg` — Women's Events in Johannesburg
- `/events/cape-town` — Women's Events in Cape Town (waitlist)
- `/events/pretoria` — Women's Events in Pretoria (waitlist)

**SEO Experience Pages:**
- `/experiences/lifestyle` — All Lifestyle Experiences SA
- `/experiences/private-dining` — Private Dining Experiences SA
- `/experiences/wine-tasting` — Wine Tasting Events SA
- `/experiences/networking` — Women's Networking Events SA

## Booking Management System

Full end-to-end booking flow with database persistence, PDF invoices, and automated emails.

### Booking Flow
1. Customer submits booking form → saved to DB as `PENDING` → client gets acknowledgement email, admin gets approve/decline email with one-click buttons
2. Admin clicks **Approve** → status → `APPROVED` → PDF invoice generated → sent to client with banking details
3. Admin clicks **Decline** → status → `DECLINED` → polite decline email sent to client
4. Automated follow-ups: Day 7 (friendly reminder), Day 14 (firm notice + status → `OVERDUE`)
5. Admin clicks **Paid** → generates unique `qrToken` → sends cinema-style ticket email (dark/gold/crimson HTML) with embedded QR code → sends arrival details email
6. At the event door: admin uses QR scanner in Attendance page to scan guest QR → marks `checkedIn=true` / `checkedInAt=now` in DB

### API Endpoints
- `POST /api/tickets` — submit a booking (saves to DB, sends emails)
- `GET /api/bookings/approve/:token` — one-click approval link (expires 72h)
- `GET /api/bookings/decline/:token` — one-click decline link (expires 72h)
- `GET /api/bookings/:id/invoice` — download PDF invoice
- `POST /api/admin/auth` — get JWT token (password → token)
- `GET /api/admin/bookings` — list all bookings (JWT required)
- `PATCH /api/admin/bookings/:id` — update notes/status (JWT required)
- `POST /api/admin/bookings/:id/paid` — mark as paid, generate QR token, send cinema ticket + arrival emails (JWT required)
- `POST /api/admin/bookings/:id/overdue` — mark as overdue (JWT required)
- `POST /api/admin/bookings/:id/followup` — send manual follow-up email (JWT required)
- `GET /api/admin/bookings/:id/invoice` — download invoice from admin (JWT required)
- `POST /api/admin/bookings/:id/check-in` — mark guest as checked in by booking ID (JWT required)
- `POST /api/admin/check-in/:qrToken` — mark guest as checked in by QR token (JWT required, used by scanner)
- `GET /api/admin/attendance` — list all paid bookings with check-in status; ?eventId=X to filter (JWT required)
- `GET /api/ticket/:qrToken` — public: get ticket details for guest ticket page
- `GET /api/ticket/:qrToken/qr.png` — public: returns QR code PNG image

### Database Schema
Table: `bookings` — all fields in `lib/db/src/schema/bookings.ts`
- Status values: `PENDING` | `APPROVED` | `PAID` | `OVERDUE` | `DECLINED`
- Invoice numbers: `WOT-YYYY-XXXX` (sequential, based on DB row id)

### Invoice PDF
- Generated on approval using `pdfkit` (A4, brand colors)
- Stored in `data/invoices/` on the server
- Contains: header, billed-to, event block, ticket table, banking details, payment reference

### Environment Variables Required
- `ADMIN_PASSWORD` — secret for admin login
- `JWT_SECRET` — secret for JWT signing (auto-generated)
- `SMTP_USER` / `SMTP_PASS` — Zoho SMTP credentials
- `BANK_NAME`, `BANK_ACCOUNT_NAME`, `BANK_ACCOUNT_NUMBER`, `BANK_BRANCH_CODE`, `BANK_ACCOUNT_TYPE`, `BANK_BRANCH_NAME`, `BANK_SWIFT_CODE` — banking details on invoices
- `APP_URL` — base URL for approval link generation

### Where to Update Content

**Social Links** — Edit `artifacts/woman-of-taste/src/data/social.ts` (or wherever social links are defined):
- TikTok: update the TikTok URL (currently @pashieb_the_wot)
- Instagram: update the Instagram URL
- Facebook: look for `// Facebook` comment to activate
- Pinterest: look for `// Pinterest` comment to activate

**Blog Posts** — Managed via Admin CMS at `/admin/blog`:
- All 17 original posts seeded to PostgreSQL `blog_posts` table on first startup
- Create/edit/publish/archive posts via the rich text editor
- AI Blog Generator at `/admin/blog/generate` — enter topic + category → AI drafts full post with animated SVG ornaments → save as draft
- Public API: `GET /api/blog` and `GET /api/blog/:slug` (feeds Journal page)

**AI Content Generation** — Three AI-powered generators using `gpt-4o-mini`:
- `/admin/blog/generate` — full WOT blog post (title, excerpt, content with animated SVG dividers, SEO fields)
- `/admin/email/generate` — newsletter draft (subject, preview text, HTML body) → opens in Email Composer
- `/admin/social` — Instagram + TikTok captions with copy buttons and character counters
- Backend: `artifacts/api-server/src/routes/content-gen.ts` (3 POST endpoints, JWT-protected)

**Events** — Edit `artifacts/woman-of-taste/src/data/events.ts`:
- Add or update event objects
- Fields: title, date, location, description, type (upcoming/private)

**Brand Copy** — Edit the page components directly:
- Home hero copy: `artifacts/woman-of-taste/src/pages/Home.tsx`
- About story: `artifacts/woman-of-taste/src/pages/About.tsx`

**Floating Butterflies** (`artifacts/woman-of-taste/src/components/FloatingButterflies.tsx`):
- Split-wing 3D animation: each butterfly uses two overlapping images clipped to left/right halves, each rotating independently around the spine using CSS `perspective` + `rotateY`
- Spotlight system: one butterfly becomes "active" (opacity ~0.88, gold glow, 1.22× scale, settling-flap animation) every 7 seconds; others dim to ~0.13 opacity
- Active butterfly navigates toward a focal landing spot (headline, CTA, plate area), then settles
- Mouse-flee behavior preserved: butterflies scatter when cursor approaches
- Keyframes: `wot-lw` / `wot-rw` (normal flap), `wot-lw-settle` / `wot-rw-settle` (landing), `wot-bf-glow` (active gold pulse)

**Journal Flip Book** (in `artifacts/woman-of-taste/src/pages/Home.tsx`):
- Two-phase flip animation: Phase 1 accelerates to -90° (0.40s), Phase 2 decelerates to -180° with spring overshoot (0.52s)
- Dog-ear corner fold hint: 32×32 CSS triangle at bottom-right of right page, grows to 44×44 on hover, onClick=turnForward
- Left-page shadow: `motion.div` gradient overlay fades in during flip to simulate shadow cast by the turning page
- Page sheen: gradient sweep on front face of turning page (simulates paper catching light)
- Book spine depth indicator: 8px gradient strip on left edge for 3D depth
- Left page click: onClick={turnBack} when spread > 0 (clicking back page turns back)
- Enhanced box-shadow: "0 40px 100px rgba(28,20,12,0.38)" for realistic book-on-surface depth

**Logo Images** — Located in `artifacts/woman-of-taste/public/`:
- `logo-navy.jpeg` — Navy/white version
- `logo-ivory.jpeg` — Dark on ivory background (main logo)
- `logo-dark.jpeg` — Dark charcoal version
- `logo-emblem.jpeg` — Circular emblem only
- `butterfly.jpeg` — Decorative butterfly illustration

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
