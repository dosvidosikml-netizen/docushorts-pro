"use client";

import { useEffect, useMemo, useState } from "react";
import { SYS_SCENE_ENGINE, buildSceneUserPrompt } from "../engine/sceneEngine";
import { SYS_PROMPT_ENGINE, buildPromptUserPrompt } from "../engine/promptEngine";
import { SYS_REFERENCE_ENGINE, buildReferenceUserPrompt } from "../engine/referenceEngine";
import { SYS_SEO_ENGINE, buildSeoUserPrompt } from "../engine/seoEngine";
import { SYS_TTS_ENGINE, buildTtsUserPrompt } from "../engine/ttsEngine";
import { buildCharacterDNA, injectCharactersIntoScript } from "../engine/characterEngine";

const STORAGE_KEY = "neurocine_projects_v5";

const TEXT = {
  ru: {
    appTitle: "NeuroCine Studio",
    appSub: "AI Production Workspace",
    script: "Сценарий",
    scriptPlaceholder: "Вставь сценарий, идею или rough-концепт...",
    character: "Персонажи",
    reference: "Reference",
    scenes: "Сцены",
    prompts: "Промпты",
    cover: "Cover Studio",
    export: "Экспорт",
    seo: "SEO + Social",
    tts: "TTS Studio",
    projects: "Проекты",
    refImage: "Reference Image",
    noReference: "Reference пока не создан",
    noScenes: "Сцен пока нет",
    noPrompts: "Промптов пока нет",
    noSeo: "SEO пока не сгенерирован",
    noTts: "Озвучка пока не сгенерирована",
    noProjects: "Сохранённых проектов пока нет",
    noRefImage: "Reference image пока не загружен",
    btnScenes: "Сгенерировать сцены",
    btnReference: "Сгенерировать reference",
    btnPrompts: "Сгенерировать промпты",
    btnSeo: "Сгенерировать SEO",
    btnTts: "Сгенерировать озвучку",
    btnSpeak: "Слушать",
    btnStop: "Стоп",
    btnUseGenerated: "Вставить generated script",
    loading: "Генерация...",
    name: "Имя",
    gender: "Пол",
    age: "Возраст",
    style: "Стиль",
    identityLock: "Identity lock",
    outfitLock: "Outfit lock",
    goal: "Цель",
    voice: "Озвучка",
    visual: "Визуал",
    camera: "Камера",
    motion: "Движение",
    lighting: "Свет",
    environment: "Среда",
    sfx: "SFX",
    mode: "Режим",
    tabStudio: "Studio",
    tabScenes: "Scenes",
    tabPrompts: "Prompts",
    tabReference: "Reference",
    tabRefImage: "Ref Image",
    tabCover: "Cover",
    tabExport: "Export",
    tabSeo: "SEO",
    tabTts: "TTS Studio",
    tabProjects: "Projects",
    male: "Мужской",
    female: "Женский",
    saveCharacter: "Обновить персонажей",
    addCharacter: "Добавить персонажа",
    removeCharacter: "Удалить",
    coverTitle: "Заголовок",
    coverSubtitle: "Подзаголовок",
    coverCta: "CTA",
    posX: "Позиция X",
    posY: "Позиция Y",
    bgPrompt: "Описание фона",
    preview: "Превью",
    preset: "Пресет",
    copy: "Копировать",
    copied: "Скопировано",
    downloadJson: "Скачать .json",
    importJson: "Импорт .json",
    exportScenes: "Экспорт сцен",
    exportPrompts: "Экспорт промптов",
    exportReference: "Экспорт reference",
    exportRefImage: "Экспорт reference image",
    exportCover: "Экспорт cover",
    exportSeo: "Экспорт SEO",
    exportTts: "Экспорт TTS Studio",
    edit: "Редактировать",
    save: "Сохранить",
    cancel: "Отмена",
    imgPrompt: "Image prompt",
    vidPrompt: "Video prompt",
    negative: "Negative prompt",
    close: "Закрыть",
    seoTitle: "Title",
    seoDescription: "Description",
    seoHashtags: "Hashtags",
    seoTikTok: "TikTok caption",
    seoFacebook: "Facebook post",
    seoYoutube: "YouTube Shorts title",
    projectName: "Название проекта",
    projectNamePlaceholder: "Например: Dark History #1",
    saveProject: "Сохранить проект",
    loadProject: "Загрузить",
    deleteProject: "Удалить",
    projectSaved: "Проект сохранён",
    autoSaved: "Автосохранение черновика включено",
    createdAt: "Создан",
    updatedAt: "Обновлён",
    uploadRef: "Загрузить reference image",
    removeRef: "Удалить reference image",
    refNote: "Этот image anchor сохраняется в проекте и помечает промпты как I2V-ready.",
    refFileName: "Имя файла",
    refImageUsed: "Использовать uploaded reference",
    refImageActive: "Uploaded reference image активен",
    ttsFullScript: "Generated full script",
    ttsSegments: "Generated segments",
    importError: "Ошибка загрузки JSON",
    ttsStyle: "Style",
    ttsPace: "Pace",
    ttsAccent: "Accent",
    ttsVoice: "Voice",
    ttsSampleContext: "Sample Context",
    ttsScriptEditor: "Script",
    ttsEmotionPreview: "Разбор эмоций",
    ttsPackagePreview: "TTS package preview",
    ttsRawPlaceholder: "[intrigue] Первая фраза\n[desire] Вторая фраза\n[information] Третья фраза",
    ttsVoicePlaceholder: "Например: Orus",
    ttsSamplePlaceholder:
      "Premium commercial. Dynamic pacing—starts intrigued, ends punchy. Tone is polished, persuasive, and inviting.",
    ttsStudioReady: "TTS Studio настроен",
    workspace: "Workspace",
    actions: "Быстрые действия",
    generated: "Generated",
    settings: "Настройки",
    editor: "Редактор",
    results: "Результат",
    pipeline: "Pipeline",
    visualPreset: "Visual preset",
    statusReady: "Готово",
    statusDraft: "Черновик",
    summary: "Сводка",
    totalScenes: "Всего сцен",
    totalPrompts: "Всего промптов",
    charactersCount: "Персонажей",
    hasReference: "Reference",
    yes: "Да",
    no: "Нет",
  },
  en: {
    appTitle: "NeuroCine Studio",
    appSub: "AI Production Workspace",
    script: "Script",
    scriptPlaceholder: "Paste your script, idea, or rough concept...",
    character: "Characters",
    reference: "Reference",
    scenes: "Scenes",
    prompts: "Prompts",
    cover: "Cover Studio",
    export: "Export",
    seo: "SEO + Social",
    tts: "TTS Studio",
    projects: "Projects",
    refImage: "Reference Image",
    noReference: "Reference not created yet",
    noScenes: "No scenes yet",
    noPrompts: "No prompts yet",
    noSeo: "SEO not generated yet",
    noTts: "Voiceover not generated yet",
    noProjects: "No saved projects yet",
    noRefImage: "No reference image uploaded yet",
    btnScenes: "Generate scenes",
    btnReference: "Generate reference",
    btnPrompts: "Generate prompts",
    btnSeo: "Generate SEO",
    btnTts: "Generate voiceover",
    btnSpeak: "Speak",
    btnStop: "Stop",
    btnUseGenerated: "Use generated script",
    loading: "Generating...",
    name: "Name",
    gender: "Gender",
    age: "Age",
    style: "Style",
    identityLock: "Identity lock",
    outfitLock: "Outfit lock",
    goal: "Goal",
    voice: "Voice",
    visual: "Visual",
    camera: "Camera",
    motion: "Motion",
    lighting: "Lighting",
    environment: "Environment",
    sfx: "SFX",
    mode: "Mode",
    tabStudio: "Studio",
    tabScenes: "Scenes",
    tabPrompts: "Prompts",
    tabReference: "Reference",
    tabRefImage: "Ref Image",
    tabCover: "Cover",
    tabExport: "Export",
    tabSeo: "SEO",
    tabTts: "TTS Studio",
    tabProjects: "Projects",
    male: "Male",
    female: "Female",
    saveCharacter: "Update characters",
    addCharacter: "Add character",
    removeCharacter: "Remove",
    coverTitle: "Title",
    coverSubtitle: "Subtitle",
    coverCta: "CTA",
    posX: "Position X",
    posY: "Position Y",
    bgPrompt: "Background prompt",
    preview: "Preview",
    preset: "Preset",
    copy: "Copy",
    copied: "Copied",
    downloadJson: "Download .json",
    importJson: "Import .json",
    exportScenes: "Export scenes",
    exportPrompts: "Export prompts",
    exportReference: "Export reference",
    exportRefImage: "Export reference image",
    exportCover: "Export cover",
    exportSeo: "Export SEO",
    exportTts: "Export TTS Studio",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    imgPrompt: "Image prompt",
    vidPrompt: "Video prompt",
    negative: "Negative prompt",
    close: "Close",
    seoTitle: "Title",
    seoDescription: "Description",
    seoHashtags: "Hashtags",
    seoTikTok: "TikTok caption",
    seoFacebook: "Facebook post",
    seoYoutube: "YouTube Shorts title",
    projectName: "Project name",
    projectNamePlaceholder: "For example: Dark History #1",
    saveProject: "Save project",
    loadProject: "Load",
    deleteProject: "Delete",
    projectSaved: "Project saved",
    autoSaved: "Draft autosave enabled",
    createdAt: "Created",
    updatedAt: "Updated",
    uploadRef: "Upload reference image",
    removeRef: "Remove reference image",
    refNote: "This image anchor is stored in the project and marks prompts as I2V-ready.",
    refFileName: "File name",
    refImageUsed: "Use uploaded reference",
    refImageActive: "Uploaded reference image is active",
    ttsFullScript: "Generated full script",
    ttsSegments: "Generated segments",
    importError: "JSON import error",
    ttsStyle: "Style",
    ttsPace: "Pace",
    ttsAccent: "Accent",
    ttsVoice: "Voice",
    ttsSampleContext: "Sample Context",
    ttsScriptEditor: "Script",
    ttsEmotionPreview: "Emotion preview",
    ttsPackagePreview: "TTS package preview",
    ttsRawPlaceholder: "[intrigue] First line\n[desire] Second line\n[information] Third line",
    ttsVoicePlaceholder: "For example: Orus",
    ttsSamplePlaceholder:
      "Premium commercial. Dynamic pacing—starts intrigued, ends punchy. Tone is polished, persuasive, and inviting.",
    ttsStudioReady: "TTS Studio configured",
    workspace: "Workspace",
    actions: "Quick actions",
    generated: "Generated",
    settings: "Settings",
    editor: "Editor",
    results: "Results",
    pipeline: "Pipeline",
    visualPreset: "Visual preset",
    statusReady: "Ready",
    statusDraft: "Draft",
    summary: "Summary",
    totalScenes: "Total scenes",
    totalPrompts: "Total prompts",
    charactersCount: "Characters",
    hasReference: "Reference",
    yes: "Yes",
    no: "No",
  },
};

