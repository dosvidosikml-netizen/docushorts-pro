import { buildExplorePrompt, getStyleProfile } from "../../../engine/directorEngine_v4";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `
You are NeuroCine Director Engine.
Output ONLY valid JSON. No markdown.
Your job: create a strict 2x2 variation-grid image prompt for one selected storyboard frame.
Rules:
- Do not change the story event.
- Do not change character identity, wardrobe, location, time, emotion, chronology or genre.
- Only vary camera angle, lens feeling, framing, composition, camera distance and depth of field.
- Output JSON: { "prompt": "...", "notes_ru": "..." }
`;

async function askOpenRouter({ frame, storyboard, styleProfile, variantCount }) {
  if (!process.env.OPENROUTER_API_KEY) return null;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-5.4";
  const seedPrompt = buildExplorePrompt(frame, storyboard, styleProfile, variantCount);
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://neurocine.online",
      "X-Title": "NeuroCine Director Studio",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Improve this prompt without changing its rules. Return JSON only.\n\n${seedPrompt}` }
      ],
      temperature: 0.2,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    })
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(content);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const frame = body.frame || {};
    const storyboard = body.storyboard || {};
    const styleProfile = body.styleProfile || getStyleProfile(body.projectType, body.stylePreset);
    const variantCount = Number(body.variantCount || 4);

    let api = null;
    try {
      api = await askOpenRouter({ frame, storyboard, styleProfile, variantCount });
    } catch {}

    const prompt = api?.prompt || buildExplorePrompt(frame, storyboard, styleProfile, variantCount);
    return Response.json({ prompt, notes_ru: api?.notes_ru || "Промт для 2x2 сетки создан строго по выбранному кадру." });
  } catch (e) {
    return Response.json({ error: e.message || "Explore API error" }, { status: 500 });
  }
}
