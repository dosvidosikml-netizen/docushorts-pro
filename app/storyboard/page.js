"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  PROJECT_TYPES, STYLE_PRESETS,
  build2KPrompt, buildScenarioLock, buildStoryGridPrompt,
  getStyleProfile
} from "../../engine/directorEngine_v4";
import {
  buildLocalStoryboard, normalizeStoryboard, storyboardToProjectJson
} from "../../engine/sceneEngine";
import { downloadTextFile, safeFileName } from "../../lib/download";

const SAVE_KEY = "neurocine_studio_v3";

function readAsDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/* ── tiny helpers ── */
function CopyBtn({ text, label = "Копировать" }) {
  const [ok, setOk] = useState(false);
  async function go() {
    if (!text) return;
    await navigator.clipboard.writeText(String(text));
    setOk(true);
    setTimeout(() => setOk(false), 1400);
  }
  return (
    <button className="btn btn-sm btn-ghost" onClick={go} disabled={!text}>
      {ok ? "✓ Скопировано" : label}
    </button>
  );
}

function OutBox({ label, text, empty = "Пусто", compact = false, mono = false }) {
  return (
    <div className="out-box">
      <div className="out-head">
        <span className="out-label">{label}</span>
        <CopyBtn text={text} />
      </div>
      <div className="out-body">
        {text
          ? <pre className={`out-pre${compact ? " compact" : ""}${mono ? " mono" : ""}`}>{text}</pre>
          : <div className="out-empty">{empty}</div>
        }
      </div>
    </div>
  );
}

function UploadZone({ label, hint, onFile, accept = "image/*" }) {
  return (
    <div className="upload-zone">
      <input
        type="file" accept={accept}
        onChange={async e => {
          const f = e.target.files?.[0];
          if (f) { const url = await readAsDataUrl(f); onFile(url); e.target.value = ""; }
        }}
      />
      <div className="upload-icon">📎</div>
      <div className="upload-text">{label}</div>
      {hint && <div className="upload-hint">{hint}</div>}
    </div>
  );
}

