"use client";

import { useMemo, useState } from "react";
import { SYS_SCENE_ENGINE, buildSceneUserPrompt } from "../engine/sceneEngine";
import { SYS_PROMPT_ENGINE, buildPromptUserPrompt } from "../engine/promptEngine";
import { SYS_REFERENCE_ENGINE, buildReferenceUserPrompt } from "../engine/referenceEngine";
import { buildCharacterDNA, injectCharactersIntoScript } from "../engine/characterEngine";

const TEXT = {
  ru: {
    appTitle: "NeuroCine Studio",
    appSub: "AI видео-студия",
    script: "Сценарий",
    scriptPlaceholder: "Вставь сценарий или идею...",
    character: "Персонажи",
    reference: "Reference",
    scenes: "Сцены",
    prompts: "Промпты",
    cover: "Cover Studio",
    export: "Экспорт",
    noReference: "Reference пока не создан",
    noScenes: "Сцен пока нет",
    noPrompts: "Промптов пока нет",
    btnScenes: "Сгенерировать сцены",
    btnReference: "Сгенерировать reference",
    btnPrompts: "Сгенерировать промпты",
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
    tabStudio: "Студия",
    tabScenes: "Сцены",
    tabPrompts: "Промпты",
    tabReference: "Reference",
    tabCover: "Обложка",
    tabExport: "Экспорт",
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
    exportScenes: "Экспорт сцен",
    exportPrompts: "Экспорт промптов",
    exportReference: "Экспорт reference",
    exportCover: "Экспорт cover",
  },
  en: {
    appTitle: "NeuroCine Studio",
    appSub: "AI video studio",
    script: "Script",
    scriptPlaceholder: "Paste your script or idea...",
    character: "Characters",
    reference: "Reference",
    scenes: "Scenes",
    prompts: "Prompts",
    cover: "Cover Studio",
    export: "Export",
    noReference: "Reference not created yet",
    noScenes: "No scenes yet",
    noPrompts: "No prompts yet",
    btnScenes: "Generate scenes",
    btnReference: "Generate reference",
    btnPrompts: "Generate prompts",
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
    tabCover: "Cover",
    tabExport: "Export",
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
    exportScenes: "Export scenes",
    exportPrompts: "Export prompts",
    exportReference: "Export reference",
    exportCover: "Export cover",
  },
};

