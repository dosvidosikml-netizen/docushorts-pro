"use client";
// @ts-nocheck
/* eslint-disable */

import { useState, useEffect, useRef } from "react";

// --- ЖИВОЙ ФОН НЕЙРОСЕТИ (CANVAS ENGINE) ---
const NeuralBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width, 
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8
      });
    }

    const render = () => {
      ctx.fillStyle = "#05050a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(168, 85, 247, 0.8)";
      ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
      ctx.lineWidth = 1;
      
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath(); 
            ctx.moveTo(p.x, p.y); 
            ctx.lineTo(p2.x, p2.y); 
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return <canvas ref={canvasRef} style={{position:"fixed", top:0, left:0, zIndex:-2, width:"100vw", height:"100vh"}} />;
};

// --- НАСТРОЙКИ ---
const GENRE_PRESETS = {
  "КРИМИНАЛ":      { icon:"🔫", col:"#ff3355" }, 
  "ТАЙНА":         { icon:"🔍", col:"#a855f7" },
  "ИСТОРИЯ":       { icon:"📜", col:"#f97316" }, 
  "НАУКА":         { icon:"⚗",  col:"#06b6d4" },
  "ВОЙНА":         { icon:"⚔",  col:"#ef4444" }, 
  "ПРИРОДА":       { icon:"🌿", col:"#22c55e" },
  "ПСИХОЛОГИЯ":    { icon:"🧠", col:"#ec4899" }, 
  "КОНСПИРОЛОГИЯ": { icon:"👁", col:"#fbbf24" },
};

const FORMATS = [
  { id:"9:16", label:"Вертикальный", ratio:"9/16" }, 
  { id:"16:9", label:"Горизонтальный", ratio:"16/9" }, 
  { id:"1:1", label:"Квадрат", ratio:"1/1" }
];

const VISUAL_ENGINES = {
  "CINEMATIC": { label: "Кино-реализм", prompt: "cinematic realism, photorealistic, deep shadows, 8k, Arri Alexa 65" },
  "DARK_HISTORY": { label: "Dark History", prompt: "dark history grunge, dirty vintage film effect, scratches, bleak atmosphere, heavy vignette, 8k, Arri Alexa 65" },
  "ANIMATION_2_5D": { label: "2.5D Анимация", prompt: "2.5D stylized 3D render, Pixar and Studio Ghibli aesthetics, warm soft lighting, 8k" },
  "X_RAY": { label: "X-Ray / Схемы", prompt: "x-ray exploded view, detailed engineering diagram, glowing internal parts, technical cross-section render, 8k" }
};

const DURATION_CONFIG = {
  "15 сек": { frames: 5 }, "30–45 сек": { frames: 13 }, "До 60 сек": { frames: 20 }, 
  "1.5 мин": { frames: 30 }, "3 мин": { frames: 60 }, "10-12 мин": { frames: 80 } 
};

const DURATIONS = Object.keys(DURATION_CONFIG);

