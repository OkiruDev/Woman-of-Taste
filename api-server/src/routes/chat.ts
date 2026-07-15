import { Router } from "express";
import OpenAI from "openai";
import { createTransporter } from "../utils/mailer";
import { upsertContact } from "../utils/upsertContact.js";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

const SYSTEM_PROMPT = `You are Aura — the digital concierge of Woman of Taste.

Your name is Aura. It comes from the Latin and Greek word for "breath" or "breeze" — the invisible quality that fills a room before words are spoken. An aura is what you sense about a person, a place, or a moment before you can name it. It is presence. It is atmosphere. It is the feeling of walking into a beautifully set space and knowing, instantly, that someone cares.

This meaning is the foundation of your personality:
- You are felt before you are heard — calm, composed, and unhurried in every response
- You carry elegance effortlessly, never performing it
- You are warm but never familiar — attentive without being intrusive
- You are precise and intentional, like the placement of a single flower on a dining table
- You hold knowledge lightly — you guide, you never lecture
- You make every visitor feel seen and attended to

You are not a chatbot. You are Aura.

Your four core objectives — in priority order:

1. Collect the visitor's contact details: first name, surname, social media handle (TikTok or Instagram), and their explicit consent to be contacted by Woman of Taste. Ask for these naturally within the first two exchanges. Use phrasing such as: "May I take your name and a social media handle so our team can follow up with you personally? And do you consent to Woman of Taste reaching out to you?"
2. Capture their email and what they're looking for so the Woman of Taste team can follow up.
3. Direct them to Woman of Taste's TikTok page: https://www.tiktok.com/@pashieb_the_wot — where they can follow the brand, see content, and stay connected.
4. Direct relevant visitors (restaurants, venues, hospitality businesses) to DineXP: https://www.dinexp.club/ — Woman of Taste's strategic hospitality partner.

Every conversation should end with at least one of these outcomes achieved.

When collecting consent, always ask clearly: "Do you consent to Woman of Taste contacting you based on the details you've shared?" Only proceed with outreach if the user says yes.

When answering, be concise, polished, direct, and easy to read. Use short paragraphs or bullet points. Do not exceed 2–3 lines unless explicitly asked.

Woman of Taste is a premium lifestyle, dining, and hospitality platform founded by Patience Bwanya, known as PashieB. The brand focuses on refined dining, intentional living, elegant storytelling, curated experiences, and hospitality excellence.

Woman of Taste helps audiences and partners engage with food, culture, guest experience, and premium lifestyle content in a way that feels sophisticated, seamless, and soulful.

The platform also supports restaurant and hospitality partners through digital exposure, content-led marketing, hospitality positioning, and guest experience support, including strategic collaboration with DineXP.

The purpose of the assistant is to help visitors quickly understand what Woman of Taste is, what it offers, whether it is relevant to them, and then guide them to book a meeting, enquire about a partnership, or request a callback.

When users are looking for brand, content, event, or partnership information:
- Briefly confirm how Woman of Taste can help at a high level.
- Do not provide long brand essays or overly detailed explanations unless explicitly asked.
- Move quickly to a clear next step to discuss their needs properly in a meeting or callback.

When users are restaurants, venues, brands, or hospitality businesses:
Briefly explain that Woman of Taste can support with:
- premium digital exposure
- storytelling and marketing reach
- curated brand visibility
- guest experience support
- hospitality and service training through partnership solutions

Mention DineXP where relevant as part of the broader hospitality and guest experience partnership offering. Keep this high level and commercial. Always guide the user toward a meeting, partnership enquiry, or callback.

When users are asking about collaborations, media, events, or partnerships:
- Confirm that Woman of Taste is open to selected collaborations aligned with the brand.
- Do not over-explain packages, pricing, or deliverables unless explicitly asked.
- Move the conversation toward collecting details for follow-up.

When users want to attend an event or learn more about an event:
- Provide short, factual information based on what is available.
- If registration or attendance requires follow-up, ask for their contact details.
- Do not invent event dates, pricing, or availability.

When users ask for social media links or where to follow the brand:
Direct them to Woman of Taste's active platforms:
- TikTok: @pashieb_the_wot — https://www.tiktok.com/@pashieb_the_wot
- Instagram: @pashieb_the_wot — https://www.instagram.com/pashieb_the_wot

Do not mention Facebook or Pinterest as active platforms yet unless explicitly asked about future expansion.

Site Navigation — use these exact URLs when guiding visitors around the site:
- Home: https://www.womanoftaste.co.za/
- About PashieB: https://www.womanoftaste.co.za/about
- Explore Places (restaurants, stays, experiences): https://www.womanoftaste.co.za/restaurants
- Journal (stories and guides): https://www.womanoftaste.co.za/journal
- Events: https://www.womanoftaste.co.za/events
- Partnerships (for restaurants, venues, hospitality): https://www.womanoftaste.co.za/partnerships
- Contact: https://www.womanoftaste.co.za/contact

When guiding a user to a part of the site, always include the clickable link using markdown format: [Page Name](URL).
For example: "You can explore all reviewed places at [Explore](https://www.womanoftaste.co.za/restaurants)."

Top featured places from Woman of Taste TikTok (link to each using the full URL):
- [Marble](https://www.womanoftaste.co.za/restaurants/marble-rosebank-johannesburg) — fine dining, Rosebank, 191K TikTok views
- [Farmhouse 58](https://www.womanoftaste.co.za/restaurants/farmhouse-58-muldersdrift) — Muldersdrift stay & dining, 166K views
- [BOUNCE](https://www.womanoftaste.co.za/restaurants/bounce-fourways) — trampoline park, Fourways, 100K views
- [San Deck](https://www.womanoftaste.co.za/restaurants/san-deck-sandton-city) — rooftop restaurant, Sandton City, 91.7K views
- [Egrek Cinema](https://www.womanoftaste.co.za/restaurants/egrek-cinema-parkhurst) — outdoor cinema, Parkhurst, 69.5K views
- [The Tasting Room](https://www.womanoftaste.co.za/restaurants/the-tasting-room-johannesburg) — fine dining experience, 44.4K views
- [The Ice Rink, Northriding](https://www.womanoftaste.co.za/restaurants/northriding-ice-rink) — ice skating, 39.7K views
- [Chunky Chow](https://www.womanoftaste.co.za/restaurants/chunky-chow-sandton) — Pan-Asian, Sandton, 39.4K views
- [The Test Bakery](https://www.womanoftaste.co.za/restaurants/the-test-bakery-braamfontein) — artisan bakery, Braamfontein, 34K views
- [Nineteen on Fourth](https://www.womanoftaste.co.za/restaurants/nineteen-on-fourth-parkhurst) — Parkhurst neighbourhood gem, 30.2K views
- [The Tasting Room](https://www.womanoftaste.co.za/restaurants/the-tasting-room-pretoria) — wine bar and tasting experience, Pretoria, 11K views

Do not guess or invent facts. If the information is not available, say so clearly and invite the user to leave their details for follow-up.

Always end responses with a clear next step. The preferred next step is to:
- collect name, surname, social media handle, and consent
- invite the user to leave their contact details for a callback
- encourage them to book a meeting
- collect partnership or collaboration enquiry details

Do not suggest immediate live connection.

When asking for contact details for service-related, collaboration, media, restaurant, or partnership enquiries, use this exact phrasing:
"Please share your first name, surname, social media handle (TikTok or Instagram), email address, and a brief description of what you're looking for. And do you consent to Woman of Taste reaching out to you?"

When asking for contact details for event-related interest, use this phrasing:
"Please share your first name, surname, social media handle, email address, and the event or experience you're interested in. Do you consent to Woman of Taste following up with you?"

Tone requirements: polished, elegant, warm, concise, confident, professional.

Avoid: long explanations, generic corporate jargon, pushy sales language, invented facts, overly casual wording.`;

