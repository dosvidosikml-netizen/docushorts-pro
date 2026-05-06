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
import { useState } from "react";

// ─────── COMMON HELPERS ───────────────────────────────────────────
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
function TtsStudioTab({ topic, script, genre }) {
  const [data, setData] = useState(null);
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
        <button className="btn btn-sm btn-ghost" onClick={() => setData(null)}>Перегенерировать</button>
        <a className="btn btn-sm btn-ghost" href="https://aistudio.google.com/" target="_blank" rel="noreferrer">
          Открыть Google AI Studio →
        </a>
      </div>
    </div>
  );
}

// ─────── 🖼 COVER TAB ─────────────────────────────────────────────
function CoverTab({ topic, storyboard }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true); setErr(""); setData(null);
    try {
      const r = await fetch("/api/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, storyboard, hook: storyboard?.scenes?.[0]?.description_ru || "" })
      });
      const d = await r.json();
      if (d.error) setErr(d.error); else setData(d);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  if (!data) {
    return (
      <div>
        <p className="step-desc" style={{ marginBottom: 14 }}>
          2 виральных промта обложки: SHOCK / EVENT и ЧЕЛОВЕК + ДОКАЗАТЕЛЬСТВО.
          Детерминированно — без LLM, мгновенно, бесплатно.
        </p>
        <button className="btn btn-red btn-full" onClick={run} disabled={busy || (!topic && !storyboard?.scenes?.length)}>
          {busy ? "Генерация…" : "Сгенерировать обложки"}
        </button>
        {err && <StatusLine type="err" text={`✗ ${err}`} />}
      </div>
    );
  }

  return (
    <div className="col">
      <StatusLine text={`Theme detected: ${data.theme}`} />
      {data.variants?.map((v, i) => (
        <OutBox key={v.id} label={`Вариант ${i + 1} · ${v.title}`} copy={v.prompt_EN}>
          <div className="out-pre mono compact">{v.prompt_EN}</div>
        </OutBox>
      ))}
      <div className="brow">
        <button className="btn btn-sm btn-ghost" onClick={() => setData(null)}>Перегенерировать</button>
        <a className="btn btn-sm btn-ghost" href="https://www.midjourney.com/imagine" target="_blank" rel="noreferrer">
          Midjourney →
        </a>
      </div>
    </div>
  );
}

// ─────── 🎵 MUSIC + 🚀 SEO TAB ────────────────────────────────────
function MusicSeoTab({ topic, script, genre, storyboard }) {
  const [music, setMusic] = useState(null);
  const [seo, setSeo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true); setErr(""); setMusic(null); setSeo(null);
    try {
      const [m, s] = await Promise.all([
        fetch("/api/music-suno", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, genre, storyboard })
        }).then(r => r.json()),
        fetch("/api/seo-pack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, script, genre })
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
          Suno промт фоновой музыки + 3 SEO варианта (shock · intrigue · keyword) с тегами.
          Параллельная генерация одной кнопкой.
        </p>
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
        <OutBox label="Музыка · Suno AI" copy={music.music_EN}>
          <div className="out-pre mono" style={{ marginBottom: 8 }}>{music.music_EN}</div>
          {music.negative_EN && (
            <div className="out-pre" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
              <b>Negative:</b> {music.negative_EN}
            </div>
          )}
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
        <button className="btn btn-sm btn-ghost" onClick={() => { setMusic(null); setSeo(null); }}>Перегенерировать</button>
        <a className="btn btn-sm btn-ghost" href="https://suno.com/create" target="_blank" rel="noreferrer">
          Открыть Suno →
        </a>
      </div>
    </div>
  );
}

// ─────── 📘 SOCIAL PACK TAB ───────────────────────────────────────
function SocialPackTab({ topic, script, genre }) {
  const [data, setData] = useState(null);
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

      <button className="btn btn-sm btn-ghost" onClick={() => setData(null)}>Перегенерировать всё</button>
    </div>
  );
}

// ─────── MAIN COMPONENT ───────────────────────────────────────────
export default function ProductionPack({ topic = "", script = "", genre = "ИСТОРИЯ", storyboard = null }) {
  const [activeTab, setActiveTab] = useState("tts");

  const tabs = [
    { id: "tts",    label: "TTS Studio",   comp: <TtsStudioTab topic={topic} script={script} genre={genre} /> },
    { id: "cover",  label: "Обложки",      comp: <CoverTab topic={topic} storyboard={storyboard} /> },
    { id: "music",  label: "Музыка + SEO", comp: <MusicSeoTab topic={topic} script={script} genre={genre} storyboard={storyboard} /> },
    { id: "social", label: "Social Pack",  comp: <SocialPackTab topic={topic} script={script} genre={genre} /> },
  ];

  return (
    <section className="step-section">
      <div className="step-header">
        <div className="step-num">05</div>
        <div className="step-info">
          <div className="step-title">Production Pack</div>
          <div className="step-desc">TTS · Обложки · Музыка · SEO · Social — готовые промты для копирования</div>
        </div>
        <span className="step-badge">v2.4</span>
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