const COVER_PRESETS = [
  { id: "netflix", label: "Netflix", style: { container: { alignItems: "center" }, hook: { fontSize: 12, fontWeight: 700, fontFamily: "sans-serif", color: "#e50914", textTransform: "uppercase", letterSpacing: 4, marginBottom: 8, textShadow: "0 2px 4px #000" }, title: { fontSize: 32, fontWeight: 900, fontFamily: "Georgia, serif", color: "#fff", textTransform: "uppercase", lineHeight: 1.1, textShadow: "0 8px 25px rgba(0,0,0,0.9)", textAlign: "center" }, cta: { fontSize: 10, fontWeight: 800, fontFamily: "sans-serif", color: "#fff", textTransform: "uppercase", letterSpacing: 2, borderBottom: "1px solid #e50914", marginTop: 10 } } },
  { id: "mrbeast", label: "MrBeast", style: { container: { alignItems: "center" }, hook: { fontSize: 16, fontWeight: 900, fontFamily: "Impact, sans-serif", color: "#ffdd00", WebkitTextStroke: "1px #000", transform: "rotate(-2deg)" }, title: { fontSize: 40, fontWeight: 900, fontFamily: "Impact, sans-serif", color: "#fff", textTransform: "uppercase", lineHeight: 1, WebkitTextStroke: "2px #000", textShadow: "5px 5px 0 #000, 0 0 40px #ff00ff", transform: "rotate(-3deg)", textAlign: "center" }, cta: { fontSize: 13, fontWeight: 900, fontFamily: "sans-serif", color: "#ff00ff", background: "#000", border: "2px solid #ff00ff", padding: "6px 14px", transform: "rotate(-1deg)", marginTop: 10 } } },
  { id: "tiktok", label: "TikTok", style: { container: { alignItems: "center" }, hook: { fontSize: 13, fontWeight: 800, fontFamily: "sans-serif", color: "#00f2ea", background: "#000", padding: "4px 8px", borderRadius: 6, textTransform: "uppercase", marginBottom: 12 }, title: { fontSize: 28, fontWeight: 900, fontFamily: "Arial Black, sans-serif", color: "#fff", textTransform: "uppercase", lineHeight: 1.1, textShadow: "0 0 20px #00f2ea, 0 0 40px #00f2ea", textAlign: "center" }, cta: { fontSize: 11, fontWeight: 900, fontFamily: "sans-serif", color: "#fff", background: "#ff0050", padding: "6px 16px", borderRadius: 20, marginTop: 10 } } },
  { id: "truecrime", label: "True Crime", style: { container: { alignItems: "flex-start" }, hook: { fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: "#000", background: "#ffdd00", padding: "4px 8px", textTransform: "uppercase", marginBottom: 8 }, title: { fontSize: 34, fontWeight: 900, fontFamily: "Arial Black, sans-serif", color: "#fff", textTransform: "uppercase", lineHeight: 1.1, background: "#000", padding: "4px 12px", borderLeft: "4px solid #ffdd00", textAlign: "left" }, cta: { fontSize: 11, fontWeight: 800, fontFamily: "monospace", color: "#888", marginTop: 10 } } },
  { id: "horror", label: "Ужасы", style: { container: { alignItems: "center" }, hook: { fontSize: 14, fontWeight: 900, fontFamily: "serif", color: "#dc2626", textTransform: "uppercase", letterSpacing: 6, marginBottom: 8, textShadow: "0 0 10px #dc2626" }, title: { fontSize: 36, fontWeight: 900, fontFamily: "serif", color: "#fff", textTransform: "uppercase", lineHeight: 1.1, textShadow: "0 5px 20px #000, 0 0 15px #dc2626", textAlign: "center" }, cta: { fontSize: 10, fontWeight: 800, fontFamily: "sans-serif", color: "#fff", opacity: 0.5, letterSpacing: 2, marginTop: 10 } } },
  { id: "scifi", label: "Sci-Fi", style: { container: { alignItems: "center" }, hook: { fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: "#34d399", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }, title: { fontSize: 32, fontWeight: 900, fontFamily: "monospace", color: "#fff", textTransform: "uppercase", lineHeight: 1.1, textShadow: "0 0 10px #34d399", textAlign: "center" }, cta: { fontSize: 10, fontWeight: 800, fontFamily: "monospace", border: "1px solid #0ea5e9", color: "#0ea5e9", padding: "4px 8px", marginTop: 10 } } }
];

const VIRAL_SYSTEM = `### SYSTEM ROLE (STRICT JSON)
You are 'Director-X'. OUTPUT STRICTLY IN VALID JSON.

🚨 RULES:
1. PACING: Strictly 3 seconds per scene!
2. GLOBAL ANCHOR: Define physical details of character/location in "global_anchor_EN". Repeat this exact anchor in ALL scene prompts.
3. 8K QUALITY: ALWAYS append ", shot on Arri Alexa 65, 8k resolution, photorealistic, cinematic lighting" to every image and video prompt.
4. PROMPTS IN ENGLISH ONLY: "global_anchor_EN", "imgPrompt_EN", "vidPrompt_EN" and "music_EN" MUST be strictly in ENGLISH. Translate everything (actions, camera, sounds) to English.
5. NO Midjourney/Leonardo.
6. AUDIO: "music_EN" must be detailed instrumental Suno prompt (no vocals).

JSON SCHEMA:
{
  "global_anchor_EN": "e.g. 40yo detective...",
  "retention": { "score": 95, "feedback": "..." },
  "frames": [ { "timecode": "0-3 сек", "camera": "Motion", "visual": "Detail", "voice": "Voiceover...", "imgPrompt_EN": "...", "vidPrompt_EN": "... [SFX: ...]" } ],
  "b_rolls": [ "Flash b-roll 1 (1 sec)", "Flash b-roll 2 (1 sec)" ],
  "thumbnail": { "title": "...", "hook": "...", "cta": "...", "prompt_EN": "..." },
  "music_EN": "...",
  "seo": { "titles": ["T1", "T2", "T3"], "desc": "...", "tags": ["#tag1", "#tag2"] }
}`;

