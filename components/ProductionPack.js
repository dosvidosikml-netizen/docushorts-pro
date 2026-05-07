// components/ProductionPack.js
// NeuroCine Production Pack v1
// Использует родные классы сайта: .step-section, .step-header, .step-body,
// .out-box, .out-head, .out-body, .out-pre, .field, .frow, .btn, .fb, .frame-card
// Никакого inline-CSS — только токены globals.css.
//
// Использование в page.js:
//   import ProductionPack from "@/components/ProductionPack";
//   <ProductionPack topic={topic} script={script} genre={projectType} storyboard={storyboard} />

"use client";
import { useEffect, useMemo, useState } from "react";

// ─────── COMMON HELPERS ───────────────────────────────────────────
function safeJsonParse(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

function hashString(input = "") {
  let h = 2166136261;
  const str = String(input || "");
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (!key) return;
    try { setValue(safeJsonParse(localStorage.getItem(key), initialValue)); } catch {}
  }, [key]);
  useEffect(() => {
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

function useStoredString(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (!key) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved != null) setValue(saved);
    } catch {}
  }, [key]);
  useEffect(() => {
    if (!key) return;
    try { localStorage.setItem(key, String(value ?? "")); } catch {}
  }, [key, value]);
  return [value, setValue];
}

function PackToolbar({ onClear }) {
  return (
    <div className="brow" style={{ marginTop: 10 }}>
      <button className="btn btn-xs btn-ghost" onClick={onClear}>Очистить сохранённый результат</button>
      <span className="out-label">Результат сохраняется в браузере и не пропадает после обновления страницы</span>
    </div>
  );
}

