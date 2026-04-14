// @ts-nocheck
/* eslint-disable */
"use client";

import { useState, useEffect, useRef } from "react";

// --- ОПТИМИЗИРОВАННЫЙ ФОН ---
const NeuralBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    // Отключаем анимацию на мобилках для экономии ресурсов
    if (window.innerWidth < 768) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize); resize();

    for (let i = 0; i < 40; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 });

    const render = () => {
      ctx.fillStyle = "#05050a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(168, 85, 247, 0.4)"; ctx.strokeStyle = "rgba(168, 85, 247, 0.15)"; ctx.lineWidth = 1;
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1; if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]; const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed", top:0, left:0, zIndex:-2, width:"100vw", height:"100vh", background: "#05050a"}} />;
};

// --- КОНСТАНТЫ И ПРЕСЕТЫ ---
const GENRE_PRESETS = {
  "КРИМИНАЛ":      { icon:"🔫", col:"#ef4444", font: "'Creepster', cursive", color: "#ef4444" }, 
  "ТАЙНА":         { icon:"🔍", col:"#a855f7", font: "'Creepster', cursive", color: "#a855f7" },
  "ИСТОРИЯ":       { icon:"📜", col:"#f97316", font: "'Cinzel', serif", color: "#fbbf24" }, 
  "НАУКА":         { icon:"⚗",  col:"#06b6d4", font: "'Oswald', sans-serif", color: "#0ea5e9" },
  "ВОЙНА":         { icon:"⚔",  col:"#dc2626", font: "'Bebas Neue', sans-serif", color: "#ffffff" }, 
  "ПРИРОДА":       { icon:"🌿", col:"#22c55e", font: "'Montserrat', sans-serif", color: "#22c55e" },
  "ПСИХОЛОГИЯ":    { icon:"🧠", col:"#ec4899", font: "'Playfair Display', serif", color: "#ffffff" }, 
  "ЗАГАДКИ":       { icon:"👁", col:"#fbbf24", font: "Impact, sans-serif", color: "#ffdd00" },
};

