// lib/neurocineVideoPipeline.js
// NeuroCine Final Video Pipeline
// script JSON -> locked prompts -> image anchors -> video clips -> timeline package

export const DEFAULT_NEGATIVE_PROMPT = [
  "blur",
  "bad anatomy",
  "extra fingers",
  "duplicate people",
  "deformed face",
  "plastic skin",
  "low detail",
  "watermark",
  "text artifacts",
  "flat lighting",
  "oversaturated CGI",
  "inconsistent face",
  "changed outfit",
  "identity drift"
].join(", ");

export function normalizeText(value = "", max = 220) {
  const s = String(value || "").replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max).trim() : s;
}

export function buildIdentityLock({ characterDNA = {}, seed = "777777", referenceImage = "" } = {}) {
  const dna = {
    name: characterDNA.name || "Alex",
    gender: characterDNA.gender || "male",
    age: characterDNA.age || "28",
    face: characterDNA.face || "sharp jawline, expressive eyes",
    hair: characterDNA.hair || "short dark hair",
    outfit: characterDNA.outfit || "black hoodie",
    style: characterDNA.style || "modern cinematic",
    lighting: characterDNA.lighting || "high contrast shadows",
    camera: characterDNA.camera || "35mm close-up",
  };

  const identity = [
    dna.name,
    dna.gender,
    `${dna.age} years old`,
    dna.face,
    dna.hair,
    `wearing ${dna.outfit}`,
    dna.style,
    dna.lighting,
    dna.camera,
  ].join(", ");

  return {
    dna,
    seed,
    referenceImage,
    identity,
    lockPhrase:
      "same character, consistent face, same hairstyle, same outfit, same lighting style, no identity drift",
  };
}


function pipelineHasVisibleCharacter(frame = {}, prompt = "") {
  const chars = Array.isArray(frame.characters_in_frame) ? frame.characters_in_frame.filter(Boolean) : [];
  if (chars.length > 0) return true;
  const t = `${frame.visual || ""} ${frame.voice || ""} ${prompt || ""}`.toLowerCase();
  return /\b(agent|officer|detective|witness|man|woman|person|figure|soldier|president|official|scientist|архивист|агент|офицер|человек|женщина|мужчина|солдат|учёный|ученый|свидетель)\b/i.test(t);
}

function sanitizePipelineModeLeak(text = "", { allowXray = false, frame = null } = {}) {
  let t = String(text || "").replace(/\bANIMATE CURRENT FRAME:\s*ANIMATE CURRENT FRAME:/gi, "ANIMATE CURRENT FRAME:");
  if (!allowXray) {
    const xrayPatterns = [
      /\bX[-\s]?ray\s+(?:medical\s+)?fluoroscopy\s+imaging\s+style\.?:?/gi,
      /\bX[-\s]?ray\s+fluoroscopy\s+style\.?:?/gi,
      /\bX[-\s]?ray\s+visualization\.?:?/gi,
      /\bfluoroscopic\s+visualization:?/gi,
      /\bfluoroscopy\s+style\.?:?/gi,
      /\bmedical\s+scan\s+style\.?:?/gi,
      /\bclinical\s+scan\s+annotations?[^,.]*(?:[,.]|$)/gi,
      /\bneon\s+blue\s+(?:glowing\s+)?skeletal[^,.]*(?:[,.]|$)/gi,
      /\bskeletal\s+(?:jeep|soldier|body|anatomical|structures?)[^,.]*(?:[,.]|$)/gi,
      /\bdeep\s+black\s+field[^,.]*(?:[,.]|$)/gi,
      /\bsubsurface\s+skeletal\s+glow[^,.]*(?:[,.]|$)/gi,
    ];
    for (const re of xrayPatterns) t = t.replace(re, "");
  }
  if (!pipelineHasVisibleCharacter(frame || {}, t)) {
    t = t.replace(/preserve same face and outfit(?:\s+for visible character only)?[, ]*/gi, "");
    t = t.replace(/same character, consistent face[^,.]*(?:[,.]|$)/gi, "");
    t = t.replace(/no identity drift[, ]*/gi, "");
  }
  return t.replace(/,\s*,+/g, ",").replace(/\s+,/g, ",").replace(/\s+/g, " ").replace(/^\s*,\s*|\s*,\s*$/g, "").trim();
}

