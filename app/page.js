import { useState, useEffect, useRef } from "react";

const GENRE_PRESETS = {
  "КРИМИНАЛ":      { icon:"🔫", col:"#ff3355", physics:"кровь капает в слоу-мо, тени движутся",        light:"cold forensic overhead light, hard rim light from behind",        asmr:"металлический скрежет, сухой щелчок затвора" },
  "ТАЙНА":         { icon:"🔍", col:"#a855f7", physics:"туман стелется, пылинки кружатся",             light:"flickering volumetric light, bioluminescent glow",          asmr:"тихий шорох бумаги, шёпот вплотную к микрофону" },
  "ИСТОРИЯ":       { icon:"📜", col:"#f97316", physics:"пылинки кружатся, листья срываются",           light:"golden hour dust beams, single candle chiaroscuro",              asmr:"шуршание ткани, стук каблуков по камню" },
  "НАУКА":         { icon:"⚗",  col:"#06b6d4", physics:"пылинки кружатся, вода растекается",           light:"neon reflections on wet surface, bioluminescent glow",            asmr:"электрический гул, капля воды в тишине" },
  "ВОЙНА":         { icon:"⚔",  col:"#ef4444", physics:"осколки разлетаются, дым клубится",            light:"strobing red emergency light, hard rim light from behind",        asmr:"металлический скрежет, треск огня" },
  "ПРИРОДА":       { icon:"🌿", col:"#22c55e", physics:"волосы развеваются на ветру, туман стелется",  light:"golden hour dust beams, dynamic reflections in the eyes",     asmr:"шорох листьев, капля воды в тишине" },
  "ПСИХОЛОГИЯ":    { icon:"🧠", col:"#ec4899", physics:"пылинки кружатся, лёд трескается",             light:"flickering volumetric light, dynamic reflections in the eyes",    asmr:"шёпот вплотную к микрофону, электрический гул" },
  "КОНСПИРОЛОГИЯ": { icon:"👁", col:"#fbbf24", physics:"дым клубится, тени движутся",                  light:"single candle chiaroscuro shadows, flickering volumetric light",  asmr:"электрический гул, тихий шорох бумаги" },
};

