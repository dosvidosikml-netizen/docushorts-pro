import { STYLE_LOCKS, VIDEO_LOCK, NEGATIVE_LOCK } from "./sceneEngine";

export const PROJECT_TYPES = {
  film: {
    label: "Фильм / реализм",
    lock: "live-action cinematic realism, camera-photographed image, natural imperfections, documentary physical reality"
  },
  animation: {
    label: "Мультфильм / animation",
    lock: "animation production design, clean readable silhouettes, controlled stylization, consistent character model"
  },
  anime: {
    label: "Аниме",
    lock: "cinematic anime direction, dramatic composition, consistent anime character model, controlled lighting"
  },
  comic: {
    label: "Комикс / graphic novel",
    lock: "graphic novel panels, bold composition, illustrated texture, cinematic comic-book framing"
  },
  music: {
    label: "Музыкальный клип",
    lock: "music video visual rhythm, stylized cinematic pacing, dynamic camera energy, strong atmosphere"
  }
};

export const STYLE_PRESETS = {
  cinematic: {
    label: "Cinematic documentary",
    family: "film",
    lock: STYLE_LOCKS.cinematic
  },
  dark: {
    label: "Dark history thriller",
    family: "film",
    lock: STYLE_LOCKS.dark
  },
  truecrime: {
    label: "True crime",
    family: "film",
    lock: STYLE_LOCKS.truecrime
  },
  war: {
    label: "War documentary",
    family: "film",
    lock: STYLE_LOCKS.war
  },
  animation2d: {
    label: "2D animation",
    family: "animation",
    lock: "2D cinematic animation, hand-painted backgrounds, expressive but grounded acting, clean shapes, consistent character sheet, no live-action photo realism"
  },
  animation25d: {
    label: "2.5D layered animation",
    family: "animation",
    lock: "2.5D animation, layered parallax-ready backgrounds, cinematic depth, painted textures, controlled character model, clean readable motion"
  },
  animation3d: {
    label: "3D cartoon",
    family: "animation",
    lock: "high-end 3D animated film look, stylized realistic materials, cinematic lighting, consistent character model, expressive posing"
  },
  stopmotion: {
    label: "Stop motion",
    family: "animation",
    lock: "stop-motion miniature set look, handmade tactile materials, real fabric texture, imperfect physical puppets, cinematic tabletop lighting"
  },
  animeDark: {
    label: "Dark anime",
    family: "anime",
    lock: "dark cinematic anime, dramatic shadows, detailed backgrounds, mature tone, consistent character sheet, filmic composition"
  },
  graphicNovel: {
    label: "Graphic novel",
    family: "comic",
    lock: "dark graphic novel illustration, inked cinematic panels, textured shadows, strong silhouettes, controlled panel composition"
  }
};

export function getStyleProfile(projectType = "film", stylePreset = "cinematic") {
  const type = PROJECT_TYPES[projectType] || PROJECT_TYPES.film;
  const preset = STYLE_PRESETS[stylePreset] || STYLE_PRESETS.cinematic;
  return {
    project_type: projectType,
    project_type_label: type.label,
    style_preset: stylePreset,
    style_label: preset.label,
    style_lock: `${type.lock}. ${preset.lock}`,
    negative_lock: NEGATIVE_LOCK
  };
}

export function buildScenarioLock(storyboard = {}, script = "", styleProfile = {}) {
  const scenes = storyboard?.scenes || [];
  return {
    script,
    project_name: storyboard?.project_name || "NeuroCine Project",
    total_duration: storyboard?.total_duration || 60,
    aspect_ratio: storyboard?.aspect_ratio || "9:16",
    global_style_lock: styleProfile.style_lock || storyboard?.global_style_lock || STYLE_LOCKS.cinematic,
    global_video_lock: storyboard?.global_video_lock || VIDEO_LOCK,
    character_lock: storyboard?.character_lock || [],
    rules: [
      "Сценарий является законом: нельзя менять событие кадра, порядок истории или смысл VO.",
      "Нельзя добавлять новых персонажей, новую эпоху, новую локацию или новый сюжетный поворот.",
      "Можно менять только операторский язык: ракурс, крупность, линзу, перспективу, композицию, глубину резкости.",
      "Image prompts всегда на английском и начинаются с SCENE PRIMARY FOCUS:",
      "Video prompts всегда на английском и начинаются с ANIMATE CURRENT FRAME:",
      "SFX должен быть внутри video prompt и отдельно в поле sfx.",
      "Без субтитров, UI, watermark, надписей и современных объектов, если их нет в сценарии."
    ],
    frames: scenes.map((s) => ({
      id: s.id,
      start: s.start,
      duration: s.duration,
      action: s.description_ru,
      vo_ru: s.vo_ru,
      sfx: s.sfx,
      image_prompt_en: s.image_prompt_en,
      video_prompt_en: s.video_prompt_en,
      continuity_note: s.continuity_note
    }))
  };
}

