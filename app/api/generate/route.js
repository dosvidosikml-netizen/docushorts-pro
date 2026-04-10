export async function POST(req) {
  try {
    const body = await req.json();

    const systemPrompt = `### **SYSTEM ROLE & VIRAL ALGORITHMS (STRICT ADHERENCE REQUIRED)**

**1. ВИЗУАЛЬНЫЙ РИТМ И МАТЕМАТИКА:**
 * **ПРАВИЛО 3 СЕКУНД:** Смена кадра СТРОГО каждые 3 секунды.
 * **КОЛИЧЕСТВО ПРОМПТОВ:** Ты ОБЯЗАН выдать количество промптов, соответствующее длительности. 
   - Если 30 сек — 10 Image и 10 Video промптов.
   - Если 60 сек — 20 Image и 20 Video промптов.
   - Если 90 сек — 30 Image и 30 Video промптов.
 * **ЗАПРЕЩЕНО:** Выдавать меньше промптов, чем требует тайминг. Каждый кадр сценария должен иметь свой пронумерованный промпт.

**2. ТЕХНИЧЕСКИЙ РАЙДЕР (ДЕТАЛИЗАЦИЯ 50+ СЛОВ):**
 * **Image Prompts (Veo/Whisk):** Описывай как для фотографа. Глубина резкости (f/1.8), свет (Rim lighting), частицы пыли, пот, текстура ржавого железа, 8k, cinematic.
 * **Video Prompts (Grok Super):** Описывай физику. "Камера медленно пролетает сквозь...", "Брызги воды разлетаются под углом...", "Объект вращается в замедленной съемке (slow-motion)".
 * **СТИЛЬ:** Мрачный, гиперреалистичный, вызывающий тревогу и любопытство.

**3. СТРУКТУРА ВЫДАЧИ:**
 1. **3 Варианта мощного HOOK.**
 2. **Полный сценарий** (Таймкоды каждые 3 сек | Текст | Описание).
 3. **СПИСОК IMAGE PROMPTS (VEO/WHISK):** Полный перечень под каждый кадр (1, 2, 3...).
 4. **СПИСОК VIDEO PROMPTS (GROK SUPER):** Полный перечень под каждый кадр (1, 2, 3...).

**ЗАПРЕТЫ:** Никаких Midjourney/Leonardo. Никаких коротких описаний. Между промптами — пустая строка.`;

    const userPrompt = `ТЕМА: ${body.topic}. КОНТЕКСТ: ${body.context}. ЖАНР: ${body.genre}. ДЛИТЕЛЬНОСТЬ: ${body.duration}. ПЛАТФОРМА: ${body.platform}. Генерируй сценарий и ПОЛНЫЙ набор промптов для каждого 3-секундного отрезка.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 4000 
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Ошибка API Groq");

    return new Response(JSON.stringify({ text: data.choices[0].message.content }), { 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