function CopyBtn({ text, label = "Копировать", small = false }) {
  const [ok, setOk] = useState(false);
  const cls = `btn ${small ? "btn-xs" : "btn-sm"} ${ok ? "" : "btn-ghost"}`;
  return (
    <button
      className={cls}
      onClick={(e) => {
        e.stopPropagation();
        try { navigator.clipboard?.writeText(text || ""); } catch {}
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      style={ok ? { color: "var(--green)", borderColor: "var(--green)" } : undefined}
    >
      {ok ? "✓ Скопировано" : label}
    </button>
  );
}

function OutBox({ label, children, copy }) {
  return (
    <div className="out-box">
      <div className="out-head">
        <span className="out-label">{label}</span>
        {copy != null && <CopyBtn text={copy} small />}
      </div>
      <div className="out-body">{children}</div>
    </div>
  );
}

function StatusLine({ type, text }) {
  return <div className={`status-line${type ? " " + type : ""}`}>{text}</div>;
}

// ─────── 🎙 TTS STUDIO TAB ────────────────────────────────────────
function TtsStudioTab({ topic, script, genre, cacheKey }) {
  const [data, setData] = useStoredState(`${cacheKey}:tts:data`, null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [activeScript, setActiveScript] = useState("google");

  async function run() {
    if (!script?.trim()) { setErr("Сначала создай сценарий в шаге 01"); return; }
    setBusy(true); setErr(""); setData(null);
    try {
      const r = await fetch("/api/tts-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, script, genre })
      });
      const d = await r.json();
      if (d.error) setErr(d.error); else setData(d.ttsStudio);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  if (!data) {
    return (
      <div>
        <p className="step-desc" style={{ marginBottom: 14 }}>
          AI подберёт лучший Google AI Studio голос и перепишет скрипт в 3 формата (Google AI · ElevenLabs · Чистый).
          Промт готов для копирования в aistudio.google.com.
        </p>
        <button className="btn btn-red btn-full" onClick={run} disabled={busy || !script?.trim()}>
          {busy ? "Генерация…" : "Сгенерировать TTS настройки"}
        </button>
        {err && <StatusLine type="err" text={`✗ ${err}`} />}
        {!script?.trim() && <StatusLine text="Сначала создай сценарий в шаге 01" />}
      </div>
    );
  }

  const scripts = {
    google:     { label: "Google AI",  text: data.script_google || "" },
    elevenlabs: { label: "ElevenLabs", text: data.script_elevenlabs || "" },
    clean:      { label: "Чистый",     text: data.script_clean || "" },
  };

  return (
    <div className="col">
      <div className="frow frow2">
        <OutBox label="Scene" copy={data.scene}>
          <div className="out-pre mono">{data.scene}</div>
        </OutBox>
        <OutBox label="Context" copy={data.context}>
          <div className="out-pre">{data.context}</div>
        </OutBox>
      </div>

      <OutBox label="Голос" copy={data.voice_id}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", color: "#fca5a5" }}>{data.voice_id}</span>
          {data.voice_desc && <span className="out-label">{data.voice_desc}</span>}
        </div>
        <div className="out-pre">{data.voice_reason}</div>
      </OutBox>

      {data.pacing_tips && (
        <OutBox label="Советы по темпу">
          <div className="out-pre" style={{ whiteSpace: "pre-wrap" }}>{data.pacing_tips}</div>
        </OutBox>
      )}

      <div>
        <div className="frame-btns" style={{ marginBottom: 8 }}>
          {Object.entries(scripts).map(([k, v]) => (
            <button
              key={k}
              className={`fb ${activeScript === k ? "active" : ""}`}
              onClick={() => setActiveScript(k)}
            >
              {v.label}
            </button>
          ))}
        </div>
        <OutBox label={`Скрипт · ${scripts[activeScript].label}`} copy={scripts[activeScript].text}>
          <div className="out-pre mono compact">{scripts[activeScript].text}</div>
        </OutBox>
      </div>

      <div className="brow" style={{ marginTop: 4 }}>
        <button className="btn btn-sm btn-ghost" onClick={run}>Обновить</button>
        <a className="btn btn-sm btn-ghost" href="https://aistudio.google.com/" target="_blank" rel="noreferrer">
          Открыть Google AI Studio →
        </a>
      </div>
      <PackToolbar onClear={() => setData(null)} />
    </div>
  );
}

// ─────── 🖼 COVER DIRECTOR TAB ───────────────────────────────────
function CoverTab({ topic, script, storyboard, cacheKey }) {
  const [data, setData] = useStoredState(`${cacheKey}:cover:data`, null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [mode, setMode] = useStoredString(`${cacheKey}:cover:mode`, "viral");
  const [style, setStyle] = useStoredString(`${cacheKey}:cover:style`, "viral");
  const [activeVariant, setActiveVariant] = useStoredString(`${cacheKey}:cover:variant`, "poster");

  async function run() {
    setBusy(true); setErr(""); setData(null);
    try {
      const r = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, script, storyboard, mode, style, platform: "shorts" })
      });
      const d = await r.json();
      if (d.error) setErr(d.error); else setData(d.cover || d);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  const sourceReady = Boolean(topic?.trim() || script?.trim() || storyboard?.scenes?.length);

  if (!data) {
    return (
      <div className="col">
        <p className="step-desc" style={{ marginBottom: 14 }}>
          Cover Director V2 анализирует сценарий и собирает не просто картинку, а готовое вирусное превью: главный заголовок,
          факты сбоку, нижний крючок, текстовые зоны и 9:16 prompt для Flow / Nano Banana / Midjourney.
        </p>

        <div className="frow frow2">
          <div className="field">
            <label>CTR режим</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="safe">SAFE · документально</option>
              <option value="viral">VIRAL · сильный крючок</option>
              <option value="extreme">EXTREME CTR · максимально цепко</option>
            </select>
          </div>
          <div className="field">
            <label>Стиль превью</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="viral">Viral Documentary</option>
              <option value="netflix">Netflix Documentary</option>
              <option value="conspiracy">Conspiracy / Classified</option>
              <option value="truecrime">True Crime Evidence</option>
              <option value="mrbeast">MrBeast Energy</option>
            </select>
          </div>
        </div>

        <button className="btn btn-red btn-full" onClick={run} disabled={busy || !sourceReady}>
          {busy ? "Режиссура превью…" : "Сгенерировать вирусную обложку V2"}
        </button>
        {err && <StatusLine type="err" text={`✗ ${err}`} />}
        {!sourceReady && <StatusLine text="Нужна тема, сценарий или storyboard" />}
      </div>
    );
  }

  const variant = data.variants?.find(v => v.id === activeVariant) || data.variants?.[0];
  const layoutText = [
    `TOP: ${data.main_title}`,
    `SIDE: ${(data.side_facts || []).join(" / ")}`,
    `BOTTOM: ${data.bottom_hook}`,
  ].join("\n");

  return (
    <div className="col">
      <StatusLine text={`Cover Director: ${data.theme} · ${data.mode} · ${data.style} · ${data.format}`} />

      <div className="frow frow2">
        <OutBox label="Текстовая иерархия" copy={layoutText}>
          <div className="frame-card-row">
            <div className="frame-card-lbl">TOP TITLE</div>
            <div className="frame-card-val" style={{ fontWeight: 900, color: "#fca5a5", whiteSpace: "pre-wrap" }}>{data.main_title}</div>
          </div>
          <div className="frame-card-row">
            <div className="frame-card-lbl">SIDE FACTS</div>
            <div className="frame-card-val">{data.side_facts?.join(" · ")}</div>
          </div>
          <div className="frame-card-row">
            <div className="frame-card-lbl">BOTTOM HOOK</div>
            <div className="frame-card-val" style={{ fontWeight: 900 }}>{data.bottom_hook}</div>
          </div>
        </OutBox>

        <OutBox label="Психология клика" copy={(data.psychology || []).join("\n")}>
          <div className="out-pre compact">{(data.psychology || []).map(x => `• ${x}`).join("\n")}</div>
          <div className="out-pre compact" style={{ marginTop: 8, color: "var(--muted)" }}>{data.angle}</div>
        </OutBox>
      </div>

      <div className="frame-btns" style={{ marginBottom: 8 }}>
        {(data.variants || []).map(v => (
          <button key={v.id} className={`fb ${activeVariant === v.id ? "active" : ""}`} onClick={() => setActiveVariant(v.id)}>
            {v.title}
          </button>
        ))}
      </div>

      {variant && (
        <OutBox label={`IMAGE PROMPT · ${variant.title}`} copy={variant.prompt_EN}>
          <div className="out-pre mono compact">{variant.prompt_EN}</div>
        </OutBox>
      )}

      {data.negative_prompt_EN && (
        <OutBox label="NEGATIVE PROMPT" copy={data.negative_prompt_EN}>
          <div className="out-pre mono compact">{data.negative_prompt_EN}</div>
        </OutBox>
      )}

      <div className="brow">
        <button className="btn btn-sm btn-ghost" onClick={run}>Обновить с этими настройками</button>
        <a className="btn btn-sm btn-ghost" href="https://www.midjourney.com/imagine" target="_blank" rel="noreferrer">
          Midjourney →
        </a>
      </div>
      <PackToolbar onClear={() => setData(null)} />
    </div>
  );
}

// ─────── 🎵 MUSIC + 🚀 SEO TAB ────────────────────────────────────
function MusicSeoTab({ topic, script, genre, storyboard, cacheKey }) {
  const [music, setMusic] = useStoredState(`${cacheKey}:music:data`, null);
  const [seo, setSeo] = useStoredState(`${cacheKey}:seo:data`, null);
  const [musicMode, setMusicMode] = useStoredString(`${cacheKey}:music:mode`, "cinematic_thriller");
  const [seoPlatform, setSeoPlatform] = useStoredString(`${cacheKey}:seo:platform`, "youtube_shorts");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true); setErr(""); setMusic(null); setSeo(null);
    try {
      const [m, s] = await Promise.all([
        fetch("/api/music-suno", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, script, genre, storyboard, musicMode })
        }).then(r => r.json()),
        fetch("/api/seo-pack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, script, genre, platform: seoPlatform })
        }).then(r => r.json()),
      ]);
      if (m.error || s.error) setErr(m.error || s.error);
      setMusic(m.music || null);
      setSeo(s.seo_variants || null);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  if (!music && !seo) {
    return (
      <div>
        <p className="step-desc" style={{ marginBottom: 14 }}>
          Music + SEO V2 собирает не сырой текст, а production-ready пакет: Suno prompt, negative, длительность, цель трека и SEO под платформы.
        </p>
        <div className="frow frow2">
          <div className="field">
            <label>Музыкальный режим</label>
            <select value={musicMode} onChange={(e) => setMusicMode(e.target.value)}>
              <option value="cinematic_thriller">Cinematic Thriller</option>
              <option value="dark_documentary">Dark Documentary</option>
              <option value="alien_mystery">Alien Mystery</option>
              <option value="historical_horror">Historical Horror</option>
              <option value="epic_disaster">Epic Disaster</option>
            </select>
          </div>
          <div className="field">
            <label>SEO платформа</label>
            <select value={seoPlatform} onChange={(e) => setSeoPlatform(e.target.value)}>
              <option value="youtube_shorts">YouTube Shorts</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram_reels">Instagram Reels</option>
              <option value="facebook_reels">Facebook Reels</option>
            </select>
          </div>
        </div>
        <button className="btn btn-red btn-full" onClick={run} disabled={busy || (!topic && !script)}>
          {busy ? "Генерация…" : "Сгенерировать музыку и SEO"}
        </button>
        {err && <StatusLine type="err" text={`✗ ${err}`} />}
      </div>
    );
  }

  return (
    <div className="col">
      {music && (
        <OutBox label={`Музыка · Suno AI · ${music.duration_hint || "auto"}`} copy={[music.music_EN, music.negative_EN ? `Negative: ${music.negative_EN}` : "", music.usage_ru || ""].filter(Boolean).join("\n\n")}>
          <div className="out-pre mono" style={{ marginBottom: 8 }}>{music.music_EN}</div>
          {music.negative_EN && (
            <div className="out-pre" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
              <b>Negative:</b> {music.negative_EN}
            </div>
          )}
          {music.usage_ru && <div className="out-pre" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}><b>Как использовать:</b> {music.usage_ru}</div>}
          {music.notes_ru && <div className="out-pre" style={{ fontSize: 12, color: "var(--muted)" }}>{music.notes_ru}</div>}
        </OutBox>
      )}

      {seo && Array.isArray(seo) && seo.length > 0 && (
        <>
          <div className="out-label">SEO матрица — 3 варианта</div>
          {seo.map((v, i) => {
            const fullText = `${v.title}\n\n${v.desc}\n\n${v.tags?.join(" ")}`;
            return (
              <OutBox key={i} label={`Вариант ${i + 1} · ${(v.type || "").toUpperCase()}`} copy={fullText}>
                <div className="frame-card-row">
                  <div className="frame-card-lbl">Заголовок</div>
                  <div className="frame-card-val" style={{ fontWeight: 800 }}>{v.title}</div>
                </div>
                <div className="frame-card-row">
                  <div className="frame-card-lbl">Описание</div>
                  <div className="frame-card-val">{v.desc}</div>
                </div>
                <div className="frame-card-row">
                  <div className="frame-card-lbl">Хэштеги</div>
                  <div className="frame-card-val" style={{ color: "#fca5a5" }}>{v.tags?.join(" ")}</div>
                </div>
              </OutBox>
            );
          })}
        </>
      )}

      <div className="brow">
        <button className="btn btn-sm btn-ghost" onClick={run}>Обновить</button>
        <a className="btn btn-sm btn-ghost" href="https://suno.com/create" target="_blank" rel="noreferrer">
          Открыть Suno →
        </a>
      </div>
      <PackToolbar onClear={() => { setMusic(null); setSeo(null); }} />
    </div>
  );
}