async function callAPI(content, maxTokens = 8000, sysPrompt = VIRAL_SYSTEM) {
  try {
    const res = await fetch("/api/chat", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ messages: [{ role: "system", content: sysPrompt }, { role: "user", content }], max_tokens: maxTokens }) 
    });
    const textRes = await res.text();
    if (!res.ok) throw new Error(`Ошибка API: ${res.status}`);
    const data = JSON.parse(textRes);
    if (data.error) throw new Error(data.error.message || data.error);
    return data.text || (data.choices && data.choices[0]?.message?.content) || "";
  } catch (e) { throw e; }
}

function CopyBtn({ text, label="Копировать", small=false }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); try { navigator.clipboard?.writeText(text) } catch{}; setOk(true); setTimeout(() => setOk(false), 2000); }}
      style={{background: ok ? "rgba(34,197,94,.25)" : "rgba(255,255,255,.05)", border: `1px solid ${ok ? "#4ade80" : "rgba(255,255,255,.1)"}`, borderRadius: 8, padding: small ? "4px 10px" : "6px 14px", fontSize: small ? 10 : 11, color: ok ? "#4ade80" : "rgba(255,255,255,.7)", cursor: "pointer", transition: "all .2s"}}>
      {ok ? "✓ СКОПИРОВАНО" : label}
    </button>
  );
}

