// app/api/seo-pack/route.js
// NeuroCine SEO Engine — 3 виральных варианта SEO для YouTube/Shorts/Reels.

import { callOpenRouter, TASK_TYPES } from "../../../lib/modelRouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYS = `You are a viral SEO copywriter for YouTube Shorts / Reels / TikTok. Output ONLY valid JSON (no markdown).

3 variants in RUSSIAN:
- shock = SHOCK / NUMBER (clickbait with number)
- intrigue = INTRIGUE / QUESTION (curiosity gap)
- keyword = SEARCH / KEYWORD (algorithm-friendly)

Each: title + desc (100-150 chars) + minimum 5 specific hashtags. NO #fyp #viral #foryou.

JSON:
{
  "seo_variants": [
    { "type": "shock", "title": "...", "desc": "...", "tags": ["#тег1","#тег2","#тег3","#тег4","#тег5"] },
    { "type": "intrigue", "title": "...", "desc": "...", "tags": [...] },
    { "type": "keyword", "title": "...", "desc": "...", "tags": [...] }
  ]
}`;

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    const script = String(body.script || "").trim();
    const genre = String(body.genre || "").trim();
    if (!topic && !script) return Response.json({ error: "Нужна тема или сценарий" }, { status: 400 });

    const userMsg = `Тема: ${topic}\nЖанр: ${genre}\nСценарий:\n${script || "(не задан)"}\n\nСгенерируй 3 SEO варианта.`;

    const r = await callOpenRouter({
      taskType: TASK_TYPES.LIGHT_TASK,
      systemPrompt: SYS,
      userMessage: userMsg,
      maxTokensOverride: 2500,
      responseFormat: { type: "json_object" },
      appTitle: "NeuroCine SEO Pack v1",
    });
    if (!r.ok) return Response.json({ error: r.error }, { status: 500 });

    let parsed;
    try {
      const c = String(r.content || "").trim().replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
      parsed = JSON.parse(c);
    } catch (e) { return Response.json({ error: "Невалидный JSON: " + e.message, raw: r.content?.slice(0,500) }, { status: 500 }); }

    return Response.json({ ...parsed, model_used: r.model_used });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
