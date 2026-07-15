# Woman of Taste — Site Guide

**Domain:** womanoftaste.co.za  
**Founded by:** Patience Bwanya (PashieB)  
**Tagline:** Savory & Soulful

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with all key sections |
| About | `/about` | Brand story, founder profile (PashieB), philosophy |
| Journal | `/journal` | Blog listing with categories + featured post |
| Journal Post | `/journal/:slug` | Individual article view |
| Events | `/events` | Upcoming & private dining events |
| Partnerships | `/partnerships` | Restaurant partnership info + DineXP collaboration |
| Contact | `/contact` | Contact form + social links |

---

## How to Update Content

### Social Links
Edit `src/data/social.ts`:
```ts
tiktok: "https://www.tiktok.com/@pashieb_the_wot",
instagram: "https://www.instagram.com/pashieb_the_wot",
// Uncomment facebook / pinterest when ready
```

### Journal Articles
Edit `src/data/blog.ts` — add a new object to the `blogPosts` array:
```ts
{
  slug: "your-article-slug",
  title: "Article Title",
  category: "Editorial", // Editorial | Dining | Lifestyle | Womanhood | Culture | Hospitality
  date: "1 January 2026",
  readTime: "5 min read",
  excerpt: "Short description shown in cards.",
  content: `<p>Full HTML article content here.</p>`,
  featured: true, // optional — marks as featured post
}
```

### Events
Edit `src/data/events.ts` — add a new object to the `events` array:
```ts
{
  id: "unique-event-id",
  title: "Event Title",
  date: "15 May 2026",
  time: "6:00 PM — 9:00 PM",
  location: "Venue Name, City",
  description: "Event description.",
  type: "upcoming", // or "private"
  category: "Brunch Salon",
  ctaLabel: "Reserve Your Seat",
}
```

### DineXP / Partnership Links
Edit `src/data/social.ts`:
```ts
partnerLinks: {
  dinexpPlatform: "https://platform.dinexp.club/",
  dinexpWebsite: "https://www.dinexp.club/",
}
```

### Adding Facebook & Pinterest
In `src/data/social.ts`, uncomment:
```ts
facebook: "https://www.facebook.com/womanoftaste",
pinterest: "https://www.pinterest.com/womanoftaste",
```
Then in `src/components/Navbar.tsx` and `src/components/Footer.tsx`, uncomment the Facebook and Pinterest icon blocks (clearly marked with `// Facebook:` and `// Pinterest:` comments).

---

## Tech Stack
- React + Vite
- Tailwind CSS
- Framer Motion
- Wouter (routing)
- react-icons (TikTok, Instagram icons)
