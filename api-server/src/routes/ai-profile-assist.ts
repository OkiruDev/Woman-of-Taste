import { Router } from "express";
import OpenAI from "openai";
import { userAuthMiddleware } from "./user-auth.js";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? "placeholder",
});

router.post("/ai/profile-assist", userAuthMiddleware, async (req: any, res) => {
  try {
    const { linkedinText } = req.body;
    if (!linkedinText || typeof linkedinText !== "string") {
      return res.status(400).json({ ok: false, error: "Please paste your LinkedIn profile text." });
    }
    if (linkedinText.length > 10000) {
      return res.status(400).json({ ok: false, error: "Text too long. Please trim to under 10,000 characters." });
    }

    const systemPrompt = `You are Aura, the AI profile assistant for Woman of Taste — a premium lifestyle platform for ambitious, intentional African women.

Given a LinkedIn profile or bio text, extract and rewrite the information to fill a Woman of Taste event profile. Write warmly, specifically, and compellingly. Use first person for the direction fields, third person for shortBio. Do NOT invent details not present — if something isn't in the text, return an empty string.

Return ONLY a valid JSON object with exactly these keys:
{
  "professionOrTitle": "Current job title / professional identity — crisp and specific, e.g. 'Creative Director & Brand Strategist'",
  "companyOrVenture": "Current company, organisation, or venture name",
  "qualifications": "Educational background and professional credentials written naturally, e.g. 'BCom (Hons) Marketing, University of Cape Town · Google-certified Digital Strategist'",
  "careerHighlights": "3-5 career highlights, each on its own line starting with • — specific, achievement-focused, compelling",
  "passions": "Personal passions and interests — infer from their work, causes, and tone. Comma-separated or short phrases",
  "specialSkills": "2-4 standout skills as short sharp phrases, e.g. 'Turning complex data into compelling stories · Building community from scratch'",
  "currentProjects": "Current projects, side ventures, or focus areas mentioned or inferable from recent roles",
  "whatYouDo": "2-3 sentences in first person describing day-to-day reality: what they lead, build, or navigate right now. Warm and specific.",
  "whatYouWantNext": "1-2 sentences in first person on the next chapter — goal, pivot, or dream. Infer from trajectory if not explicit. Ambitious and honest.",
  "shortBio": "A polished 2-3 sentence bio in third person. Who they are, what they've built, and what drives them. Written as a proud introduction.",
  "city": "City of residence or base if mentioned, else empty string"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `LinkedIn profile:\n\n${linkedinText}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ ok: false, error: "Aura returned an unexpected format. Please try again." });

    const parsed = JSON.parse(match[0]);
    res.json({ ok: true, profile: parsed });
  } catch (err: any) {
    console.error("[ai-profile-assist]", err?.message ?? err);
    res.status(500).json({ ok: false, error: "Aura is unavailable right now. Please try again shortly." });
  }
});

export default router;