export function buildStoryGridPrompt(storyboard = {}, styleProfile = {}) {
  const scenes = storyboard?.scenes || [];
  const n = scenes.length || 12;
  const cols = n <= 8 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const aspect = storyboard?.aspect_ratio || "9:16";
  const charLock = (storyboard?.character_lock || [])
    .map(c => `${c.name} — ${c.description}`)
    .join("\n");

  const framesEN = scenes.map((s, i) => {
    const en = (s.image_prompt_en || "")
      .replace(/^SCENE PRIMARY FOCUS:\s*/i, "")
      .trim();
    return `${i + 1}. ${en || s.vo_ru || ""}`;
  }).join("\n");

  return `STORYBOARD GRID — ${storyboard.project_name || "NeuroCine Project"}
FORMAT: Vertical ${aspect}
TOTAL FRAMES: ${n}
GRID LAYOUT: ${cols} columns × ${rows} rows — exactly ${n} equal cells, no more, no less

CRITICAL LAYOUT RULES:
- Generate EXACTLY ${n} frames. Not ${n - 1}, not ${n + 1}. Exactly ${n}.
- Arrange them in a strict ${cols}×${rows} grid with equal-size cells
- Every cell must show a different scene from the story
- Each cell must be in ${aspect} aspect ratio
- No text, no numbers, no frame labels, no subtitles, no UI, no watermark anywhere

STYLE LOCK:
${styleProfile.style_lock || storyboard.global_style_lock || STYLE_LOCKS.cinematic}

${charLock ? `CHARACTER LOCK (maintain across all frames):\n${charLock}\n` : ""}SCENARIO LOCK:
Do not change story order. Preserve same characters, locations, chronology, emotional logic and visual continuity across all ${n} cells.

FRAMES (in order, left-to-right, top-to-bottom):
${framesEN}`;
}

export function buildExplorePrompt(frame = {}, storyboard = {}, styleProfile = {}, variantCount = 4) {
  const base = (frame.image_prompt_en || "")
    .replace(/^SCENE PRIMARY FOCUS:\s*/i, "")
    .trim() || frame.description_ru || frame.vo_ru || "selected storyboard frame";

  const charLock = (storyboard?.character_lock || [])
    .map(c => `${c.name}: ${c.description}`)
    .join("\n");

  return `ULTRA CINEMATIC VARIATION GRID — DIRECTOR MODE

Create a single vertical 9:16 image arranged as a strict 2x2 grid containing 4 clearly distinct shot variations of the exact same locked storyboard frame: ${frame.id || "frame"}. Preserve the identical story event, character identity, wardrobe, location, time of day, emotional meaning, chronology, historical logic and genre across all four cells. Do not introduce new plot information or story-changing objects.

LOCKED FRAME ID: ${frame.id || "frame"}
TIME: ${frame.start ?? "?"}–${frame.end ?? "?"}s

BASE SCENE (reproduce this exact visual in all 4 cells — only camera changes):
${base}

${charLock ? `CHARACTER LOCK — MANDATORY IN ALL 4 CELLS:\n${charLock}\n` : ""}STYLE LOCK: ${styleProfile.style_lock || storyboard.global_style_lock || STYLE_LOCKS.cinematic}

SCENARIO LOCK — NON-NEGOTIABLE:
- same story event and props
- same character identity, face, age, wardrobe as described in CHARACTER LOCK above
- same location and time of day
- same emotional meaning
- same historical / genre logic
- no new characters, no new plot, no new objects that change the story

ALLOWED VARIATION AXES ONLY:
- camera angle, camera height, lens feeling, framing, composition, camera distance, depth of field

MANDATORY VARIATIONS:
A — EXTREME CLOSE-UP: intimate detail-driven composition focused on the key element or tense facial detail; very shallow depth of field; emotional tension.
B — LOW / GROUND ANGLE: low camera position with strong foreground texture, emphasizing physical presence and perspective weight; same event and layout.
C — WIDE ENVIRONMENTAL: wider spatial view showing the full location geometry, all characters and props in context; isolation and readable environment.
D — OBSTRUCTED / OVER-SHOULDER: layered composition with partial foreground obstruction or over-shoulder framing, documentary voyeuristic feeling, deeper spatial layering.

OUTPUT: one single image, strict 2x2 grid, four compositions visibly different only through cinematography choices, no text, no subtitles, no UI, no watermark, no labels.

NEGATIVE: ${NEGATIVE_LOCK}`;
}

