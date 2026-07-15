import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { X, HelpCircle, ChevronRight, BookOpen, Users, Mail, BarChart2, Settings, LayoutDashboard, CalendarCheck } from "lucide-react";

interface GuideTip {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const GUIDE_DATA: Record<string, { heading: string; intro: string; tips: GuideTip[] }> = {
  "/admin": {
    heading: "Welcome to Your Dashboard",
    intro: "This is your command centre. Here's what you're looking at:",
    tips: [
      { icon: <LayoutDashboard size={16} />, title: "Stats Cards", body: "At-a-glance numbers: total contacts, emails sent this month, active bookings, outstanding payments, and published posts." },
      { icon: <ChevronRight size={16} />, title: "Quick Actions", body: "Jump straight to the most common tasks — compose an email, write a post, view contacts, or check bookings." },
      { icon: <ChevronRight size={16} />, title: "Activity Feed", body: "A live log of everything that's happened — emails sent, posts published, contacts imported, and more." },
    ],
  },
  "/admin/bookings": {
    heading: "Managing Bookings",
    intro: "Every booking submitted through the website lands here. Here's the flow:",
    tips: [
      { icon: <CalendarCheck size={16} />, title: "Approve a Booking", body: "When a new booking comes in it's PENDING. Hit the green ✓ Approve button — this generates a PDF invoice and emails it to the guest automatically." },
      { icon: <X size={16} />, title: "Decline a Booking", body: "If a booking can't be accommodated, hit the red ✗ Decline button. A polite notification email is sent to the guest." },
      { icon: <ChevronRight size={16} />, title: "Mark as Paid", body: "Once you've confirmed the EFT payment in your Investec account, hit the ✓ Paid button to update the booking status." },
      { icon: <ChevronRight size={16} />, title: "Follow-up Email", body: "The ✉ button sends a payment reminder to the guest. Automated reminders also go out on Day 7 and Day 14 after approval." },
      { icon: <ChevronRight size={16} />, title: "Download Invoice", body: "The 📄 button downloads the PDF invoice. If no invoice exists yet, it will be generated on the fly." },
      { icon: <ChevronRight size={16} />, title: "Notes", body: "Use the sticky-note button to save internal notes on any booking — dietary requirements, special requests, or payment references." },
    ],
  },
  "/admin/contacts": {
    heading: "Your Mailing List (CRM)",
    intro: "Everyone who has ever booked or signed up lives here. Tips:",
    tips: [
      { icon: <Users size={16} />, title: "Sync Bookings", body: "Click 'Sync Bookings' to pull all booking guests who aren't yet in your contacts list. Do this regularly to keep your list up to date." },
      { icon: <ChevronRight size={16} />, title: "Add Manually", body: "Use 'Add Contact' to manually add someone — e.g. people you meet at events or who inquire via DM." },
      { icon: <ChevronRight size={16} />, title: "Export CSV", body: "Download your full contact list as a CSV — handy for uploading to Mailchimp, Google Sheets, or sharing with a team member." },
      { icon: <ChevronRight size={16} />, title: "Search & Filter", body: "Search by name, email, phone, or tag. Use tags like 'VIP', 'corporate', or 'cooking class' to segment your list." },
      { icon: <ChevronRight size={16} />, title: "Contact Profile", body: "Click any contact's name to see their full profile, booking history, and toggle their marketing opt-in status." },
    ],
  },
  "/admin/email/compose": {
    heading: "Composing an Email Campaign",
    intro: "Send branded emails to your whole list, or test first before broadcasting:",
    tips: [
      { icon: <Mail size={16} />, title: "Subject Line", body: "Write a compelling subject — this is the first thing your readers see. Keep it under 60 characters for best mobile display." },
      { icon: <ChevronRight size={16} />, title: "Preview Text", body: "The short text that appears in the inbox below the subject line. Use it to tease the content — 90 characters max." },
      { icon: <ChevronRight size={16} />, title: "HTML Body", body: "Write your email in HTML. Use the toolbar buttons to insert bold, italic, headings, lists, and links. A branded header and unsubscribe footer are added automatically." },
      { icon: <ChevronRight size={16} />, title: "Test Send", body: "Always test before broadcasting. Click 'Test Send' to receive the email at your own address and check how it looks." },
      { icon: <ChevronRight size={16} />, title: "Preview", body: "Click 'Preview' to see a rendered version of your email before sending." },
      { icon: <ChevronRight size={16} />, title: "Send to All", body: "Broadcasts to all opted-in contacts. Drafts are auto-saved every 60 seconds while you type." },
    ],
  },
  "/admin/email/history": {
    heading: "Email Campaign History",
    intro: "Track performance of every email you've sent:",
    tips: [
      { icon: <Mail size={16} />, title: "Open Rate", body: "The % of recipients who opened the email. A good open rate for an engaged list is 25–40%. WOT's audience is premium so aim high." },
      { icon: <ChevronRight size={16} />, title: "Click Rate", body: "The % who clicked a link inside the email. Anything above 3–5% is strong." },
      { icon: <ChevronRight size={16} />, title: "Expand a Campaign", body: "Click a row to see exactly which recipients opened and clicked. This helps you identify your most engaged readers." },
    ],
  },
  "/admin/blog": {
    heading: "Managing Your Blog",
    intro: "All 17 original journal posts are here, seeded from the website. Here's how to use the blog manager:",
    tips: [
      { icon: <BookOpen size={16} />, title: "Publish / Unpublish", body: "The eye icon toggles a post between published (visible to website visitors) and draft (hidden). Use drafts to prepare posts in advance." },
      { icon: <ChevronRight size={16} />, title: "New Post", body: "Click 'New Post' to open the editor. Write, style, add a cover image, set SEO metadata, then publish — the Journal page updates instantly." },
      { icon: <ChevronRight size={16} />, title: "Featured Post", body: "Mark one post as 'Featured' in the editor — it appears in the large hero card at the top of the Journal page." },
      { icon: <ChevronRight size={16} />, title: "Categories", body: "Use categories (Editorial, Events, Dining, etc.) to organise content. Readers can filter by category on the Journal page." },
      { icon: <ChevronRight size={16} />, title: "Archive", body: "Archiving hides a post from the public without deleting it — good for seasonal or outdated content." },
    ],
  },
  "/admin/analytics": {
    heading: "Analytics Overview",
    intro: "Track the performance of your emails and connect social platforms:",
    tips: [
      { icon: <BarChart2 size={16} />, title: "Email Tab", body: "Real data from your sent campaigns — open rates, click rates, opt-outs, and a chart comparing campaign performance over time." },
      { icon: <ChevronRight size={16} />, title: "Google Analytics", body: "To see website traffic, add GA4_PROPERTY_ID and GA4_CREDENTIALS to Replit Secrets, then restart the server." },
      { icon: <ChevronRight size={16} />, title: "TikTok & Instagram", body: "Social analytics require API credentials from each platform. The setup panels show exactly which secrets are needed." },
    ],
  },
  "/admin/settings": {
    heading: "Settings",
    intro: "Configure how the admin portal behaves:",
    tips: [
      { icon: <Settings size={16} />, title: "General Settings", body: "Update the site name, contact email, social links, and business address. These are used across emails and the admin portal." },
      { icon: <Mail size={16} />, title: "Email Settings", body: "Set your sender name and a default test address. The sender email (info@womanoftaste.co.za) is controlled via Replit Secrets." },
      { icon: <ChevronRight size={16} />, title: "Integrations", body: "See which services are connected at a glance. Add missing credentials to Replit Secrets to connect them." },
      { icon: <ChevronRight size={16} />, title: "Password", body: "The admin password is stored as a Replit Secret (ADMIN_PASSWORD). To change it, update the secret directly in Replit." },
    ],
  },
};

function getGuide(path: string) {
  const exact = GUIDE_DATA[path];
  if (exact) return exact;
  for (const key of Object.keys(GUIDE_DATA)) {
    if (key !== "/admin" && path.startsWith(key)) return GUIDE_DATA[key];
  }
  return null;
}

const SEEN_KEY = "wot_guide_seen";

export function useGuide() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const guide = getGuide(location);

