import { buildVideoPrompt, getStyleProfile } from "../../../engine/directorEngine_v4";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `
You are NeuroCine Video Prompt Director.
Output ONLY valid JSON. No markdown.
Create one production-ready image-to-video prompt.
Rules:
- prompt must start with "ANIMATE CURRENT FRAME:"
- preserve storyboard frame, uploaded image analysis, character identity, location, style and VO meaning
- do not invent new action, new characters or new location
- include SFX inside prompt
- output JSON: { "video_prompt_en": "...", "sfx": "...", "notes_ru": "..." }
`;

async function askOpenRouter({ frame, analysis, storyboard, styleProfile }) {
  if (!process.env.OPENROUTER_API_KEY) return null;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-5.4";
  const seedPrompt = buildVideoPrompt(frame, analysis, storyboard, styleProfile);
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
        { role: "user", content: `Refine this prompt, keep all locks, return JSON only.\n\n${seedPrompt}` }
      ],
      temperature: 0.18,
      max_tokens: 3500,
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
    const analysis = body.analysis || {};
    const storyboard = body.storyboard || {};
    const styleProfile = body.styleProfile || getStyleProfile(body.projectType, body.stylePreset);

    let api = null;
    try {
      api = await askOpenRouter({ frame, analysis, storyboard, styleProfile });
    } catch {}

    const video_prompt_en = api?.video_prompt_en || buildVideoPrompt(frame, analysis, storyboard, styleProfile);
    const sfx = api?.sfx || analysis.sfx || frame.sfx || "subtle realistic ambience";
    return Response.json({ video_prompt_en, sfx, notes_ru: api?.notes_ru || "Video prompt создан строго по locked frame и сценарию." });
  } catch (e) {
    return Response.json({ error: e.message || "Video API error" }, { status: 500 });
  }
}