// ─────── 📘 SOCIAL PACK TAB ───────────────────────────────────────
function SocialPackTab({ topic, script, genre, cacheKey }) {
  const [data, setData] = useStoredState(`${cacheKey}:social:data`, null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    if (!script?.trim()) { setErr("Сначала создай сценарий"); return; }
    setBusy(true); setErr(""); setData(null);
    try {
      const r = await fetch("/api/social-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, script, genre })
      });
      const d = await r.json();
      if (d.error) setErr(d.error); else setData(d.social);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  if (!data) {
    return (
      <div>
        <p className="step-desc" style={{ marginBottom: 14 }}>
          Полный пакет: Facebook пост · Reels caption · Instagram карусель (5 слайдов) · Stories тизеры (3 слайда).
        </p>
        <button className="btn btn-red btn-full" onClick={run} disabled={busy || !script?.trim()}>
          {busy ? "Генерация…" : "Сгенерировать Social Pack"}
        </button>
        {err && <StatusLine type="err" text={`✗ ${err}`} />}
      </div>
    );
  }

  const fbText = `${data.post_hook}\n\n${data.post_body}\n\n${data.post_question}\n\n${data.post_tags}`;

  return (
    <div className="col">
      <OutBox label="Facebook публикация" copy={fbText}>
        <div className="out-pre" style={{ fontWeight: 800, marginBottom: 8 }}>{data.post_hook}</div>
        <div className="out-pre" style={{ whiteSpace: "pre-wrap", marginBottom: 10, color: "var(--muted)" }}>{data.post_body}</div>
        <div className="out-pre" style={{ fontWeight: 800, paddingTop: 10, borderTop: "1px solid var(--border)", marginBottom: 6 }}>
          {data.post_question}
        </div>
        <div className="out-pre" style={{ fontSize: 11, color: "#fca5a5" }}>{data.post_tags}</div>
      </OutBox>

      {data.reels_caption && (
        <OutBox label="Instagram Reels caption" copy={data.reels_caption}>
          <div className="out-pre" style={{ whiteSpace: "pre-wrap" }}>{data.reels_caption}</div>
        </OutBox>
      )}

      {data.tiktok_caption && (
        <OutBox label="TikTok caption" copy={data.tiktok_caption}>
          <div className="out-pre" style={{ whiteSpace: "pre-wrap" }}>{data.tiktok_caption}</div>
        </OutBox>
      )}

      {data.youtube_pinned_comment && (
        <OutBox label="YouTube pinned comment" copy={data.youtube_pinned_comment}>
          <div className="out-pre" style={{ whiteSpace: "pre-wrap" }}>{data.youtube_pinned_comment}</div>
        </OutBox>
      )}

      {data.carousel && data.carousel.length > 0 && (
        <OutBox
          label={`Карусель · ${data.carousel.length} слайдов`}
          copy={data.carousel.map((s, i) => `СЛАЙД ${i + 1}:\n${s.emoji} ${s.headline}\n${s.sub}`).join("\n\n")}
        >
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {data.carousel.map((s, i) => (
              <div key={i} style={{
                flexShrink: 0, width: 130, borderRadius: "var(--radius-xs)",
                overflow: "hidden", border: "1px solid var(--border)"
              }}>
                <div style={{
                  background: s.bg || "#0d0010",
                  padding: "16px 10px", minHeight: 140,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center"
                }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: "var(--muted2)", letterSpacing: "0.18em" }}>{i + 1}/{data.carousel.length}</div>
                  <div style={{ fontSize: 20 }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text)", lineHeight: 1.3 }}>{s.headline}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", lineHeight: 1.3 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </OutBox>
      )}

      {data.slides && data.slides.length > 0 && (
        <OutBox
          label={`Stories · ${data.slides.length} тизера`}
          copy={data.slides.map((s, i) => `STORIES ${i + 1}:\n${s.emoji} ${s.headline}\n${s.sub}`).join("\n\n")}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {data.slides.map((s, i) => (
              <div key={i} style={{
                flex: 1, borderRadius: "var(--radius-xs)",
                overflow: "hidden", border: "1px solid var(--border)"
              }}>
                <div style={{
                  background: s.bg || "#0d0010",
                  padding: "14px 10px", minHeight: 100,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center"
                }}>
                  <div style={{ fontSize: 18 }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "var(--text)", lineHeight: 1.2 }}>{s.headline}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", lineHeight: 1.3 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </OutBox>
      )}

      <div className="brow"><button className="btn btn-sm btn-ghost" onClick={run}>Обновить</button></div>
      <PackToolbar onClear={() => setData(null)} />
    </div>
  );
}

// ─────── MAIN COMPONENT ───────────────────────────────────────────
export default function ProductionPack({ topic = "", script = "", genre = "ИСТОРИЯ", storyboard = null }) {
  const sourceKey = useMemo(() => hashString(`${topic}|${script?.slice(0, 1200)}|${storyboard?.scenes?.length || 0}`), [topic, script, storyboard]);
  const cacheKey = `neurocine:production:v26:${sourceKey}`;
  const [activeTab, setActiveTab] = useStoredString(`neurocine:production:activeTab`, "cover");

  const tabs = [
    { id: "tts",    label: "TTS Studio",   comp: <TtsStudioTab topic={topic} script={script} genre={genre} cacheKey={cacheKey} /> },
    { id: "cover",  label: "Cover Director", comp: <CoverTab topic={topic} script={script} storyboard={storyboard} cacheKey={cacheKey} /> },
    { id: "music",  label: "Музыка + SEO", comp: <MusicSeoTab topic={topic} script={script} genre={genre} storyboard={storyboard} cacheKey={cacheKey} /> },
    { id: "social", label: "Social Pack",  comp: <SocialPackTab topic={topic} script={script} genre={genre} cacheKey={cacheKey} /> },
  ];

  return (
    <section className="step-section">
      <div className="step-header">
        <div className="step-num">05</div>
        <div className="step-info">
          <div className="step-title">Production Pack</div>
          <div className="step-desc">TTS · Cover Director · Музыка · SEO · Social — результаты сохраняются после обновления браузера</div>
        </div>
        <span className="step-badge">v2.6</span>
      </div>
      <div className="step-body">
        <div className="frame-btns" style={{ marginBottom: 18 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`fb ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tabs.find(t => t.id === activeTab)?.comp}
      </div>
    </section>
  );
}


{/* COVER DNA ENGINE */}
<div style={{
  marginTop: 24,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  padding: 18,
  background: '#09090f'
}}>
  <div style={{
    fontSize: 12,
    letterSpacing: '0.28em',
    opacity: 0.6,
    marginBottom: 12
  }}>
    COVER DNA ENGINE
  </div>

  <div style={{
    display: 'grid',
    gap: 10
  }}>
    <div>• Conspiracy Documentary</div>
    <div>• Historical Horror</div>
    <div>• Prison Survival</div>
    <div>• Plague Nightmare</div>
    <div>• Netflix Documentary</div>
  </div>

  <div style={{
    marginTop: 14,
    opacity: 0.7,
    lineHeight: 1.6
  }}>
    NeuroCine now changes thumbnail visual language automatically depending on the scenario genre and emotional tone.
  </div>
</div>
