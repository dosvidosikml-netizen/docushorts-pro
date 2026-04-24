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

// ─────────────────────────────────────────────────────────────────────────────
// VIRAL DIRECTOR ENGINE v3 — every frame must be visually interesting.
// VO -> cinematic interpretation -> strong T2V scene, not literal boring illustration.
// ─────────────────────────────────────────────────────────────────────────────
function viralText(frame = {}) {
  return `${frame.voice || frame.vo || ""} ${frame.visual || ""} ${frame.text_on_screen || ""}`.toLowerCase();
}
function detectViralStoryTheme(frame = {}) {
  const t = viralText(frame);
  if (/розуэлл|roswell|нло|ufo|alien|иноплан|не\s*человеч|mj-12|mj12|aquarius|аквариус|пентагон|pentagon/.test(t)) return "UFO";
  if (/убий|маньяк|crime|murder|serial|forensic|полици|детектив/.test(t)) return "CRIME";
  if (/цру|cia|fbi|фбр|секрет|classified|архив|документ|заговор|cover.?up|редакт|redacted/.test(t)) return "CONSPIRACY";
  if (/война|war|soldier|солдат|army|military|военн/.test(t)) return "WAR";
  if (/ужас|horror|ghost|призрак|демон|curse|проклят/.test(t)) return "HORROR";
  if (/учен|science|лаборатор|experiment|эксперимент|physics|физик/.test(t)) return "SCIENCE";
  return "GENERAL";
}
function detectViralBeat(frame = {}, index = 0, total = 1) {
  const t = viralText(frame);
  if (index === 0) return "HOOK_SHOCK";
  if (index >= total - 1 || /либо|propaganda|пропаганд|финал|до сих пор|still classified|засекречен/.test(t)) return "FINAL_TWIST";
  if (/не\s*человеч|unknown|не знаем|аномал|anomaly|impossible|невозмож|17\s*000|17000|без двигателя|without engine/.test(t)) return "ANOMALY";
  if (/48|собран|облом|debris|crash|кратер|press|пресса|до того/.test(t)) return "ACTION_COVERUP";
  if (/документ|архив|фбр|fbi|гриф|совершенно секретно|classified|project|проект|mj-12|mj12|aquarius|аквариус/.test(t)) return "PROOF_WITH_THREAT";
  if (/цру|cia|группа|двенадцать|президенты|не в списке|officer|офицер|перевели|transferred/.test(t)) return "PARANOIA_POWER";
  if (/2017|пентагон|pentagon|video|видео|объекты|objects|рассекретил/.test(t)) return "TECH_REVEAL";
  return "VISUAL_CONFLICT";
}
function buildViralRuSummary(frame = {}, index = 0, total = 1) {
  const vo = String(frame.voice || frame.vo || "").trim();
  const theme = detectViralStoryTheme(frame);
  const beat = detectViralBeat(frame, index, total);
  if (theme === "UFO") {
    if (beat === "HOOK_SHOCK") return "Ночной Розуэлл: военные находят четыре накрытых нечеловеческих тела, одна серая рука видна из-под простыни.";
    if (beat === "ACTION_COVERUP") return "Военные в спешке вывозят обломки и скрытые тела до приезда прессы, фары режут пыль и дым.";
    if (beat === "PROOF_WITH_THREAT") return "Секретная папка ФБР/Аквариус рядом с размытыми фото вскрытия; агент рукой закрывает часть доказательств.";
    if (beat === "PARANOIA_POWER") return "Тайная комната MJ-12: двенадцать теневых фигур смотрят на улики, президентский портрет отвернут.";
    if (beat === "TECH_REVEAL") return "Военный инфракрасный экран фиксирует НЛО, объект резко ускоряется без двигателя, приборы срываются в глитч.";
    if (beat === "FINAL_TWIST") return "Финальный раскол: с одной стороны скрытый контакт, с другой — комната пропаганды, всё связано папкой Аквариус.";
  }
  return `Кадр ${index + 1}: сильная сцена с визуальным конфликтом и скрытой угрозой. VO: ${vo || "без VO"}`;
}
function buildViralDirectorScene(frame = {}, index = 0, total = 1) {
  const original = String(frame.visual || frame.image_prompt || frame.imgPrompt_EN || "").trim();
  const vo = String(frame.voice || frame.vo || "").trim();
  const t = viralText(frame);
  const theme = detectViralStoryTheme(frame);
  const beat = detectViralBeat(frame, index, total);
  let scene = "";
  if (theme === "UFO") {
    if (beat === "HOOK_SHOCK" || /не\s*человеч|четыре тела|four bodies|bodies/.test(t)) scene = "night Roswell crash-site recovery, four covered non-human bodies on military stretchers, one grey alien hand visible under a torn sheet, floodlights, dust, soldiers freezing in shock";
    else if (beat === "ACTION_COVERUP") scene = "1947 Roswell desert cover-up operation, military trucks loading strange metallic debris and covered non-human forms before reporters arrive, headlights cutting through dust, urgent secrecy";
    else if (beat === "PROOF_WITH_THREAT") scene = "classified FBI/Aquarius folder opened under a hard desk lamp, redacted pages beside blurred alien autopsy photographs, agent hand covering evidence, shadow figure behind frosted glass";
    else if (beat === "PARANOIA_POWER") scene = "MJ-12 secret room, twelve faceless officials around a glowing evidence table, presidential portrait deliberately turned away, alien silhouette reflected in black glass, surveillance paranoia";
    else if (beat === "TECH_REVEAL") scene = "declassified Pentagon infrared tracking screen, impossible UFO accelerating over dark ocean, pilots' instruments shaking, speed numbers glitching, no engine trail, cold military tension";
    else if (beat === "FINAL_TWIST") scene = "split reality finale: one side secret alien contact behind military glass, other side propaganda broadcast control room, same classified Aquarius file connecting both worlds";
    else scene = "Cold War UFO evidence scene, hidden alien trace visible in the background, classified material in foreground, every object suggesting a cover-up";
  } else if (theme === "CRIME") scene = beat === "HOOK_SHOCK" ? "clean non-graphic crime scene reveal, police lights slicing through rain, a single impossible clue in the foreground, detective silhouette stopping mid-step" : "forensic evidence scene with one disturbing contradiction, case file, suspect shadow, police light reflections, high tension without graphic violence";
  else if (theme === "CONSPIRACY") scene = beat === "HOOK_SHOCK" ? "secret evidence room with a forbidden object under glass, redacted files scattered, shadow officials watching from behind blinds, immediate visual threat" : "classified document scene with hidden photograph, surveillance monitors, gloved hand removing evidence, paranoia and cover-up in every layer";
  else if (theme === "WAR") scene = beat === "HOOK_SHOCK" ? "battlefield aftermath without gore, abandoned military vehicle, strange classified object in the mud, soldiers frozen under searchlights, smoke and urgency" : "military operation with moving troops, hidden evidence, searchlights, dust, urgent radio tension, no static archive shot";
  else if (theme === "HORROR") scene = "dark corridor horror reveal, human figure in foreground, unnatural silhouette behind, flickering light, impossible shadow geometry, dread and motion";
  else if (theme === "SCIENCE") scene = "high-stakes laboratory experiment going wrong, instruments vibrating, impossible anomaly forming behind glass, scientists reacting, cinematic tension";
  else scene = (original || vo || "high-retention cinematic scene with clear visual conflict") + ", visible conflict, hidden threat, strong foreground object, background reveal, cinematic tension";
  return { theme, beat, scene_EN: `${scene}. Frame meaning: ${vo || original}.`, visual_RU: buildViralRuSummary(frame, index, total) };
}
function buildViralImagePrompt(frame = {}, index = 0, total = 1, style = "") {
  const v = buildViralDirectorScene(frame, index, total);
  return sanitizePipelineModeLeak([
    v.scene_EN,
    "dominant visual hook, no boring archive-only shot, no neutral talking head, no static portrait",
    "cinematic documentary thriller, high contrast, strong foreground object, background reveal",
    style,
    "no subtitles, no UI, no watermark"
  ].filter(Boolean).join(", "), { allowXray: false, frame });
}
function buildViralVideoPrompt(frame = {}, index = 0, total = 1, style = "") {
  const v = buildViralDirectorScene(frame, index, total);
  const sfx = frame.sfx || "low ominous rumble, radio static, wind, distant metal impact";
  return sanitizePipelineModeLeak([
    "ANIMATE CURRENT FRAME:",
    v.scene_EN,
    "camera pushes or tracks through the evidence, subject/object motion, dust/light/smoke movement, pattern-interrupt pacing",
    style,
    `Audio: ${sfx}`
  ].filter(Boolean).join(" "), { allowXray: false, frame });
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
    const viralScene = buildViralDirectorScene(frame, index, frames.length);
    const scene = buildViralImagePrompt(frame, index, frames.length, style) || frame.visual || frame.image_prompt || "";
    const motion = buildViralVideoPrompt(frame, index, frames.length, style) || frame.video_prompt || frame.vidPrompt_EN || scene;
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
      visual_ru: frame.visual_ru || viralScene.visual_RU,
      viral_theme: viralScene.theme,
      viral_beat: viralScene.beat,
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
