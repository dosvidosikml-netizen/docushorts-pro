export async function POST(req) {
  try {
    const body = await req.json();

    const systemPrompt = `### **SYSTEM ROLE & VIRAL ALGORITHMS (STRICT ADHERENCE REQUIRED)**

**1. ВИЗУАЛЬНЫЙ РИТМ (RETENTION ENGINE):**
 * **ПРАВИЛО 3 СЕКУНД:** Смена визуала СТРОГО каждые 3 секунды. Каждый кадр должен быть динамичным. Использовать: медленный наезд (slow zoom in), отъезд, панорамирование, смену ракурса.
 * **Принцип 40/60:** Главный объект занимает 40–60% кадра. Глубокий контраст между объектом и фоном.
 * **Динамический текст:** Ключевые слова диктора должны быть выделены как визуальные акценты в описании кадров.

**2. СТРУКТУРА СЦЕНАРИЯ (CONVERSION FUNNEL):**
 * **Мгновенный Hook (0–3 сек):** Визуальный шок или парадоксальное утверждение. Никакой воды.
 * **Curiosity Gap:** Финальный твист или разгадка — СТРОГО в последние 5 секунд.
 * **Seamless Loop:** Последнее слово сценария должно идеально переходить в первое слово Hook'а.

**3. ТЕХНИЧЕСКИЙ РАЙДЕР ГЕНЕРАЦИИ (STRICT RULES):**
 * **ДЕТАЛИЗАЦИЯ ПРОМПТОВ:** Запрещено писать коротко. Каждый промпт (Image/Video) должен содержать 40+ слов. Описывай: Cinematic lighting, Volumetric fog, 8k resolution, Hyper-realistic textures, ракурс камеры.
 * **Image Prompts:** Использовать ТОЛЬКО для Veo, Whisk. Формат: Высокохудожественное фотореалистичное описание.
 * **Video Prompts:** Использовать ТОЛЬКО для Grok Super. Формат: Описание физического движения, динамики частиц, освещения в динамике.
 * **ЗАПРЕТЫ:** КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО упоминать Midjourney и Leonardo.
 * **ОТСТУПЫ:** Между каждым промптом в списке ОБЯЗАТЕЛЬНО делать пустую строку (двойной перенос).

### **ПОРЯДОК ВЫДАЧИ ОТВЕТА:**
 1. **3 Варианта мощного HOOK** (Шок, Тайна, Опасность, Парадокс).
 2. **Полный сценарий:** Таймкоды (шаг строго 3 сек), текст диктора, детальное описание кадра, режиссерские пометки (SFX).
 3. **Список промптов (Clean List):** Сначала блок Image prompts (Veo/Whisk), затем блок Video prompts (Grok Super). Между каждым промптом пустая строка.`;

    const userPrompt = `ТЕМА: ${body.topic}. КОНТЕКСТ: ${body.context}. ЖАНР: ${body.genre}. ДЛИТЕЛЬНОСТЬ: ${body.duration}. ПЛАТФОРМА: ${body.platform}.`;

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
        temperature: 0.6
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Ошибка API Groq");
    }

    const text = data.choices[0].message.content;
    
    return new Response(JSON.stringify({ text }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}
