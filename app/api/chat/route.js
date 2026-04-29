export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fallbackScript({ topic, duration }) {
  return `Ты бы не поверил, но ${topic || "эта история"} начинается с одной детали.\n\nСначала кажется, что это обычный факт.\nНо через несколько секунд становится понятно: за ним скрыта настоящая тьма.\n\nЛюди жили в условиях, где ошибка стоила жизни.\nГрязь, страх, болезни и власть работали против человека каждый день.\n\nСамое страшное было не в одном событии.\nСамое страшное — это было нормой.\n\nИ теперь вопрос:\nты бы выдержал это хотя бы одну неделю?`;
}

const SYSTEM_PROMPT = `
Ты профессиональный сценарист коротких вирусных видео для YouTube Shorts, Reels, TikTok.
Пиши только готовый текст диктора — без заголовков, без markdown, без объяснений.

СТРУКТУРА АКТА (обязательная):

ACT 1 — HOOK (первые 3–5 сек):
- Один сильный факт или вопрос который ломает ожидания
- Зритель должен остановить скролл
- Формула: "Ты не знал что..." / "В [год] произошло..." / "Представь: ..."

ACT 2 — BUILD (основная часть):
- Нарастание через конкретные детали и факты
- Каждое предложение — отдельная мысль
- Ритм: короткое → длиннее → короткое → длиннее
- Каждые 2–3 предложения — смена угла или новый факт
- Никаких абстракций — только конкретика

ACT 3 — CLIMAX (пик):
- Самый неожиданный или шокирующий факт
- Эмоциональный пик всего ролика

ACT 4 — OUTRO + ВОПРОС (последние 3–5 сек):
- Одна финальная мысль которая переворачивает всё
- Вопрос для комментариев — открытый, провокационный

ТЕХНИЧЕСКИЕ ПРАВИЛА:
- Только внешний диктор, никаких диалогов персонажей
- Короткие фразы, максимум 12–15 слов в предложении
- Без субтитров и UI в тексте
- Темп: ~2–2.5 слова в секунду (60 сек ≈ 130–150 слов)
- Тон должен быть документальным но захватывающим
`;

export async function POST(req) {
  try {
    const body     = await req.json();
    const topic    = String(body.topic || "").trim();
    const tone     = String(body.tone || "cinematic documentary thriller").trim();
    const duration = Number(body.duration || 60);

    const wordsTarget = Math.round(duration * 2.2);

    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({ text: fallbackScript({ topic, duration }) });
    }

    const model = process.env.OPENROUTER_MODEL || "openai/gpt-5.4";

    const userPrompt = `
Напиши вирусный сценарий на русском для Shorts/Reels/TikTok.

Тема: ${topic}
Тон: ${tone}
Длительность: ${duration} секунд
Целевой объём: ~${wordsTarget} слов

Соблюдай 4-актную структуру: Hook → Build → Climax → Outro+Вопрос.
Только текст диктора. Никаких заголовков актов в тексте.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://neurocine.online",
        "X-Title": "NeuroCine Studio",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.45,
        max_tokens: 2000
      })
    });

    const raw  = await response.text();
    const data = JSON.parse(raw);
    const text = data.choices?.[0]?.message?.content || fallbackScript({ topic, duration });
    return Response.json({ text });
  } catch (e) {
    return Response.json({ text: fallbackScript({ topic: "", duration: 60 }), warning: e.message });
  }
}
