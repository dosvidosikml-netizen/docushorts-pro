"use client";
import { useState } from "react";

const DURATIONS = ["15 сек", "30–45 сек", "До 60 сек", "1.5 мин", "3 мин"];
const HOOK_TYPES = ["⚡ ШОК", "🔮 ТАЙНА", "☠ ОПАСНОСТЬ", "🌀 ПАРАДОКС", "🩸 ПРОВОКАЦИЯ", "👁 ЗАПРЕТ"];
const CAMERA_MOVES = ["Slow zoom in", "Extreme close-up", "Static shot", "Camera slowly panning", "Handheld drift", "Aerial descent", "Push in", "Pull back reveal", "Dutch angle", "Over-the-shoulder", "POV shot", "Whip pan"];
const PHYSICS = ["дым клубится", "пламя разгорается в слоу-мо", "пылинки кружатся", "вода растекается", "осколки разлетаются", "волосы развеваются на ветру", "листья срываются", "лёд трескается", "кровь капает в слоу-мо", "туман стелется"];
const LIGHT_MOODS = ["dynamic reflections in the eyes", "flickering volumetric light", "hard rim light from behind", "neon reflections on wet surface", "single candle — chiaroscuro shadows", "cold forensic overhead light", "golden hour dust beams", "bioluminescent glow", "strobing red emergency light"];
const ASMR_SOUNDS = ["сухой щелчок затвора", "металлический скрежет", "тихий шорох бумаги", "капля воды в тишине", "треск огня", "шёпот вплотную к микрофону", "хруст льда", "шуршание ткани", "стук каблуков по камню", "электрический гул"];
const GENRES = ["КРИМИНАЛ", "ТАЙНА", "ИСТОРИЯ", "НАУКА", "ВОЙНА", "ПРИРОДА", "ПСИХОЛОГИЯ", "КОНСПИРОЛОГИЯ"];

function Tag({ label, active, onClick, accent = "#e11d48" }) {
  return (
    <button onClick={onClick} style={{ background: active ? `${accent}20` : "rgba(255,255,255,0.03)", border: `1.5px solid ${active ? accent : "rgba(255,255,255,0.08)"}`, color: active ? accent : "rgba(255,255,255,0.4)", fontSize: 12, padding: "6px 14px", borderRadius: 20, cursor: "pointer", transition: "all 0.2s" }}>{label}</button>
  );
}

function Section({ title, children }) {
  return <div style={{ marginBottom: 28 }}><div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,0.3)", fontWeight: 600, marginBottom: 12 }}>{title}</div>{children}</div>;
}

export default function DocuShortsPro() {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [language, setLanguage] = useState("RU");
  const [duration, setDuration] = useState("До 60 сек");
  const [platform, setPlatform] = useState("YouTube Shorts");
  const [genre, setGenre] = useState("КРИМИНАЛ");
  const [hookTypes, setHookTypes] = useState(["⚡ ШОК"]);
  const [cameraMoves, setCameraMoves] = useState(["Slow zoom in"]);
  const [physicsEffects, setPhysicsEffects] = useState(["дым клубится"]);
  const [lightMoods, setLightMoods] = useState(["flickering volumetric light"]);
  const [asmrSounds, setAsmrSounds] = useState(["капля воды в тишине"]);
  
  const [view, setView] = useState("form");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  function toggle(arr, set, val) { set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]); }

  async function handleGenerate() {
    if (!topic.trim()) { setError("Введите тему!"); return; }
    setError(""); setResult(""); setLoading(true); setView("result");

    const payload = { topic, context, genre, duration, platform, language, hookTypes, cameraMoves, physicsEffects, lightMoods, asmrSounds };

    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.text);
    } catch (e) {
      setError("Ошибка: " + e.message);
      setView("form");
    } finally {
      setLoading(false);
    }
  }

  const steps = [{ id: "content", label: "Контент", icon: "✦" }, { id: "camera", label: "Камера", icon: "📷" }, { id: "light", label: "Свет", icon: "💡" }, { id: "sound", label: "Звук", icon: "🎧" }];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "rgba(255,255,255,0.85)", maxWidth: 480, margin: "0 auto", paddingBottom: "100px", fontFamily: "sans-serif" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "rgba(10,10,15,0.92)", zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {view === "result" && <button onClick={() => setView("form")} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>‹</button>}
          <div style={{ fontWeight: 700 }}>DocuShorts AI</div>
          <div style={{ fontSize: 10, background: "rgba(225,29,72,0.15)", color: "#e11d48", padding: "4px 8px", borderRadius: 12 }}>PRO</div>
        </div>
      </div>

      {view === "form" && (
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {steps.map((s, i) => (
              <button key={s.id} onClick={() => setStep(i)} style={{ flex: 1, background: step === i ? "rgba(225,29,72,0.2)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, padding: 8, color: step === i ? "#e11d48" : "#aaa", cursor: "pointer" }}>
                <div>{s.icon}</div><div style={{ fontSize: 9 }}>{s.label}</div>
              </button>
            ))}
          </div>

          {step === 0 && (
            <>
              <Section title="ТЕМА ВИДЕО"><input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Например: Перевал Дятлова" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 12, color: "#fff", boxSizing: "border-box" }} /></Section>
              <Section title="ЖАНР"><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{GENRES.map(g => <Tag key={g} label={g} active={genre === g} onClick={() => setGenre(g)} />)}</div></Section>
              <Section title="ДЛИТЕЛЬНОСТЬ"><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{DURATIONS.map(d => <Tag key={d} label={d} active={duration === d} onClick={() => setDuration(d)} />)}</div></Section>
            </>
          )}

          {step === 1 && <Section title="ДВИЖЕНИЕ КАМЕРЫ"><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{CAMERA_MOVES.map(c => <Tag key={c} label={c} active={cameraMoves.includes(c)} onClick={() => toggle(cameraMoves, setCameraMoves, c)} />)}</div></Section>}
          {step === 2 && <Section title="СВЕТОВЫЕ РЕШЕНИЯ"><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{LIGHT_MOODS.map(l => <Tag key={l} label={l} active={lightMoods.includes(l)} onClick={() => toggle(lightMoods, setLightMoods, l)} />)}</div></Section>}
          {step === 3 && <Section title="ASMR-ЭЛЕМЕНТЫ"><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{ASMR_SOUNDS.map(s => <Tag key={s} label={s} active={asmrSounds.includes(s)} onClick={() => toggle(asmrSounds, setAsmrSounds, s)} />)}</div></Section>}
          {error && <div style={{ color: "#e11d48", fontSize: 13, marginTop: 10 }}>⚠ {error}</div>}
        </div>
      )}

      {view === "result" && (
        <div style={{ padding: 20 }}>
          {loading ? <div style={{ textAlign: "center", color: "#e11d48", padding: 50 }}>Режиссёр думает...</div> : <pre style={{ whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 12, fontSize: 13, lineHeight: 1.6, overflowX: "auto" }}>{result}</pre>}
        </div>
      )}

      {view === "form" && (
        <div style={{ position: "fixed", bottom: 0, width: "100%", maxWidth: 480, padding: 20, background: "#0a0a0f", boxSizing: "border-box", left: "50%", transform: "translateX(-50%)" }}>
          <button onClick={step < 3 ? () => setStep(s => s + 1) : handleGenerate} style={{ width: "100%", background: "#e11d48", color: "#fff", border: "none", padding: 16, borderRadius: 12, fontWeight: "bold" }}>
            {step < 3 ? "Далее" : "СОЗДАТЬ СЦЕНАРИЙ"}
          </button>
        </div>
      )}
    </div>
  );
  }
            
