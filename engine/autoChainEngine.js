// NeuroCine Auto-Chain Strict Engine v2.1
// Separate optional engine: does not replace storyboard/director engines.
// Purpose: build chained storyboard PART prompts and video prompt packs strictly from existing storyboard scenes.

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripPromptPrefix(value = "") {
  return cleanText(value)
    .replace(/^SCENE PRIMARY FOCUS:\s*/i, "")
    .replace(/^ANIMATE CURRENT FRAME:\s*/i, "");
}

function frameNumber(scene, index = 0) {
  const raw = String(scene?.id || "").match(/\d+/)?.[0];
  return raw ? Number(raw) : index + 1;
}

function frameLabel(scene, index = 0) {
  return `F${String(frameNumber(scene, index)).padStart(2, "0")}`;
}

function sceneText(scene = {}) {
  return stripPromptPrefix(scene.image_prompt_en || scene.description_en || scene.description_ru || scene.vo_ru || "");
}

function sceneMotion(scene = {}) {
  return stripPromptPrefix(scene.video_prompt_en || scene.motion || scene.description_ru || scene.vo_ru || "");
}

function getShotType(scene = {}, i = 0) {
  const shots = ["wide establishing shot", "handheld medium shot", "close-up", "over-the-shoulder shot"];
  return cleanText(scene.shot_type || scene.camera || shots[i % shots.length]);
}

export function splitScenesIntoParts(scenes = [], partSize = 4) {
  const size = Math.max(1, Number(partSize) || 4);
  const parts = [];
  for (let i = 0; i < scenes.length; i += size) {
    parts.push(scenes.slice(i, i + size));
  }
  return parts;
}

export function buildWorldLock({ storyboard, styleProfile, chainMode = "worldHero", strictLevel = "hard" } = {}) {
  const globalStyle = cleanText(styleProfile?.style_lock || storyboard?.global_style_lock || "live-action cinematic realism, camera-photographed image, natural imperfections, documentary physical reality, 35mm film grain");
  const world = cleanText(storyboard?.world_lock || storyboard?.project_type || "same cinematic universe");
  const chars = Array.isArray(storyboard?.character_lock) ? storyboard.character_lock : [];
  const heroLine = chars.length
    ? chars.map((c, i) => `${c.name || `Character ${i + 1}`}: ${cleanText([c.description, c.age, c.clothing, c.hair, c.face_features, c.physical_condition].filter(Boolean).join("; "))}`).join("\n")
    : "If the script repeats the same hero, keep the same face, proportions, clothing and emotional state whenever that hero appears.";

  return `AUTO-CHAIN STRICT ENGINE — SOURCE-OF-TRUTH MODE

SOURCE OF TRUTH:
Use ONLY the provided storyboard scenes from the existing Scenario/Storyboard.
Do NOT invent new plot events, new locations, new actions, or new important objects.
If a detail is not present in a frame description, keep it neutral and minimal.

CHAIN MODE:
${chainMode === "worldOnly" ? "WORLD ONLY — characters may change when the scenario changes, but the same world/style must remain locked." : "WORLD + HERO — the world stays locked, and recurring hero identity stays locked whenever the scenario returns to that hero."}

STRICTNESS:
${strictLevel === "maximum" ? "MAXIMUM — literal execution only. No decorative narrative expansion." : strictLevel === "soft" ? "SOFT — keep cinematic polish, but never contradict the scenario." : "HARD — cinematic framing is allowed, but story content must remain literal."}

WORLD LOCK:
All frames exist in the SAME cinematic universe.
World identity: ${world}
Style identity: ${globalStyle}
Maintain the same historical period, environment logic, lighting family, color grading, texture density, lens language and documentary realism across all generated PARTS.

HERO / CHARACTER LOCK:
${heroLine}
Do not force the hero into a frame where the scenario does not include them.
Do not replace a recurring hero with a different face when the hero appears.

REFERENCE RULE:
Use uploaded previous PART image only as a visual DNA reference: style, lighting, texture, world continuity and recurring character identity.
Do NOT copy the same composition into every new frame.
New frames must follow their own scenario descriptions.

NEGATIVE LOCK:
No modern objects, no modern clothes, no clean fantasy armor, no fantasy magic, no cartoon, no anime, no illustration, no painting, no UI, no subtitles, no watermark.`;
}

