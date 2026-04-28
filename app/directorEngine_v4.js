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
  return `Create one vertical 9:16 cinematic storyboard grid image.\n\nLAYOUT:\n- ${scenes.length || 20} frames total\n- clean grid, equal cells\n- each cell is a different frame from the same story\n- no text, no numbers, no labels, no UI, no subtitles, no watermark\n\nSTYLE LOCK:\n${styleProfile.style_lock || storyboard.global_style_lock || STYLE_LOCKS.cinematic}\n\nSCENARIO LOCK:\nDo not change the story order. Preserve the same characters, locations, chronology, emotional logic and visual continuity.\n\nFRAMES:\n${scenes.map((s, i) => `${i + 1}. ${s.description_ru || s.vo_ru || s.image_prompt_en}`).join("\n")}`;
}

export function buildExplorePrompt(frame = {}, storyboard = {}, styleProfile = {}, variantCount = 4) {
  const base = frame.image_prompt_en || frame.description_ru || frame.vo_ru || "selected storyboard frame";
  return `ULTRA CINEMATIC VARIATION GRID — DIRECTOR MODE\n\nTASK:\nCreate a 2x2 grid with ${variantCount} shot variations of the EXACT SAME FRAME.\n\nLOCKED FRAME ID:\n${frame.id || "frame"}\n\nLOCKED STORY ACTION:\n${frame.description_ru || "Use the selected frame action only."}\n\nLOCKED VO MEANING:\n${frame.vo_ru || "Preserve the story meaning."}\n\nBASE IMAGE PROMPT:\n${base}\n\nSTYLE LOCK:\n${styleProfile.style_lock || storyboard.global_style_lock || STYLE_LOCKS.cinematic}\n\nSCENARIO LOCK — NON-NEGOTIABLE:\n- same story event\n- same character identity and condition\n- same wardrobe / character model\n- same location and time of day\n- same emotional meaning\n- same historical / genre logic\n- no new plot, no new objects that change the story\n\nALLOWED TO CHANGE ONLY:\n- camera angle\n- camera height\n- lens feeling\n- framing\n- composition\n- camera distance\n- depth of field\n\nMANDATORY VARIATIONS:\nA — EXTREME CLOSE-UP: emotional face/detail focus, shallow DOF, intimate tension.\nB — LOW / GROUND ANGLE: strong foreground texture, weight, perspective, physical presence.\nC — WIDE ENVIRONMENTAL: full spatial storytelling, isolation, readable location geometry.\nD — OBSTRUCTED / OVER-SHOULDER: layered depth, partial foreground obstruction, voyeuristic documentary feeling.\n\nOUTPUT:\n- single image\n- 2x2 grid\n- four clearly different compositions\n- no text, no subtitles, no UI, no watermark\n\nNEGATIVE:\n${NEGATIVE_LOCK}`;
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
