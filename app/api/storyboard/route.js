import { buildLocalStoryboard, normalizeStoryboard } from "../../../engine/sceneEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `
You are NeuroCine Storyboard Engine.
Output ONLY valid JSON. No markdown. No explanations.

Create production storyboard JSON for short cinematic videos.

Rules:
- Language RU for VO.
- Image/video prompts EN.
- Every image_prompt_en starts with "SCENE PRIMARY FOCUS:".
- Every video_prompt_en starts with "ANIMATE CURRENT FRAME:".
- SFX must be inside video_prompt_en and also in sfx field.
- Vertical 9:16 by default.
- Shots usually 2-6 seconds.
- No subtitles, no UI, no watermark.
- Non-graphic documentary framing.
- Strong continuity.
- Output JSON structure:
{
 "project_name": "",
 "language": "ru",
 "format": "shorts_reels_tiktok",
 "aspect_ratio": "9:16",
 "total_duration": 60,
 "global_style_lock": "",
 "global_video_lock": "",
 "character_lock": [],
 "scenes": [
   {
    "id": "frame_01",
    "start": 0,
    "duration": 3,
    "beat_type": "hook",
    "description_ru": "",
    "image_prompt_en": "SCENE PRIMARY FOCUS:",
    "video_prompt_en": "ANIMATE CURRENT FRAME:",
    "vo_ru": "",
    "sfx": "",
    "camera": "",
    "transition": "cut",
    "continuity_note": "",
    "safety_note": ""
   }
 ],
 "export_meta": {
   "engine_target": "openrouter",
   "version": "neurocine_full_site_v2",
   "created_by": "NeuroCine Storyboard Engine"
 }
}
`;

export async function POST(req) {
  try {
    const body = await req.json();
    const script = String(body.script || "").trim();
    const duration = Number(body.duration || 60);
    const aspectRatio = body.aspect_ratio || "9:16";
    const style = body.style || "cinematic";
    const projectName = body.project_name || "NeuroCine Project";

    if (!script || script.length < 10) {
      return Response.json({ error: "Сценарий слишком короткий." }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      const storyboard = buildLocalStoryboard({ script, duration, aspectRatio, style, projectName });
      return Response.json({ storyboard, mode: "local_fallback" });
    }

    const model = process.env.OPENROUTER_MODEL || "openai/gpt-5.4";

    const userPrompt = `
Project name: ${projectName}
Target duration: ${duration} seconds
Aspect ratio: ${aspectRatio}
Style preset: ${style}

SCRIPT:
${script}

Create final production storyboard JSON.
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    let response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://neurocine.online",
          "X-Title": "NeuroCine Storyboard Studio",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.25,
          max_tokens: 12000,
          response_format: { type: "json_object" }
        })
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const rawText = await response.text();
    const apiData = JSON.parse(rawText);

    if (!response.ok) {
      const storyboard = buildLocalStoryboard({ script, duration, aspectRatio, style, projectName });
      return Response.json({ storyboard, mode: "api_error_fallback", error: apiData.error?.message || response.statusText });
    }

    const content = apiData.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    const storyboard = normalizeStoryboard(parsed, { script, duration, aspectRatio, style, projectName });
    return Response.json({ storyboard, mode: "api" });
  } catch (e) {
    try {
      const body = await req.json();
      const storyboard = buildLocalStoryboard({
        script: body.script || "",
        duration: body.duration || 60,
        aspectRatio: body.aspect_ratio || "9:16",
        style: body.style || "cinematic",
        projectName: body.project_name || "NeuroCine Project"
      });
      return Response.json({ storyboard, mode: "catch_fallback", error: e.message });
    } catch {
      return Response.json({ error: e.message || "Storyboard API error" }, { status: 500 });
    }
  }
}