const COVER_PRESETS = [
  { id: "netflix", label: "Netflix", defX: 50, defY: 50, style: { container: { alignItems: "center", width: "90%" }, hook: { fontSize: 12, fontWeight: 700, fontFamily: "sans-serif", color: "#e50914", textTransform: "uppercase", letterSpacing: 4, marginBottom: 8, textShadow: "0 2px 4px #000" }, title: { fontSize: 32, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1, textShadow: "0 8px 25px #000", textAlign: "center" }, cta: { fontSize: 10, fontWeight: 800, color: "#fff", borderBottom: "1px solid #e50914", paddingBottom: 4, textTransform: "uppercase", letterSpacing: 2, marginTop: 8 } } },
  { id: "mrbeast", label: "MrBeast", defX: 50, defY: 50, style: { container: { alignItems: "center", width: "95%" }, hook: { fontSize: 16, fontWeight: 900, fontFamily: "Impact, sans-serif", color: "#ffdd00", textTransform: "uppercase", WebkitTextStroke: "1px #000", textShadow: "3px 3px 0 #000", transform: "rotate(-3deg)", marginBottom: 4 }, title: { fontSize: 40, fontWeight: 900, textTransform: "uppercase", lineHeight: 1, WebkitTextStroke: "2px #000", textShadow: "5px 5px 0 #000, 0 0 40px rgba(0,0,0,0.8)", transform: "rotate(-3deg)", textAlign: "center", marginBottom: 16 }, cta: { fontSize: 13, fontWeight: 900, color: "#ff00ff", background: "#000", border: "2px solid #ff00ff", padding: "6px 14px", borderRadius: 8, textTransform: "uppercase", transform: "rotate(-3deg)", boxShadow: "0 4px 15px rgba(0,0,0,0.8)" } } },
  { id: "tiktok", label: "TikTok", defX: 50, defY: 50, style: { container: { alignItems: "center", width: "90%" }, hook: { fontSize: 13, fontWeight: 800, fontFamily: "sans-serif", color: "#00f2ea", background: "#000", padding: "4px 8px", borderRadius: 6, textTransform: "uppercase", marginBottom: 12 }, title: { fontSize: 28, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1, textShadow: "0 0 20px #00f2ea, 0 0 40px #00f2ea", textAlign: "center", marginBottom: 12 }, cta: { fontSize: 11, fontWeight: 900, color: "#fff", background: "#ff0050", padding: "6px 16px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 1 } } },
  { id: "truecrime", label: "True Crime", defX: 10, defY: 50, style: { container: { alignItems: "flex-start", width: "85%" }, hook: { fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: "#000", background: "#ffdd00", padding: "4px 8px", textTransform: "uppercase", marginBottom: 8 }, title: { fontSize: 34, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1, background: "#000", padding: "4px 12px", borderLeft: "4px solid #ffdd00", textAlign: "left", marginBottom: 12 }, cta: { color: "#aaa", fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 } } },
  { id: "history", label: "Dark History", defX: 50, defY: 50, style: { container: { alignItems: "center", width: "90%" }, hook: { fontSize: 12, fontWeight: 400, fontFamily: "'Georgia', serif", color: "#d4af37", textTransform: "uppercase", letterSpacing: 3, marginBottom: 8, textShadow: "0 2px 4px #000" }, title: { fontSize: 36, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1, textShadow: "0 10px 30px #000", textAlign: "center", marginBottom: 12 }, cta: { fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: 2, textTransform: "uppercase", borderTop: "1px solid #d4af37", paddingTop: 6 } } },
  { id: "breaking", label: "Новости", defX: 10, defY: 80, style: { container: { alignItems: "flex-start", width: "90%" }, hook: { fontSize: 14, fontWeight: 900, fontFamily: "sans-serif", color: "#fff", background: "#ef4444", padding: "4px 10px", textTransform: "uppercase", marginBottom: 8 }, title: { fontSize: 32, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1, color: "#000", background: "#fff", padding: "4px 12px", textAlign: "left", marginBottom: 12 }, cta: { fontSize: 12, fontWeight: 900, color: "#ef4444", textTransform: "uppercase", background:"#000", padding:"2px 8px" } } },
  { id: "cyber", label: "Cyberpunk", defX: 50, defY: 50, style: { container: { alignItems: "center", width: "90%" }, hook: { fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: "#fef08a", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, textShadow: "0 0 10px #fef08a" }, title: { fontSize: 34, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1, textShadow: "2px 2px 0px #0ea5e9, -2px -2px 0px #ec4899", textAlign: "center", marginBottom: 12, fontStyle: "italic" }, cta: { fontSize: 11, fontWeight: 900, color: "#000", background: "#0ea5e9", padding: "4px 12px", textTransform: "uppercase", boxShadow: "0 0 15px #0ea5e9" } } },
  { id: "minimal", label: "Minimal", defX: 50, defY: 80, style: { container: { alignItems: "center", width: "90%" }, hook: { fontSize: 10, fontWeight: 500, fontFamily: "sans-serif", color: "#fff", textTransform: "uppercase", letterSpacing: 4, marginBottom: 12, opacity: 0.7 }, title: { fontSize: 30, fontWeight: 300, textTransform: "uppercase", lineHeight: 1.2, textAlign: "center", marginBottom: 16, letterSpacing: 2 }, cta: { fontSize: 9, fontWeight: 400, color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "6px 16px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 1 } } },
  { id: "edge", label: "Vertical Edge", defX: 15, defY: 50, style: { container: { alignItems: "flex-end", width: "120%", height:"auto", customTransform: "translate(-50%, -50%) rotate(-90deg)" }, hook: { fontSize: 14, color: "#fff", background: "#ef4444", padding: "4px 12px", letterSpacing: 2 }, title: { fontSize: 44, fontWeight: 900, textTransform: "uppercase", whiteSpace:"nowrap", textShadow:"0 4px 10px rgba(0,0,0,0.8)" }, cta: { display:"none" } } },
  { id: "zpattern", label: "Z-Pattern", defX: 50, defY: 50, style: { container: { width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding:"40px 20px" }, hook: { alignSelf: "flex-start", fontSize: 13, background: "#fff", color: "#000", padding: "6px 12px", fontWeight:900 }, title: { alignSelf: "center", textAlign: "center", fontSize: 36, fontWeight: 900, textShadow: "0 8px 30px #000" }, cta: { alignSelf: "flex-end", fontSize: 12, color: "#0ea5e9", borderBottom: "2px solid #0ea5e9", paddingBottom:4, fontWeight:900 } } },
  { id: "sidebar", label: "Sidebar", defX: 25, defY: 50, style: { container: { width: "50%", height: "100%", background: "rgba(0,0,0,0.85)", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", borderRight: "2px solid #a855f7" }, hook: { color: "#a855f7", fontSize: 12, marginBottom: 15, fontWeight:800, letterSpacing:1 }, title: { fontSize: 28, fontWeight: 900, textAlign: "left", marginBottom: 25, lineHeight:1.1 }, cta: { color: "#000", background: "#a855f7", padding: "8px 16px", fontSize: 10, fontWeight:900, textTransform:"uppercase" } } },
  { id: "cinematic", label: "Cinematic", defX: 50, defY: 50, style: { container: { width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center" }, hook: { width: "100%", background: "#000", color: "#fff", textAlign: "center", padding: "12px", fontSize: 11, letterSpacing: 4 }, title: { width: "100%", background: "#000", color: "#fff", textAlign: "center", padding: "20px 10px", fontSize: 28, fontWeight: 900, marginBottom: 0 }, cta: { position: "absolute", bottom: "12%", fontSize: 10, color: "#fff", border: "1px solid rgba(255,255,255,0.5)", padding: "6px 14px", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(5px)" } } }
];

const FONTS = [
  { id: "Impact, sans-serif", label: "Viral (Толстый)" },
  { id: "'Bebas Neue', sans-serif", label: "YouTube (Кликбейт)" },
  { id: "'Creepster', cursive", label: "Horror (Рваный)" },
  { id: "'Cinzel', serif", label: "Cinematic (Кино)" },
  { id: "'Oswald', sans-serif", label: "Oswald (Строгий)" },
  { id: "'Montserrat', sans-serif", label: "Clean (Док)" },
  { id: "'Permanent Marker', cursive", label: "Marker (Гранж)" },
  { id: "'Playfair Display', serif", label: "Elegance (Курсив)" },
  { id: "'Courier New', monospace", label: "Secret (Машинка)" }
];

const COLORS = ["#ffffff", "#ffdd00", "#facc15", "#ef4444", "#ec4899", "#0ea5e9", "#a855f7", "#22c55e", "#f97316", "#000000"];

// --- СИСТЕМНЫЕ ПРОМПТЫ ---
const SYS_STEP_1 = `You are 'Director-X'. Output ONLY valid JSON.
Create a storyboard, voiceover, sfx, and SEO. 
ALL CONTENT MUST BE IN TARGET LANGUAGE EXCEPT "_EN" FIELDS.
Rule: Do NOT write "Диктор: " in the voice text. Just the words.
Rule: SEO titles must have a curiosity gap. Description MUST end on a cliffhanger.
Rule: Be a brutal retention analyst. Calculate a REALISTIC retention score (from 60 to 99) based on the Hook, pacing, and twist. Provide 1 sentence of CRITICAL feedback in Russian. Do NOT just write 95.

JSON FORMAT:
{
  "character_ref_EN": "Create a professional character reference sheet for: [CHARACTER DESC]. Use a clean, neutral solid background and present the sheet as a technical model turnaround in a photographic style. 8k.",
  "location_ref_EN": "A wide architectural establishing shot of [LOCATION]...",
  "style_ref_EN": "[Era/Atmosphere tags...]",
  "retention": { "score": 82, "feedback": "Критический разбор..." },
  "frames": [ { "timecode": "0-3 сек", "camera": "Наезд", "visual": "Описание кадра", "sfx": "Шум", "text_on_screen": "ТИТР", "voice": "Текст диктора" } ],
  "thumbnail": { "title": "ЗАГОЛОВАК", "hook": "ХУК", "cta": "СМОТРЕТЬ" },
  "music_EN": "Dark cinematic orchestral score, 120 BPM...",
  "seo": { "titles": ["Viral Title 1"], "desc": "Cliffhanger...", "tags": ["#tag1"] }
}`;

const SYS_STEP_2 = `You are an Elite AI Prompter. Output ONLY valid JSON.
Based on the storyboard, generate highly detailed English visual descriptions for frames.
Rule for thumbnail_prompt_EN: Analyze the core mystery/object. The thumbnail MUST feature the main enigmatic object or central mysterious character (e.g., 'The Iron Mask', 'The empty bunker'). DO NOT focus on secondary people. Rule: Main subject MUST take 40-60% of frame. Include: 'dark empty background space for text layout', 8k, photorealistic.

JSON FORMAT:
{
  "frames_prompts": [ { "imgPrompt_EN": "...", "vidPrompt_EN": "..." } ],
  "b_rolls": [ "..." ],
  "thumbnail_prompt_EN": "..."
}`;

// --- ФУНКЦИИ ---
async function callAPI(content, maxTokens = 4000, sysPrompt) {
  try {
    const res = await fetch("/api/chat", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ messages: [{ role: "system", content: sysPrompt }, { role: "user", content }], max_tokens: maxTokens }) 
    });
    const textRes = await res.text();
    let data = JSON.parse(textRes);
    if (!res.ok || data.error) throw new Error(data.error || "Ошибка API");
    return data.text || "";
  } catch (e) { throw e; }
}

function cleanJSON(rawText) {
  let cleanText = rawText.replace(/```json/gi, "").replace(/```/gi, "").trim();
  const startIdx = cleanText.indexOf('{'); const endIdx = cleanText.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1) cleanText = cleanText.substring(startIdx, endIdx + 1);
  return JSON.parse(cleanText.replace(/\r?\n|\r/g, " ").replace(/[\u0000-\u001F]+/g, ""));
}

function CopyBtn({ text, label="Копировать", small=false }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={e=>{ e.stopPropagation(); try{navigator.clipboard?.writeText(text)}catch{}; setOk(true); setTimeout(()=>setOk(false),2000); }}
      style={{background:ok?"rgba(34,197,94,.25)":"rgba(255,255,255,.05)",border:`1px solid ${ok?"#4ade80":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:small?"4px 10px":"6px 14px",fontSize:small?10:11,color:ok?"#4ade80":"rgba(255,255,255,.7)",cursor:"pointer",fontFamily:"inherit",transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
      {ok?"✓ СКОПИРОВАНО":label}
    </button>
  );
}

export default function Page() {
  const [tokens, setTokens] = useState(3);
  const [showPaywall, setShowPaywall] = useState(false);
  const [clicks, setClicks] = useState(0); 
  
  const [topic, setTopic] = useState("");
  const [finalTwist, setFinalTwist] = useState(""); 
  const [genre, setGenre] = useState("ТАЙНА");
  const [script, setScript] = useState("");
  const [dur, setDur] = useState("До 60 сек");
  const [vidFormat, setVidFormat] = useState("9:16");
  const [engine, setEngine] = useState("CINEMATIC");
  const [customStyle, setCustomStyle] = useState(""); 
  const [lang, setLang] = useState("RU"); 
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTTS, setShowTTS] = useState(false);
  const [hooksList, setHooksList] = useState([]); 
  const [view, setView] = useState("form");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [tab, setTab] = useState("storyboard");
  const [frames, setFrames] = useState([]);
  const [bRolls, setBRolls] = useState([]);
  const [retention, setRetention] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [music, setMusic] = useState("");
  const [seo, setSeo] = useState(null);
  const [charRef, setCharRef] = useState("");
  const [locRef, setLocRef] = useState("");
  const [styleRef, setStyleRef] = useState("");
  const [step2Done, setStep2Done] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rawScript, setRawScript] = useState("");
  const [rawImg, setRawImg] = useState("");
  const [rawVid, setRawVid] = useState("");
  const [bgImage, setBgImage] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [showSafeZone, setShowSafeZone] = useState(false); 

  // Cover Design State
  const [covTitle, setCovTitle] = useState("");
  const [covHook, setCovHook] = useState("");
  const [covCta, setCovCta] = useState("");
  const [covDark, setCovDark] = useState(50);
  const [covX, setCovX] = useState(50);
  const [covY, setCovY] = useState(50);
  const [covFont, setCovFont] = useState(FONTS[1].id);
  const [covColor, setCovColor] = useState(COLORS[0]);
  const [sizeHook, setSizeHook] = useState(12);
  const [sizeTitle, setSizeTitle] = useState(32);
  const [sizeCta, setSizeCta] = useState(10);
  const [activePreset, setActivePreset] = useState("netflix");

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { 
    if (typeof window !== "undefined") { 
      const savedHist = localStorage.getItem("ds_history"); 
      if (savedHist) setHistory(JSON.parse(savedHist)); 
      const savedDraft = localStorage.getItem("ds_draft");
      if (savedDraft) {
         try {
           const d = JSON.parse(savedDraft);
           if (d.topic) setTopic(d.topic); if (d.script) setScript(d.script); if (d.genre) setGenre(d.genre); if (d.finalTwist) setFinalTwist(d.finalTwist);
         } catch(e){}
      }
      setDraftLoaded(true);
      const today = new Date().toLocaleDateString();
      const savedBilling = localStorage.getItem("ds_billing");
      if (savedBilling) {
        try {
          const b = JSON.parse(savedBilling);
          if (b.date !== today) { setTokens(3); localStorage.setItem("ds_billing", JSON.stringify({ tokens: 3, date: today })); } 
          else { setTokens(b.tokens); }
        } catch(e) { setTokens(3); }
      } else { localStorage.setItem("ds_billing", JSON.stringify({ tokens: 3, date: today })); setTokens(3); }
    } 
  }, []);

  useEffect(() => {
    if (GENRE_PRESETS[genre]) { setCovFont(GENRE_PRESETS[genre].font); setCovColor(GENRE_PRESETS[genre].color); }
  }, [genre]);

  useEffect(() => { if (draftLoaded) localStorage.setItem("ds_draft", JSON.stringify({topic, script, genre, finalTwist})); }, [topic, script, genre, finalTwist, draftLoaded]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTo({top:0,behavior:"smooth"}); }, [view]);

  const handleGodMode = () => {
    setClicks(c => c + 1);
    if (clicks + 1 >= 5) {
      setTokens(999); localStorage.setItem("ds_billing", JSON.stringify({ tokens: 999, date: new Date().toLocaleDateString() }));
      alert("✨ GOD MODE: 💎 999 ✨"); setClicks(0);
    }
    setTimeout(() => setClicks(0), 2000);
  };

  const deductToken = () => { setTokens(prev => { const next = prev - 1; localStorage.setItem("ds_billing", JSON.stringify({ tokens: next, date: new Date().toLocaleDateString() })); return next; }); };
  const checkTokens = () => { if (tokens <= 0) { setShowPaywall(true); return false; } return true; };
  const deleteFromHistory = (id) => { setHistory(prev => { const next = prev.filter(item => item.id !== id); localStorage.setItem("ds_history", JSON.stringify(next)); return next; }); };
  
  const applyPreset = (pid) => {
    setActivePreset(pid); const p = COVER_PRESETS.find(x => x.id === pid);
    if (p) { 
      setCovX(p.defX); setCovY(p.defY); 
      setSizeHook(p.style.hook.fontSize || 12); setSizeTitle(p.style.title.fontSize || 32); setSizeCta(p.style.cta?.fontSize || 10);
    }
  };

  async function handleGenerateHooks() {
    if (!topic.trim()) return alert("Введите Тему!");
    setBusy(true); setLoadingMsg("Придумываем кликбейты..."); setView("loading");
    try {
      const text = await callAPI(`Topic: ${topic}`, 2000, `Write 3 viral hooks in Russian. Genre: ${genre}. Provide JSON array: ["Хук 1", "Хук 2", "Хук 3"]`);
      const arr = cleanJSON(text); if(Array.isArray(arr)) setHooksList(arr);
    } catch(e) { alert("Ошибка: " + e.message); } finally { setBusy(false); setView("form"); }
  }

  async function handleDraftText() {
    if (!topic.trim()) return alert("Введите тему!");
    setBusy(true); setLoadingMsg("Пишем сценарий..."); setView("loading");
    try {
      const sec = DURATION_SECONDS[dur] || 60; const maxWords = Math.floor(sec * 2.2); 
      const sysTxt = `You are 'Director-X'. Напиши ТОЛЬКО текст диктора на РУССКОМ ЯЗЫКЕ. Без слова "Диктор:". Жанр: ${genre}. Макс: ${maxWords} слов. ${finalTwist ? `Интрига: ${finalTwist}` : ""}`;
      const text = await callAPI(`Тема: ${topic}`, 3000, sysTxt);
      setScript(text.replace(/Диктор:\s*/gi, "").trim()); setHooksList([]);
    } catch(e) { alert("Ошибка: " + e.message); } finally { setBusy(false); setView("form"); }
  }

  function rebuildRawText(frms, s2done) {
    let scriptTxt = frms.map((f, i) => `КАДР ${i+1} [${f.timecode || ''}]\n👁 Визуал: ${f.visual}\n🎙 Диктор: «${f.voice}»`).join("\n\n");
    let imgTxt = s2done ? frms.map(f => f.imgPrompt_EN).filter(Boolean).join("\n\n") : "";
    let vidTxt = s2done ? frms.map(f => f.vidPrompt_EN).filter(Boolean).join("\n\n") : "";
    setRawScript(scriptTxt); setRawImg(imgTxt); setRawVid(vidTxt);
  }

  async function handleStep1() {
    if (!topic.trim() && !script.trim()) return alert("Заполните поля!");
    if (!checkTokens()) return;
    setBusy(true); setLoadingMsg("Шаг 1: Создаем раскадровку..."); setView("loading");
    try {
      let currentScript = script.trim();
      if (!currentScript) { currentScript = await callAPI(`Тема: ${topic}`, 3000, `Write voiceover in Russian under 100 words.`); setScript(currentScript.trim()); }
      const req = `ТЕМА: ${topic}. ЖАНР: ${genre}. ТВИСТ: ${finalTwist}. СЦЕНАРИЙ: ${currentScript}. ВЫДАЙ JSON!`;
      const text = await callAPI(req, 8000, SYS_STEP_1);
      const data = cleanJSON(text);
      setFrames(data.frames || []); setRetention(data.retention || null); setThumb(data.thumbnail || null); setMusic(data.music_EN || ""); setSeo(data.seo || null);
      setCharRef(data.character_ref_EN || ""); setLocRef(data.location_ref_EN || ""); setStyleRef(data.style_ref_EN || ""); 
      setBRolls([]); setStep2Done(false);
      if (data.thumbnail) { setCovTitle(data.thumbnail.title || ""); setCovHook(data.thumbnail.hook || ""); setCovCta(data.thumbnail.cta || "СМОТРЕТЬ"); }
      rebuildRawText(data.frames || [], false); deductToken(); setBgImage(null); setTab("storyboard"); setView("result");
      const stateData = { frames: data.frames, charRef: data.character_ref_EN, locRef: data.location_ref_EN, styleRef: data.style_ref_EN, retention: data.retention, thumb: data.thumbnail, seo: data.seo, music: data.music_EN, step2Done: false };
      const newHistory = [{ id: Date.now(), topic: topic || "Генерация", time: new Date().toLocaleString("ru-RU"), text: JSON.stringify(stateData), format: vidFormat }, ...history].slice(0, 10);
      setHistory(newHistory); localStorage.setItem("ds_history", JSON.stringify(newHistory));
    } catch(e) { alert(`Ошибка: ${e.message}`); setView("form"); } finally { setBusy(false); }
  }

  async function handleStep2() {
    if (!checkTokens()) return;
    setBusy(true); setLoadingMsg("Шаг 2: Генерируем 8k PRO-промпты..."); setView("loading");
    try {
      const storyboardLite = frames.map((f, i) => `Frame ${i+1}: Visual: ${f.visual}`).join("\n");
      const text = await callAPI(storyboardLite, 8000, SYS_STEP_2);
      const data = cleanJSON(text);
      const updatedFrames = frames.map((f, i) => {
        const p = data.frames_prompts && data.frames_prompts[i] ? data.frames_prompts[i] : {};
        const engineStyle = VISUAL_ENGINES[engine]?.prompt || "";
        const finalStyle = `${styleRef ? styleRef + ", " : ""}${engineStyle}${customStyle ? ", "+customStyle : ""}`;
        return { ...f, imgPrompt_EN: (p.imgPrompt_EN || f.visual) + `, ${finalStyle}, 8k`, vidPrompt_EN: (p.vidPrompt_EN || f.visual) + `, ${finalStyle}, 8k` };
      });
      setFrames(updatedFrames); setBRolls(data.b_rolls || []); setThumb({...thumb, prompt_EN: data.thumbnail_prompt_EN}); setStep2Done(true);
      rebuildRawText(updatedFrames, true); deductToken(); setView("result");
    } catch(e) { alert(`Ошибка: ${e.message}`); setView("result"); } finally { setBusy(false); }
  }

  function handleImageUpload(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => setBgImage(ev.target.result); reader.readAsDataURL(file); }
  async function downloadThumbnail() {
    const el = document.getElementById("thumbnail-export"); if (!el) return;
    setDownloading(true); const wasSafeZone = showSafeZone; setShowSafeZone(false); 
    setTimeout(() => {
      if (!window.html2canvas) { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload = doCapture; document.body.appendChild(s); } else doCapture();
      function doCapture() {
        window.html2canvas(el, { useCORS: true, scale: 3, backgroundColor: null }).then(c => { const a = document.createElement('a'); a.download = `Cover_${Date.now()}.png`; a.href = c.toDataURL(); a.click(); setDownloading(false); setShowSafeZone(wasSafeZone); }).catch(() => { setDownloading(false); setShowSafeZone(wasSafeZone); alert("Ошибка рендера"); });
      }
    }, 100);
  }

  return (
    <div ref={scrollRef} style={{minHeight:"100vh", color:"#e2e8f0", paddingBottom:120, position:"relative", zIndex:1, overflowY:"auto"}}>
      <NeuralBackground />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cinzel:wght@700;900&family=Creepster&family=Montserrat:wght@800;900&family=Oswald:wght@700&family=Permanent+Marker&family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
        .gbtn{width:100%;height:56px;border:none;border-radius:16px;cursor:pointer;font-weight:900;color:#fff;background:linear-gradient(135deg,#4f46e5,#9333ea,#ec4899);box-shadow: 0 4px 20px rgba(168,85,247,0.4);}
        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #a855f7; cursor: pointer; margin-top: -6px; box-shadow: 0 0 10px #a855f7; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        @keyframes spin {to{transform:rotate(360deg)}}
      `}</style>

      {showPaywall && (
        <div style={{position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
          <div style={{background:"#111827", border:"1px solid #a855f7", borderRadius:24, padding:30, maxWidth:400, textAlign:"center", boxShadow:"0 10px 50px rgba(168,85,247,0.3)"}}>
            <div style={{fontSize:50, marginBottom:10}}>💎</div>
            <h2 style={{fontSize:22, fontWeight:900, color:#fff, marginBottom:10}}>Лимит исчерпан</h2>
            <p style={{fontSize:14, color:"#cbd5e1", marginBottom:24}}>Бесплатная магия на сегодня закончилась. Возвращайтесь завтра за новыми кристаллами!</p>
            <button onClick={()=>setShowPaywall(false)} style={{width:"100%", background:"linear-gradient(135deg, #a855f7, #ec4899)", border:"none", padding:"16px", borderRadius:16, color:"#fff", fontWeight:900, cursor:"pointer"}}>ПОНЯТНО</button>
          </div>
        </div>
      )}

      {showHistory && (
        <div style={{position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
          <div style={{background:"#111827", border:"1px solid #374151", borderRadius:24, width:"100%", maxWidth:500, maxHeight:"80vh", display:"flex", flexDirection:"column", overflow:"hidden"}}>
            <div style={{padding:"20px 24px", borderBottom:"1px solid #374151", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
               <h2 style={{fontSize:18, fontWeight:900, color:"#fff"}}>🗄 Архив</h2>
               <button onClick={()=>setShowHistory(false)} style={{background:"none", border:"none", color:"#9ca3af", fontSize:24, cursor:"pointer"}}>×</button>
            </div>
            <div style={{padding:20, overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:12}}>
              {history.map(item => (
                <div key={item.id} style={{background:"rgba(255,255,255,0.05)", borderRadius:16, padding:16, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div><div style={{fontSize:14, fontWeight:800, color:"#d8b4fe"}}>{item.topic || "Без темы"}</div><div style={{fontSize:11, color:"#9ca3af"}}>{item.time}</div></div>
                  <button onClick={()=>{
                    const d = JSON.parse(item.text); setFrames(d.frames || []); setRetention(d.retention || null); setThumb(d.thumb || null); setMusic(d.music || ""); setSeo(d.seo || null); setCharRef(d.charRef || ""); setLocRef(d.locRef || ""); setStyleRef(d.styleRef || ""); setStep2Done(d.step2Done || false);
                    if(d.thumb) { setCovTitle(d.thumb.title || ""); setCovHook(d.thumb.hook || ""); setCovCta(d.thumb.cta || "СМОТРЕТЬ"); applyPreset("netflix"); }
                    rebuildRawText(d.frames || [], d.step2Done); setShowHistory(false); setView("result");
                  }} style={{background:"#10b981", border:"none", borderRadius:8, padding:"8px 12px", color:"#fff", fontSize:11, fontWeight:800, cursor:"pointer"}}>ОТКРЫТЬ</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav style={{position:"sticky", top:0, zIndex:50, background:"rgba(5,5,10,.6)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.05)", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px"}}>
        <span onClick={handleGodMode} style={{fontSize:18,fontWeight:900,color:"#fff", cursor:"pointer"}}>DOCU<span style={{color:"#a855f7"}}>SHORTS</span></span>
        <div style={{display:"flex",gap:12, alignItems:"center"}}>
          <button onClick={()=>setShowHistory(true)} style={{background:"none",border:"none",color:"#cbd5e1",fontSize:12,fontWeight:700, cursor:"pointer"}}>🗄 АРХИВ</button>
          <div style={{fontSize:11, fontWeight:800, color:tokens>0?"#34d399":"#ef4444", background:"rgba(255,255,255,0.05)", padding:"6px 12px", borderRadius:10}}>💎 {tokens}</div>
        </div>
      </nav>

      {view==="form" && (
        <div style={{maxWidth:600,margin:"0 auto",padding:"30px 20px"}}>
          <div style={{marginBottom:24, background:"rgba(15,15,25,.4)", border:"1px solid rgba(168,85,247,0.3)", borderRadius:24, padding:24, backdropFilter:"blur(20px)"}}>
            <label style={{fontSize:11, fontWeight:800, color:"#d8b4fe", display:"block", marginBottom:12}}>🎯 ТЕМА ВИДЕО</label>
            <textarea rows={2} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="О чем будет хит?" style={{width:"100%",background:"rgba(0,0,0,.5)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:18,fontSize:16,color:"#fff", resize:"none", marginBottom:12}}/>
            <input type="text" value={finalTwist} onChange={e=>setFinalTwist(e.target.value)} placeholder="Скрытый твист в конце..." style={{width:"100%",background:"rgba(0,0,0,.5)",border:"1px dashed rgba(168,85,247,0.4)",borderRadius:12,padding:12,fontSize:13,color:"#e9d5ff"}}/>
          </div>

          <div style={{marginBottom:24, padding:"20px 24px"}}>
            <label style={{fontSize:11, fontWeight:800, color:"#94a3b8", display:"block", marginBottom:12}}>🎭 ЖАНР РАССКАЗА</label>
            <div className="hide-scroll" style={{display:"flex", gap:8, overflowX:"auto", paddingBottom:8}}>
              {Object.entries(GENRE_PRESETS).map(([g,p])=>(
                <button key={g} onClick={()=>setGenre(g)} style={{flexShrink:0, display:"flex", alignItems:"center", gap:6, background: genre===g ? p.col : "rgba(0,0,0,0.4)", border: `1px solid ${genre===g ? p.col : "rgba(255,255,255,0.1)"}`, color: genre===g ? "#fff" : "rgba(255,255,255,0.6)", padding: "8px 16px", borderRadius: 100, fontWeight: 800, fontSize: 11, cursor: "pointer"}}>
                  <span>{p.icon}</span> <span>{g}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:24, background:"rgba(15,15,25,.4)", border:"1px solid rgba(255,255,255,.08)", borderRadius:24, padding:24}}>
             <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
               <label style={{fontSize:11, fontWeight:800, color:"#94a3b8"}}>📝 СЦЕНАРИЙ</label>
               <button onClick={handleGenerateHooks} disabled={busy || !topic.trim()} style={{background:"rgba(249,115,22,0.15)", color:"#fbbf24", border:"1px solid rgba(249,115,22,0.3)", borderRadius:8, padding:"4px 10px", fontSize:10, fontWeight:900, cursor:"pointer"}}>🔥 3 ХУКА</button>
             </div>
             {hooksList.length > 0 && <div style={{display:"flex", flexDirection:"column", gap:6, marginBottom:12}}>{hooksList.map((h,i) => ( <div key={i} onClick={() => { setScript(h + " " + script); setHooksList([]); }} style={{background:"rgba(255,255,255,0.05)", padding:10, borderRadius:8, fontSize:13, color:"#fcd34d", cursor:"pointer", borderLeft:"3px solid #f59e0b"}}>{h}</div> ))}</div>}
             <textarea rows={5} value={script} onChange={e=>setScript(e.target.value)} placeholder="Текст диктора..." style={{width:"100%",background:"rgba(0,0,0,.5)",border:"1px solid rgba(255,255,255,.1)",borderRadius:16,padding:16,fontSize:14,color:"#cbd5e1",marginBottom:16, resize:"none"}}/>
             <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
               <button onClick={handleDraftText} disabled={busy || !topic.trim()} style={{background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", padding:12, borderRadius:12, fontSize:12, fontWeight:700, cursor:"pointer"}}>✍️ Написать весь текст</button>
               <button onClick={()=>setShowTTS(!showTTS)} style={{background:"rgba(14,165,233,0.1)", border:"1px dashed rgba(14,165,233,0.3)", color:"#7dd3fc", padding:12, borderRadius:12, fontSize:12, fontWeight:700, cursor:"pointer"}}>⚙️ Голос (TTS)</button>
             </div>
             {showTTS && <div style={{marginTop:16, display:"flex", flexDirection:"column", gap:10}}>{[
               {t:"МЕДЛЕННЫЙ", c:"#34d399", p:"A middle-aged male voice, extremely raspy and hoarse, sinister whisper. Slow pacing, heavy breathing."},
               {t:"СРЕДНИЙ", c:"#38bdf8", p:"A professional documentary narrator. Warm, authoritative tone, natural conversational inflections."},
               {t:"БЫСТРЫЙ", c:"#fb7185", p:"Young male voice, highly energetic, breathless and urgent. Rapid aggressive podcast style."}
             ].map((v,i)=>(<div key={i} style={{background:"rgba(0,0,0,0.4)", border:`1px solid ${v.c}44`, padding:12, borderRadius:12}}><div style={{color:v.c, fontSize:11, fontWeight:900, marginBottom:4}}>{i+1}. {v.t}</div><div style={{display:"flex", gap:10, alignItems:"center"}}><span style={{fontSize:11, color:v.c+"aa", flex:1, fontFamily:"monospace"}}>{v.p}</span><CopyBtn text={v.p} small/></div></div>))}</div>}
          </div>

          <div style={{marginBottom: 24}}>
             <button onClick={()=>setSettingsOpen(!settingsOpen)} style={{width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", padding:"16px 24px", borderRadius:24, color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer"}}><span>⚙️ НАСТРОЙКИ</span><span>{settingsOpen?"▲":"▼"}</span></button>
             {settingsOpen && <div style={{background:"rgba(15,15,25,.3)", padding:24, borderRadius:24, marginTop:10}}>
                <label style={{fontSize:11, color:"#94a3b8", display:"block", marginBottom:10}}>ВИЗУАЛ</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>{Object.entries(VISUAL_ENGINES).map(([eId, e])=><button key={eId} onClick={()=>setEngine(eId)} style={{flex:"1 1 45%",background:engine===eId?"rgba(168,85,247,.15)":"rgba(0,0,0,.4)",border:`1px solid ${engine===eId?"#a855f7":"rgba(255,255,255,0.1)"}`,borderRadius:14,padding:10,fontSize:11,color:engine===eId?"#d8b4fe":"rgba(255,255,255,0.5)"}}>{e.label}</button>)}</div>
                <label style={{fontSize:11, color:"#94a3b8", display:"block", marginBottom:10}}>ДЛИТЕЛЬНОСТЬ</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{DURATIONS.map(d=><button key={d} onClick={()=>setDur(d)} style={{background:dur===d?"rgba(249,115,22,.15)":"rgba(0,0,0,.4)",border:`1px solid ${dur===d?"#f97316":"rgba(255,255,255,0.1)"}`,borderRadius:20,padding:"10px 16px",fontSize:12,color:dur===d?"#fdba74":"rgba(255,255,255,.5)"}}>{d}</button>)}</div>
             </div>}
          </div>

          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:600,padding:"16px 20px 24px",background:"linear-gradient(to top, rgba(5,5,10,1) 50%, transparent)",zIndex:100}}>
            <button className="gbtn" onClick={handleStep1} disabled={(!script.trim() && !topic.trim()) || busy}>{busy?"В РАБОТЕ...":"🚀 ШАГ 1: РАСКАДРОВКА (💎 1)"}</button>
          </div>
        </div>
      )}

      {view==="loading" && <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",padding:20,textAlign:"center"}}><div style={{width:50,height:50,border:"3px solid rgba(168,85,247,0.2)",borderTopColor:"#a855f7",borderRadius:"50%",animation:"spin 1s linear infinite",marginBottom:24}}/><div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{loadingMsg}</div></div>}

      {view==="result" && (
        <div style={{maxWidth:600,margin:"0 auto",padding:"20px 20px 100px"}}>
          <button onClick={()=>setView("form")} style={{marginBottom:20, color:"#a855f7", background:"none", border:"none", fontWeight:800, cursor:"pointer", fontSize:12}}>← НАЗАД В НАСТРОЙКИ</button>
          
          {retention && (
             <div style={{background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:16, padding:16, marginBottom:24}}>
               <div style={{fontSize:11, fontWeight:900, color:"#34d399", marginBottom:6}}>📊 Удержание: {retention.score}%</div>
               <div style={{fontSize:13, color:"#a7f3d0"}}>{retention.feedback}</div>
             </div>
          )}

          <div style={{background:"rgba(15,15,25,.4)", border:"1px solid rgba(255,255,255,.08)", borderRadius:24, padding:24, marginBottom:24}}>
            <div style={{fontSize:14, fontWeight:900, color:"#d8b4fe", marginBottom:20}}>🎨 СТУДИЯ ОБЛОЖКИ</div>
            <div className="hide-scroll" style={{display:"flex", gap:8, overflowX:"auto", paddingBottom:16, marginBottom:10}}>
              {COVER_PRESETS.map(p=>(<button key={p.id} onClick={()=>applyPreset(p.id)} style={{flexShrink:0, padding:"8px 14px", borderRadius:10, border:`1px solid ${activePreset===p.id?"#a855f7":"rgba(255,255,255,0.1)"}`, background:activePreset===p.id?"rgba(168,85,247,0.2)":"rgba(0,0,0,0.3)", color:activePreset===p.id?"#fff":"rgba(255,255,255,0.5)", fontSize:11, fontWeight:800, cursor:"pointer"}}>{p.label}</button>))}
            </div>

            <div id="thumbnail-export" style={{width:320, height:568, margin:"0 auto 20px", position:"relative", background:bgImage?`url(${bgImage}) center/cover no-repeat`:"#111", overflow:"hidden", borderRadius:16}}>
              <div style={{position:"absolute", inset:0, background:`linear-gradient(to top, rgba(0,0,0,${covDark/100}) 0%, rgba(0,0,0,${covDark/200}) 50%, transparent 100%)`, zIndex:1}} />
              <div style={{...activeStyle.container, position:"absolute", left:`${covX}%`, top:`${covY}%`, transform: activeStyle.container.customTransform || "translate(-50%,-50%)", zIndex:2 }}>
                <div style={{...activeStyle.hook, fontSize: Number(sizeHook)}}>{covHook}</div>
                <div style={{...activeStyle.title, fontFamily: covFont, color: covColor, fontSize: Number(sizeTitle), wordWrap:"break-word"}}>{covTitle}</div>
                <div style={{...activeStyle.cta, fontSize: Number(sizeCta)}}>{covCta}</div>
              </div>
              {showSafeZone && <div style={{position:"absolute", inset:0, borderBottom:"100px solid rgba(239,68,68,0.1)", borderRight:"60px solid rgba(239,68,68,0.1)", pointerEvents:"none", zIndex:10}}/>}
            </div>
            
            <label style={{display:"flex", alignItems:"center", gap:8, fontSize:11, color:"#94a3b8", marginBottom:20}}><input type="checkbox" checked={showSafeZone} onChange={e=>setShowSafeZone(e.target.checked)} /> Показать Сейф-зону</label>

            <div style={{background:"rgba(0,0,0,0.3)", borderRadius:16, padding:20, marginBottom:20}}>
               <input type="text" value={covHook} onChange={e=>setCovHook(e.target.value)} placeholder="Хук" style={{width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", padding:12, borderRadius:10, color:"#fff", marginBottom:8}} />
               <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}><span style={{fontSize:10, color:"#94a3b8", width:40}}>Size</span><input type="range" min="8" max="40" value={sizeHook} onChange={e=>setSizeHook(e.target.value)}/></div>
               
               <input type="text" value={covTitle} onChange={e=>setCovTitle(e.target.value)} placeholder="Заголовок" style={{width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(168,85,247,0.4)", padding:12, borderRadius:10, color:"#fff", fontWeight:800, marginBottom:8}} />
               <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:16}}><span style={{fontSize:10, color:"#94a3b8", width:40}}>Size</span><input type="range" min="16" max="80" value={sizeTitle} onChange={e=>setSizeTitle(e.target.value)}/></div>

               <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16}}>
                 <div><label style={{fontSize:10, color:"#94a3b8", display:"block", marginBottom:4}}>Позиция X</label><input type="range" min="0" max="100" value={covX} onChange={e=>setCovX(e.target.value)}/></div>
                 <div><label style={{fontSize:10, color:"#94a3b8", display:"block", marginBottom:4}}>Позиция Y</label><input type="range" min="0" max="100" value={covY} onChange={e=>setCovY(e.target.value)}/></div>
               </div>

               <label style={{fontSize:10, color:"#94a3b8", display:"block", marginBottom:8}}>Шрифт и Цвет</label>
               <div className="hide-scroll" style={{display:"flex", gap:8, overflowX:"auto", paddingBottom:12}}>{FONTS.map(f=>(<button key={f.id} onClick={()=>setCovFont(f.id)} style={{flexShrink:0, background:covFont===f.id?"rgba(168,85,247,0.2)":"rgba(0,0,0,0.5)", border:`1px solid ${covFont===f.id?"#a855f7":"rgba(255,255,255,0.1)"}`, color:"#fff", padding:"6px 12px", borderRadius:8, fontSize:10, fontFamily:f.id}}>{f.label}</button>))}</div>
               <div className="hide-scroll" style={{display:"flex", gap:10, alignItems:"center", overflowX:"auto"}}>{COLORS.map(c=>(<div key={c} onClick={()=>setCovColor(c)} style={{flexShrink:0, width:24, height:24, borderRadius:"50%", background:c, border:covColor===c?"2px solid #fff":"1px solid rgba(255,255,255,0.2)"}}/>))}<input type="color" value={covColor} onChange={e=>setCovColor(e.target.value)} style={{flexShrink:0, width:26, height:26, border:"none", borderRadius:"50%", background:"none"}}/></div>
            </div>

            {step2Done && thumb?.prompt_EN && <div style={{background:"rgba(14,165,233,0.1)", border:"1px dashed rgba(14,165,233,0.4)", borderRadius:16, padding:16, marginBottom:20}}><div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}><span style={{fontSize:11, fontWeight:900, color:"#38bdf8"}}>🖼 PROMPT ОБЛОЖКИ</span><CopyBtn text={thumb.prompt_EN} small/></div><div style={{fontSize:12, color:"#bae6fd", fontFamily:"monospace"}}>{thumb.prompt_EN}</div></div>}

            <div style={{display:"flex", gap:10}}><label style={{flex:1, height:48, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, cursor:"pointer", fontSize:12, fontWeight:800}}>📸 ФОН<input type="file" hidden onChange={handleImageUpload}/></label><button onClick={downloadThumbnail} style={{flex:1, height:48, background:"linear-gradient(135deg, #10b981, #059669)", borderRadius:14, border:"none", fontWeight:900, color:"#fff"}}>{downloading ? "..." : "💾 СКАЧАТЬ"}</button></div>
          </div>

          {!step2Done && <div style={{background:"rgba(236,72,153,0.1)", border:"1px dashed rgba(236,72,153,0.4)", borderRadius:24, padding:24, textAlign:"center", marginBottom:24}}><button onClick={handleStep2} disabled={busy || !checkTokens()} style={{width:"100%", padding:16, background:"linear-gradient(135deg, #db2777, #9333ea)", borderRadius:16, color:"#fff", fontWeight:900, border:"none"}}>🪄 ШАГ 2: PRO-ПРОМПТЫ (💎 1)</button></div>}

          <div style={{display:"flex", gap:15, marginBottom:20, borderBottom:"1px solid rgba(255,255,255,.05)", paddingBottom:10}}>{["storyboard","raw","seo"].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{background:"none", border:"none", color:tab===t?"#a855f7":"#94a3b8", fontWeight:800, fontSize:12, textTransform:"uppercase"}}>{t==="raw"?"Промпты":t==="seo"?"SEO":"Кадры"}</button>))}</div>

          {tab==="storyboard" && frames.map((f,i)=>(
            <div key={i} style={{background:"rgba(15,15,25,.4)", borderRadius:24, padding:20, marginBottom:16}}>
              <div style={{fontSize:12, fontWeight:900, color:"#ef4444", marginBottom:12}}>REC {String(i+1).padStart(2,"0")} | {f.timecode}</div>
              <div style={{fontSize:14, color:"#fff", marginBottom:10}}>👁 {f.visual}</div>
              <div style={{fontSize:14, fontStyle:"italic", color:"#a855f7", marginBottom:12}}>«{f.voice}»</div>
              {step2Done && f.vidPrompt_EN && <div style={{background:"rgba(139,92,246,.05)", padding:12, borderRadius:12}}><div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}><span style={{fontSize:9, color:"#a78bfa", fontWeight:800}}>VIDEO PROMPT</span><CopyBtn text={f.vidPrompt_EN} small/></div><div style={{fontSize:11, fontFamily:"monospace", color:"#d8b4fe"}}>{f.vidPrompt_EN}</div></div>}
            </div>
          ))}
          {tab==="seo" && seo && <div style={{background:"rgba(15,15,25,.4)", padding:20, borderRadius:24}}><div style={{color:"#fbbf24", fontSize:11, fontWeight:900, marginBottom:10}}>🎵 MUSIC: {music}</div><div style={{fontSize:13, color:"#fff"}}><strong>Titles:</strong> {seo.titles?.join(" | ")}</div><div style={{fontSize:13, color:"#fff", marginTop:10}}><strong>Tags:</strong> {seo.tags?.join(" ")}</div></div>}
        </div>
      )}
    </div>
  );
}