/* ── main page ── */
export default function StudioPage() {

  /* Step 1 – Script */
  const [projectName, setProjectName] = useState("NeuroCine Project");
  const [topic, setTopic]             = useState("");
  const [projectType, setProjectType] = useState("film");
  const [stylePreset, setStylePreset] = useState("cinematic");
  const [duration, setDuration]       = useState(60);
  const [aspectRatio, setAspect]      = useState("9:16");
  const [tone, setTone]               = useState("cinematic documentary thriller");
  const [script, setScript]           = useState("");
  const [sBusy, setSBusy]             = useState(false);
  const [sStat, setSStat]             = useState("");

  /* Step 2 – Storyboard */
  const [storyboard, setSB]   = useState(null);
  const [sbBusy, setSbBusy]   = useState(false);
  const [sbStat, setSbStat]   = useState("");
  const [jsonIn, setJsonIn]   = useState("");

  /* Step 3 – Pipeline */
  const [gridImg, setGridImg]         = useState(null);
  const [frameIdx, setFrameIdx]       = useState(null);
  const [exploreP, setExploreP]       = useState("");
  const [expBusy, setExpBusy]         = useState(false);
  const [variantImg, setVariantImg]   = useState(null);
  const [selVariant, setSelVariant]   = useState(null);
  const [p2k, setP2k]                 = useState("");
  const [finalImg, setFinalImg]       = useState(null);
  const [analysis, setAnalysis]       = useState(null);
  const [videoP, setVideoP]           = useState("");
  const [vidBusy, setVidBusy]         = useState(false);

  const styleProfile = useMemo(() => getStyleProfile(projectType, stylePreset), [projectType, stylePreset]);
  const scenes       = storyboard?.scenes || [];
  const curFrame     = frameIdx !== null ? scenes[frameIdx] : null;

  const storyGridPrompt = useMemo(
    () => storyboard ? buildStoryGridPrompt(storyboard, styleProfile) : "",
    [storyboard, styleProfile]
  );

  const scriptJson = script
    ? JSON.stringify({ project_name: projectName, script, topic, duration, aspect_ratio: aspectRatio, style: stylePreset, project_type: projectType, tone }, null, 2)
    : "";

  /* autosave load */
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (!d) return;
      if (d.projectName) setProjectName(d.projectName);
      if (d.topic)       setTopic(d.topic);
      if (d.projectType) setProjectType(d.projectType);
      if (d.stylePreset) setStylePreset(d.stylePreset);
      if (d.duration)    setDuration(d.duration);
      if (d.aspectRatio) setAspect(d.aspectRatio);
      if (d.tone)        setTone(d.tone);
      if (d.script)      setScript(d.script);
      if (d.storyboard)  setSB(d.storyboard);
    } catch {}
  }, []);

  /* autosave write */
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        projectName, topic, projectType, stylePreset, duration, aspectRatio: aspectRatio, tone, script, storyboard
      }));
    } catch {}
  }, [projectName, topic, projectType, stylePreset, duration, aspectRatio, tone, script, storyboard]);

  /* 2K prompt auto when variant picked */
  useEffect(() => {
    if (!curFrame || !selVariant) { setP2k(""); return; }
    setP2k(build2KPrompt(curFrame, selVariant, storyboard, styleProfile));
  }, [curFrame, selVariant, storyboard, styleProfile]);

  /* API calls */
  async function doScript() {
    if (!topic.trim()) return;
    setSBusy(true); setSStat("Генерация...");
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, duration })
      });
      const d = await r.json();
      setScript(d.text || d.error || "");
      setSStat(d.text ? "ok" : "err");
    } catch (e) { setSStat("err"); }
    finally { setSBusy(false); }
  }

  async function doStoryboard() {
    let src = script;
    if (jsonIn.trim()) {
      try { const p = JSON.parse(jsonIn); src = p.script || p.text || script; } catch {}
    }
    if (!src.trim()) return;
    setSbBusy(true); setSbStat("Генерация storyboard...");
    try {
      const r = await fetch("/api/storyboard", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: src, duration, aspect_ratio: aspectRatio, style: stylePreset, project_name: projectName })
      });
      const d = await r.json();
      if (d.storyboard) {
        setSB(d.storyboard);
        setSbStat(`ok|${d.storyboard.scenes?.length || 0} кадров · ${d.mode}`);
      } else {
        setSbStat("err|" + (d.error || "unknown"));
      }
    } catch (e) { setSbStat("err|" + e.message); }
    finally { setSbBusy(false); }
  }

  async function doExplore() {
    if (!curFrame) return;
    setExpBusy(true); setExploreP("");
    try {
      const r = await fetch("/api/explore", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: curFrame, storyboard, styleProfile, projectType, stylePreset })
      });
      const d = await r.json();
      setExploreP(d.prompt || "Ошибка");
    } catch (e) { setExploreP("Ошибка: " + e.message); }
    finally { setExpBusy(false); }
  }

  async function doVideoPrompt() {
    if (!curFrame || !finalImg) return;
    setVidBusy(true); setVideoP(""); setAnalysis(null);
    try {
      const r1 = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: curFrame, variant: selVariant || "A", imageDataUrl: finalImg, styleProfile, projectType, stylePreset })
      });
      const d1 = await r1.json();
      setAnalysis(d1.analysis);
      const r2 = await fetch("/api/video", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: curFrame, analysis: d1.analysis, storyboard, styleProfile, projectType, stylePreset })
      });
      const d2 = await r2.json();
      setVideoP(d2.video_prompt_en || "");
    } catch (e) { setVideoP("Ошибка: " + e.message); }
    finally { setVidBusy(false); }
  }

  /* frame select / clear downstream */
  function selectFrame(idx) {
    setFrameIdx(idx);
    setExploreP(""); setVariantImg(null); setSelVariant(null);
    setP2k(""); setFinalImg(null); setVideoP(""); setAnalysis(null);
  }

  function nextFrame() {
    if (!scenes.length) return;
    selectFrame(((frameIdx ?? -1) + 1) % scenes.length);
  }

  /* export */
  function exportJson() {
    const obj = storyboardToProjectJson(storyboard, { script, director: { styleProfile } });
    downloadTextFile(JSON.stringify(obj, null, 2), safeFileName(projectName) + ".json", "application/json;charset=utf-8");
  }
  function exportTxt() {
    const lines = [`NEUROCINE — ${projectName}\n\nСЦЕНАРИЙ:\n${script}\n\n--- STORYBOARD ---\n`];
    scenes.forEach(s => {
      lines.push(`\n[${s.id}] ${s.start}s–${s.end ?? "?"}s | ${s.beat_type}\nVO: ${s.vo_ru}\nIMAGE: ${s.image_prompt_en}\nVIDEO: ${s.video_prompt_en}\nSFX: ${s.sfx}\n`);
    });
    downloadTextFile(lines.join(""), safeFileName(projectName) + ".txt");
  }
  function clearAll() {
    localStorage.removeItem(SAVE_KEY);
    setScript(""); setSB(null); setTopic(""); setProjectName("NeuroCine Project");
    setGridImg(null); setFrameIdx(null); setExploreP(""); setVariantImg(null);
    setSelVariant(null); setP2k(""); setFinalImg(null); setVideoP(""); setAnalysis(null);
    setSStat(""); setSbStat(""); setJsonIn("");
  }

  /* ── render ── */
  return (
    <div className="studio">

      {/* NAV */}
      <nav className="studio-nav">
        <div className="nav-brand">
          <div className="nav-kicker">NeuroCine Online</div>
          <div className="nav-title">Director Studio</div>
        </div>
        <div className="nav-links">
          <Link href="/" className="nav-btn">Главная</Link>
          <Link href="/chat" className="nav-btn">Chat</Link>
          <Link href="/storyboard" className="nav-btn active">Studio</Link>
          {storyboard && <>
            <button className="nav-btn" onClick={exportJson}>⬇ JSON</button>
            <button className="nav-btn" onClick={exportTxt}>⬇ TXT</button>
          </>}
          <button className="nav-btn danger" onClick={clearAll}>Очистить</button>
        </div>
      </nav>

      {/* ══ STEP 01 — SCRIPT ══════════════════════════════════════ */}
      <section className="step-section">
        <div className="step-header">
          <div className="step-num">01</div>
          <div className="step-info">
            <div className="step-title">Сценарий</div>
            <div className="step-desc">Тема → настройки → текст диктора + JSON</div>
          </div>
          {script && <span className="step-badge">✓ Готов</span>}
        </div>

        <div className="step-body">
          <div className="two-col lw">

            {/* LEFT — settings */}
            <div className="col">
              <div className="field">
                <label className="field-label">Название проекта</label>
                <input className="inp" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="NeuroCine Project" />
              </div>

              <div className="field">
                <label className="field-label">Тема / задание</label>
                <textarea className="inp tall" value={topic} onChange={e => setTopic(e.target.value)}
                  placeholder="Например: Ты бы не выжил в Средневековье — вот почему" />
              </div>

              <div className="frow frow2">
                <div className="field">
                  <label className="field-label">Тип проекта</label>
                  <select className="inp" value={projectType} onChange={e => setProjectType(e.target.value)}>
                    {Object.entries(PROJECT_TYPES).map(([k, v]) =>
                      <option key={k} value={k}>{v.label}</option>
                    )}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Стиль / пресет</label>
                  <select className="inp" value={stylePreset} onChange={e => setStylePreset(e.target.value)}>
                    {Object.entries(STYLE_PRESETS).map(([k, v]) =>
                      <option key={k} value={k}>{v.label}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="frow frow3">
                <div className="field">
                  <label className="field-label">Длительность</label>
                  <select className="inp" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                    <option value={30}>30 сек</option>
                    <option value={60}>60 сек</option>
                    <option value={90}>90 сек</option>
                    <option value={120}>2 мин</option>
                    <option value={180}>3 мин</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Формат</label>
                  <select className="inp" value={aspectRatio} onChange={e => setAspect(e.target.value)}>
                    <option value="9:16">9:16 Shorts</option>
                    <option value="16:9">16:9 YouTube</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="4:5">4:5 Instagram</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Тон / жанр</label>
                  <input className="inp" value={tone} onChange={e => setTone(e.target.value)} placeholder="thriller, dark..." />
                </div>
              </div>

              <button className="btn btn-red btn-full" onClick={doScript} disabled={sBusy || !topic.trim()}>
                {sBusy ? "⏳ Генерация..." : "▶ СОЗДАТЬ СЦЕНАРИЙ"}
              </button>

              {sStat && (
                <div className={`status-line${sStat === "ok" ? " ok" : sStat === "err" ? " err" : ""}`}>
                  {sStat === "ok" ? "✓ Сценарий готов" : sStat === "err" ? "✗ Ошибка генерации" : sStat}
                </div>
              )}
            </div>

            {/* RIGHT — output */}
            <div className="col">
              <OutBox label="Текст диктора (VO)" text={script} empty="Сценарий появится здесь" />

              {script && <>
                <div className="out-box">
                  <div className="out-head">
                    <span className="out-label">Script JSON</span>
                    <div className="brow">
                      <CopyBtn text={scriptJson} label="Копировать JSON" />
                      <button className="btn btn-sm" onClick={() => downloadTextFile(scriptJson, safeFileName(projectName) + "-script.json", "application/json;charset=utf-8")}>⬇ .json</button>
                      <button className="btn btn-sm" onClick={() => downloadTextFile(script, safeFileName(projectName) + "-script.txt")}>⬇ .txt</button>
                    </div>
                  </div>
                  <div className="json-box">
                    <pre>{scriptJson}</pre>
                  </div>
                </div>
              </>}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STEP 02 — STORYBOARD ══════════════════════════════════ */}
      <section className="step-section">
        <div className="step-header">
          <div className="step-num">02</div>
          <div className="step-info">
            <div className="step-title">Storyboard</div>
            <div className="step-desc">Разбивка на кадры + промт для генерации всей сетки</div>
          </div>
          {storyboard && <span className="step-badge">✓ {scenes.length} кадров</span>}
        </div>

        <div className="step-body">
          <div className="two-col lw">

            {/* LEFT */}
            <div className="col">
              <div className="field">
                <label className="field-label">Вставить JSON вручную (необязательно)</label>
                <textarea className="inp mono"
                  style={{ minHeight: 90 }}
                  value={jsonIn} onChange={e => setJsonIn(e.target.value)}
                  placeholder='{"script": "..."} — или оставь пустым, будет использован сценарий выше'
                />
              </div>

              <button className="btn btn-red" onClick={doStoryboard}
                disabled={sbBusy || (!script.trim() && !jsonIn.trim())}>
                {sbBusy ? "⏳ Генерация..." : "▶ СГЕНЕРИРОВАТЬ STORYBOARD"}
              </button>

              {sbStat && (() => {
                const [type, msg] = sbStat.includes("|") ? sbStat.split("|") : ["", sbStat];
                return (
                  <div className={`status-line${type === "ok" ? " ok" : type === "err" ? " err" : ""}`}>
                    {type === "ok" ? `✓ Готово · ${msg}` : type === "err" ? `✗ ${msg}` : sbStat}
                  </div>
                );
              })()}

              {storyboard && (
                <div className="brow">
                  <button className="btn btn-sm" onClick={exportJson}>⬇ Проект .json</button>
                  <button className="btn btn-sm" onClick={exportTxt}>⬇ Полный .txt</button>
                </div>
              )}
            </div>

            {/* RIGHT — story grid prompt */}
            <div className="col">
              {storyGridPrompt
                ? <OutBox label="Story Grid Prompt (для Flux / Midjourney)" text={storyGridPrompt} empty="" />
                : (
                  <div className="upload-zone" style={{ pointerEvents: "none", cursor: "default" }}>
                    <div className="upload-icon">🎬</div>
                    <div className="upload-text">Story Grid Prompt</div>
                    <div className="upload-hint">Промт для генерации сетки всех кадров появится здесь</div>
                  </div>
                )
              }
            </div>
          </div>

          {/* Storyboard table */}
          {scenes.length > 0 && <>
            <hr className="divider" />
            <div className="out-box">
              <div className="out-head">
                <span className="out-label">Все кадры ({scenes.length}) — нажми чтобы выбрать</span>
              </div>
              <div className="out-body" style={{ padding: 0 }}>
                <div className="sb-wrap">
                  <table className="sb-t">
                    <thead>
                      <tr>
                        {["Кадр", "Тайм", "Beat", "VO", "SFX", "Camera"].map(h =>
                          <th key={h}>{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {scenes.map((s, i) => (
                        <tr key={s.id} onClick={() => selectFrame(i)}
                          style={{ outline: frameIdx === i ? "2px solid rgba(229,53,53,0.5)" : "none" }}>
                          <td style={{ color: "#fca5a5", fontWeight: 800 }}>{s.id}</td>
                          <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{s.start}–{s.end ?? "?"}s</td>
                          <td style={{ color: "var(--muted)" }}>{s.beat_type}</td>
                          <td style={{ maxWidth: 260 }}>{String(s.vo_ru || "").slice(0, 80)}</td>
                          <td style={{ color: "var(--muted)", maxWidth: 160 }}>{String(s.sfx || "").slice(0, 50)}</td>
                          <td style={{ color: "var(--muted)" }}>{String(s.camera || "").slice(0, 40)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>}
        </div>
      </section>

      {/* ══ STEP 03 — PRODUCTION PIPELINE ════════════════════════ */}
      <section className="step-section">
        <div className="step-header">
          <div className="step-num">03</div>
          <div className="step-info">
            <div className="step-title">Production Pipeline</div>
            <div className="step-desc">Загрузи сетку → кадр → 4 варианта → 2K prompt → video prompt</div>
          </div>
          {curFrame && <span className="step-badge">{curFrame.id}</span>}
        </div>

        <div className="step-body">

          {/* ── A: Upload storyboard grid ── */}
          <div className={`pipe-step${gridImg ? "" : " on"}`}>
            <div className="pipe-head">
              <div className={`pipe-dot${gridImg ? " done" : " act"}`}>A</div>
              <div>
                <div className="pipe-title">Загрузи storyboard сетку</div>
                <div className="pipe-sub">JPG/PNG из Midjourney, Flux, DALL-E</div>
              </div>
            </div>
            <div className="pipe-body">
              <div className="two-col">

                {/* image */}
                <div className="col">
                  {gridImg ? (
                    <div>
                      <div className="img-viewer"><img src={gridImg} alt="Storyboard grid" /></div>
                      <div className="brow" style={{ marginTop: 10 }}>
                        <button className="btn btn-sm" onClick={() => { setGridImg(null); setFrameIdx(null); }}>
                          Заменить
                        </button>
                      </div>
                    </div>
                  ) : (
                    <UploadZone
                      label="Загрузи storyboard сетку"
                      hint="Сетка кадров всего сценария"
                      onFile={setGridImg}
                    />
                  )}
                </div>

                {/* frame selector */}
                <div className="col">
                  {scenes.length > 0 ? (
                    <>
                      <div className="field">
                        <label className="field-label">Выбери кадр</label>
                        <div className="frame-btns">
                          {scenes.map((s, i) => (
                            <button key={s.id}
                              className={`fb${frameIdx === i ? " active" : ""}`}
                              onClick={() => selectFrame(i)}>
                              {s.id}
                            </button>
                          ))}
                        </div>
                      </div>

                      {curFrame && (
                        <div className="frame-card">
                          <div className="frame-card-id">{curFrame.id}</div>
                          <div className="frame-card-meta">
                            {curFrame.start}–{curFrame.end ?? "?"}s · {curFrame.beat_type}
                            {curFrame.emotion ? ` · ${curFrame.emotion}` : ""}
                          </div>
                          {curFrame.description_ru && (
                            <div className="frame-card-row">
                              <div className="frame-card-lbl">Описание</div>
                              <div className="frame-card-val">{String(curFrame.description_ru).slice(0, 140)}</div>
                            </div>
                          )}
                          {curFrame.vo_ru && (
                            <div className="frame-card-row">
                              <div className="frame-card-lbl">VO</div>
                              <div className="frame-card-val">{curFrame.vo_ru}</div>
                            </div>
                          )}
                          {curFrame.sfx && (
                            <div className="frame-card-row">
                              <div className="frame-card-lbl">SFX</div>
                              <div className="frame-card-val" style={{ color: "var(--muted)" }}>{curFrame.sfx}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: "var(--muted)", fontSize: 13, padding: 16, textAlign: "center" }}>
                      Сначала создай storyboard в шаге 02
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── B: 4 variation prompts ── */}
          {curFrame && (
            <div className={`pipe-step${exploreP ? "" : " on"}`}>
              <div className="pipe-head">
                <div className={`pipe-dot${exploreP ? " done" : " act"}`}>B</div>
                <div>
                  <div className="pipe-title">4 варианта ракурсов — {curFrame.id}</div>
                  <div className="pipe-sub">A extreme close-up · B low angle · C wide · D over-shoulder</div>
                </div>
              </div>
              <div className="pipe-body">
                <div className="col">
                  <button className="btn btn-red" onClick={doExplore} disabled={expBusy}>
                    {expBusy ? "⏳ Генерация..." : "▶ СОЗДАТЬ ПРОМТ 4 ВАРИАНТОВ (2×2)"}
                  </button>
                  {exploreP && <OutBox label="Explore Prompt — для Flux / Midjourney / DALL-E" text={exploreP} />}
                </div>
              </div>
            </div>
          )}

          {/* ── C: Upload 4-variant grid + select ── */}
          {curFrame && (
            <div className={`pipe-step${selVariant ? "" : variantImg ? " on" : ""}`}>
              <div className="pipe-head">
                <div className={`pipe-dot${selVariant ? " done" : variantImg ? " act" : ""}`}>C</div>
                <div>
                  <div className="pipe-title">Загрузи сетку 4 вариантов · Выбери лучший</div>
                  <div className="pipe-sub">Нажми на вариант A / B / C / D</div>
                </div>
              </div>
              <div className="pipe-body">
                <div className="two-col">

                  {/* variant image with overlay */}
                  <div className="col">
                    {variantImg ? (
                      <div>
                        <div className="variant-wrap">
                          <img src={variantImg} alt="4 variants" />
                          <div className="variant-overlay">
                            {["A","B","C","D"].map(v => (
                              <div key={v}
                                className={`variant-cell${selVariant === v ? " sel" : ""}`}
                                onClick={() => setSelVariant(v)}>
                                <div className="variant-badge">{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="brow" style={{ marginTop: 10 }}>
                          <button className="btn btn-sm" onClick={() => { setVariantImg(null); setSelVariant(null); }}>Заменить</button>
                          {selVariant && <span style={{ fontSize: 12, color: "var(--muted)" }}>Выбран: <strong style={{ color: "#fff" }}>{selVariant}</strong></span>}
                        </div>
                      </div>
                    ) : (
                      <UploadZone
                        label="Загрузи сетку 4 вариантов"
                        hint="2×2 изображение из Midjourney / Flux"
                        onFile={setVariantImg}
                      />
                    )}
                  </div>

                  {/* 2K prompt */}
                  <div className="col">
                    {p2k ? (
                      <OutBox label={`2K IMAGE PROMPT — вариант ${selVariant}`} text={p2k} />
                    ) : (
                      <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>
                        {variantImg ? "Нажми на вариант A / B / C / D на изображении" : "Загрузи сетку вариантов слева"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── D: Final 2K + video prompt ── */}
          {curFrame && (
            <div className={`pipe-step${videoP ? "" : finalImg ? " on" : ""}`}>
              <div className="pipe-head">
                <div className={`pipe-dot${videoP ? " done" : finalImg ? " act" : ""}`}>D</div>
                <div>
                  <div className="pipe-title">Загрузи финальный 2K кадр → Video Prompt</div>
                  <div className="pipe-sub">Анализ изображения + видео промт для анимации</div>
                </div>
              </div>
              <div className="pipe-body">
                <div className="two-col">

                  {/* upload + analyze */}
                  <div className="col">
                    {finalImg ? (
                      <div>
                        <div className="img-viewer"><img src={finalImg} alt="Final 2K frame" /></div>
                        <div className="brow" style={{ marginTop: 10 }}>
                          <button className="btn btn-sm" onClick={() => { setFinalImg(null); setVideoP(""); setAnalysis(null); }}>
                            Заменить
                          </button>
                          <button className="btn btn-red" onClick={doVideoPrompt} disabled={vidBusy}>
                            {vidBusy ? "⏳ Анализ..." : "▶ ПОЛУЧИТЬ VIDEO PROMPT"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <UploadZone
                        label="Загрузи финальный 2K кадр"
                        hint="Итоговое изображение для анимации"
                        onFile={setFinalImg}
                      />
                    )}

                    {/* analysis details */}
                    {analysis && (
                      <div className="frame-card" style={{ marginTop: 10 }}>
                        <div className="frame-card-lbl" style={{ marginBottom: 8 }}>Анализ кадра</div>
                        {[
                          ["Camera", analysis.camera],
                          ["Lighting", analysis.lighting],
                          ["Emotion", analysis.emotion],
                          ["SFX", analysis.sfx],
                        ].filter(([,v]) => v).map(([k, v]) => (
                          <div key={k} className="frame-card-row">
                            <div className="frame-card-lbl">{k}</div>
                            <div className="frame-card-val" style={{ color: "var(--muted)" }}>{String(v).slice(0, 100)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* video prompt output */}
                  <div className="col">
                    {videoP ? (
                      <>
                        <OutBox label={`VIDEO PROMPT — ${curFrame.id}`} text={videoP} />
                        {analysis?.sfx && <OutBox label="SFX" text={analysis.sfx} compact />}
                      </>
                    ) : (
                      <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 24 }}>
                        {finalImg ? "Нажми «ПОЛУЧИТЬ VIDEO PROMPT»" : "Сначала загрузи финальный 2K кадр"}
                      </div>
                    )}
                  </div>
                </div>

                {/* NEXT FRAME */}
                {videoP && scenes.length > 1 && (
                  <>
                    <hr className="divider" />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>
                        ✓ Кадр {(frameIdx ?? 0) + 1} из {scenes.length} завершён
                      </div>
                      <button className="btn btn-red" onClick={nextFrame}>
                        СЛЕДУЮЩИЙ КАДР → {scenes[(((frameIdx ?? 0) + 1) % scenes.length)]?.id}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* empty state */}
          {!scenes.length && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--muted)", fontSize: 14 }}>
              Создай storyboard в шаге 02 — пайплайн откроется здесь
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
