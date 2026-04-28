// @ts-nocheck
/* eslint-disable */
"use client";

import { useMemo, useRef, useState } from "react";

const STYLE_SYSTEM = {
  film: {
    label: "Film / Realistic",
    presets: [
      { id: "cinematic_realism", label: "Cinematic Realism", lock: "cinematic documentary realism, 35mm anamorphic, handheld, natural overcast light, realistic textures, Kodak Vision3 500T grain" },
      { id: "dark_doc", label: "Dark Documentary", lock: "dark historical documentary, muted palette, handheld realism, smoky interiors, tactile production design" },
      { id: "war_doc", label: "War Documentary", lock: "gritty war documentary realism, long lens compression, mud, smoke, cold overcast light, handheld tension" },
      { id: "true_crime", label: "True Crime", lock: "premium true crime cinematic reconstruction, low-key lighting, controlled shadows, forensic atmosphere" },
      { id: "epic_history", label: "Epic Historical", lock: "epic historical drama realism, large scale atmosphere, period accurate costumes, natural light, film grain" },
    ],
  },
  animation: {
    label: "Animation / Cartoon",
    presets: [
      { id: "2d_dark", label: "2D Dark Animation", lock: "dark 2D animation, hand-painted backgrounds, expressive character shapes, cinematic lighting, textured brushwork" },
      { id: "2_5d", label: "2.5D Layered", lock: "2.5D animation, layered parallax backgrounds, hand-painted textures, cinematic depth, soft atmospheric particles" },
      { id: "3d_cartoon", label: "3D Cartoon", lock: "stylized 3D cartoon, cinematic lighting, expressive character design, soft realistic materials, clean animation staging" },
      { id: "stop_motion", label: "Stop Motion", lock: "stop motion miniature look, handmade textures, tactile fabric and clay materials, cinematic macro lighting" },
      { id: "paper_cutout", label: "Paper Cutout", lock: "paper cutout animation, layered paper textures, handmade shadows, limited animation charm, cinematic composition" },
    ],
  },
  anime: {
    label: "Anime",
    presets: [
      { id: "anime_drama", label: "Anime Drama", lock: "cinematic anime drama, expressive eyes, dramatic lighting, detailed backgrounds, controlled emotional close-ups" },
      { id: "dark_anime", label: "Dark Anime", lock: "dark mature anime style, high contrast, atmospheric haze, intense close-ups, painterly background detail" },
      { id: "anime_doc", label: "Anime Documentary", lock: "anime documentary reconstruction, grounded historical detail, restrained stylization, realistic lighting and texture" },
    ],
  },
  comic: {
    label: "Comic / Graphic Novel",
    presets: [
      { id: "graphic_novel", label: "Graphic Novel", lock: "graphic novel realism, cinematic panels, inked shadows, textured color grading, dramatic composition" },
      { id: "dark_comic", label: "Dark Comic", lock: "dark comic book style, heavy shadows, gritty textures, dynamic panels, cinematic staging" },
    ],
  },
};

const DEFAULT_LOCKS = {
  characters: true,
  locations: true,
  timeline: true,
  emotion: true,
  vo: true,
  sfx: true,
  action: true,
};

const DEMO_SCENE = {
  id: "frame_01",
  start: 0,
  duration: 3,
  description_ru: "Марек резко открывает глаза на сырой соломе в тёмной избе.",
  image_prompt_en: "SCENE PRIMARY FOCUS: Marek, gaunt medieval man, wakes up on wet straw inside a dark wooden hut, cold breath visible, damp timber, weak dawn light through cracks.",
  video_prompt_en: "Marek jolts awake on wet straw and inhales sharply. Maintain EXACT same character appearance, face, clothing, and condition. Camera pushes in low from straw level. SFX: straw crunch, hard inhale, wind through wood gaps.",
  vo_ru: "Ты открываешь глаза на сырой соломе, и первый удар приходит не мечом, а холодом.",
  sfx: "straw crunch, hard inhale, distant wind through wood gaps, low room creak",
  camera: "close-up low angle handheld push-in",
  cut_energy: "medium",
};