  useEffect(() => {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}");
    if (!seen[location] && guide) {
      setTimeout(() => setOpen(true), 800);
      seen[location] = true;
      localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    }
  }, [location]);

  return { open, setOpen, guide };
}

export default function AdminGuide({ open, onClose, guide }: {
  open: boolean;
  onClose: () => void;
  guide: ReturnType<typeof getGuide>;
}) {
  if (!open || !guide) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 300, backdropFilter: "blur(2px)" }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: 400,
        background: "white", zIndex: 301, boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          background: "hsl(225,45%,18%)", padding: "1.5rem 1.5rem 1.25rem",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <HelpCircle size={16} style={{ color: "hsl(38,45%,65%)" }} />
              <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "hsl(38,45%,65%)" }}>
                Guide
              </span>
            </div>
            <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.35rem", color: "white", lineHeight: 1.2 }}>
              {guide.heading}
            </h3>
            <p style={{ margin: "0.5rem 0 0", fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
              {guide.intro}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "white", flexShrink: 0, marginTop: 2 }}>
            <X size={16} />
          </button>
        </div>

        {/* Tips */}
        <div style={{ padding: "1.25rem 1.5rem", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {guide.tips.map((tip, i) => (
              <div key={i} style={{
                background: "#f8f9ff", borderRadius: 12, padding: "1rem 1.1rem",
                border: "1px solid #e8eaf6",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "hsl(225,45%,18%)", display: "flex", alignItems: "center", justifyContent: "center", color: "hsl(38,45%,65%)", flexShrink: 0 }}>
                    {tip.icon}
                  </div>
                  <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", fontWeight: 700, color: "hsl(225,50%,22%)" }}>
                    {tip.title}
                  </span>
                </div>
                <p style={{ margin: 0, fontFamily: "Raleway, sans-serif", fontSize: "0.79rem", color: "#555", lineHeight: 1.6, paddingLeft: 36 }}>
                  {tip.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#aaa" }}>
            This guide auto-opens on first visit per page
          </span>
          <button onClick={() => { localStorage.removeItem(SEEN_KEY); }} style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#aaa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Reset guides
          </button>
        </div>
      </div>
    </>
  );
}
