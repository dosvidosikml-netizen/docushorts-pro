// app/api/analyze/route.js
// NeuroCine Vision Director v2.2
// Использует modelRouter для выбора vision-модели (по умолчанию Sonnet 4.6).
// Кастомный fetch т.к. vision требует мультимодального content array.

import { buildLocalImageAnalysis, compactFrameForModel, getStyleProfile } from "../../../engine/directorEngine_v4";
import { getModelConfig, TASK_TYPES } from "../../../lib/modelRouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `
You are NeuroCine Vision Director v2.2.
Analyze the uploaded locked frame for animation planning.
Output ONLY valid JSON. No markdown.
Never invent a new story. Your analysis must preserve the provided storyboard frame.
Return this JSON:
{
 "frame_id": "",
 "variant": "A",
 "camera": "",
 "lighting": "",
 "subject_motion": "",
 "environment_motion": "",
 "emotion": "",
 "continuity": "",
 "sfx": "",
 "notes_ru": ""
}
`;

async function askVision({ imageDataUrl, frame, variant, styleProfile }) {
  if (!process.env.OPENROUTER_API_KEY || !imageDataUrl) return null;

  const config = getModelConfig(TASK_TYPES.IMAGE_ANALYSIS);

  const userText = `
Analyze this uploaded locked frame for image-to-video animation.

LOCKED STORYBOARD FRAME:
${JSON.stringify(compactFrameForModel(frame), null, 2)}

SELECTED VARIANT: ${variant}
STYLE LOCK: ${styleProfile?.style_lock || "preserve storyboard style"}

Rules:
- preserve the exact uploaded image composition
- preserve scenario action and VO meaning
- do not add plot events
- return concise production-ready analysis JSON
`;

  async function tryModel(modelId) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://neurocine.online",
        "X-Title": "NeuroCine Vision Director v2.2",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        response_format: { type: "json_object" },
      }),
    });
    return res;
  }

  // Primary
  let res = await tryModel(config.primary);
  let modelUsed = config.primary;

  // Fallback
  if (!res.ok && config.fallback) {
    res = await tryModel(config.fallback);
    modelUsed = config.fallback;
  }

  if (!res.ok) return null;

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content);
    return { ...parsed, _model_used: modelUsed };
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const frame = body.frame || {};
    const variant = body.variant || "A";
    const imageDataUrl = body.imageDataUrl || "";
    const styleProfile = body.styleProfile || getStyleProfile(body.projectType, body.stylePreset);

    let analysis = null;
    try {
      analysis = await askVision({ imageDataUrl, frame, variant, styleProfile });
    } catch {}

    if (!analysis) {
      analysis = buildLocalImageAnalysis(frame, variant, styleProfile);
    }
    return Response.json({ analysis });
  } catch (e) {
    return Response.json({ error: e.message || "Analyze API error" }, { status: 500 });
  }
}
