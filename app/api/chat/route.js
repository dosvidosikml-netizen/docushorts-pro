// @ts-nocheck
/* eslint-disable */

// ЭТА СТРОКА ОТКЛЮЧАЕТ ЛИМИТ 10 СЕКУНД В VERCEL
export const runtime = 'edge'; 

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // СТРОГО УМНАЯ МОДЕЛЬ
        messages: body.messages,
        max_tokens: body.max_tokens || 6000 // ВЕРНУЛИ БОЛЬШОЙ ЛИМИТ ДЛЯ ДЛИННЫХ ПРОМПТОВ
      })
    });

    const textResponse = await response.text();

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Сбой связи с Groq. Ответ: " + textResponse.substring(0, 100) }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || "Запрос заблокирован цензурой или лимитами Groq.";
      return new Response(JSON.stringify({ error: errorMsg }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" }
      });
    }

    const text = data.choices[0].message.content;

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Внутренний сбой сервера: " + error.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