const COVER_PRESETS = {
  netflix: { label: "Netflix", hookColor: "#e50914", titleColor: "#ffffff", ctaBg: "rgba(229,9,20,0.95)", titleSize: 34, hookSize: 13, align: "center", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 6px 20px rgba(0,0,0,0.9)" },
  mrbeast: { label: "MrBeast", hookColor: "#ffdd00", titleColor: "#ffffff", ctaBg: "rgba(236,72,153,0.95)", titleSize: 42, hookSize: 16, align: "center", transform: "translate(-50%, -50%) rotate(-3deg)", titleWeight: 900, titleFont: "Impact, sans-serif", titleStroke: "2px #000", titleShadow: "5px 5px 0 #000, 0 0 20px rgba(0,0,0,0.7)" },
  tiktok: { label: "TikTok", hookColor: "#00f2ea", titleColor: "#ffffff", ctaBg: "rgba(255,0,80,0.95)", titleSize: 32, hookSize: 14, align: "center", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 0 20px rgba(0,242,234,0.35), 0 6px 20px rgba(0,0,0,0.8)" },
  truecrime: { label: "True Crime", hookColor: "#facc15", titleColor: "#ffffff", ctaBg: "rgba(0,0,0,0.9)", titleSize: 30, hookSize: 12, align: "left", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 4px 18px rgba(0,0,0,0.9)" },
  history: { label: "History", hookColor: "#d4af37", titleColor: "#f8fafc", ctaBg: "rgba(180,83,9,0.9)", titleSize: 36, hookSize: 12, align: "center", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Georgia, serif", titleStroke: "none", titleShadow: "0 6px 20px rgba(0,0,0,0.9)" },
  minimal: { label: "Minimal", hookColor: "#cbd5e1", titleColor: "#ffffff", ctaBg: "rgba(51,65,85,0.9)", titleSize: 26, hookSize: 11, align: "center", transform: "translate(-50%, -50%)", titleWeight: 400, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 4px 10px rgba(0,0,0,0.7)" },
  breakingnews: { label: "Breaking News", hookColor: "#ffffff", titleColor: "#ffffff", ctaBg: "rgba(220,38,38,0.95)", titleSize: 30, hookSize: 12, align: "center", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Arial Black, sans-serif", titleStroke: "none", titleShadow: "0 4px 15px rgba(0,0,0,0.8)" },
  cyberpunk: { label: "Cyberpunk", hookColor: "#fef08a", titleColor: "#ffffff", ctaBg: "rgba(236,72,153,0.95)", titleSize: 40, hookSize: 14, align: "center", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Orbitron, Inter, sans-serif", titleStroke: "none", titleShadow: "3px 3px 0 #ec4899, -3px -3px 0 #06b6d4, 0 0 20px rgba(0,0,0,0.8)" },
  natgeo: { label: "NatGeo", hookColor: "#facc15", titleColor: "#ffffff", ctaBg: "rgba(250,204,21,0.9)", titleSize: 30, hookSize: 12, align: "center", transform: "translate(-50%, -50%)", titleWeight: 900, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 4px 15px rgba(0,0,0,0.8)" },
  horror: { label: "Horror", hookColor: "#ffffff", titleColor: "#ef4444", ctaBg: "rgba(127,29,29,0.95)", titleSize: 46, hookSize: 14, align: "center", transform: "translate(-50%, -50%)", titleWeight: 400, titleFont: "Creepster, Impact, serif", titleStroke: "none", titleShadow: "0 5px 20px #000" },
  podcast: { label: "Podcast", hookColor: "#a855f7", titleColor: "#ffffff", ctaBg: "rgba(17,24,39,0.95)", titleSize: 28, hookSize: 12, align: "center", transform: "translate(-50%, -50%)", titleWeight: 800, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 4px 14px rgba(0,0,0,0.8)" },
  science: { label: "Science", hookColor: "#0ea5e9", titleColor: "#ffffff", ctaBg: "rgba(14,165,233,0.9)", titleSize: 24, hookSize: 11, align: "left", transform: "translate(-50%, -50%)", titleWeight: 800, titleFont: "IBM Plex Sans, Inter, sans-serif", titleStroke: "none", titleShadow: "0 4px 14px rgba(0,0,0,0.8)" },
  retro: { label: "Retro 80s", hookColor: "#f472b6", titleColor: "#ffffff", ctaBg: "rgba(56,189,248,0.95)", titleSize: 40, hookSize: 15, align: "center", transform: "translate(-50%, -50%) rotate(-4deg)", titleWeight: 900, titleFont: "Permanent Marker, Impact, sans-serif", titleStroke: "1px #38bdf8", titleShadow: "0 0 15px rgba(236,72,153,0.6), 0 4px 14px rgba(0,0,0,0.8)" },
  quote: { label: "Quote", hookColor: "#fbbf24", titleColor: "#ffffff", ctaBg: "rgba(251,191,36,0.9)", titleSize: 26, hookSize: 30, align: "center", transform: "translate(-50%, -50%)", titleWeight: 400, titleFont: "Georgia, serif", titleStroke: "none", titleShadow: "0 4px 14px rgba(0,0,0,0.8)" },
  luxury: { label: "Luxury", hookColor: "#e7c873", titleColor: "#fff8dc", ctaBg: "rgba(180,140,40,0.95)", titleSize: 34, hookSize: 12, align: "center", transform: "translate(-50%, -50%)", titleWeight: 700, titleFont: "Times New Roman, Georgia, serif", titleStroke: "none", titleShadow: "0 6px 20px rgba(0,0,0,0.9)" },
  documentarypro: { label: "Documentary Pro", hookColor: "#93c5fd", titleColor: "#ffffff", ctaBg: "rgba(30,41,59,0.95)", titleSize: 28, hookSize: 11, align: "left", transform: "translate(-50%, -50%)", titleWeight: 800, titleFont: "Inter, sans-serif", titleStroke: "none", titleShadow: "0 4px 14px rgba(0,0,0,0.8)" },
};

function makeFormCharacter(index = 1) {
  return { id: `char_${index}`, name: `Character ${index}`, gender: "male", age: 28, style: "black tactical jacket, cinematic look" };
}

export default function Page() {
  const [lang, setLang] = useState("ru");
  const [activeTab, setActiveTab] = useState("studio");
  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [reference, setReference] = useState(null);
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [loadingReference, setLoadingReference] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

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
    buildCharacterDNA({ name: "Alex", gender: "male", age: 28, style: "black tactical jacket, cinematic look" }),
  ]);

  const t = useMemo(() => TEXT[lang], [lang]);
  const preset = COVER_PRESETS[cover.preset] || COVER_PRESETS.netflix;

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
  }

  async function generateScenes() {
    try {
      setLoadingScenes(true);
      setError("");
      setScenes([]);
      setPrompts([]);
      const scriptWithChars = injectCharactersIntoScript(script, characters);
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
      const prompt = buildReferenceUserPrompt({ characters });
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
      const prompt = buildPromptUserPrompt({ scenes, reference });
      const raw = await callAPI(prompt, SYS_PROMPT_ENGINE);
      const data = cleanJSON(raw);
      setPrompts(data.prompts || []);
      setActiveTab("prompts");
    } catch (e) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoadingPrompts(false);
    }
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

  const exportScenes = JSON.stringify(scenes, null, 2);
  const exportPrompts = JSON.stringify(prompts, null, 2);
  const exportReference = JSON.stringify(reference || {}, null, 2);
  const exportCover = JSON.stringify(cover, null, 2);

  return (
    <main style={styles.page}>
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <div style={styles.title}>🎬 {t.appTitle}</div>
            <div style={styles.subtitle}>{t.appSub}</div>
          </div>

          <div style={styles.langWrap}>
            <button onClick={() => setLang("ru")} style={{ ...styles.langBtn, ...(lang === "ru" ? styles.langBtnActive : {}) }}>RU</button>
            <button onClick={() => setLang("en")} style={{ ...styles.langBtn, ...(lang === "en" ? styles.langBtnActive : {}) }}>EN</button>
          </div>
        </header>

        <nav style={styles.tabs}>
          <button onClick={() => setActiveTab("studio")} style={{ ...styles.tabBtn, ...(activeTab === "studio" ? styles.tabBtnActive : {}) }}>{t.tabStudio}</button>
          <button onClick={() => setActiveTab("reference")} style={{ ...styles.tabBtn, ...(activeTab === "reference" ? styles.tabBtnActive : {}) }}>{t.tabReference}</button>
          <button onClick={() => setActiveTab("scenes")} style={{ ...styles.tabBtn, ...(activeTab === "scenes" ? styles.tabBtnActive : {}) }}>{t.tabScenes}</button>
          <button onClick={() => setActiveTab("prompts")} style={{ ...styles.tabBtn, ...(activeTab === "prompts" ? styles.tabBtnActive : {}) }}>{t.tabPrompts}</button>
          <button onClick={() => setActiveTab("cover")} style={{ ...styles.tabBtn, ...(activeTab === "cover" ? styles.tabBtnActive : {}) }}>{t.tabCover}</button>
          <button onClick={() => setActiveTab("export")} style={{ ...styles.tabBtn, ...(activeTab === "export" ? styles.tabBtnActive : {}) }}>{t.tabExport}</button>
        </nav>

        {error ? <div style={styles.errorBox}><b>Error:</b> {error}</div> : null}

        {activeTab === "studio" && (
          <section style={styles.grid}>
            <div style={styles.cardLarge}>
              <div style={styles.cardTitle}>{t.script}</div>
              <textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder={t.scriptPlaceholder} style={styles.textarea} />
              <div style={styles.actions}>
                <button onClick={generateScenes} style={styles.primaryBtn}>{loadingScenes ? `⏳ ${t.loading}` : `🚀 ${t.btnScenes}`}</button>
                <button onClick={generateReference} style={styles.secondaryBtn}>{loadingReference ? `⏳ ${t.loading}` : `🖼 ${t.btnReference}`}</button>
                <button onClick={generatePrompts} style={styles.secondaryBlueBtn}>{loadingPrompts ? `⏳ ${t.loading}` : `🎥 ${t.btnPrompts}`}</button>
              </div>
            </div>

            <div style={styles.cardSide}>
              <div style={styles.cardTitle}>{t.character}</div>
              <div style={styles.actions}>
                <button onClick={addCharacter} style={styles.secondaryBtn}>➕ {t.addCharacter}</button>
                <button onClick={updateCharacters} style={styles.secondaryBlueBtn}>🧬 {t.saveCharacter}</button>
              </div>

              <div style={styles.formGrid}>
                {characterForms.map((c, idx) => (
                  <div key={c.id} style={styles.characterCard}>
                    <div style={styles.sceneHead}>
                      <div style={styles.sceneId}>{c.name || `Character ${idx + 1}`}</div>
                      {characterForms.length > 1 ? <button onClick={() => removeCharacter(c.id)} style={styles.removeBtn}>{t.removeCharacter}</button> : null}
                    </div>

                    <label style={styles.label}><span>{t.name}</span><input value={c.name} onChange={(e) => updateCharacterField(c.id, "name", e.target.value)} style={styles.input} /></label>
                    <label style={styles.label}><span>{t.gender}</span><select value={c.gender} onChange={(e) => updateCharacterField(c.id, "gender", e.target.value)} style={styles.input}><option value="male">{t.male}</option><option value="female">{t.female}</option></select></label>
                    <label style={styles.label}><span>{t.age}</span><input type="number" value={c.age} onChange={(e) => updateCharacterField(c.id, "age", e.target.value)} style={styles.input} /></label>
                    <label style={styles.label}><span>{t.style}</span><textarea value={c.style} onChange={(e) => updateCharacterField(c.id, "style", e.target.value)} style={{ ...styles.input, minHeight: 90, resize: "vertical" }} /></label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "reference" && (
          <section style={styles.cardFull}>
            <div style={styles.cardTitle}>{t.reference}</div>
            {!reference ? <div style={styles.empty}>{t.noReference}</div> : (
              <div style={styles.stack}>
                <div><b>Character:</b> {reference.character_name}</div>
                <div><b>{t.identityLock}:</b> {reference.identity_lock}</div>
                <div><b>{t.outfitLock}:</b> {reference.outfit_lock}</div>
                <div style={styles.codeBlock}>{reference.reference_prompt_EN}</div>
              </div>
            )}
          </section>
        )}

        {activeTab === "scenes" && (
          <section style={styles.cardFull}>
            <div style={styles.cardTitle}>{t.scenes}</div>
            {!scenes.length ? <div style={styles.empty}>{t.noScenes}</div> : (
              <div style={styles.stack}>
                {scenes.map((s, i) => (
                  <div key={i} style={styles.sceneBox}>
                    <div style={styles.sceneHead}>
                      <div style={styles.sceneId}>{s.id}</div>
                      <div style={styles.badge}>{t.mode}: {s.generation_mode}</div>
                    </div>
                    <div><b>{t.goal}:</b> {s.scene_goal}</div>
                    <div><b>{t.voice}:</b> {s.voice}</div>
                    <div><b>{t.visual}:</b> {s.visual}</div>
                    <div><b>{t.camera}:</b> {s.camera}</div>
                    <div><b>{t.motion}:</b> {s.motion}</div>
                    <div><b>{t.lighting}:</b> {s.lighting}</div>
                    <div><b>{t.environment}:</b> {s.environment}</div>
                    <div><b>{t.sfx}:</b> {s.sfx}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "prompts" && (
          <section style={styles.cardFull}>
            <div style={styles.cardTitle}>{t.prompts}</div>
            {!prompts.length ? <div style={styles.empty}>{t.noPrompts}</div> : (
              <div style={styles.stack}>
                {prompts.map((p, i) => (
                  <div key={i} style={styles.sceneBox}>
                    <div style={styles.sceneHead}>
                      <div style={styles.sceneId}>{p.scene_id}</div>
                      <div style={styles.badge}>{t.mode}: {p.generation_mode_final}</div>
                    </div>
                    <div style={styles.codeBlock}>{p.imgPrompt_EN}</div>
                    <div style={styles.codeBlock}>{p.vidPrompt_EN}</div>
                    <div style={styles.codeBlock}>{p.negative_prompt}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "cover" && (
          <section style={styles.grid}>
            <div style={styles.cardLarge}>
              <div style={styles.cardTitle}>{t.cover}</div>

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
                <label style={styles.label}><span>{t.bgPrompt}</span><textarea value={cover.backgroundPrompt} onChange={(e) => updateCoverField("backgroundPrompt", e.target.value)} style={{ ...styles.input, minHeight: 90, resize: "vertical" }} /></label>
                <label style={styles.label}><span>{t.posX}: {cover.posX}</span><input type="range" min="0" max="100" value={cover.posX} onChange={(e) => updateCoverField("posX", Number(e.target.value))} /></label>
                <label style={styles.label}><span>{t.posY}: {cover.posY}</span><input type="range" min="0" max="100" value={cover.posY} onChange={(e) => updateCoverField("posY", Number(e.target.value))} /></label>
              </div>
            </div>

            <div style={styles.cardSide}>
              <div style={styles.cardTitle}>{t.preview}</div>
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
          </section>
        )}

        {activeTab === "export" && (
          <section style={styles.cardFull}>
            <div style={styles.cardTitle}>{t.export}</div>

            <div style={styles.stack}>
              <div style={styles.exportBlock}>
                <div style={styles.sceneHead}>
                  <div style={styles.sceneId}>{t.exportScenes}</div>
                  <button onClick={() => copyText("scenes", exportScenes)} style={styles.secondaryBtn}>
                    {copiedKey === "scenes" ? t.copied : t.copy}
                  </button>
                </div>
                <div style={styles.codeBlock}>{exportScenes}</div>
              </div>

              <div style={styles.exportBlock}>
                <div style={styles.sceneHead}>
                  <div style={styles.sceneId}>{t.exportPrompts}</div>
                  <button onClick={() => copyText("prompts", exportPrompts)} style={styles.secondaryBtn}>
                    {copiedKey === "prompts" ? t.copied : t.copy}
                  </button>
                </div>
                <div style={styles.codeBlock}>{exportPrompts}</div>
              </div>

              <div style={styles.exportBlock}>
                <div style={styles.sceneHead}>
                  <div style={styles.sceneId}>{t.exportReference}</div>
                  <button onClick={() => copyText("reference", exportReference)} style={styles.secondaryBtn}>
                    {copiedKey === "reference" ? t.copied : t.copy}
                  </button>
                </div>
                <div style={styles.codeBlock}>{exportReference}</div>
              </div>

              <div style={styles.exportBlock}>
                <div style={styles.sceneHead}>
                  <div style={styles.sceneId}>{t.exportCover}</div>
                  <button onClick={() => copyText("cover", exportCover)} style={styles.secondaryBtn}>
                    {copiedKey === "cover" ? t.copied : t.copy}
                  </button>
                </div>
                <div style={styles.codeBlock}>{exportCover}</div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#06070d",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "20px 14px 50px",
  },
  bgGlowTop: {
    position: "absolute",
    top: -120,
    left: "50%",
    transform: "translateX(-50%)",
    width: 500,
    height: 500,
    background: "radial-gradient(circle, rgba(124,58,237,0.22), transparent 65%)",
    pointerEvents: "none",
  },
  bgGlowBottom: {
    position: "absolute",
    bottom: -180,
    right: -80,
    width: 420,
    height: 420,
    background: "radial-gradient(circle, rgba(59,130,246,0.16), transparent 65%)",
    pointerEvents: "none",
  },
  shell: { maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 },
  title: { fontSize: 40, fontWeight: 900, letterSpacing: "-0.05em" },
  subtitle: { color: "#a1a1aa", marginTop: 4 },
  langWrap: { display: "flex", gap: 8 },
  langBtn: { padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontWeight: 700 },
  langBtnActive: { background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "1px solid rgba(168,85,247,0.7)" },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 },
  tabBtn: { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#fff", fontWeight: 700 },
  tabBtnActive: { background: "rgba(124,58,237,0.18)", border: "1px solid rgba(168,85,247,0.45)" },
  errorBox: { marginBottom: 14, padding: 12, borderRadius: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5" },
  grid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 },
  cardLarge: { background: "rgba(14,14,24,0.92)", border: "1px solid rgba(168,85,247,0.22)", borderRadius: 18, padding: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.25)" },
  cardSide: { background: "rgba(14,14,24,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.25)" },
  cardFull: { background: "rgba(14,14,24,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.25)" },
  cardTitle: { fontSize: 22, fontWeight: 900, marginBottom: 14 },
  textarea: { width: "100%", minHeight: 180, resize: "vertical", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", padding: 16, fontSize: 16, outline: "none", boxSizing: "border-box" },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14, marginBottom: 14 },
  primaryBtn: { padding: "14px 18px", borderRadius: 14, border: "1px solid rgba(168,85,247,0.45)", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", fontWeight: 800, fontSize: 15 },
  secondaryBtn: { padding: "14px 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 800, fontSize: 15 },
  secondaryBlueBtn: { padding: "14px 18px", borderRadius: 14, border: "1px solid rgba(59,130,246,0.45)", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#fff", fontWeight: 800, fontSize: 15 },
  formGrid: { display: "grid", gap: 12 },
  characterCard: { padding: 12, borderRadius: 14, background: "#0f172a", border: "1px solid #334155", display: "grid", gap: 10 },
  label: { display: "grid", gap: 6, fontSize: 14, color: "#d4d4d8" },
  input: { width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", boxSizing: "border-box" },
  empty: { padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.03)", color: "#a1a1aa" },
  stack: { display: "grid", gap: 14 },
  exportBlock: { display: "grid", gap: 8 },
  sceneBox: { padding: 14, borderRadius: 14, background: "#0f172a", border: "1px solid #334155", display: "grid", gap: 8 },
  sceneHead: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 2 },
  sceneId: { fontSize: 18, fontWeight: 900 },
  badge: { fontSize: 12, color: "#c4b5fd", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", padding: "6px 10px", borderRadius: 999 },
  codeBlock: { marginTop: 6, padding: 12, borderRadius: 10, background: "#020617", border: "1px solid #334155", whiteSpace: "pre-wrap", lineHeight: 1.5, color: "#e4e4e7" },
  removeBtn: { padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.1)", color: "#fca5a5", fontWeight: 700 },
  coverPreview: { position: "relative", width: "100%", aspectRatio: "9 / 16", overflow: "hidden", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "#0b1120", marginBottom: 14 },
  coverBg: { position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 20%, rgba(168,85,247,0.35), transparent 30%), radial-gradient(circle at 70% 80%, rgba(59,130,246,0.22), transparent 30%), linear-gradient(180deg, #0f172a 0%, #020617 100%)" },
  coverTextWrap: { position: "absolute", width: "82%" },
  coverHook: { fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, textShadow: "0 2px 10px rgba(0,0,0,0.8)" },
  coverTitle: { lineHeight: 1.05, textTransform: "uppercase", marginBottom: 10 },
  coverCta: { display: "inline-block", fontSize: 12, fontWeight: 900, color: "#fff", padding: "8px 14px", borderRadius: 999, boxShadow: "0 6px 16px rgba(0,0,0,0.35)", letterSpacing: 1 },
};