function cx(...v) { return v.filter(Boolean).join(" "); }
function downloadFile(name, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
function copyText(text) { navigator.clipboard?.writeText(text || ""); }
function padFrame(i) { return `frame_${String(i).padStart(2, "0")}`; }
function safeScene(scene, i = 0) {
  return { ...DEMO_SCENE, ...(scene || {}), id: scene?.id || padFrame(i + 1) };
}
function parseScenesFromJson(data) {
  if (Array.isArray(data?.scenes)) return data.scenes.map(safeScene);
  if (Array.isArray(data?.shots)) return data.shots.map(safeScene);
  if (Array.isArray(data)) return data.map(safeScene);
  return [];
}
function createLocalStoryboard(script, duration = 60) {
  const text = String(script || "").trim();
  const parts = text.split(/(?<=[.!?。！？])\s+|\n+/).map(x => x.trim()).filter(Boolean);
  const count = Math.max(6, Math.min(20, Math.ceil(Number(duration || 60) / 3)));
  return Array.from({ length: count }, (_, i) => {
    const line = parts[i % Math.max(1, parts.length)] || `Кадр ${i + 1}`;
    return safeScene({
      id: padFrame(i + 1), start: i * 3, duration: 3,
      description_ru: line,
      image_prompt_en: `SCENE PRIMARY FOCUS: ${line}. Cinematic composition, clear subject, production-ready frame, no text, no UI, no watermark.`,
      video_prompt_en: `ANIMATE CURRENT FRAME: ${line}. Maintain EXACT same character appearance, location, action, emotion and timeline. Add realistic micro-movement, camera drift, environmental particles and grounded physics. SFX: scenario-appropriate natural sound.`,
      vo_ru: line,
      sfx: "scenario-appropriate natural sound",
      camera: "cinematic handheld composition",
      cut_energy: i === 0 ? "high" : "medium",
    }, i);
  });
}
function buildStoryGridPrompt({ scenes, styleLock }) {
  return `Create a vertical 9:16 cinematic storyboard grid image.\n\nLayout:\n- ${scenes.length} frames total\n- clean storyboard map\n- each cell is a different scene from the scenario\n- no text, no subtitles, no UI, no labels, no watermark\n\nSTYLE LOCK:\n${styleLock}\n\nSCENES PROGRESSION:\n${scenes.map((s, i) => `${i + 1}. ${s.description_ru || s.image_prompt_en}`).join("\n")}\n\nContinuity: preserve the same characters, locations, chronology, emotional logic and visual world across all frames.`;
}
function buildExplorePrompt(scene, styleLock) {
  return `ULTRA CINEMATIC VARIATION GRID — PRODUCTION SPEC\n\nTASK:\nCreate a 2x2 grid of four shot variations of the EXACT SAME MOMENT.\n\nBASE SCENE:\n${scene.image_prompt_en || scene.description_ru}\n\nSCENARIO LOCK — NON-NEGOTIABLE:\n- do not change the story event\n- do not change character identity\n- do not change wardrobe\n- do not change location\n- do not change time of day\n- do not change emotional meaning\n- do not add new story props or new characters\n\nALLOWED VARIATION AXES ONLY:\n- camera angle and height\n- lens feeling and focal length\n- framing and composition\n- camera distance and perspective\n- depth of field\n\nSHOT SET MANDATORY:\nA — EXTREME CLOSE-UP: emotional face focus, shallow DOF.\nB — LOW GROUND ANGLE: strong foreground texture, subject rising into frame.\nC — WIDE ENVIRONMENTAL: full body and location readable, isolation emphasized.\nD — OVER-SHOULDER / OBSTRUCTED: foreground obstruction, layered depth, voyeuristic documentary feeling.\n\nSTYLE LOCK:\n${styleLock}\n\nOUTPUT:\n- single image\n- 2x2 grid\n- 4 clearly distinct cinematic compositions\n- no text, no UI, no subtitles, no watermark.`;
}
function buildLockedImagePrompt(scene, styleLock, selectedVariant = "A") {
  const variants = {
    A: "extreme close-up, emotional face focus, shallow depth of field",
    B: "low ground angle from foreground texture level, heavy perspective",
    C: "wide environmental shot, full body and location readable, strong negative space",
    D: "over-shoulder obstructed composition, layered depth, documentary observer feeling",
  };
  return `SCENE PRIMARY FOCUS: ${scene.image_prompt_en || scene.description_ru}\n\nLOCKED VARIANT: ${selectedVariant} — ${variants[selectedVariant] || variants.A}.\n\nSTYLE LOCK: ${styleLock}.\n\n2K UPSCALE PROMPT:\nPreserve exact character identity, wardrobe, location, action, emotion, lighting and scenario chronology. Increase resolution, texture clarity and cinematic detail only. Do not redesign the shot. No text, no subtitles, no UI, no watermark.`;
}
function buildAnalyzePrompt(scene, styleLock) {
  return `ANALYZE THE UPLOADED LOCKED FRAME AND CONVERT IT INTO VIDEO PROMPTS STRICTLY FOR THIS SCENARIO.\n\nSCENARIO FRAME LOCK:\nFrame: ${scene.id}\nStory action: ${scene.description_ru}\nVoiceover: ${scene.vo_ru || "use original frame VO only"}\nOriginal SFX: ${scene.sfx || "use scenario-appropriate realistic SFX"}\n\nExtract from image:\n- exact character appearance\n- camera angle and lens feeling\n- lighting conditions\n- composition and depth\n- environment and atmosphere\n- emotional tone\n\nThen output 3 video prompt options. Each option must preserve the same event and only vary camera motion intensity.\n\nFORBIDDEN:\nDo not change character, costume, location, time, action, emotion, timeline, VO meaning, or scenario logic.\n\nSTYLE LOCK:\n${styleLock}\n\nOUTPUT FORMAT:\n1) CALM MOTION\n2) CINEMATIC MOTION\n3) AGGRESSIVE MOTION\nEach includes: ANIMATE CURRENT FRAME, Camera, Motion, Physics, SFX.`;
}
function buildVideoPrompt(scene, styleLock, mode = "cinematic") {
  const cameraMode = {
    calm: "slow restrained handheld drift, minimal motion, observational documentary tone",
    cinematic: "controlled handheld push-in with organic focus breathing and tactile atmosphere",
    aggressive: "urgent handheld compression, sharper camera pressure, faster micro-drift, stronger tension",
  }[mode] || "controlled handheld push-in";
  return `ANIMATE CURRENT LOCKED FRAME:\n\nFRAME ID: ${scene.id}\n\nLOCKED STORY ACTION:\n${scene.description_ru}\n\nLOCKED VISUAL SOURCE:\n${scene.image_prompt_en}\n\nVOICEOVER LOCK:\n${scene.vo_ru || "Use original scenario voiceover for this frame."}\n\nCAMERA:\n${cameraMode}. ${scene.camera || "Preserve selected angle and framing."}\n\nMOTION:\nAdd only realistic micro-movements that belong to this exact moment: breathing, cloth response, environmental particles, small body shift, natural weight and contact.\n\nPHYSICS:\ngrounded inertia, realistic friction, no floaty motion, no impossible camera, no artificial morphing.\n\nSCENARIO FORBIDDEN CHANGES:\nDo not change character, face, clothing, location, time, action, emotion, story order, VO meaning, props or continuity.\n\nSTYLE LOCK:\n${styleLock}\n\nSFX:\n${scene.sfx || "scenario-appropriate realistic sound design"}`;
}

function Metric({ label, value }) {
  return <div className="metric"><b>{value}</b><span>{label}</span></div>;
}
function Section({ title, kicker, children, right }) {
  return <section className="panel"><div className="sectionHead"><div><p>{kicker}</p><h2>{title}</h2></div>{right}</div>{children}</section>;
}

export default function Page() {
  const [script, setScript] = useState("");
  const [duration, setDuration] = useState(60);
  const [projectType, setProjectType] = useState("film");
  const [stylePreset, setStylePreset] = useState("cinematic_realism");
  const [locks, setLocks] = useState(DEFAULT_LOCKS);
  const [storyboard, setStoryboard] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [selected, setSelected] = useState(0);
  const [variant, setVariant] = useState("A");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [manualImage, setManualImage] = useState("");
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  const presets = STYLE_SYSTEM[projectType].presets;
  const style = presets.find(p => p.id === stylePreset) || presets[0];
  const styleLock = style.lock;
  const scene = safeScene(scenes[selected] || DEMO_SCENE, selected);
  const ready = scenes.length > 0;

  async function importProjectJson(file) {
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    const imported = parseScenesFromJson(data);
    setStoryboard(data);
    setScenes(imported);
    setSelected(0);
    setScript(data.script || data.project_name || script);
    if (data.total_duration) setDuration(data.total_duration);
    setOutput(`Imported ${imported.length} frames. Scenario is ready for Director Mode.`);
  }

  async function generateStoryboard() {
    setLoading(true); setOutput("");
    try {
      const res = await fetch("/api/storyboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script, duration, mode: "safe", styleLock, projectType, stylePreset }) });
      const data = await res.json();
      const source = data.storyboard || data.data || data;
      const imported = parseScenesFromJson(source);
      if (!imported.length) throw new Error("API returned no scenes");
      setStoryboard(source); setScenes(imported); setSelected(0);
      setOutput(`Storyboard generated: ${imported.length} locked frames.`);
    } catch (e) {
      const local = createLocalStoryboard(script, duration);
      setStoryboard({ project_name: "Local Director Storyboard", total_duration: duration, scenes: local });
      setScenes(local); setSelected(0);
      setOutput(`API fallback: local storyboard created (${local.length} frames). ${e.message || ""}`);
    } finally { setLoading(false); }
  }

  function exportProject() {
    const data = { name: "NeuroCine Director Project v3", version: "director_v3", script, duration, project_type: projectType, style_preset: style.id, style_lock: styleLock, scenario_lock: locks, scenes, storyboard };
    downloadFile("neurocine_director_v3_project.json", JSON.stringify(data, null, 2));
  }
  function onManualImage(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setManualImage(String(r.result || ""));
    r.readAsDataURL(file);
  }

  const storyGridPrompt = ready ? buildStoryGridPrompt({ scenes, styleLock }) : "";
  const explorePrompt = buildExplorePrompt(scene, styleLock);
  const lockedPrompt = buildLockedImagePrompt(scene, styleLock, variant);
  const analyzePrompt = buildAnalyzePrompt(scene, styleLock);
  const videoPrompt = buildVideoPrompt(scene, styleLock, "cinematic");

  return <main className="app">
    <style>{CSS}</style>
    <div className="glow g1" /><div className="glow g2" />
    <header className="hero">
      <div>
        <div className="badge">NEUROCINE STUDIO v3</div>
        <h1>Director Mode</h1>
        <p>Сценарий = закон. Стиль фиксируется в начале. Storyboard остаётся мозгом, а ручной контроль управляет каждым кадром: Explore → Lock → Analyze → Video Prompt.</p>
      </div>
      <div className="heroStats">
        <Metric label="frames" value={scenes.length || "—"} />
        <Metric label="duration" value={`${duration}s`} />
        <Metric label="mode" value="manual+auto" />
      </div>
    </header>

    <div className="layout">
      <div className="left">
        <Section title="1. Script / JSON" kicker="input" right={<button className="ghost" onClick={() => fileRef.current?.click()}>Import JSON</button>}>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={e => importProjectJson(e.target.files?.[0])} />
          <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Вставь сценарий или загрузи storyboard JSON..." />
          <div className="row">
            {[30,60,90,120,180].map(d => <button key={d} className={duration===d?"pill active":"pill"} onClick={()=>setDuration(d)}>{d}s</button>)}
            <button className="primary" disabled={loading || !script.trim()} onClick={generateStoryboard}>{loading ? "Generating..." : "Generate / Refresh Storyboard"}</button>
          </div>
        </Section>

        <Section title="2. Style System" kicker="visual lock">
          <div className="typeGrid">{Object.entries(STYLE_SYSTEM).map(([id, v]) => <button key={id} className={projectType===id?"type active":"type"} onClick={()=>{setProjectType(id); setStylePreset(v.presets[0].id)}}>{v.label}</button>)}</div>
          <div className="presetGrid">{presets.map(p => <button key={p.id} className={stylePreset===p.id?"preset active":"preset"} onClick={()=>setStylePreset(p.id)}><b>{p.label}</b><span>{p.lock}</span></button>)}</div>
        </Section>

        <Section title="3. Scenario Lock" kicker="rules">
          <div className="lockGrid">{Object.keys(locks).map(k => <label key={k} className="lock"><input type="checkbox" checked={locks[k]} onChange={e=>setLocks({...locks,[k]:e.target.checked})}/><span>{k}</span></label>)}</div>
          <div className="law">Запрещено менять событие, персонажа, одежду, эпоху, локацию, время, эмоцию, VO, SFX-смысл и порядок истории. Разрешены только ракурс, линза, крупность, композиция и движение камеры.</div>
        </Section>

        <Section title="4. Storyboard Grid" kicker="scenario map" right={<button className="ghost" disabled={!ready} onClick={()=>{setOutput(storyGridPrompt); copyText(storyGridPrompt)}}>Copy Grid Prompt</button>}>
          <div className="frames">{(ready ? scenes : [DEMO_SCENE]).map((s, i) => <button key={i} onClick={()=>setSelected(i)} className={selected===i?"frame active":"frame"}><span>{s.id || padFrame(i+1)}</span><p>{s.description_ru || "Frame description"}</p><em>{s.duration || 3}s</em></button>)}</div>
        </Section>
      </div>

      <aside className="right">
        <Section title="Frame Control" kicker={scene.id}>
          <div className="selectedCard"><b>{scene.description_ru}</b><p>VO: {scene.vo_ru}</p><p>SFX: {scene.sfx}</p></div>
          <div className="actions">
            <button onClick={()=>setOutput(explorePrompt)}>Explore 2×2 Variants</button>
            <button onClick={()=>setOutput(lockedPrompt)}>Lock Selected Variant → 2K Prompt</button>
            <button onClick={()=>setOutput(analyzePrompt)}>Analyze Image → Video Options</button>
            <button className="primary" onClick={()=>setOutput(videoPrompt)}>Generate Video Prompt</button>
          </div>
          <div className="variantPick"><span>Variant:</span>{["A","B","C","D"].map(v => <button key={v} className={variant===v?"pill active":"pill"} onClick={()=>setVariant(v)}>{v}</button>)}</div>
          <input ref={imageRef} type="file" accept="image/*" hidden onChange={e=>onManualImage(e.target.files?.[0])}/>
          <button className="ghost full" onClick={()=>imageRef.current?.click()}>Upload generated grid / locked frame</button>
          {manualImage && <div className="preview"><img src={manualImage} /><div className="quadrants"><button>A</button><button>B</button><button>C</button><button>D</button></div></div>}
        </Section>

        <Section title="Output" kicker="copy / export" right={<button className="ghost" onClick={()=>copyText(output)}>Copy</button>}>
          <textarea className="output" value={output} onChange={e=>setOutput(e.target.value)} placeholder="Здесь появятся grid prompts, explore prompts, locked image prompts и video prompts..." />
          <div className="row">
            <button className="ghost" onClick={()=>downloadFile("neurocine_output.txt", output, "text/plain")}>Export TXT</button>
            <button className="ghost" disabled={!ready} onClick={exportProject}>Export Project JSON</button>
          </div>
        </Section>
      </aside>
    </div>
  </main>;
}

const CSS = `
:root{--bg:#07070b;--panel:rgba(18,18,28,.74);--panel2:rgba(255,255,255,.06);--line:rgba(255,255,255,.11);--text:#f5f2ff;--muted:#a9a3bb;--hot:#a855f7;--hot2:#22d3ee;--ok:#34d399;--warn:#f59e0b}*{box-sizing:border-box}body{background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Arial;margin:0}.app{min-height:100vh;padding:28px;position:relative;overflow:hidden}.glow{position:fixed;border-radius:50%;filter:blur(70px);opacity:.25;z-index:-1}.g1{width:500px;height:500px;background:var(--hot);top:-180px;left:-130px}.g2{width:460px;height:460px;background:var(--hot2);right:-160px;bottom:-150px}.hero{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin:0 auto 22px;max-width:1500px}.badge{display:inline-flex;padding:8px 12px;border:1px solid var(--line);border-radius:999px;color:#d8c7ff;background:rgba(168,85,247,.12);font-size:12px;letter-spacing:.14em;font-weight:800}.hero h1{font-size:58px;line-height:.9;margin:18px 0 14px;letter-spacing:-.05em}.hero p{color:var(--muted);font-size:16px;line-height:1.55;max-width:820px}.heroStats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;min-width:360px}.metric{padding:16px;border:1px solid var(--line);background:var(--panel);border-radius:22px}.metric b{display:block;font-size:24px}.metric span{display:block;color:var(--muted);font-size:12px;text-transform:uppercase;margin-top:4px}.layout{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:18px;max-width:1500px;margin:auto}.left{display:grid;gap:18px}.right{display:grid;gap:18px;align-content:start;position:sticky;top:18px}.panel{border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.035));backdrop-filter:blur(16px);border-radius:28px;padding:18px;box-shadow:0 24px 80px rgba(0,0,0,.25)}.sectionHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.sectionHead p{margin:0 0 4px;color:var(--hot2);font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.sectionHead h2{margin:0;font-size:20px;letter-spacing:-.03em}textarea{width:100%;min-height:160px;resize:vertical;border:1px solid var(--line);background:rgba(0,0,0,.32);border-radius:20px;color:var(--text);padding:16px;outline:none;font-size:14px;line-height:1.55}button{border:0;border-radius:16px;padding:12px 14px;background:rgba(255,255,255,.08);color:var(--text);cursor:pointer;font-weight:800;transition:.18s;border:1px solid transparent}button:hover{transform:translateY(-1px);border-color:rgba(255,255,255,.16);background:rgba(255,255,255,.12)}button:disabled{opacity:.45;cursor:not-allowed}.primary{background:linear-gradient(135deg,var(--hot),#7c3aed);box-shadow:0 14px 30px rgba(168,85,247,.25)}.ghost{background:rgba(255,255,255,.055);border-color:var(--line)}.full{width:100%}.row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:12px}.pill{padding:9px 12px;border-radius:999px}.pill.active,.type.active,.preset.active,.frame.active{border-color:rgba(168,85,247,.72);background:rgba(168,85,247,.20);box-shadow:0 0 0 1px rgba(168,85,247,.18) inset}.typeGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.type,.preset{text-align:left}.presetGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px}.preset span{display:block;color:var(--muted);font-size:12px;line-height:1.35;margin-top:6px}.lockGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.lock{display:flex;align-items:center;gap:9px;padding:12px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.045);text-transform:capitalize;color:#e8e1ff;font-weight:800}.lock input{accent-color:var(--hot)}.law{margin-top:12px;padding:14px;border-radius:18px;background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.22);color:#ffe7b0;font-size:13px;line-height:1.45}.frames{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.frame{text-align:left;min-height:120px;display:flex;flex-direction:column;justify-content:space-between;background:rgba(0,0,0,.24);border-color:var(--line)}.frame span{color:var(--hot2);font-size:12px;font-weight:900}.frame p{font-size:12px;line-height:1.35;color:#dad5e8;margin:10px 0}.frame em{font-size:11px;color:var(--muted);font-style:normal}.selectedCard{padding:14px;border-radius:20px;background:rgba(0,0,0,.25);border:1px solid var(--line)}.selectedCard b{display:block;line-height:1.35}.selectedCard p{color:var(--muted);font-size:12px;line-height:1.45}.actions{display:grid;gap:10px;margin-top:12px}.variantPick{display:flex;align-items:center;gap:8px;margin:14px 0}.variantPick span{color:var(--muted);font-size:12px}.preview{margin-top:12px;border:1px solid var(--line);border-radius:20px;overflow:hidden;position:relative;background:#000}.preview img{display:block;width:100%;max-height:280px;object-fit:cover}.quadrants{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:8px}.quadrants button{padding:8px}.output{min-height:330px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}@media(max-width:1100px){.layout{grid-template-columns:1fr}.right{position:static}.hero{display:block}.heroStats{min-width:0}.frames{grid-template-columns:repeat(2,1fr)}.typeGrid,.presetGrid,.lockGrid{grid-template-columns:1fr}.hero h1{font-size:42px}}`;
