// app/api/chat/route.js

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = body.topic || "AI видео";

    const key = process.env.OPENROUTER_API_KEY;

    if (!key) {
      // 🔥 fallback если нет ключа
      return json({
        hooks: [
          "Ты теряешь деньги на AI",
          "3 способа заработать на AI",
          "Почему твои видео не заходят",
          "AI меняет всё уже сейчас",
          "Вот как делать вирусные видео"
        ],
        selected_hook: "3 способа заработать на AI",
        frames: [
          {
            time: "0-3",
            visual: "man shocked looking at screen",
            image_prompt: "close-up man, shocked, dark room, screen glow",
            video_prompt: "slow zoom, subtle movement",
            vo: "3 способа заработать на AI",
            sfx: "whoosh"
          }
        ]
      });
    }

    const system = `
Output ONLY JSON.

Short prompts only.

Return:
{
  "hooks": [],
  "selected_hook": "",
  "frames": [
    {
      "time": "",
      "visual": "",
      "image_prompt": "",
      "video_prompt": "",
      "vo": "",
      "sfx": ""
    }
  ]
}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${key}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-6",
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: "Topic: " + topic }
        ]
      })
    });

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      // 🔥 fallback если модель дала мусор
      parsed = {
        hooks: ["Ошибка генерации, но система работает"],
        selected_hook: "Ошибка генерации",
        frames: []
      };
    }

    return json(parsed);

  } catch (e) {
    return json({
      hooks: ["Сервер ошибка"],
      selected_hook: "Ошибка",
      frames: []
    });
  }
}
