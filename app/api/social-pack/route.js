// app/api/social-pack/route.js
// NeuroCine Social Pack — Facebook + Reels caption + Instagram карусель + Stories тизеры.

import { callOpenRouter, TASK_TYPES } from "../../../lib/modelRouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYS = (genre) => `Ты — elite SMM-копирайтер для Facebook и Instagram. Пиши ТОЛЬКО на русском. Output ONLY valid JSON (no markdown).
ЖАНР: ${genre}.

ПРАВИЛА FB:
— Первая строка = стоп-скроллер.
— Абзацы 2-3 предложения через \\n\\n.
— Факты с цифрами и физикой.
— Финал = вопрос раскалывающий аудиторию.
— 5-7 хештегов тематики.
— БАН: "невероятно", "удивительно", "мало кто знает".

REELS CAPTION:
— Макс 3 строки до "ещё".
— Строка 1: цифра+шок (5-7 слов).
— Строка 2: КАК это произошло.
— Строка 3: незакрытая интрига.
— 3-5 хештегов.

CAROUSEL 5 СЛАЙДОВ:
1 — ОБЛОЖКА (bg #0d0010): КАПСЛОК. 1-2 строки.
2 — КОНТЕКСТ (#0a0500): физика, числа.
3 — ПОВОРОТ (#000a06): неожиданный факт.
4 — ПИК (#0a000a): шокирующий момент.
5 — CTA (#00060d): смотри видео + вопрос.

STORIES 3:
1 — УДАР (#0d0010): 7 слов max, КАПСЛОК.
2 — ИНТРИГА (#0a0500): риторический вопрос.
3 — ПРИЗЫВ (#00060d): CTA.

JSON:
{
  "post_hook": "Первая строка",
  "post_body": "Тело через \\n\\n",
  "post_question": "Финальный вопрос",
  "post_tags": "#тег1 #тег2 #тег3 #тег4 #тег5",
  "reels_caption": "3 строки + \\n\\n + хештеги",
  "carousel": [
    { "emoji":"🎬","headline":"ЗАГ","sub":"подзаг","bg":"#0d0010" },
    { "emoji":"📊","headline":"КОНТЕКСТ","sub":"...","bg":"#0a0500" },
    { "emoji":"⚡","headline":"ПОВОРОТ","sub":"...","bg":"#000a06" },
    { "emoji":"🔥","headline":"ПИК","sub":"...","bg":"#0a000a" },
    { "emoji":"👁","headline":"СМОТРИ","sub":"...","bg":"#00060d" }
  ],
  "slides": [
    { "emoji":"💥","headline":"УДАР","sub":"...","bg":"#0d0010" },
    { "emoji":"❓","headline":"ИНТРИГА","sub":"...","bg":"#0a0500" },
    { "emoji":"🎯","headline":"ПРИЗЫВ","sub":"...","bg":"#00060d" }
  ]
}`;

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    const script = String(body.script || "").trim();
    const genre = String(body.genre || "ИСТОРИЯ").trim();
    if (!script || script.length < 30) return Response.json({ error: "Нужен сценарий минимум 30 символов" }, { status: 400 });

    const userMsg = `Тема: ${topic}\nСценарий:\n${script}\n\nСгенерируй полный пакет: FB + Reels + Carousel + Stories.`;

    const r = await callOpenRouter({
      taskType: TASK_TYPES.SCRIPT_WRITING,
      systemPrompt: SYS(genre),
      userMessage: userMsg,
      maxTokensOverride: 4000,
      responseFormat: { type: "json_object" },
      appTitle: "NeuroCine Social Pack v1",
    });
    if (!r.ok) return Response.json({ error: r.error }, { status: 500 });

    let parsed;
    try {
      const c = String(r.content || "").trim().replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
      parsed = JSON.parse(c);
    } catch (e) { return Response.json({ error: "Невалидный JSON: " + e.message, raw: r.content?.slice(0,500) }, { status: 500 }); }

    return Response.json({ social: parsed, model_used: r.model_used });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
