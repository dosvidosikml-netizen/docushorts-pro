"use client";

import { useState } from "react";
import { SYS_SCENE_ENGINE, buildSceneUserPrompt } from "@/engine/sceneEngine";

export default function Page() {
  const [input, setInput] = useState("");
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(false);

  async function callAPI(content, system) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: system },
          { role: "user", content }
        ]
      })
    });

    const data = await res.json();
    return data?.result || "";
  }

  function cleanJSON(str) {
    try {
      return JSON.parse(str);
    } catch {
      const match = str.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      return {};
    }
  }

  async function generateScenes() {
    try {
      setLoading(true);

      const prompt = buildSceneUserPrompt({
        script: input,
        mode: "shorts",
        total: 60,
        characters: []
      });

      const raw = await callAPI(prompt, SYS_SCENE_ENGINE);
      const data = cleanJSON(raw);

      setScenes(data.scenes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🎬 NeuroCine V2</h1>

      <textarea
        placeholder="Вставь сценарий..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "100%",
          height: 120,
          marginBottom: 10
        }}
      />

      <button onClick={generateScenes}>
        {loading ? "Генерация..." : "🚀 Сгенерировать сцены"}
      </button>

      <div style={{ marginTop: 20 }}>
        {scenes.map((scene, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #333",
              padding: 10,
              marginBottom: 10
            }}
          >
            <b>{scene.id}</b> ({scene.start}s - {scene.end}s)
            <p><b>🎯</b> {scene.scene_goal}</p>
            <p><b>🎙</b> {scene.voice}</p>
            <p><b>👁</b> {scene.visual}</p>
            <p><b>🎥</b> {scene.camera}</p>
            <p><b>⚡</b> {scene.motion}</p>
            <p><b>💡</b> {scene.lighting}</p>
            <p><b>🌍</b> {scene.environment}</p>
            <p><b>🔊</b> {scene.sfx}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