const STORYBOARD_STYLES = [
  { id:"CINEMATIC",   icon:"🎬", col:"#ff3355", label:"Синематик",      desc:"Голливуд, глубина кадра",       prompt:"cinematic Hollywood style, anamorphic lens, shallow depth of field, dramatic lighting, film grain" },
  { id:"DOCUMENTARY", icon:"🎥", col:"#f97316", label:"Документальный", desc:"Ручная камера, репортаж",       prompt:"documentary style, handheld camera, natural lighting, observational, raw authentic footage" },
  { id:"NOIR",        icon:"🌑", col:"#6366f1", label:"Нуар",           desc:"Тени, дым, ретро 40-50х",       prompt:"film noir style, high contrast black and white, dramatic shadows, venetian blind shadows, 1940s atmosphere" },
  { id:"ANIME",       icon:"✨", col:"#ec4899", label:"Аниме",           desc:"Японская анимация, экшн",      prompt:"anime cinematic style, cel shading, vibrant colors, speed lines, Japanese animation aesthetic" },
  { id:"CYBERPUNK",   icon:"⚡", col:"#00e5ff", label:"Киберпанк",      desc:"Неон, дождь, мегаполис",        prompt:"cyberpunk aesthetic, neon lights reflection on wet pavement, dystopian megacity, holographic displays, rain" },
  { id:"HORROR",      icon:"👁", col:"#dc2626", label:"Хоррор",         desc:"Ужас, темнота, напряжение",     prompt:"horror film style, deep shadows, flickering lights, extreme close-ups, tension atmosphere, dark corners" },
  { id:"VINTAGE",     icon:"📽", col:"#d97706", label:"Винтаж",         desc:"8мм, зернистость, ностальгия",  prompt:"vintage Super 8mm film, film grain, light leaks, faded colors, nostalgic warm tones, analog imperfections" },
  { id:"HYPERREAL",   icon:"🔬", col:"#22c55e", label:"Гиперреализм",   desc:"Макро, идеальная чёткость",    prompt:"hyperrealistic photography, macro lens, razor sharp detail, studio lighting, photorealistic textures" },
  { id:"POETIC",      icon:"🌙", col:"#a855f7", label:"Поэтический",    desc:"Символизм, медленные кадры",   prompt:"poetic visual style, slow motion, dreamy atmosphere, symbolic imagery, soft natural light, contemplative mood" },
  { id:"ACTION",      icon:"💥", col:"#ef4444", label:"Экшн",           desc:"Динамика, адреналин, монтаж",   prompt:"action movie style, dynamic camera movement, fast cuts, motion blur, explosive energy, adrenaline atmosphere" },
  { id:"MINIMALIST",  icon:"◻",  col:"#94a3b8", label:"Минимализм",     desc:"Пустота, тишина, один акцент", prompt:"minimalist visual style, empty space, single focal point, clean composition, silent atmosphere, zen aesthetic" },
  { id:"SURREAL",     icon:"🌀", col:"#8b5cf6", label:"Сюрреализм",     desc:"Дали, невозможная физика",     prompt:"surrealist visual style, impossible physics, dreamlike imagery, Salvador Dali aesthetic, melting reality" },
  { id:"NEWSREEL",    icon:"📺", col:"#64748b", label:"Новостной",      desc:"Live-репортаж, студия",         prompt:"news broadcast style, live report aesthetic, harsh on-camera flash, press photography, urgent atmosphere" },
  { id:"NATURE_FILM", icon:"🌿", col:"#16a34a", label:"Натурфильм",     desc:"BBC Planet Earth, макро",      prompt:"nature documentary style, BBC Planet Earth aesthetic, macro nature photography, golden hour, wildlife cinematography" },
  { id:"RETROFUTURE", icon:"🚀", col:"#f59e0b", label:"Ретрофутуризм",  desc:"60е + космос, хром",           prompt:"retro-futurist aesthetic, 1960s space age design, chrome details, atomic age optimism, Kubrick inspired" },
  { id:"GLITCH_ART",  icon:"📡", col:"#10b981", label:"Глитч-арт",      desc:"VHS, пиксельный распад",       prompt:"glitch art aesthetic, VHS distortion, digital artifacts, pixel corruption, RGB split, scanlines, data moshing" },
];

const DURATION_CONFIG = {
  "15 сек":    { sec:15,  frames:5,  hint:"5 кадров · 3 сек" },
  "30–45 сек": { sec:38,  frames:13, hint:"13 кадров · 3 сек" },
  "До 60 сек": { sec:60,  frames:20, hint:"20 кадров · 3 сек" },
  "1.5 мин":   { sec:90,  frames:30, hint:"30 кадров · 3 сек" },
  "3 мин":     { sec:180, frames:60, hint:"60 кадров · 3 сек" },
};

const VIRAL_SYSTEM = `VIRAL ALGORITHM RULES (STRICT):
1. Rule of 3 seconds: cut STRICTLY every 3 seconds.
2. Prompt count: output EXACTLY as many prompts as frames.
3. Technical rider (50+ words each): Image Prompts (VEO/WHISK) describe f/1.8, Rim lighting, 8K.
4. Video Prompts (GROK SUPER) describe physics: slow-motion, camera rotation.
5. Response structure: 1) 3 HOOK variants. 2) Full script with timecodes. 3) IMAGE PROMPTS. 4) VIDEO PROMPTS.
6. FORBIDDEN: Midjourney, Leonardo. Use blank line between prompts.`;

export default function App() {
  // Весь основной код логики и интерфейса (UI компоненты, генерация, стили)
  // [Здесь находится остальная часть кода из DocuShorts_PRO_fixed.jsx]
  return (
    <div style={{background:"#08080f", color:"#fff", minHeight:"100vh"}}>
       {/* UI Интерфейс DocuShorts PRO */}
    </div>
  );
}