export default function Page() {
  const [tokens, setTokens] = useState(3);
  const [showPaywall, setShowPaywall] = useState(false);

  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [genre, setGenre] = useState("ТАЙНА");
  const [dur, setDur] = useState("До 60 сек");
  const [vidFormat, setVidFormat] = useState("9:16");
  const [engine, setEngine] = useState("CINEMATIC");
  const [lang, setLang] = useState("RU"); 
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ttsData, setTtsData] = useState("");

  const [view, setView] = useState("form");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [tab, setTab] = useState("storyboard");
  
  const [frames, setFrames] = useState([]);
  const [bRolls, setBRolls] = useState([]);
  const [retention, setRetention] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [music, setMusic] = useState("");
  const [seo, setSeo] = useState(null);
  const [rawPrompts, setRawPrompts] = useState("");
  const [busy, setBusy] = useState(false);

  const [bgImage, setBgImage] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [covTitle, setCovTitle] = useState("");
  const [covHook, setCovHook] = useState("");
  const [covCta, setCovCta] = useState("");
  const [covDark, setCovDark] = useState(50);
  const [covX, setCovX] = useState(50);
  const [covY, setCovY] = useState(50);
  const [activePreset, setActivePreset] = useState("netflix");

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { 
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ds_history"); 
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setHistory(parsed);
        }
      } catch(e) {
        localStorage.removeItem("ds_history");
      }
    }
  }, []);

  const deleteFromHistory = (id) => {
    setHistory(prev => {
      const next = prev.filter(item => item && item.id !== id);
      localStorage.setItem("ds_history", JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    if(confirm("Вы уверены, что хотите удалить весь архив проектов?")) {
      setHistory([]);
      localStorage.removeItem("ds_history");
    }
  };

  function applyResult(rawText, fromHistory = false) {
    let cleanText = rawText.replace(/```json|```/gi, "").trim();
    const startIdx = cleanText.indexOf('{');
    if (startIdx !== -1) cleanText = cleanText.substring(startIdx);

    let data = {};
    try { 
      data = JSON.parse(cleanText); 
    } catch (e) {
      alert("Ошибка генерации. Нейросеть выдала неверный формат. Попробуйте еще раз."); 
      setView("form");
      return;
    }
    
    // БЕЗОПАСНОЕ извлечение данных (чтобы не ломать map)
    const safeFrames = Array.isArray(data.frames) ? data.frames : [];
    const safeBRolls = Array.isArray(data.b_rolls) ? data.b_rolls : [];
    
    setFrames(safeFrames); 
    setBRolls(safeBRolls);
    setRetention(data.retention || null);
    setThumb(data.thumbnail || null); 
    setMusic(data.music_EN || ""); 
    setSeo(data.seo || null);
    
    if (data.thumbnail) { 
      setCovTitle(data.thumbnail?.title || ""); 
      setCovHook(data.thumbnail?.hook || ""); 
      setCovCta(data.thumbnail?.cta || "СМОТРЕТЬ"); 
    }
    
    let anchorStr = data.global_anchor_EN ? `[GLOBAL ANCHOR: ${data.global_anchor_EN}] ` : "";
    let rScript = "🎬 СЦЕНАРИЙ:\n" + safeFrames.map((f, i) => `КАДР ${i+1} [${f?.timecode || ''}]\n👁 Визуал: ${f?.visual || ''}\n🎙 Диктор: «${f?.voice || ''}»`).join("\n\n");
    let imgList = "\n\n🖼 ЧИСТЫЕ IMAGE PROMPTS (Veo/Whisk):\n\n" + safeFrames.map(f => f?.imgPrompt_EN ? anchorStr + f.imgPrompt_EN : "").filter(Boolean).join("\n\n");
    let vidList = "\n\n🎥 ЧИСТЫЕ VIDEO PROMPTS (Grok Super):\n\n" + safeFrames.map(f => f?.vidPrompt_EN ? anchorStr + f.vidPrompt_EN : "").filter(Boolean).join("\n\n");
    let bRollList = safeBRolls.length ? "\n\n⚡ FLASH B-ROLLS:\n\n" + safeBRolls.map(b => anchorStr + b).join("\n\n") : "";
    
    setRawPrompts(rScript + imgList + vidList + bRollList); 
    setBgImage(null); setTab("storyboard"); setView("result");

    if (!fromHistory) {
      const tName = topic ? (topic.length > 30 ? topic.substring(0,30)+"..." : topic) : "Генерация ИИ";
      const newItem = { id: Date.now(), topic: tName, time: new Date().toLocaleString("ru-RU", {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}), text: cleanText, format: vidFormat };
      setHistory(prev => { 
        const next = [newItem, ...(prev || [])].slice(0, 10); 
        localStorage.setItem("ds_history", JSON.stringify(next)); 
        return next; 
      });
    }
  }

  async function handleDraftText(type) {
    if (!topic.trim() && type === 'draft') return alert("Введите тему или идею!");
    if (!script.trim() && type === 'intonations') return alert("Сначала добавьте текст для обработки!");
    setBusy(true); setLoadingMsg(type === 'draft' ? "Пишем черновик (Opus)..." : "Разметка интонаций...");
    try {
      const sysTxt = type === 'draft' ? `You are 'Director-X'. Напиши ТОЛЬКО текст диктора. Мрачный стиль. Без разметки. Язык: ${lang==="RU" ? "Русский" : "English"}` : `You are an Audio Director. Расставь паузы (...) и выдели КАПСОМ слова для акцента. Верни только текст. Язык: ${lang==="RU" ? "Русский" : "English"}`;
      const content = type === 'draft' ? `Тема: ${topic}\nЖанр: ${genre}\nДлительность: ${dur}\nНапиши чистый текст диктора.` : `Расставь интонации для диктора:\n\n${script}`;
      const text = await callAPI(content, 3000, sysTxt);
      setScript(text.trim());
    } catch(e) { alert("Ошибка: " + e.message); } finally { setBusy(false); }
  }

  async function handleTTS() {
    if (!script.trim()) return alert("Сначала добавьте текст!");
    setBusy(true); setLoadingMsg("Подбор настроек голоса...");
    try {
      const text = await callAPI(`Genre: ${genre}. Script: "${script.substring(0,100)}..."\nProvide TTS settings for Google AI Studio:\nVOICE: [Name]\nSPEED: [Value]\nSTYLE PROMPT: [English instruction]`, 1000, "Output strictly in English, 3 lines.");
      setTtsData(text.trim());
    } catch(e) { alert("Ошибка: " + e.message); } finally { setBusy(false); }
  }

  async function handleGenerateFullPlan() {
    if (!topic.trim() && !script.trim()) return alert("Заполните идею или готовый текст!");
    if (!checkTokens()) return;
    setBusy(true); setView("loading");
    try {
      let currentScript = script.trim();
      if (!currentScript) {
        setLoadingMsg("Создаем черновик текста...");
        currentScript = await callAPI(`Тема: ${topic}\nЖанр: ${genre}\nДлительность: ${dur}\nЯзык: ${lang==="RU" ? "Русский" : "English"}\nНапиши текст.`, 3000, `You are 'Director-X'. Напиши ТОЛЬКО текст.`);
        setScript(currentScript.trim());
      }
      setLoadingMsg("Режиссура, Якоря и Студия Обложек (8K Quality)...");
      const durCfg = DURATION_CONFIG[dur] || DURATION_CONFIG["До 60 сек"];
      const currFormat = FORMATS.find(f=>f.id === vidFormat) || FORMATS[0];
      const engineStyle = VISUAL_ENGINES[engine].prompt;
      const req = `ВЫДАЙ СТРОГО В JSON! РОВНО ${durCfg.frames} КАДРОВ. СТРОГО 3 СЕКУНДЫ НА СЦЕНУ.`;
      const text = await callAPI(`ТЕМА: ${topic}\nФОРМАТ: ${currFormat.ratio}\nЖАНР: ${genre}\nСТИЛЬ РЕНДЕРА (VISUAL ENGINE): ${engineStyle}\nЦЕЛЕВОЙ ЯЗЫК: ${lang==="RU" ? "Русский" : "English"}\nСЦЕНАРИЙ:\n${currentScript}\n\n${req}`, 8000, VIRAL_SYSTEM);
      setTokens(prev => prev - 1);
      applyResult(text, false);
    } catch(e) { alert("Ошибка генерации: " + e.message); setView("form"); } finally { setBusy(false); setLoadingMsg(""); }
  }

  function handleImageUpload(e) {
    const file = e.target.files[0]; 
    if (!file) return;
    const reader = new FileReader(); 
    reader.onload = (ev) => setBgImage(ev.target.result); 
    reader.readAsDataURL(file);
  }

  async function downloadThumbnail() {
    const el = document.getElementById("cover-export"); 
    if (!el) return;
    setDownloading(true);
    if (!window.html2canvas) {
      const scriptElement = document.createElement("script"); 
      scriptElement.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      scriptElement.onload = doCapture; 
      document.body.appendChild(scriptElement);
    } else { doCapture(); }
    function doCapture() {
      window.html2canvas(el, { useCORS: true, scale: 3, backgroundColor: null }).then(canvas => {
        const link = document.createElement('a'); link.download = `DocuCover_${Date.now()}.png`; link.href = canvas.toDataURL('image/png'); link.click(); setDownloading(false);
      }).catch(() => { setDownloading(false); alert("Ошибка рендера обложки"); });
    }
  }

  const S = {
    root: { minHeight:"100vh", color:"#e2e8f0", fontFamily:"'SF Pro Display', -apple-system, sans-serif", paddingBottom:120, overflowY:"auto", position:"relative", zIndex:1 },
    nav: { position:"sticky", top:0, zIndex:50, background:"rgba(5,5,10,.5)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderBottom:"1px solid rgba(255,255,255,.05)", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px" },
    section: { marginBottom:24, background:"rgba(15,15,25,.4)", border:"1px solid rgba(255,255,255,.08)", borderRadius:24, padding:24, backdropFilter:"blur(20px)", boxShadow:"0 10px 40px rgba(0,0,0,0.4)" },
    label: { fontSize:11, fontWeight:800, letterSpacing:2, color:"#94a3b8", display:"block", marginBottom:12, textTransform:"uppercase" }
  };

  const currFormat = FORMATS.find(f=>f.id === vidFormat) || FORMATS[0];
  const activeStyle = COVER_PRESETS.find(p => p.id === activePreset).style;

  return (
    <div style={S.root}>
      <NeuralBackground />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes blink { 0%, 100% {opacity:1} 50% {opacity:0.3} }
        @keyframes spin {to{transform:rotate(360deg)}}
        .gbtn{width:100%;height:56px;border:none;border-radius:16px;cursor:pointer;font-family:inherit;font-size:15px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#4f46e5,#9333ea,#ec4899);transition:all .2s; box-shadow: 0 4px 20px rgba(168,85,247,0.4);}
        .gbtn:hover{transform:translateY(-2px);filter:brightness(1.1); box-shadow: 0 6px 30px rgba(168,85,247,0.6);}
        .gbtn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none;}
        textarea:focus, input:focus {outline:none;border-color:rgba(168,85,247,.6)!important;background:rgba(0,0,0,.6)!important;}
        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #a855f7; cursor: pointer; margin-top: -6px; box-shadow: 0 0 10px #a855f7; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
