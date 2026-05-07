export const MOCK_SCRIPT_RU = `За несколько секунд тайга легла на землю, как скошенная трава. И никто до сих пор не может честно сказать, что взорвалось над Сибирью.

Удар был такой силы, что окна выбило за сотни километров. Люди проснулись от белой вспышки, будто солнце упало прямо в печную трубу. Земля качнулась. Небо горело.

Охотники потом шли через мёртвый лес, где стволы лежали радиальными полосами, как спички после удара кулаком. А в центре их ждал странный круг: деревья стояли без веток, голые, будто их обожгло изнутри.

Но самое жуткое пришло потом. Экспедицию отправили только через 19 лет. Слишком поздно.

Ни воронки. Ни осколков. Ничего.

Если завтра такой свет вспыхнет над твоим городом, ты поверишь в официальное объяснение сразу?`;

export function buildMockStoryboard({ projectName = "NeuroCine Mock Project", topic = "Тунгусский взрыв", duration = 60, aspectRatio = "9:16", style = "cinematic" } = {}) {
  const shots = [
    ["Белая вспышка над тёмной сибирской тайгой", "slow push through black pine silhouettes toward a blinding white-orange aerial flash"],
    ["Ударная волна прокатывается по лесу", "ground-level shockwave bends grass and pine branches, camera shakes with physical vibration"],
    ["Окна в далёкой деревне взрываются от давления", "interior wooden house trembles, glass bursts outward in slow motion, dust floats in morning light"],
    ["Тайга лежит радиальными полосами", "high aerial drift over thousands of flattened trees arranged like spokes around an unseen center"],
    ["Охотник стоит перед мёртвым лесом", "handheld over-shoulder shot of a lone hunter entering the silent flattened forest"],
    ["Странный центр без кратера", "slow circular camera move around a barren center where branchless trees stand upright"],
    ["Карта экспедиции через 19 лет", "documentary table shot, old map, red route line, gloved finger marks the delayed expedition"],
    ["Финальный вопрос зрителю", "wide apocalyptic silhouette under pale burning sky, the forest dead and silent behind him"]
  ];
  const total = shots.length;
  const per = Math.round((Number(duration || 60) / total) * 10) / 10;
  return {
    project_name: projectName,
    topic,
    aspect_ratio: aspectRatio,
    total_duration: Number(duration || 60),
    style,
    global_style_lock: "cinematic documentary realism, dark mystery atmosphere, 35mm anamorphic, handheld camera, natural overcast light, Kodak Vision3 500T grain, no subtitles, no UI, no watermark",
    character_lock: [],
    scenes: shots.map((s, i) => ({
      id: `frame_${String(i + 1).padStart(2, "0")}`,
      start: Math.round(i * per * 10) / 10,
      end: Math.round((i + 1) * per * 10) / 10,
      duration: per,
      description_ru: s[0],
      action_ru: s[0],
      vo_ru: i === 0 ? "За несколько секунд тайга легла на землю." : i === total - 1 ? "Ты поверишь в официальное объяснение сразу?" : "И чем дальше заходили люди, тем меньше это было похоже на обычный метеорит.",
      sfx: "low dark drone, distant wind, muted impact rumble, eerie silence",
      image_prompt_en: `SCENE PRIMARY FOCUS: ${s[0]}, Siberian taiga 1908, cinematic documentary realism, high contrast mystery lighting, realistic textures, 35mm anamorphic, Kodak Vision3 500T grain, vertical ${aspectRatio}, no subtitles, no UI, no watermark`,
      video_prompt_en: `ANIMATE CURRENT FRAME: ${s[1]}, organic handheld micro-motion, physical atmosphere, slow cinematic tension, documentary realism. SFX: low dark drone, distant wind, muted impact rumble, eerie silence.`,
      continuity_note: "Mock mode continuity: preserve Siberian taiga world, cold smoky light, dark documentary palette, no modern objects."
    }))
  };
}

export function buildMockVideoPrompt(frame = {}) {
  return `ANIMATE CURRENT FRAME: ${String(frame.video_prompt_en || frame.description_ru || "cinematic documentary shot").replace(/^ANIMATE CURRENT FRAME:\s*/i, "")} Camera motion must feel physical and restrained: slow push-in, subtle handheld instability, atmospheric particles crossing the lens, no random new objects, no subtitles, no UI, no watermark. Keep continuity with previous frames: same dark Siberian palette, same lens language, same documentary realism. SFX: low drone, cold wind, distant wood creak, impact memory rumble.`;
}

