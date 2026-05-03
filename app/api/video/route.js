// app/api/video/route.js
// NeuroCine Video Prompt API v2.2
// Использует centralized modelRouter — VIDEO_PROMPT_REFINEMENT task.
// По умолчанию Haiku 4.5: дешёвая модель полирует уже собранный videoPromptAgent
// промт. Большая часть работы делается локально, LLM только дошлифовывает.

import { buildVideoPrompt as buildLegacyVideoPrompt, getStyleProfile } from "../../../engine/directorEngine_v4";
import {
  buildVideoPromptFor,
  buildImagePrompt,
  stripBannedWords,
  validateFramePrompts,
  NEGATIVE_PROMPT_BASE,
} from "../../../engine/videoPromptAgent";
import { normalizeTarget } from "../../../engine/sceneEngine_v2";
import { callOpenRouter, TASK_TYPES } from "../../../lib/modelRouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_BASE = `
You are NeuroCine Video Prompt Director v2.2.
Output ONLY valid JSON. No markdown.
Create one production-ready image-to-video prompt for a locked frame.

CORE RULES:
- preserve storyboard frame, uploaded image analysis, character identity, location, style, VO meaning
- do not invent new action, new characters, or new location
- inject character_lock VERBATIM (no paraphrasing of locked features)
- use realism anchors: visible skin pores, individual hair strands, fabric weave, lens vignette, 35mm film grain
- NO banned tokens: "cinematic", "epic", "stunning", "8K", "masterpiece", "perfect", "hyperrealistic", "rendered", "CGI"
- end video_prompt with EXACT line: "Maintain EXACT same character appearance, face, clothing, and condition as previous frame."

OUTPUT JSON: { "video_prompt_en": "...", "image_prompt_en": "...", "sfx": "...", "negative_prompt": "...", "notes_ru": "..." }
`;

const VEO3_RULES = `
TARGET MODEL: Google Veo 3
- video_prompt_en: flowing paragraph 60-120 words
- Order: shot type → subject → action → environment → camera → lighting → color → realism → audio
- Camera movement MUST include explicit timing ("slow 2-second push-in", "static 3-second hold")
- MANDATORY Audio block: "Audio: [ambience]. SFX: [sfx]. [Voiceover or 'no dialogue']"
`;

const GROK_RULES = `
TARGET MODEL: Grok Imagine (xAI)
- video_prompt_en: compact 40-80 words
- VISUAL HOOK FIRST: first 8-12 words must be the strongest image
- Use stylistic references: "shot like a Roger Deakins documentary fragment"
- NO Audio block inside prompt
- Single action only
`;

async function refineWithRouter({ frame, analysis, storyboard, target, seedPrompt, seedImage }) {
  if (!process.env.OPENROUTER_API_KEY) return null;

  const targetRules = target === "grok" ? GROK_RULES : VEO3_RULES;
  const systemPrompt = `${SYSTEM_PROMPT_BASE}\n${targetRules}`;

  const characterContext = (storyboard?.character_lock || [])
    .map((c) => {
      const parts = [
        c.name,
        c.age ? `${c.age}y` : null,
        c.face_features || c.description,
        c.hair,
        c.clothing,
        c.physical_condition,
      ].filter(Boolean);
      return parts.join(", ");
    })
    .join(" | ");

  const userMessage = `Refine this frame into a final ${target.toUpperCase()} prompt. Keep all locks. Return JSON only.

FRAME ID: ${frame.id || "frame"}
DURATION: ${frame.duration || 3}s
ASPECT RATIO: ${storyboard?.aspect_ratio || "9:16"}

CHARACTER LOCK (verbatim — do NOT paraphrase):
${characterContext || "(none specified)"}

SCENE DESCRIPTION (Russian):
${frame.description_ru || "(none)"}

VOICEOVER (Russian, narrator):
${frame.vo_ru || "(none)"}

CAMERA:
${frame.camera || "(infer from scene)"}

EXISTING SFX:
${frame.sfx || "(infer from scene)"}

SEED IMAGE PROMPT (starting frame):
${seedImage}

SEED VIDEO PROMPT (refine this):
${seedPrompt}

VISUAL ANALYSIS (if uploaded image present):
- Camera: ${analysis?.camera || "preserve uploaded composition"}
- Lighting: ${analysis?.lighting || "preserve uploaded lighting"}
- Emotion: ${analysis?.emotion || frame.emotion || "preserve emotional tone"}
- Continuity: ${analysis?.continuity || "same character, same location"}

Generate the FINAL ${target.toUpperCase()} prompt following all rules above. Output JSON only.`;

  const result = await callOpenRouter({
    taskType: TASK_TYPES.VIDEO_PROMPT_REFINEMENT,
    systemPrompt,
    userMessage,
    responseFormat: { type: "json_object" },
    appTitle: "NeuroCine Video Director v2.2",
  });

  if (!result.ok || !result.content) return null;

  try {
    const parsed = JSON.parse(result.content);
    return { ...parsed, _model_used: result.model_used };
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const frame = body.frame || {};
    const analysis = body.analysis || {};
    const storyboard = body.storyboard || {};
    const target = normalizeTarget(body.target || frame.target || storyboard?.export_meta?.target || "veo3");
    const styleProfile = body.styleProfile || getStyleProfile(body.projectType, body.stylePreset);

    // Build seed prompts locally first (deterministic baseline)
    const seedImage = stripBannedWords(buildImagePrompt({ frame, storyboard, target }));
    const seedVideo = stripBannedWords(buildVideoPromptFor({ frame, storyboard, target }));

    // Refine via cheap model (Haiku 4.5 default)
    let api = null;
    try {
      api = await refineWithRouter({
        frame,
        analysis,
        storyboard,
        target,
        seedPrompt: seedVideo,
        seedImage,
      });
    } catch {}

    const video_prompt_en = stripBannedWords(api?.video_prompt_en || seedVideo);
    const image_prompt_en = stripBannedWords(api?.image_prompt_en || seedImage);
    const sfx = api?.sfx || analysis.sfx || frame.sfx || "subtle realistic ambience";
    const negative_prompt = api?.negative_prompt || NEGATIVE_PROMPT_BASE;

    const validation = validateFramePrompts({
      frame: { ...frame, video_prompt_en, image_prompt_en },
      storyboard,
      target,
    });

    return Response.json({
      video_prompt_en,
      image_prompt_en,
      sfx,
      negative_prompt,
      target,
      validation,
      model_used: api?._model_used || "local_only",
      notes_ru:
        api?.notes_ru ||
        `Промт построен под ${target === "veo3" ? "Veo 3" : "Grok Imagine"} с инжекцией character lock и realism anchors. Banned-токены вычищены.`,
    });
  } catch (e) {
    return Response.json({ error: e.message || "Video API error" }, { status: 500 });
  }
}
