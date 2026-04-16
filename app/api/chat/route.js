// Даем серверу 60 секунд на ответ (Фикс для Vercel Timeout)
export const maxDuration = 60;

export async function POST(req) {
  try {
    const body = await req.json();

    const messages = body.messages || [];
    const maxTokens = body.max_tokens || 4000;

    // Стучимся в OpenRouter, так как ключ для него есть в твоем Vercel
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://docushorts.vercel.app", // Обязательный заголовок для OpenRouter
        "X-Title": "DocuShorts Pro", // Обязательный заголовок для OpenRouter
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Можешь поменять модель на ту, которую предпочитаешь в OpenRouter
        model: "meta-llama/llama-3-70b-instruct", 
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.2 // Низкая температура для строгого JSON
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Ошибка API OpenRouter");
    }

    // Извлекаем ответ из стандартной структуры OpenRouter
    const text = data.choices[0].message.content;
    
    return new Response(JSON.stringify({ text }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Внутренняя ошибка сервера" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}
