export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fallbackScript({ topic, duration }) {
  return `Ты бы не поверил, но ${topic || "эта история"} начинается с одной детали.

Сначала кажется, что это обычный факт.
Но через несколько секунд становится понятно: за ним скрыта настоящая тьма.

Люди жили в условиях, где ошибка стоила жизни.
Грязь, страх, болезни и власть работали против человека каждый день.

Самое страшное было не в одном событии.
Самое страшное — это было нормой.

И теперь вопрос:
ты бы выдержал это хотя бы одну неделю?`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    const tone = String(body.tone || "cinematic documentary thriller").trim();
    const duration = Number(body.duration || 60);

    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json({ text: fallbackScript({ topic, duration }) });
    }

    const model = process.env.OPENROUTER_MODEL || "openai/gpt-5.4";

    const prompt = `
Напиши вирусный сценарий на русском для Shorts/Reels/TikTok.
Длительность: ${duration} секунд.
Тема: ${topic}
Тон: ${tone}

Требования:
- первые 2 секунды — сильный hook;
- короткие фразы;
- без субтитров в тексте;
- финал с вопросом для комментариев;
- только текст диктора, без markdown.
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
          { role: "system", content: "Ты профессиональный сценарист коротких вирусных исторических видео. Отвечай только готовым текстом диктора." },
          { role: "user", content: prompt }
        ],
        temperature: 0.45,
        max_tokens: 1600
      })
    });

    const raw = await response.text();
    const data = JSON.parse(raw);
    const text = data.choices?.[0]?.message?.content || fallbackScript({ topic, duration });
    return Response.json({ text });
  } catch (e) {
    return Response.json({ text: fallbackScript({ topic: "", duration: 60 }), warning: e.message });
  }
}