const COVER_PRESETS = {
  netflix: { label: "Netflix", hookColor: "#e50914", titleColor: "#ffffff", ctaBg: "rgba(229,9,20,0.95)", titleSize: 34, hookSize: 13, align: "center", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 6px 20px rgba(0,0,0,0.9)" },
  mrbeast: { label: "MrBeast", hookColor: "#ffdd00", titleColor: "#ffffff", ctaBg: "rgba(236,72,153,0.95)", titleSize: 42, hookSize: 16, align: "center", transform: "translate(-50%, -50%) rotate(-3deg)", titleWeight: 900, titleFont: "Impact, sans-serif", titleStroke: "2px #000", titleShadow: "5px 5px 0 #000, 0 0 20px rgba(0,0,0,0.7)" },
  tiktok: { label: "TikTok", hookColor: "#00f2ea", titleColor: "#ffffff", ctaBg: "rgba(255,0,80,0.95)", titleSize: 32, hookSize: 14, align: "center", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 0 20px rgba(0,242,234,0.35), 0 6px 20px rgba(0,0,0,0.8)" },
  truecrime: { label: "True Crime", hookColor: "#facc15", titleColor: "#ffffff", ctaBg: "rgba(0,0,0,0.9)", titleSize: 30, hookSize: 12, align: "left", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 4px 18px rgba(0,0,0,0.9)" },
  history: { label: "History", hookColor: "#d4af37", titleColor: "#f8fafc", ctaBg: "rgba(180,83,9,0.9)", titleSize: 36, hookSize: 12, align: "center", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Georgia, serif", titleStroke: "none", titleShadow: "0 6px 20px rgba(0,0,0,0.9)" },
  minimal: { label: "Minimal", hookColor: "#cbd5e1", titleColor: "#ffffff", ctaBg: "rgba(51,65,85,0.9)", titleSize: 26, hookSize: 11, align: "center", transform: "translate(-50%, -50%)", titleWeight: 400, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 4px 10px rgba(0,0,0,0.7)" },
};

const TTS_STYLE_OPTIONS = ["Promo/Hype", "Cinematic", "Documentary", "Trailer", "Horror", "Calm", "Energetic", "Storytelling", "News"];
const TTS_PACE_OPTIONS = ["Slow", "Natural", "Fast", "Dynamic"];
const TTS_ACCENT_OPTIONS = ["American (Gen)", "British", "Neutral", "Russian", "Ukrainian"];

const NAV_ITEMS = [
  { key: "studio", icon: "🎬" },
  { key: "scenes", icon: "🧩" },
  { key: "prompts", icon: "🧠" },
  { key: "tts", icon: "🎤" },
  { key: "reference", icon: "🧬" },
  { key: "refimage", icon: "🖼️" },
  { key: "cover", icon: "📺" },
  { key: "seo", icon: "📈" },
  { key: "projects", icon: "💾" },
  { key: "export", icon: "📦" },
];

function makeFormCharacter(index = 1) {
  return {
    id: `char_${index}`,
    name: `Character ${index}`,
    gender: "male",
    age: 28,
    style: "black tactical jacket, cinematic look",
  };
}

function defaultTtsSettings() {
  return {
    style: "Promo/Hype",
    pace: "Natural",
    accent: "American (Gen)",
    voice: "Orus",
    sampleContext:
      "Premium commercial. Dynamic pacing—starts intrigued, ends punchy. Tone is polished, persuasive, and inviting.",
  };
}

function getTabLabel(t, key) {
  const map = {
    studio: t.tabStudio,
    scenes: t.tabScenes,
    prompts: t.tabPrompts,
    tts: t.tabTts,
    reference: t.tabReference,
    refimage: t.tabRefImage,
    cover: t.tabCover,
    seo: t.tabSeo,
    projects: t.tabProjects,
    export: t.tabExport,
  };
  return map[key] || key;
}

function SectionHeader({ eyebrow, title, description, right }) {
  return (
    <div style={styles.sectionHeader}>
      <div>
        {eyebrow ? <div style={styles.sectionEyebrow}>{eyebrow}</div> : null}
        <div style={styles.sectionTitle}>{title}</div>
        {description ? <div style={styles.sectionDescription}>{description}</div> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

function SceneEditorModal({ scene, t, onClose, onSave }) {
  const [form, setForm] = useState(scene);
  useEffect(() => setForm(scene), [scene]);
  if (!scene) return null;

  function setField(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  return (
    <div style={modal.backdrop}>
      <div style={modal.panel}>
        <div style={modal.header}>
          <div style={modal.title}>{scene.id}</div>
          <button onClick={onClose} style={modal.closeBtn}>{t.close}</button>
        </div>

        <div style={modal.grid}>
          {["scene_goal", "voice", "visual", "camera", "motion", "lighting", "environment", "sfx", "generation_mode"].map((field) => (
            <label key={field} style={modal.label}>
              <span>{field}</span>
              <textarea
                value={form?.[field] ?? ""}
                onChange={(e) => setField(field, e.target.value)}
                style={modal.textarea}
              />
            </label>
          ))}
        </div>

        <div style={modal.actions}>
          <button onClick={onClose} style={modal.secondary}>{t.cancel}</button>
          <button onClick={() => onSave(form)} style={modal.primary}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

function PromptEditorModal({ prompt, t, onClose, onSave }) {
  const [form, setForm] = useState(prompt);
  useEffect(() => setForm(prompt), [prompt]);
  if (!prompt) return null;

  function setField(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  return (
    <div style={modal.backdrop}>
      <div style={modal.panel}>
        <div style={modal.header}>
          <div style={modal.title}>{prompt.scene_id}</div>
          <button onClick={onClose} style={modal.closeBtn}>{t.close}</button>
        </div>

        <div style={modal.grid}>
          <label style={modal.label}>
            <span>imgPrompt_EN</span>
            <textarea value={form?.imgPrompt_EN ?? ""} onChange={(e) => setField("imgPrompt_EN", e.target.value)} style={modal.textareaLg} />
          </label>
          <label style={modal.label}>
            <span>vidPrompt_EN</span>
            <textarea value={form?.vidPrompt_EN ?? ""} onChange={(e) => setField("vidPrompt_EN", e.target.value)} style={modal.textareaLg} />
          </label>
          <label style={modal.label}>
            <span>negative_prompt</span>
            <textarea value={form?.negative_prompt ?? ""} onChange={(e) => setField("negative_prompt", e.target.value)} style={modal.textarea} />
          </label>
          <label style={modal.label}>
            <span>generation_mode_final</span>
            <input value={form?.generation_mode_final ?? ""} onChange={(e) => setField("generation_mode_final", e.target.value)} style={modal.input} />
          </label>
        </div>

        <div style={modal.actions}>
          <button onClick={onClose} style={modal.secondary}>{t.cancel}</button>
          <button onClick={() => onSave(form)} style={modal.primary}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [lang, setLang] = useState("ru");
  const [activeTab, setActiveTab] = useState("studio");
  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [reference, setReference] = useState(null);
  const [seo, setSeo] = useState(null);
  const [tts, setTts] = useState(null);
  const [ttsSettings, setTtsSettings] = useState(defaultTtsSettings());
  const [ttsScriptRaw, setTtsScriptRaw] = useState("");
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [loadingReference, setLoadingReference] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [loadingSeo, setLoadingSeo] = useState(false);
  const [loadingTts, setLoadingTts] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [editingScene, setEditingScene] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [projectName, setProjectName] = useState("NeuroCine Project");
  const [savedProjects, setSavedProjects] = useState([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [refImage, setRefImage] = useState({
    dataUrl: "",
    fileName: "",
    mimeType: "",
    useAsAnchor: true,
  });

  const [cover, setCover] = useState({
    preset: "netflix",
    title: "ТВОЯ ИСТОРИЯ",
    subtitle: "КИНОШНЫЙ AI-РОЛИК",
    cta: "СМОТРИ ДО КОНЦА",
    posX: 50,
    posY: 58,
    backgroundPrompt: "dark cinematic background, dramatic contrast, volumetric light, high tension",
  });

  const [characterForms, setCharacterForms] = useState([{ ...makeFormCharacter(1), name: "Alex" }]);
  const [characters, setCharacters] = useState([
    buildCharacterDNA({
      name: "Alex",
      gender: "male",
      age: 28,
      style: "black tactical jacket, cinematic look",
    }),
  ]);

  const t = useMemo(() => TEXT[lang], [lang]);
  const preset = COVER_PRESETS[cover.preset] || COVER_PRESETS.netflix;

  function parseTtsScript(text) {
    return String(text || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^\[(.*?)\]\s*(.*)$/);
        if (!match) return { emotion: "neutral", text: line };
        return { emotion: match[1] || "neutral", text: match[2] || "" };
      });
  }

  const parsedTtsScript = useMemo(() => parseTtsScript(ttsScriptRaw), [ttsScriptRaw]);

  const ttsPackage = useMemo(
    () => ({
      tts_settings: ttsSettings,
      script: parsedTtsScript,
      generated: tts || null,
    }),
    [ttsSettings, parsedTtsScript, tts]
  );

  function readProjects() {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function writeProjects(projects) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    setSavedProjects(projects);
  }

  function buildProjectPayload() {
    return {
      id: Date.now().toString(),
      name: projectName.trim() || "NeuroCine Project",
      lang,
      script,
      scenes,
      prompts,
      reference,
      seo,
      tts,
      ttsSettings,
      ttsScriptRaw,
      cover,
      refImage,
      characterForms,
      characters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function saveProject() {
    const existing = readProjects();
    const name = projectName.trim() || "NeuroCine Project";
    const existingIndex = existing.findIndex((p) => p.name === name);

    if (existingIndex >= 0) {
      existing[existingIndex] = {
        ...existing[existingIndex],
        lang,
        script,
        scenes,
        prompts,
        reference,
        seo,
        tts,
        ttsSettings,
        ttsScriptRaw,
        cover,
        refImage,
        characterForms,
        characters,
        updatedAt: new Date().toISOString(),
      };
      writeProjects(existing);
    } else {
      writeProjects([buildProjectPayload(), ...existing]);
    }

    setSaveStatus(t.projectSaved);
    setTimeout(() => setSaveStatus(""), 1200);
  }

  function loadProject(project) {
    setProjectName(project.name || "NeuroCine Project");
    setLang(project.lang || "ru");
    setScript(project.script || "");
    setScenes(project.scenes || []);
    setPrompts(project.prompts || []);
    setReference(project.reference || null);
    setSeo(project.seo || null);
    setTts(project.tts || null);
    setTtsSettings(project.ttsSettings || defaultTtsSettings());
    setTtsScriptRaw(project.ttsScriptRaw || "");
    setCover(
      project.cover || {
        preset: "netflix",
        title: "ТВОЯ ИСТОРИЯ",
        subtitle: "КИНОШНЫЙ AI-РОЛИК",
        cta: "СМОТРИ ДО КОНЦА",
        posX: 50,
        posY: 58,
        backgroundPrompt: "dark cinematic background, dramatic contrast, volumetric light, high tension",
      }
    );
    setRefImage(project.refImage || { dataUrl: "", fileName: "", mimeType: "", useAsAnchor: true });
    setCharacterForms(project.characterForms || [{ ...makeFormCharacter(1), name: "Alex" }]);
    setCharacters(
      project.characters || [
        buildCharacterDNA({
          name: "Alex",
          gender: "male",
          age: 28,
          style: "black tactical jacket, cinematic look",
        }),
      ]
    );
    setActiveTab("studio");
  }

  function deleteProject(id) {
    writeProjects(readProjects().filter((p) => p.id !== id));
  }

  useEffect(() => {
    setSavedProjects(readProjects());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const draft = {
      projectName,
      lang,
      script,
      scenes,
      prompts,
      reference,
      seo,
      tts,
      ttsSettings,
      ttsScriptRaw,
      cover,
      refImage,
      characterForms,
      characters,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("neurocine_draft_v5", JSON.stringify(draft));
  }, [projectName, lang, script, scenes, prompts, reference, seo, tts, ttsSettings, ttsScriptRaw, cover, refImage, characterForms, characters]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const draft = JSON.parse(localStorage.getItem("neurocine_draft_v5") || "null");
      if (!draft) return;
      setProjectName(draft.projectName || "NeuroCine Project");
      setLang(draft.lang || "ru");
      setScript(draft.script || "");
      setScenes(draft.scenes || []);
      setPrompts(draft.prompts || []);
      setReference(draft.reference || null);
      setSeo(draft.seo || null);
      setTts(draft.tts || null);
      setTtsSettings(draft.ttsSettings || defaultTtsSettings());
      setTtsScriptRaw(draft.ttsScriptRaw || "");
      setCover(
        draft.cover || {
          preset: "netflix",
          title: "ТВОЯ ИСТОРИЯ",
          subtitle: "КИНОШНЫЙ AI-РОЛИК",
          cta: "СМОТРИ ДО КОНЦА",
          posX: 50,
          posY: 58,
          backgroundPrompt: "dark cinematic background, dramatic contrast, volumetric light, high tension",
        }
      );
      setRefImage(draft.refImage || { dataUrl: "", fileName: "", mimeType: "", useAsAnchor: true });
      setCharacterForms(draft.characterForms || [{ ...makeFormCharacter(1), name: "Alex" }]);
      setCharacters(
        draft.characters || [
          buildCharacterDNA({
            name: "Alex",
            gender: "male",
            age: 28,
            style: "black tactical jacket, cinematic look",
          }),
        ]
      );
    } catch {}
  }, []);

  async function callAPI(content, system) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: system },
          { role: "user", content },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "API error");
    return data?.text || "";
  }

  function cleanJSON(str) {
    try {
      return JSON.parse(str);
    } catch {
      const match = String(str).match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      return {};
    }
  }

  function addCharacter() {
    setCharacterForms((prev) => [...prev, makeFormCharacter(prev.length + 1)]);
  }

  function removeCharacter(id) {
    setCharacterForms((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCharacterField(id, field, value) {
    setCharacterForms((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  function updateCharacters() {
    const next = characterForms.map((c) =>
      buildCharacterDNA({ name: c.name, gender: c.gender, age: Number(c.age), style: c.style })
    );
    setCharacters(next);
    setReference(null);
    setScenes([]);
    setPrompts([]);
    setSeo(null);
    setTts(null);
  }

  function handleRefImageUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRefImage({
        dataUrl: String(reader.result || ""),
        fileName: file.name || "",
        mimeType: file.type || "",
        useAsAnchor: true,
      });
      setPrompts([]);
    };
    reader.readAsDataURL(file);
  }

  function removeRefImage() {
    setRefImage({ dataUrl: "", fileName: "", mimeType: "", useAsAnchor: true });
  }

  async function generateScenes() {
    try {
      setLoadingScenes(true);
      setError("");
      setScenes([]);
      setPrompts([]);
      setSeo(null);
      setTts(null);

      const extraRefText =
        refImage.dataUrl && refImage.useAsAnchor
          ? `\n\nUploaded reference image is available and should be treated as the identity anchor for recurring characters.`
          : "";

      const scriptWithChars = injectCharactersIntoScript(script, characters) + extraRefText;
      const prompt = buildSceneUserPrompt({ script: scriptWithChars, mode: "shorts", total: 60, characters });
      const raw = await callAPI(prompt, SYS_SCENE_ENGINE);
      const data = cleanJSON(raw);
      setScenes(data.scenes || []);
      setActiveTab("scenes");
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoadingScenes(false);
    }
  }

  async function generateReference() {
    try {
      setLoadingReference(true);
      setError("");

      const extra =
        refImage.dataUrl && refImage.useAsAnchor
          ? `\n\nAn uploaded reference image exists and must be considered the strongest identity anchor. File name: ${refImage.fileName}`
          : "";

      const prompt = buildReferenceUserPrompt({ characters }) + extra;
      const raw = await callAPI(prompt, SYS_REFERENCE_ENGINE);
      const data = cleanJSON(raw);
      setReference(data.reference || null);
      setActiveTab("reference");
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoadingReference(false);
    }
  }

  async function generatePrompts() {
    try {
      setLoadingPrompts(true);
      setError("");
      setPrompts([]);

      const refAnchorText =
        refImage.dataUrl && refImage.useAsAnchor
          ? `\n\nIMPORTANT: Uploaded reference image is present and must be used as the I2V anchor. Prefer I2V for recurring characters. File name: ${refImage.fileName}`
          : "";

      const prompt = buildPromptUserPrompt({ scenes, reference }) + refAnchorText;
      const raw = await callAPI(prompt, SYS_PROMPT_ENGINE);
      const data = cleanJSON(raw);

      let nextPrompts = data.prompts || [];
      if (refImage.dataUrl && refImage.useAsAnchor) {
        nextPrompts = nextPrompts.map((p) => ({
          ...p,
          generation_mode_final: "I2V",
          vidPrompt_EN: `${p.vidPrompt_EN || ""}\n\nUse uploaded reference image as identity anchor for character consistency.`,
        }));
      }

      setPrompts(nextPrompts);
      setActiveTab("prompts");
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoadingPrompts(false);
    }
  }

  async function generateSeo() {
    try {
      setLoadingSeo(true);
      setError("");
      const prompt = buildSeoUserPrompt({ script, scenes, cover });
      const raw = await callAPI(prompt, SYS_SEO_ENGINE);
      const data = cleanJSON(raw);
      setSeo(data.seo || null);
      setActiveTab("seo");
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoadingSeo(false);
    }
  }

  async function generateTts() {
    try {
      setLoadingTts(true);
      setError("");
      const prompt = buildTtsUserPrompt({ scenes, language: lang });
      const raw = await callAPI(prompt, SYS_TTS_ENGINE);
      const data = cleanJSON(raw);
      const nextTts = data.tts || null;
      setTts(nextTts);
      if (nextTts?.full_script) setTtsScriptRaw(nextTts.full_script);
      setActiveTab("tts");
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoadingTts(false);
    }
  }

  function speakText(text) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ru" ? "ru-RU" : "en-US";
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeech() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }

  function updateCoverField(field, value) {
    setCover((prev) => ({ ...prev, [field]: value }));
  }

  async function copyText(key, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1200);
    } catch {}
  }

  function downloadProjectJson() {
    if (typeof window === "undefined") return;

    const payload = {
      name: projectName.trim() || "NeuroCine Project",
      lang,
      script,
      scenes,
      prompts,
      reference,
      refImage,
      cover,
      seo,
      tts,
      ttsSettings,
      ttsScriptRaw,
      ttsPackage,
      characterForms,
      characters,
      exportedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const safeName = (projectName.trim() || "neurocine-project")
      .toLowerCase()
      .replace(/[^a-z0-9а-яіїєґ_-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName || "neurocine-project"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function importProjectJson(file) {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "{}"));
        setProjectName(data.name || "Imported Project");
        setLang(data.lang || "ru");
        setScript(data.script || "");
        setScenes(data.scenes || []);
        setPrompts(data.prompts || []);
        setReference(data.reference || null);
        setRefImage(data.refImage || { dataUrl: "", fileName: "", mimeType: "", useAsAnchor: true });
        setCover(
          data.cover || {
            preset: "netflix",
            title: "ТВОЯ ИСТОРИЯ",
            subtitle: "КИНОШНЫЙ AI-РОЛИК",
            cta: "СМОТРИ ДО КОНЦА",
            posX: 50,
            posY: 58,
            backgroundPrompt: "dark cinematic background, dramatic contrast, volumetric light, high tension",
          }
        );
        setSeo(data.seo || null);
        setTts(data.tts || null);
        setTtsSettings(data.ttsSettings || defaultTtsSettings());
        setTtsScriptRaw(data.ttsScriptRaw || "");
        setCharacterForms(data.characterForms || [{ ...makeFormCharacter(1), name: "Alex" }]);
        setCharacters(
          data.characters || [
            buildCharacterDNA({
              name: "Alex",
              gender: "male",
              age: 28,
              style: "black tactical jacket, cinematic look",
            }),
          ]
        );
        setActiveTab("studio");
      } catch {
        alert(t.importError);
      }
    };

    reader.readAsText(file);
  }

  function saveSceneEdits(updated) {
    setScenes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingScene(null);
  }

  function savePromptEdits(updated) {
    setPrompts((prev) => prev.map((p) => (p.scene_id === updated.scene_id ? updated : p)));
    setEditingPrompt(null);
  }

  const exportScenes = JSON.stringify(scenes, null, 2);
  const exportPrompts = JSON.stringify(prompts, null, 2);
  const exportReference = JSON.stringify(reference || {}, null, 2);
  const exportCover = JSON.stringify(cover, null, 2);
  const exportSeo = JSON.stringify(seo || {}, null, 2);
  const exportTts = JSON.stringify(ttsPackage || {}, null, 2);
  const exportRefImage = JSON.stringify(
    {
      fileName: refImage.fileName,
      mimeType: refImage.mimeType,
      useAsAnchor: refImage.useAsAnchor,
      hasData: Boolean(refImage.dataUrl),
      dataUrl: refImage.dataUrl,
    },
    null,
    2
  );

  return (
    <main style={styles.page}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />
      <div style={styles.bgGrid} />

      <div style={styles.appShell}>
        <aside style={styles.sidebar}>
          <div style={styles.logoWrap}>
            <div style={styles.logoBadge}>🎬</div>
            <div>
              <div style={styles.logoTitle}>{t.appTitle}</div>
              <div style={styles.logoSub}>{t.appSub}</div>
            </div>
          </div>

          <div style={styles.sidebarGroupLabel}>{t.workspace}</div>

          <nav style={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  ...styles.navBtn,
                  ...(activeTab === item.key ? styles.navBtnActive : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{getTabLabel(t, item.key)}</span>
              </button>
            ))}
          </nav>

          <div style={styles.sidebarBottom}>
            <div style={styles.sidebarGroupLabel}>{t.summary}</div>
            <StatCard label={t.totalScenes} value={scenes.length} />
            <div style={{ height: 8 }} />
            <StatCard label={t.totalPrompts} value={prompts.length} />
            <div style={{ height: 8 }} />
            <StatCard label={t.charactersCount} value={characters.length} />
            <div style={{ height: 8 }} />
            <StatCard label={t.hasReference} value={reference ? t.yes : t.no} />
          </div>
        </aside>

        <section style={styles.main}>
          <header style={styles.topbar}>
            <div>
              <div style={styles.topbarTitle}>{getTabLabel(t, activeTab)}</div>
              <div style={styles.topbarSub}>{projectName || "NeuroCine Project"}</div>
            </div>

            <div style={styles.topbarRight}>
              <div style={styles.statusChip}>
                {saveStatus || t.statusDraft}
              </div>
              <div style={styles.langWrap}>
                <button onClick={() => setLang("ru")} style={{ ...styles.langBtn, ...(lang === "ru" ? styles.langBtnActive : {}) }}>RU</button>
                <button onClick={() => setLang("en")} style={{ ...styles.langBtn, ...(lang === "en" ? styles.langBtnActive : {}) }}>EN</button>
              </div>
            </div>
          </header>

          {error ? <div style={styles.errorBox}><b>Error:</b> {error}</div> : null}

          {activeTab === "studio" && (
            <div style={styles.contentStack}>
              <SectionHeader
                eyebrow={t.pipeline}
                title={t.script}
                description={t.scriptPlaceholder}
                right={<div style={styles.readyPill}>{t.statusReady}</div>}
              />

              <div style={styles.grid2}>
                <div style={styles.panel}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>{t.editor}</div>
                    <div style={styles.cardSub}>{t.script}</div>
                  </div>

                  <label style={styles.label}>
                    <span>{t.projectName}</span>
                    <input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder={t.projectNamePlaceholder}
                      style={styles.input}
                    />
                  </label>

                  <div style={styles.actionsRow}>
                    <button onClick={saveProject} style={styles.buttonSuccess}>💾 {t.saveProject}</button>
                    <div style={styles.softInfo}>{saveStatus || t.autoSaved}</div>
                  </div>

                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder={t.scriptPlaceholder}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.panel}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>{t.actions}</div>
                    <div style={styles.cardSub}>{t.pipeline}</div>
                  </div>

                  <div style={styles.actionGrid}>
                    <button onClick={generateScenes} style={styles.buttonPrimary}>
                      {loadingScenes ? `⏳ ${t.loading}` : `🚀 ${t.btnScenes}`}
                    </button>
                    <button onClick={generateReference} style={styles.buttonGhost}>
                      {loadingReference ? `⏳ ${t.loading}` : `🧬 ${t.btnReference}`}
                    </button>
                    <button onClick={generatePrompts} style={styles.buttonBlue}>
                      {loadingPrompts ? `⏳ ${t.loading}` : `🧠 ${t.btnPrompts}`}
                    </button>
                    <button onClick={generateTts} style={styles.buttonOrange}>
                      {loadingTts ? `⏳ ${t.loading}` : `🎤 ${t.btnTts}`}
                    </button>
                    <button onClick={generateSeo} style={styles.buttonSuccess}>
                      {loadingSeo ? `⏳ ${t.loading}` : `📈 ${t.btnSeo}`}
                    </button>
                  </div>

                  <div style={styles.summaryList}>
                    <div style={styles.summaryRow}><span>{t.totalScenes}</span><b>{scenes.length}</b></div>
                    <div style={styles.summaryRow}><span>{t.totalPrompts}</span><b>{prompts.length}</b></div>
                    <div style={styles.summaryRow}><span>{t.charactersCount}</span><b>{characters.length}</b></div>
                    <div style={styles.summaryRow}><span>{t.hasReference}</span><b>{reference ? t.yes : t.no}</b></div>
                  </div>
                </div>
              </div>

              <SectionHeader eyebrow={t.settings} title={t.character} description={t.visualPreset} />
              <div style={styles.panel}>
                <div style={styles.actionsRow}>
                  <button onClick={addCharacter} style={styles.buttonGhost}>➕ {t.addCharacter}</button>
                  <button onClick={updateCharacters} style={styles.buttonBlue}>🧬 {t.saveCharacter}</button>
                </div>

                <div style={styles.characterGrid}>
                  {characterForms.map((c) => (
                    <div key={c.id} style={styles.characterCard}>
                      <div style={styles.sceneHead}>
                        <div style={styles.characterName}>{c.name || "Character"}</div>
                        {characterForms.length > 1 ? (
                          <button onClick={() => removeCharacter(c.id)} style={styles.removeBtn}>{t.removeCharacter}</button>
                        ) : null}
                      </div>

                      <label style={styles.label}><span>{t.name}</span><input value={c.name} onChange={(e) => updateCharacterField(c.id, "name", e.target.value)} style={styles.input} /></label>
                      <label style={styles.label}>
                        <span>{t.gender}</span>
                        <select value={c.gender} onChange={(e) => updateCharacterField(c.id, "gender", e.target.value)} style={styles.input}>
                          <option value="male">{t.male}</option>
                          <option value="female">{t.female}</option>
                        </select>
                      </label>
                      <label style={styles.label}><span>{t.age}</span><input type="number" value={c.age} onChange={(e) => updateCharacterField(c.id, "age", e.target.value)} style={styles.input} /></label>
                      <label style={styles.label}><span>{t.style}</span><textarea value={c.style} onChange={(e) => updateCharacterField(c.id, "style", e.target.value)} style={styles.textareaSmall} /></label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reference" && (
            <div style={styles.contentStack}>
              <SectionHeader eyebrow={t.generated} title={t.reference} description={t.identityLock} />
              <div style={styles.panel}>
                {!reference ? (
                  <div style={styles.emptyBox}>{t.noReference}</div>
                ) : (
                  <div style={styles.stack}>
                    <div style={styles.infoLine}><b>Character:</b> {reference.character_name}</div>
                    <div style={styles.infoLine}><b>{t.identityLock}:</b> {reference.identity_lock}</div>
                    <div style={styles.infoLine}><b>{t.outfitLock}:</b> {reference.outfit_lock}</div>
                    <div style={styles.codeBlock}>{reference.reference_prompt_EN}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "refimage" && (
            <div style={styles.contentStack}>
              <SectionHeader eyebrow={t.settings} title={t.refImage} description={t.refNote} />
              <div style={styles.grid2}>
                <div style={styles.panel}>
                  <div style={styles.actionsRow}>
                    <label style={styles.buttonBlueLabel}>
                      📤 {t.uploadRef}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleRefImageUpload(e.target.files?.[0])}
                      />
                    </label>
                    {refImage.dataUrl ? (
                      <button onClick={removeRefImage} style={styles.removeBtn}>{t.removeRef}</button>
                    ) : null}
                  </div>

                  <label style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={refImage.useAsAnchor}
                      onChange={(e) => setRefImage((p) => ({ ...p, useAsAnchor: e.target.checked }))}
                    />
                    <span>{t.refImageUsed}</span>
                  </label>

                  <div style={styles.noteBox}>{t.refNote}</div>

                  {refImage.fileName ? (
                    <div style={styles.infoLine}><b>{t.refFileName}:</b> {refImage.fileName}</div>
                  ) : null}

                  {refImage.useAsAnchor && refImage.dataUrl ? (
                    <div style={styles.readyPill}>{t.refImageActive}</div>
                  ) : null}
                </div>

                <div style={styles.panel}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>{t.preview}</div>
                    <div style={styles.cardSub}>{t.refImage}</div>
                  </div>

                  {!refImage.dataUrl ? (
                    <div style={styles.emptyBox}>{t.noRefImage}</div>
                  ) : (
                    <div style={styles.imageCard}>
                      <img src={refImage.dataUrl} alt="reference" style={styles.refImagePreview} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "scenes" && (
            <div style={styles.contentStack}>
              <SectionHeader eyebrow={t.generated} title={t.scenes} description={t.pipeline} />
              <div style={styles.panel}>
                {!scenes.length ? (
                  <div style={styles.emptyBox}>{t.noScenes}</div>
                ) : (
                  <div style={styles.stack}>
                    {scenes.map((s, i) => (
                      <div key={i} style={styles.itemCard}>
                        <div style={styles.sceneHead}>
                          <div style={styles.itemTitle}>{s.id}</div>
                          <div style={styles.inlineActions}>
                            <div style={styles.modeBadge}>{t.mode}: {s.generation_mode}</div>
                            <button onClick={() => setEditingScene(s)} style={styles.smallButton}>{t.edit}</button>
                          </div>
                        </div>
                        <div style={styles.infoLine}><b>{t.goal}:</b> {s.scene_goal}</div>
                        <div style={styles.infoLine}><b>{t.voice}:</b> {s.voice}</div>
                        <div style={styles.infoLine}><b>{t.visual}:</b> {s.visual}</div>
                        <div style={styles.infoLine}><b>{t.camera}:</b> {s.camera}</div>
                        <div style={styles.infoLine}><b>{t.motion}:</b> {s.motion}</div>
                        <div style={styles.infoLine}><b>{t.lighting}:</b> {s.lighting}</div>
                        <div style={styles.infoLine}><b>{t.environment}:</b> {s.environment}</div>
                        <div style={styles.infoLine}><b>{t.sfx}:</b> {s.sfx}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "prompts" && (
            <div style={styles.contentStack}>
              <SectionHeader eyebrow={t.generated} title={t.prompts} description={t.results} />
              <div style={styles.panel}>
                {!prompts.length ? (
                  <div style={styles.emptyBox}>{t.noPrompts}</div>
                ) : (
                  <div style={styles.stack}>
                    {prompts.map((p, i) => (
                      <div key={i} style={styles.itemCard}>
                        <div style={styles.sceneHead}>
                          <div style={styles.itemTitle}>{p.scene_id}</div>
                          <div style={styles.inlineActions}>
                            <div style={styles.modeBadge}>{t.mode}: {p.generation_mode_final}</div>
                            <button onClick={() => setEditingPrompt(p)} style={styles.smallButton}>{t.edit}</button>
                          </div>
                        </div>

                        <div style={styles.blockLabel}>{t.imgPrompt}</div>
                        <div style={styles.codeBlock}>{p.imgPrompt_EN}</div>

                        <div style={styles.blockLabel}>{t.vidPrompt}</div>
                        <div style={styles.codeBlock}>{p.vidPrompt_EN}</div>

                        <div style={styles.blockLabel}>{t.negative}</div>
                        <div style={styles.codeBlock}>{p.negative_prompt}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "tts" && (
            <div style={styles.contentStack}>
              <SectionHeader eyebrow={t.settings} title={t.tts} description={t.ttsStudioReady} />

              <div style={styles.gridTts}>
                <div style={styles.panel}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>{t.settings}</div>
                    <div style={styles.cardSub}>{t.tts}</div>
                  </div>

                  <div style={styles.formGrid2}>
                    <label style={styles.label}>
                      <span>{t.ttsStyle}</span>
                      <select value={ttsSettings.style} onChange={(e) => setTtsSettings((p) => ({ ...p, style: e.target.value }))} style={styles.input}>
                        {TTS_STYLE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>

                    <label style={styles.label}>
                      <span>{t.ttsPace}</span>
                      <select value={ttsSettings.pace} onChange={(e) => setTtsSettings((p) => ({ ...p, pace: e.target.value }))} style={styles.input}>
                        {TTS_PACE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>

                    <label style={styles.label}>
                      <span>{t.ttsAccent}</span>
                      <select value={ttsSettings.accent} onChange={(e) => setTtsSettings((p) => ({ ...p, accent: e.target.value }))} style={styles.input}>
                        {TTS_ACCENT_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>

                    <label style={styles.label}>
                      <span>{t.ttsVoice}</span>
                      <input
                        value={ttsSettings.voice}
                        onChange={(e) => setTtsSettings((p) => ({ ...p, voice: e.target.value }))}
                        placeholder={t.ttsVoicePlaceholder}
                        style={styles.input}
                      />
                    </label>
                  </div>

                  <label style={styles.label}>
                    <span>{t.ttsSampleContext}</span>
                    <textarea
                      value={ttsSettings.sampleContext}
                      onChange={(e) => setTtsSettings((p) => ({ ...p, sampleContext: e.target.value }))}
                      placeholder={t.ttsSamplePlaceholder}
                      style={styles.textareaMedium}
                    />
                  </label>

                  <div style={styles.actionsRow}>
                    <button onClick={generateTts} style={styles.buttonOrange}>
                      {loadingTts ? `⏳ ${t.loading}` : `🎤 ${t.btnTts}`}
                    </button>
                    <button onClick={() => tts?.full_script && setTtsScriptRaw(tts.full_script)} style={styles.buttonGhost}>
                      {t.btnUseGenerated}
                    </button>
                  </div>
                </div>

                <div style={styles.panel}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>{t.results}</div>
                    <div style={styles.cardSub}>{t.ttsEmotionPreview}</div>
                  </div>

                  {parsedTtsScript.length ? (
                    <div style={styles.stack}>
                      {parsedTtsScript.map((seg, idx) => (
                        <div key={idx} style={styles.segmentCard}>
                          <div style={styles.emotionTag}>[{seg.emotion}]</div>
                          <div style={styles.segmentText}>{seg.text}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyBox}>{t.noTts}</div>
                  )}
                </div>
              </div>

              <div style={styles.panel}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>{t.editor}</div>
                  <div style={styles.cardSub}>{t.ttsScriptEditor}</div>
                </div>

                <textarea
                  value={ttsScriptRaw}
                  onChange={(e) => setTtsScriptRaw(e.target.value)}
                  placeholder={t.ttsRawPlaceholder}
                  style={styles.textareaLarge}
                />

                <div style={styles.actionsRow}>
                  <button onClick={() => speakText(ttsScriptRaw)} style={styles.buttonOrange}>{t.btnSpeak}</button>
                  <button onClick={stopSpeech} style={styles.buttonGhost}>{t.btnStop}</button>
                </div>
              </div>

              <div style={styles.panel}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitle}>{t.ttsPackagePreview}</div>
                  <div style={styles.cardSub}>{t.generated}</div>
                </div>

                {tts ? (
                  <div style={styles.stack}>
                    <div style={styles.itemCard}>
                      <div style={styles.blockLabel}>{t.ttsFullScript}</div>
                      <div style={styles.codeBlock}>{tts.full_script || ""}</div>
                    </div>

                    <div style={styles.itemCard}>
                      <div style={styles.blockLabel}>{t.ttsSegments}</div>
                      <div style={styles.stack}>
                        {(tts.segments || []).map((seg, idx) => (
                          <div key={idx} style={styles.segmentCard}>
                            <div style={styles.sceneHead}>
                              <div style={styles.itemTitle}>{seg.scene_id || `segment_${idx + 1}`}</div>
                              <button onClick={() => speakText(seg.text || "")} style={styles.smallButton}>{t.btnSpeak}</button>
                            </div>
                            <div style={styles.codeBlock}>{seg.text || ""}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div style={styles.codeBlock}>{JSON.stringify(ttsPackage, null, 2)}</div>
              </div>
            </div>
          )}

          {activeTab === "cover" && (
            <div style={styles.contentStack}>
              <SectionHeader eyebrow={t.settings} title={t.cover} description={t.preview} />

              <div style={styles.grid2}>
                <div style={styles.panel}>
                  <div style={styles.formGrid}>
                    <label style={styles.label}>
                      <span>{t.preset}</span>
                      <select value={cover.preset} onChange={(e) => updateCoverField("preset", e.target.value)} style={styles.input}>
                        {Object.entries(COVER_PRESETS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                      </select>
                    </label>

                    <label style={styles.label}><span>{t.coverTitle}</span><input value={cover.title} onChange={(e) => updateCoverField("title", e.target.value)} style={styles.input} /></label>
                    <label style={styles.label}><span>{t.coverSubtitle}</span><input value={cover.subtitle} onChange={(e) => updateCoverField("subtitle", e.target.value)} style={styles.input} /></label>
                    <label style={styles.label}><span>{t.coverCta}</span><input value={cover.cta} onChange={(e) => updateCoverField("cta", e.target.value)} style={styles.input} /></label>
                    <label style={styles.label}><span>{t.bgPrompt}</span><textarea value={cover.backgroundPrompt} onChange={(e) => updateCoverField("backgroundPrompt", e.target.value)} style={styles.textareaSmall} /></label>
                    <label style={styles.label}><span>{t.posX}: {cover.posX}</span><input type="range" min="0" max="100" value={cover.posX} onChange={(e) => updateCoverField("posX", Number(e.target.value))} /></label>
                    <label style={styles.label}><span>{t.posY}: {cover.posY}</span><input type="range" min="0" max="100" value={cover.posY} onChange={(e) => updateCoverField("posY", Number(e.target.value))} /></label>
                  </div>
                </div>

                <div style={styles.panel}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>{t.preview}</div>
                    <div style={styles.cardSub}>{preset.label}</div>
                  </div>

                  <div style={styles.coverPreview}>
                    <div style={styles.coverBg} />
                    <div
                      style={{
                        ...styles.coverTextWrap,
                        textAlign: preset.align,
                        left: `${cover.posX}%`,
                        top: `${cover.posY}%`,
                        transform: preset.transform,
                      }}
                    >
                      <div style={{ ...styles.coverHook, color: preset.hookColor, fontSize: preset.hookSize }}>{cover.subtitle}</div>
                      <div
                        style={{
                          ...styles.coverTitle,
                          color: preset.titleColor,
                          fontSize: preset.titleSize,
                          fontWeight: preset.titleWeight,
                          fontFamily: preset.titleFont,
                          WebkitTextStroke: preset.titleStroke,
                          textShadow: preset.titleShadow,
                        }}
                      >
                        {cover.title}
                      </div>
                      <div style={{ ...styles.coverCta, background: preset.ctaBg }}>{cover.cta}</div>
                    </div>
                  </div>

                  <div style={styles.codeBlock}>{cover.backgroundPrompt}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div style={styles.contentStack}>
              <SectionHeader eyebrow={t.generated} title={t.seo} description={t.results} />
              <div style={styles.panel}>
                {!seo ? (
                  <div style={styles.emptyBox}>{t.noSeo}</div>
                ) : (
                  <div style={styles.stack}>
                    <div style={styles.itemCard}>
                      <div style={styles.blockLabel}>{t.seoTitle}</div>
                      <div style={styles.codeBlock}>{seo.title || ""}</div>
                    </div>
                    <div style={styles.itemCard}>
                      <div style={styles.blockLabel}>{t.seoYoutube}</div>
                      <div style={styles.codeBlock}>{seo.youtube_shorts_title || ""}</div>
                    </div>
                    <div style={styles.itemCard}>
                      <div style={styles.blockLabel}>{t.seoDescription}</div>
                      <div style={styles.codeBlock}>{seo.description || ""}</div>
                    </div>
                    <div style={styles.itemCard}>
                      <div style={styles.blockLabel}>{t.seoHashtags}</div>
                      <div style={styles.codeBlock}>{Array.isArray(seo.hashtags) ? seo.hashtags.join(" ") : ""}</div>
                    </div>
                    <div style={styles.itemCard}>
                      <div style={styles.blockLabel}>{t.seoTikTok}</div>
                      <div style={styles.codeBlock}>{seo.tiktok_caption || ""}</div>
                    </div>
                    <div style={styles.itemCard}>
                      <div style={styles.blockLabel}>{t.seoFacebook}</div>
                      <div style={styles.codeBlock}>{seo.facebook_post || ""}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div style={styles.contentStack}>
              <SectionHeader eyebrow={t.workspace} title={t.projects} description={t.saveProject} />
              <div style={styles.panel}>
                {!savedProjects.length ? (
                  <div style={styles.emptyBox}>{t.noProjects}</div>
                ) : (
                  <div style={styles.stack}>
                    {savedProjects.map((project) => (
                      <div key={project.id} style={styles.itemCard}>
                        <div style={styles.sceneHead}>
                          <div>
                            <div style={styles.itemTitle}>{project.name}</div>
                            <div style={styles.metaLine}>{t.updatedAt}: {new Date(project.updatedAt || project.createdAt).toLocaleString()}</div>
                            <div style={styles.metaLine}>{t.createdAt}: {new Date(project.createdAt).toLocaleString()}</div>
                          </div>
                          <div style={styles.inlineActions}>
                            <button onClick={() => loadProject(project)} style={styles.buttonBlueSmall}>{t.loadProject}</button>
                            <button onClick={() => deleteProject(project.id)} style={styles.removeBtn}>{t.deleteProject}</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div style={styles.contentStack}>
              <SectionHeader eyebrow={t.pipeline} title={t.export} description={t.downloadJson} />
              <div style={styles.panel}>
                <div style={styles.actionsRow}>
                  <button onClick={downloadProjectJson} style={styles.buttonBlue}>⬇️ {t.downloadJson}</button>
                  <label style={styles.buttonGhostLabel}>
                    📂 {t.importJson}
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={(e) => importProjectJson(e.target.files?.[0])}
                    />
                  </label>
                </div>

                <div style={styles.stack}>
                  {[
                    [t.exportScenes, "scenes", exportScenes],
                    [t.exportPrompts, "prompts", exportPrompts],
                    [t.exportReference, "reference", exportReference],
                    [t.exportRefImage, "refimage", exportRefImage],
                    [t.exportCover, "cover", exportCover],
                    [t.exportSeo, "seo", exportSeo],
                    [t.exportTts, "tts", exportTts],
                  ].map(([title, key, value]) => (
                    <div key={key} style={styles.itemCard}>
                      <div style={styles.sceneHead}>
                        <div style={styles.itemTitle}>{title}</div>
                        <button onClick={() => copyText(key, value)} style={styles.smallButton}>
                          {copiedKey === key ? t.copied : t.copy}
                        </button>
                      </div>
                      <div style={styles.codeBlock}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <SceneEditorModal scene={editingScene} t={t} onClose={() => setEditingScene(null)} onSave={saveSceneEdits} />
      <PromptEditorModal prompt={editingPrompt} t={t} onClose={() => setEditingPrompt(null)} onSave={savePromptEdits} />
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050816",
    color: "#eef2ff",
    position: "relative",
    overflow: "hidden",
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  bgOrb1: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(79,70,229,0.22), transparent 68%)",
    top: -120,
    left: -80,
    pointerEvents: "none",
  },
  bgOrb2: {
    position: "absolute",
    width: 580,
    height: 580,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)",
    bottom: -180,
    right: -120,
    pointerEvents: "none",
  },
  bgGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "36px 36px",
    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.15))",
    pointerEvents: "none",
  },
  appShell: {
    position: "relative",
    zIndex: 2,
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    minHeight: "100vh",
  },
  sidebar: {
    borderRight: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(8,12,26,0.82)",
    backdropFilter: "blur(20px)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "8px 4px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontSize: 24,
    background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(168,85,247,0.22))",
    border: "1px solid rgba(129,140,248,0.35)",
  },
  logoTitle: { fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em" },
  logoSub: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  sidebarGroupLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "#64748b",
    fontWeight: 800,
    marginTop: 4,
  },
  nav: { display: "grid", gap: 8 },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid transparent",
    background: "transparent",
    color: "#cbd5e1",
    textAlign: "left",
    fontWeight: 700,
    cursor: "pointer",
    transition: "0.2s ease",
  },
  navBtnActive: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.18))",
    border: "1px solid rgba(129,140,248,0.38)",
    color: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },
  navIcon: { width: 20, textAlign: "center", fontSize: 16 },
  sidebarBottom: { marginTop: "auto" },
  statCard: {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
  },
  statLabel: { color: "#94a3b8", fontSize: 12, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: 900 },
  main: {
    padding: 22,
    overflow: "auto",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    padding: "6px 2px 18px",
  },
  topbarTitle: { fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em" },
  topbarSub: { color: "#94a3b8", marginTop: 3 },
  topbarRight: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  statusChip: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#cbd5e1",
    fontWeight: 700,
    fontSize: 13,
  },
  langWrap: { display: "flex", gap: 8 },
  langBtn: {
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  langBtnActive: {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    border: "1px solid rgba(129,140,248,0.45)",
  },
  errorBox: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.28)",
    color: "#fecaca",
  },
  contentStack: { display: "grid", gap: 18 },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    flexWrap: "wrap",
  },
  sectionEyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "#818cf8",
    fontWeight: 900,
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em" },
  sectionDescription: { color: "#94a3b8", marginTop: 4, maxWidth: 760 },
  readyPill: {
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(16,185,129,0.15)",
    border: "1px solid rgba(16,185,129,0.35)",
    color: "#86efac",
    fontWeight: 800,
    fontSize: 13,
  },
  grid2: { display: "grid", gridTemplateColumns: "1.4fr 0.9fr", gap: 18 },
  gridTts: { display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 18 },
  panel: {
    background: "rgba(13,18,34,0.78)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 18,
    backdropFilter: "blur(20px)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
  },
  cardHeader: { marginBottom: 14 },
  cardTitle: { fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em" },
  cardSub: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  label: { display: "grid", gap: 7, fontSize: 13, color: "#cbd5e1", marginBottom: 12 },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    width: "100%",
    minHeight: 260,
    resize: "vertical",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    padding: 16,
    fontSize: 15,
    lineHeight: 1.6,
    outline: "none",
    boxSizing: "border-box",
  },
  textareaSmall: {
    width: "100%",
    minHeight: 100,
    resize: "vertical",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    padding: 14,
    fontSize: 14,
    lineHeight: 1.5,
    outline: "none",
    boxSizing: "border-box",
  },
  textareaMedium: {
    width: "100%",
    minHeight: 120,
    resize: "vertical",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    padding: 15,
    fontSize: 14,
    lineHeight: 1.5,
    outline: "none",
    boxSizing: "border-box",
  },
  textareaLarge: {
    width: "100%",
    minHeight: 260,
    resize: "vertical",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    padding: 16,
    fontSize: 15,
    lineHeight: 1.6,
    outline: "none",
    boxSizing: "border-box",
  },
  actionsRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 },
  actionGrid: { display: "grid", gap: 10 },
  buttonPrimary: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(129,140,248,0.4)",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  buttonGhost: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  buttonBlue: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(59,130,246,0.38)",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  buttonOrange: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(249,115,22,0.38)",
    background: "linear-gradient(135deg, #ea580c, #f97316)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  buttonSuccess: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(16,185,129,0.35)",
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  buttonBlueSmall: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(59,130,246,0.35)",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  buttonBlueLabel: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(59,130,246,0.38)",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  buttonGhostLabel: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  smallButton: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  softInfo: {
    padding: "10px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#a5b4fc",
    fontWeight: 700,
    fontSize: 13,
  },
  summaryList: {
    display: "grid",
    gap: 10,
    marginTop: 10,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    color: "#cbd5e1",
  },
  characterGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 },
  characterCard: {
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  characterName: { fontSize: 17, fontWeight: 900 },
  stack: { display: "grid", gap: 14 },
  itemCard: {
    padding: 16,
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  sceneHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  itemTitle: { fontSize: 17, fontWeight: 900, letterSpacing: "-0.02em" },
  inlineActions: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  modeBadge: {
    fontSize: 12,
    color: "#c4b5fd",
    background: "rgba(124,58,237,0.15)",
    border: "1px solid rgba(124,58,237,0.35)",
    padding: "7px 10px",
    borderRadius: 999,
    fontWeight: 700,
  },
  infoLine: { color: "#e2e8f0", lineHeight: 1.6 },
  metaLine: { color: "#94a3b8", fontSize: 13, marginTop: 3 },
  blockLabel: { fontWeight: 800, marginTop: 4, marginBottom: 6, color: "#cbd5e1" },
  codeBlock: {
    marginTop: 6,
    padding: 14,
    borderRadius: 14,
    background: "#060b18",
    border: "1px solid rgba(148,163,184,0.18)",
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
    color: "#e2e8f0",
    overflowX: "auto",
    fontSize: 14,
  },
  emptyBox: {
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    border: "1px dashed rgba(255,255,255,0.12)",
    color: "#94a3b8",
  },
  noteBox: {
    padding: 14,
    borderRadius: 16,
    background: "rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.2)",
    color: "#bfdbfe",
    lineHeight: 1.6,
    marginBottom: 14,
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    color: "#e2e8f0",
  },
  imageCard: {
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#060b18",
  },
  refImagePreview: {
    display: "block",
    width: "100%",
    height: "auto",
    objectFit: "cover",
  },
  segmentCard: {
    padding: 14,
    borderRadius: 16,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  emotionTag: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(249,115,22,0.12)",
    border: "1px solid rgba(249,115,22,0.3)",
    color: "#fdba74",
    fontWeight: 800,
    fontSize: 12,
    marginBottom: 10,
  },
  segmentText: { color: "#e2e8f0", lineHeight: 1.6 },
  formGrid: { display: "grid", gap: 12 },
  formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  coverPreview: {
    position: "relative",
    width: "100%",
    aspectRatio: "9 / 16",
    overflow: "hidden",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#0b1120",
    marginBottom: 14,
  },
  coverBg: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 30% 20%, rgba(168,85,247,0.35), transparent 30%), radial-gradient(circle at 70% 80%, rgba(59,130,246,0.22), transparent 30%), linear-gradient(180deg, #0f172a 0%, #020617 100%)",
  },
  coverTextWrap: { position: "absolute", width: "82%" },
  coverHook: {
    fontWeight: 800,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
    textShadow: "0 2px 10px rgba(0,0,0,0.8)",
  },
  coverTitle: {
    lineHeight: 1.05,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  coverCta: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 900,
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 999,
    boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
    letterSpacing: 1,
  },
  removeBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.28)",
    background: "rgba(239,68,68,0.12)",
    color: "#fca5a5",
    fontWeight: 800,
    cursor: "pointer",
  },
};

const modal = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.78)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  },
  panel: {
    width: "min(920px, 100%)",
    maxHeight: "90vh",
    overflow: "auto",
    background: "#0b1120",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 18,
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: 900 },
  closeBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  grid: { display: "grid", gap: 12 },
  label: { display: "grid", gap: 6, fontSize: 14, color: "#d4d4d8" },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: 80,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    resize: "vertical",
    boxSizing: "border-box",
  },
  textareaLg: {
    width: "100%",
    minHeight: 160,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    resize: "vertical",
    boxSizing: "border-box",
  },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 },
  primary: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(59,130,246,0.45)",
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondary: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
};