export function buildAutoChainPartPrompt({ storyboard, styleProfile, partScenes = [], partIndex = 0, totalScenes = 0, partSize = 4, chainMode = "worldHero", strictLevel = "hard", referenceMode = "previousPart" } = {}) {
  if (!partScenes.length) return "";
  const start = frameNumber(partScenes[0], partIndex * partSize);
  const end = frameNumber(partScenes[partScenes.length - 1], partIndex * partSize + partScenes.length - 1);
  const rows = Math.ceil(partScenes.length / 2);
  const refText = referenceMode === "heroAndPrevious"
    ? "Use the uploaded HERO ANCHOR image and the uploaded PREVIOUS PART image as references. Hero anchor fixes identity; previous PART fixes world/style continuity."
    : referenceMode === "heroOnly"
      ? "Use the uploaded HERO ANCHOR image only for recurring hero identity and style DNA."
      : "Use the uploaded PREVIOUS PART image as visual reference for world/style continuity.";

  const frameBlocks = partScenes.map((s, localIdx) => {
    const globalIdx = partIndex * partSize + localIdx;
    const label = frameLabel(s, globalIdx);
    return `${label}:
SCENARIO INPUT (STRICT): ${sceneText(s)}
VO MEANING: ${cleanText(s.vo_ru || "")}
SHOT TYPE: ${getShotType(s, localIdx)}
COMPOSITION RULE: visualize only the described action/subject/environment; keep cinematic composition but do not add new story events.
SFX NOTE: ${cleanText(s.sfx || "")}`;
  }).join("\n\n");

  return `STORYBOARD GRID PART ${partIndex + 1} — AUTO-CHAIN STRICT CONTINUATION
FRAMES: F${String(start).padStart(2, "0")}–F${String(end).padStart(2, "0")} of ${totalScenes || storyboard?.scenes?.length || end} total

REFERENCE INPUT:
${refText}
This PART must continue the same project, but each frame must follow its own scenario input.

FORMAT:
2 columns × ${rows} rows — exactly ${partScenes.length} equal cells.
Each cell format: 9:16 portrait.
Overall image: natural storyboard grid canvas, do NOT force the overall canvas to 9:16.

FRAME LABELS:
${partScenes.map((s, i) => frameLabel(s, partIndex * partSize + i)).join(", ")} only.
Small white text, top-left corner of each cell.
No other text.

${buildWorldLock({ storyboard, styleProfile, chainMode, strictLevel })}

MOTION / EDITING CONTINUITY:
The PART should feel like a sequence cut from the same film.
Maintain timeline order left-to-right, top-to-bottom.
No teleportation unless the scenario itself changes location.
Scene changes are allowed ONLY when the scenario frame describes a new place/action.

FRAMES IN THIS PART:
${frameBlocks}

FINAL CHECK:
Exactly ${partScenes.length} frames.
Every frame matches its SCENARIO INPUT only.
Same world/style across all cells.
Recurring hero identity remains consistent only where the scenario includes the hero.
No extra text except frame labels.`;
}

export function buildAutoChainAllParts({ storyboard, styleProfile, partSize = 4, chainMode = "worldHero", strictLevel = "hard", referenceMode = "previousPart" } = {}) {
  const scenes = storyboard?.scenes || [];
  const parts = splitScenesIntoParts(scenes, partSize);
  return parts.map((partScenes, i) => buildAutoChainPartPrompt({
    storyboard, styleProfile, partScenes, partIndex: i, totalScenes: scenes.length,
    partSize, chainMode, strictLevel, referenceMode
  }));
}

export function buildAutoVideoPrompt(scene = {}, { storyboard, styleProfile, chainMode = "worldHero" } = {}) {
  const label = frameLabel(scene, 0);
  const visual = sceneText(scene);
  const motion = sceneMotion(scene);
  const style = cleanText(styleProfile?.style_lock || storyboard?.global_style_lock || "cinematic realism, 35mm film grain, natural light");
  return `ANIMATE CURRENT FRAME — ${label}

SOURCE OF TRUTH:
Animate ONLY what is present in this frame and its storyboard description. Do not invent new plot events.

VISUAL CONTEXT:
${visual}

ACTION / MOTION:
${motion || visual}

CONTINUITY:
Maintain the same cinematic universe, lighting, color grading, texture density and camera realism.
${chainMode === "worldOnly" ? "Characters may vary according to the scenario, but the world/style must remain consistent." : "If the recurring hero appears, keep the same face, outfit, body language and emotional state."}

CAMERA:
Subtle cinematic motion, realistic handheld micro-movement, physical lens behavior, no artificial zoom jumps.

CINEMATOGRAPHY:
${style}

SFX:
${cleanText(scene.sfx || "subtle environmental ambience")}

RESTRICTIONS:
No subtitles, no UI, no watermark, no modern objects unless explicitly present in the scenario.`;
}

export function buildAutoVideoPack({ storyboard, styleProfile, partScenes = [], chainMode = "worldHero" } = {}) {
  return partScenes.map((s, i) => buildAutoVideoPrompt(s, { storyboard, styleProfile, chainMode })).join("\n\n---\n\n");
}

export function buildAutoChainJson({ storyboard, styleProfile, partSize = 4, chainMode = "worldHero", strictLevel = "hard", referenceMode = "previousPart" } = {}) {
  const scenes = storyboard?.scenes || [];
  const parts = splitScenesIntoParts(scenes, partSize);
  return {
    engine: "NeuroCine Auto-Chain Strict Engine",
    version: "2.1",
    project_name: storyboard?.project_name || "NeuroCine Project",
    mode: chainMode,
    strict_level: strictLevel,
    reference_mode: referenceMode,
    part_size: partSize,
    total_frames: scenes.length,
    parts: parts.map((partScenes, i) => ({
      part: i + 1,
      frame_range: `${frameLabel(partScenes[0], i * partSize)}-${frameLabel(partScenes[partScenes.length - 1], i * partSize + partScenes.length - 1)}`,
      image_prompt: buildAutoChainPartPrompt({ storyboard, styleProfile, partScenes, partIndex: i, totalScenes: scenes.length, partSize, chainMode, strictLevel, referenceMode }),
      video_pack: buildAutoVideoPack({ storyboard, styleProfile, partScenes, chainMode }),
      frames: partScenes.map((s, localIdx) => ({
        id: s.id || frameLabel(s, i * partSize + localIdx),
        label: frameLabel(s, i * partSize + localIdx),
        scenario_input: sceneText(s),
        vo_ru: s.vo_ru || "",
        sfx: s.sfx || "",
        image_prompt_en: s.image_prompt_en || "",
        video_prompt_en: s.video_prompt_en || ""
      }))
    }))
  };
}