export function buildMockTtsPack({ script = MOCK_SCRIPT_RU } = {}) {
  return {
    scene: "Dark historical mystery / documentary narration",
    context: "Low, tense narrator voice. Slow start, rising pressure, short pauses before key facts.",
    voice_id: "Google AI Studio · RU Narrator · Deep Documentary",
    voice_desc: "низкий, сухой, тревожный, без театральности",
    voice_reason: "Подходит для историй с тайной, катастрофой и скрытой версией. Не звучит как реклама.",
    script_google: script,
    script_elevenlabs: script,
    script_clean: script.replace(/\n{2,}/g, "\n"),
    pacing_tips: "0–3s: тише и ближе к микрофону\n3–35s: нарастание\n35–50s: паузы перед фактами\n50–60s: финальный вопрос почти шёпотом"
  };
}

export function buildMockCoverPack({ topic = "Тунгусский взрыв" } = {}) {
  return {
    theme: topic,
    mode: "DEV MOCK",
    style: "conspiracy_documentary",
    format: "9:16",
    main_title: "ЧТО ВЗОРВАЛОСЬ\nНАД СИБИРЬЮ?",
    side_facts: ["ОКНА ВЫБИЛО ЗА СОТНИ КМ", "ЭКСПЕДИЦИЯ ЧЕРЕЗ 19 ЛЕТ", "НИ ВОРОНКИ. НИ ОСКОЛКОВ."],
    bottom_hook: "ЭТО БЫЛ НЕ МЕТЕОРИТ?",
    psychology: ["тайна без ответа", "запретная версия", "масштаб катастрофы", "один невозможный визуальный символ"],
    angle: "DEV MOCK: проверка UI без запроса к API.",
    variants: [
      { id: "poster", label: "Viral Poster", prompt_EN: "Vertical 9:16 viral documentary thumbnail poster, massive white-orange flash above Siberian taiga, radial flattened forest, bold Russian headline zones, high contrast, readable mobile typography, red warning stamp." },
      { id: "evidence", label: "Evidence Board", prompt_EN: "Vertical 9:16 classified evidence thumbnail, map of Siberia, impact radius, archival documents, red string, warning labels, cinematic mystery lighting." }
    ],
    negative_prompt_EN: "no watermark, no logo, no UI, no tiny unreadable text, no cartoon, no anime, no extra letters"
  };
}

export function buildMockMusicPack() {
  return {
    title: "Dark Siberian Mystery Drone",
    style: "cinematic dark drone, low brass pulses, cold wind texture, slow rising tension, no vocals",
    prompt: "Instrumental only. Dark documentary mystery score, low sub drone, distant metallic hit, cold Siberian wind, slow pulse, cinematic tension rising toward the final question. No vocals, no drums at start, no bright melody.",
    structure: "0–8s sparse drone / 8–35s pulse builds / 35–52s low brass pressure / 52–60s drop into silence",
    negative: "no singing, no pop beat, no happy melody, no EDM drop"
  };
}

export function buildMockSeoPack({ topic = "Тунгусский взрыв" } = {}) {
  return [
    { platform: "YouTube Shorts", title: "Что взорвалось над Сибирью?", description: `${topic}: тайга легла за секунды, а воронки так и не нашли.`, hashtags: "#тунгусскийвзрыв #сибирь #тайна #история #shorts" },
    { platform: "TikTok", title: "Ни воронки. Ни осколков.", description: "Самая странная катастрофа Сибири за 60 секунд.", hashtags: "#тайна #история #сибирь #мистика #факты" }
  ];
}

export function buildMockSocialPack() {
  return {
    post_hook: "Ни воронки. Ни осколков. Только мёртвая тайга.",
    post_body: "В 1908 году над Сибирью взорвалось что-то такой силы, что лес лёг радиальными полосами. Экспедиция пришла только через 19 лет — и не нашла главного: кратера.",
    post_question: "Ты бы поверил в официальную версию?",
    post_tags: "#тунгусскийвзрыв #история #сибирь #тайна #необъяснимое",
    reels_caption: "Тайга легла за секунды. Но кратера так и не нашли. #история #тайна #shorts",
    tiktok_caption: "Что реально взорвалось над Сибирью? #тайна #сибирь #история",
    youtube_pinned_comment: "Какая версия кажется тебе реальной: метеорит или что-то другое?",
    carousel: [
      { emoji: "💥", headline: "ТАЙГА ЛЕГЛА ЗА СЕКУНДЫ", sub: "Такого масштаба никто не ожидал." },
      { emoji: "🕳️", headline: "НО КРАТЕРА НЕ БЫЛО", sub: "Самая странная деталь всей истории." },
      { emoji: "🗺️", headline: "ЭКСПЕДИЦИЯ ЧЕРЕЗ 19 ЛЕТ", sub: "Слишком поздно для нормальных ответов." }
    ],
    slides: [
      { emoji: "⚠️", headline: "НЕ МЕТЕОРИТ?", sub: "Одна версия звучит слишком странно." },
      { emoji: "🌲", headline: "МЁРТВАЯ ТАЙГА", sub: "Деревья лежали как спички." },
      { emoji: "❓", headline: "ЧТО ЭТО БЫЛО?", sub: "Ответа нет до сих пор." }
    ]
  };
}