export function build2KPrompt(frame = {}, variant = "A", storyboard = {}, styleProfile = {}) {
  return `SCENE PRIMARY FOCUS: recreate the selected Variant ${variant} as ONE final high-quality 2K frame.\n\nLOCKED FRAME ID: ${frame.id || "frame"}\nLOCKED STORY ACTION: ${frame.description_ru || "Preserve selected storyboard action."}\nLOCKED VO MEANING: ${frame.vo_ru || "Preserve the original meaning."}\n\nUSE THE UPLOADED SELECTED VARIANT AS THE VISUAL REFERENCE. Preserve its camera angle, composition, lens feeling, lighting direction, atmosphere, character pose and emotional tone.\n\nSTYLE LOCK:\n${styleProfile.style_lock || storyboard.global_style_lock || STYLE_LOCKS.cinematic}\n\nSTRICT CONTINUITY:\n- do not change the character identity\n- do not change costume / character model\n- do not change location, time, story event or emotion\n- do not add text, subtitles, UI or watermark\n- keep the frame ready for image-to-video animation\n\nQUALITY:\n2K clean cinematic frame, sharp subject focus where appropriate, realistic material textures, natural imperfections, film-level detail, controlled grain.\n\nNEGATIVE:\n${NEGATIVE_LOCK}`;
}

export function buildLocalImageAnalysis(frame = {}, variant = "A", styleProfile = {}) {
  return {
    frame_id: frame.id || "frame",
    variant,
    camera: "preserve the uploaded frame angle, framing and lens feeling",
    lighting: "preserve the uploaded frame lighting and atmosphere",
    subject_motion: "micro-movements only, matching the locked story action",
    environment_motion: "subtle physical movement in air, cloth, dust, smoke or weather where relevant",
    emotion: frame.emotion || "preserve the original emotional meaning",
    continuity: "same character, same location, same story event, same style lock",
    sfx: frame.sfx || "subtle room tone, breath, fabric movement, environmental texture",
    notes_ru: "Локальный анализ: изображение не было разобрано Vision-моделью, но video prompt будет построен строго по выбранному кадру и сценарию."
  };
}

export function buildVideoPrompt(frame = {}, analysis = {}, storyboard = {}, styleProfile = {}) {
  const sfx = analysis.sfx || frame.sfx || "subtle realistic ambience";
  return `ANIMATE CURRENT FRAME:\n\nLOCKED FRAME ID: ${frame.id || "frame"}\n\nAnimate the uploaded locked frame according to the original storyboard action only.\n\nSTORY ACTION LOCK:\n${frame.description_ru || "Preserve the selected frame story action."}\n\nVO MEANING LOCK:\n${frame.vo_ru || "Preserve the original voiceover meaning."}\n\nVISUAL LOCK FROM IMAGE ANALYSIS:\nCamera: ${analysis.camera || "preserve uploaded composition and lens feeling"}.\nLighting: ${analysis.lighting || "preserve uploaded lighting"}.\nEmotion: ${analysis.emotion || frame.emotion || "preserve emotional tone"}.\nContinuity: ${analysis.continuity || "same character, same location, same story event"}.\n\nMOTION DESIGN:\n${analysis.subject_motion || "Add restrained realistic micro-movements matching the locked action."}\n${analysis.environment_motion || "Add subtle environmental motion: air, cloth, particles, smoke, weather or light shift where relevant."}\n\nCAMERA BEHAVIOR:\nOrganic handheld micro-drift only unless the frame requires a slow push-in. No floaty movement, no sudden invented action, no scene change.\n\nSTYLE LOCK:\n${styleProfile.style_lock || storyboard.global_style_lock || STYLE_LOCKS.cinematic}\n\nPHYSICAL REALISM:\n${storyboard.global_video_lock || VIDEO_LOCK}. Weight, inertia, friction, contact points and material response must feel real.\n\nFORBIDDEN:\nDo not change character, face, costume, location, timeline, emotion, story event, VO meaning, style, era. No subtitles, no UI, no watermark.\n\nSFX: ${sfx}`;
}

export function compactFrameForModel(frame = {}) {
  return {
    id: frame.id,
    start: frame.start,
    duration: frame.duration,
    beat_type: frame.beat_type,
    emotion: frame.emotion,
    description_ru: frame.description_ru,
    image_prompt_en: frame.image_prompt_en,
    video_prompt_en: frame.video_prompt_en,
    vo_ru: frame.vo_ru,
    sfx: frame.sfx,
    camera: frame.camera,
    continuity_note: frame.continuity_note,
    safety_note: frame.safety_note
  };
}
