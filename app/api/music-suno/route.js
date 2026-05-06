// app/api/music-suno/route.js
// NeuroCine Music Engine — Suno AI prompt по storyboard mood.

import { callOpenRouter, TASK_TYPES } from "../../../lib/modelRouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYS = `You are a Suno AI music prompt director. Output ONLY valid JSON (no markdown).
Rules: Min 5 tags [Genre], [Mood], [Instruments], [Tempo], [Vibe]. Specific, not generic.
JSON:
{
  "music_EN": "[Genre: cinematic documentary score], [Mood: tense, slow build], [Instruments: deep bass, heartbeat drum], [Tempo: 70-85 BPM], [Vibe: atmospheric, no vocals]",
  "negative_EN": "no lyrics, no rap, no harsh distortion, no tempo changes",
  "duration_hint": "60s | 2min | 3min — based on storyboard total_duration",
  "notes_ru": "1-2 предложения на русском зачем именно такой саунд."
}`;

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    const genre = String(body.genre || "").trim();
    const storyboard = body.storyboard || null;

    const moodHints = storyboard?.scenes?.slice(0, 8).map(s =>
      `${s.beat_type || ""}: ${s.description_ru || ""} (sfx: ${s.sfx || ""})`
    ).join("\n") || "";
    const totalDur = storyboard?.total_duration || 60;

    const userMsg = `Тема: ${topic}\nЖанр: ${genre}\nДлительность: ${totalDur}с\nАтмосфера сцен:\n${moodHints}\n\nПодбери Suno музыкальный промт под эту атмосферу.`;

    const r = await callOpenRouter({
      taskType: TASK_TYPES.LIGHT_TASK,
      systemPrompt: SYS,
      userMessage: userMsg,
      maxTokensOverride: 1500,
      responseFormat: { type: "json_object" },
      appTitle: "NeuroCine Music Suno v1",
    });
    if (!r.ok) return Response.json({ error: r.error }, { status: 500 });

    let parsed;
    try {
      const c = String(r.content || "").trim().replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
      parsed = JSON.parse(c);
    } catch (e) { return Response.json({ error: "Невалидный JSON: " + e.message, raw: r.content?.slice(0,500) }, { status: 500 }); }

    return Response.json({ music: parsed, model_used: r.model_used });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