export function enrichFramesForVideo({ frames = [], identityLock, styleLock = "" } = {}) {
  const style = styleLock || "cinematic, high contrast, consistent color grading, same mood, trailer-like continuity";
  const allowXray = /\bx[-\s]?ray\b|fluoroscopy|scientific blueprint/i.test(style);

  return frames.map((frame, index) => {
    const continuity =
      index === 0
        ? "opening shot, establish story world"
        : "continue previous scene logic, preserve lighting continuity";

    const ref = identityLock.referenceImage ? "use reference image as identity anchor" : "";
    const seed = identityLock.seed ? `seed ${identityLock.seed}` : "";
    const scene = frame.visual || frame.image_prompt || "";
    const motion = frame.video_prompt || frame.vidPrompt_EN || scene;
    const visibleChar = pipelineHasVisibleCharacter(frame, `${scene} ${motion}`);

    const image_prompt = normalizeText(
      sanitizePipelineModeLeak(
        [
          scene,
          visibleChar ? identityLock.identity : "",
          continuity,
          style,
          visibleChar ? identityLock.lockPhrase : "",
          visibleChar ? ref : "",
          seed,
        ].filter(Boolean).join(", "),
        { allowXray, frame }
      ),
      320
    );

    const video_prompt = normalizeText(
      sanitizePipelineModeLeak(
        [
          motion.replace(/^ANIMATE CURRENT FRAME:\s*/i, ""),
          "smooth image-to-video animation",
          "camera motion + subject/object motion + environment motion",
          visibleChar ? "preserve same face and outfit" : "no character identity lock; focus on scene objects and environment",
          continuity,
          style,
          visibleChar ? ref : "",
          seed,
        ].filter(Boolean).join(", "),
        { allowXray, frame }
      ),
      320
    );

    return {
      ...frame,
      id: frame.id || `frame_${String(index + 1).padStart(2, "0")}`,
      time: frame.time || frame.timecode || `${index * 3}-${index * 3 + 3}s`,
      image_prompt,
      video_prompt,
      negative_prompt: frame.negative_prompt || DEFAULT_NEGATIVE_PROMPT,
      seed: identityLock.seed,
      reference_image: identityLock.referenceImage,
      continuity_note: continuity,
      duration: frame.duration || 3,
    };
  });
}

export async function generateImageAnchors({ frames, imageProvider, onProgress }) {
  if (typeof imageProvider !== "function") {
    throw new Error("imageProvider function is required");
  }

  const output = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    onProgress?.({
      stage: "image",
      index: i,
      total: frames.length,
      frameId: frame.id,
      message: `Generating image anchor ${i + 1}/${frames.length}`,
    });

    const image = await imageProvider({
      prompt: frame.image_prompt,
      negative_prompt: frame.negative_prompt,
      seed: frame.seed,
      reference_image: frame.reference_image,
      frame,
    });

    output.push({ ...frame, image });
  }

  return output;
}

export async function generateVideoClips({ frames, videoProvider, onProgress }) {
  if (typeof videoProvider !== "function") {
    throw new Error("videoProvider function is required");
  }

  const output = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];

    onProgress?.({
      stage: "video",
      index: i,
      total: frames.length,
      frameId: frame.id,
      message: `Generating video clip ${i + 1}/${frames.length}`,
    });

    const video = await videoProvider({
      prompt: frame.video_prompt,
      image: frame.image,
      seed: frame.seed,
      reference_image: frame.reference_image,
      frame,
    });

    output.push({ ...frame, video });
  }

  return output;
}

export function buildTimeline(frames = []) {
  let cursor = 0;

  return frames.map((frame, index) => {
    const duration = Number(frame.duration || 3);

    const item = {
      id: frame.id || `clip_${index + 1}`,
      start: cursor,
      duration,
      video: frame.video,
      image: frame.image,
      vo: frame.vo || frame.voice || "",
      sfx: frame.sfx || "",
      transition:
        index === 0
          ? "cold_open"
          : index % 4 === 0
          ? "pattern_interrupt"
          : index % 3 === 0
          ? "reveal_cut"
          : "hard_cut",
      continuity_note: frame.continuity_note || "",
    };

    cursor += duration;
    return item;
  });
}

export async function renderFinalTimeline({ timeline, renderProvider, onProgress }) {
  if (typeof renderProvider !== "function") {
    return {
      status: "timeline_ready",
      videoUrl: "",
      timeline,
      note:
        "No renderProvider was supplied. Timeline package is ready for external editor or renderer.",
    };
  }

  onProgress?.({
    stage: "render",
    index: 0,
    total: 1,
    message: "Rendering final video",
  });

  const videoUrl = await renderProvider({ timeline });

  return {
    status: "rendered",
    videoUrl,
    timeline,
  };
}

export async function runNeuroCineFinalPipeline({
  scriptPackage,
  characterDNA,
  seed = "777777",
  referenceImage = "",
  styleLock = "",
  imageProvider,
  videoProvider,
  renderProvider,
  onProgress,
}) {
  if (!scriptPackage?.frames?.length) {
    throw new Error("scriptPackage.frames is required");
  }

  const identityLock = buildIdentityLock({
    characterDNA: characterDNA || scriptPackage.character_dna_used || {},
    seed,
    referenceImage,
  });

  onProgress?.({
    stage: "prepare",
    index: 0,
    total: scriptPackage.frames.length,
    message: "Preparing locked prompts",
  });

  const preparedFrames = enrichFramesForVideo({
    frames: scriptPackage.frames,
    identityLock,
    styleLock,
  });

  const imageFrames = await generateImageAnchors({
    frames: preparedFrames,
    imageProvider,
    onProgress,
  });

  const videoFrames = await generateVideoClips({
    frames: imageFrames,
    videoProvider,
    onProgress,
  });

  const timeline = buildTimeline(videoFrames);

  const render = await renderFinalTimeline({
    timeline,
    renderProvider,
    onProgress,
  });

  return {
    status: render.status,
    videoUrl: render.videoUrl,
    identityLock,
    frames: videoFrames,
    timeline,
    scriptPackage,
  };
}