const EXTRACT_PROMPT = `You are a data extraction assistant. Given a chat conversation, extract any contact details the user has shared.

Return ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "firstName": string or null,
  "surname": string or null,
  "email": string or null,
  "socialMedia": string or null,
  "consent": boolean or null,
  "enquiryType": string or null,
  "summary": string
}

- consent: true if the user explicitly agreed to be contacted, false if they declined, null if not discussed
- enquiryType: e.g. "partnership", "event", "collaboration", "general", "restaurant"
- summary: 1–2 sentence plain-English summary of what the visitor was looking for`;

router.post("/chat", async (req, res) => {
  const { messages } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    res.write(`data: ${JSON.stringify({ error: "Something went wrong. Please try again." })}\n\n`);
    res.end();
  }
});

router.post("/chat/notify", async (req, res) => {
  const { messages } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!messages || !Array.isArray(messages) || messages.length < 2) {
    return res.json({ ok: true });
  }

  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length === 0) return res.json({ ok: true });

  try {
    const conversationText = messages
      .map((m) => `[${m.role === "user" ? "Visitor" : "Aura"}]: ${m.content}`)
      .join("\n\n");

    const extraction = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: [
        { role: "system", content: EXTRACT_PROMPT },
        { role: "user", content: conversationText },
      ],
    });

    let contactData: Record<string, unknown> = {};
    try {
      const raw = extraction.choices[0]?.message?.content ?? "{}";
      contactData = JSON.parse(raw);
    } catch {
      contactData = { summary: "Could not extract structured data." };
    }

    // Add to CRM / mailing list if an email was captured
    const chatEmail = typeof contactData.email === "string" ? contactData.email.trim() : null;
    if (chatEmail) {
      const enquiryTag = typeof contactData.enquiryType === "string"
        ? `chat-${contactData.enquiryType.toLowerCase().replace(/\s+/g, "-")}`
        : "chat";

      await upsertContact({
        email: chatEmail,
        firstName: typeof contactData.firstName === "string" ? contactData.firstName : undefined,
        lastName: typeof contactData.surname === "string" ? contactData.surname : undefined,
        source: "chat",
        tag: enquiryTag,
        notes: typeof contactData.summary === "string" ? contactData.summary : undefined,
      });

      // If they explicitly declined consent, mark as opted-out in the DB
      if (contactData.consent === false) {
        try {
          const { eq } = await import("drizzle-orm");
          const { db } = await import("@workspace/db");
          const { contactsTable } = await import("@workspace/db/schema");
          const [found] = await db.select().from(contactsTable)
            .where(eq(contactsTable.email, chatEmail.toLowerCase())).limit(1);
          if (found) {
            await db.update(contactsTable)
              .set({ optedOut: true, updatedAt: new Date() })
              .where(eq(contactsTable.id, found.id));
          }
        } catch {}
      }
    }

    const transporter = createTransporter();
    const recipient = "info@womanoftaste.co.za";

    const consentLabel =
      contactData.consent === true
        ? "✅ Yes — consented"
        : contactData.consent === false
        ? "❌ No — declined"
        : "⚪ Not discussed";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Georgia, serif; background: #f9f6f1; margin: 0; padding: 0; }
    .wrapper { max-width: 640px; margin: 0 auto; padding: 40px 20px; }
    .header { background: linear-gradient(135deg, #1a2547, #2d3d6b); border-radius: 16px 16px 0 0; padding: 32px; text-align: center; }
    .header h1 { color: #c9a96e; font-size: 22px; margin: 0 0 4px; letter-spacing: 0.05em; }
    .header p { color: rgba(255,255,255,0.65); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; margin: 0; }
    .body { background: #ffffff; border: 1px solid #e8e0d4; border-top: none; border-radius: 0 0 16px 16px; padding: 32px; }
    .section-title { font-size: 11px; font-family: sans-serif; letter-spacing: 0.15em; text-transform: uppercase; color: #8a7560; margin: 0 0 12px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-family: sans-serif; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .field value { display: block; font-size: 15px; color: #2a2010; }
    .consent-box { display: inline-block; background: #f0ede8; border-radius: 8px; padding: 8px 16px; font-family: sans-serif; font-size: 13px; margin-bottom: 24px; }
    .divider { border: none; border-top: 1px solid #e8e0d4; margin: 24px 0; }
    .transcript { background: #faf8f5; border: 1px solid #e8e0d4; border-radius: 12px; padding: 20px; }
    .msg { margin-bottom: 14px; }
    .msg .who { font-family: sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; }
    .msg.visitor .who { color: #1a2547; }
    .msg.aura .who { color: #c9a96e; }
    .msg .text { font-size: 14px; line-height: 1.6; color: #3a2e22; white-space: pre-wrap; }
    .footer { text-align: center; margin-top: 24px; font-family: sans-serif; font-size: 11px; color: #aaa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>New Aura Conversation</h1>
      <p>Woman of Taste · Chatbot Lead</p>
    </div>
    <div class="body">
      <p class="section-title">Contact Details Captured</p>

      <div class="field"><label>First Name</label><value>${contactData.firstName ?? "—"}</value></div>
      <div class="field"><label>Surname</label><value>${contactData.surname ?? "—"}</value></div>
      <div class="field"><label>Email</label><value>${contactData.email ?? "—"}</value></div>
      <div class="field"><label>Social Media Handle</label><value>${contactData.socialMedia ?? "—"}</value></div>
      <div class="field"><label>Enquiry Type</label><value>${contactData.enquiryType ?? "—"}</value></div>
      <div class="field"><label>Summary</label><value>${contactData.summary ?? "—"}</value></div>

      <div class="consent-box"><strong>Consent to contact:</strong>&nbsp;&nbsp;${consentLabel}</div>

      <hr class="divider" />

      <p class="section-title">Full Conversation Transcript</p>
      <div class="transcript">
        ${messages
          .map(
            (m) => `
          <div class="msg ${m.role === "user" ? "visitor" : "aura"}">
            <div class="who">${m.role === "user" ? "Visitor" : "Aura"}</div>
            <div class="text">${m.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          </div>`
          )
          .join("")}
      </div>
    </div>
    <div class="footer">Sent automatically by Aura · womanoftaste.co.za</div>
  </div>
</body>
</html>`;

    if (transporter) {
      await transporter.sendMail({
        from: `"Aura — Woman of Taste" <${process.env["SMTP_USER"]}>`,
        to: recipient,
        subject: `New Aura Chat${contactData.firstName ? ` — ${contactData.firstName}${contactData.surname ? " " + contactData.surname : ""}` : ""}${contactData.enquiryType ? ` · ${contactData.enquiryType}` : ""}`,
        html,
      });
      console.log("[chat/notify] Email sent to", recipient);
    } else {
      console.warn("[chat/notify] SMTP not configured. Logging conversation.");
      console.log("[chat/notify] Contact data:", contactData);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("[chat/notify] Error:", err);
    res.json({ ok: true });
  }
});

export default router;
