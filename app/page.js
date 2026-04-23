"use client";

import React, { useState } from "react";

export default function Page() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error");

      setResult(data);
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
  }

  return (
    <main style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1>NeuroCine Generator</h1>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Введи тему..."
        style={{
          width: "100%",
          padding: 12,
          marginTop: 10,
          borderRadius: 6,
          border: "1px solid #333",
        }}
      />

      <button
        onClick={generate}
        disabled={loading}
        style={{
          marginTop: 10,
          padding: 12,
          width: "100%",
          background: "#fff",
          color: "#000",
          borderRadius: 6,
          fontWeight: "bold",
        }}
      >
        {loading ? "..." : "Сгенерировать"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Хуки</h3>
          <ul>
            {result.hooks?.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>

          <h3>Кадры</h3>
          {result.frames?.map((f, i) => (
            <div key={i} style={{ marginTop: 10 }}>
              <strong>{f.time}</strong>
              <p>{f.visual}</p>
              <p>{f.image_prompt}</p>
              <p>{f.video_prompt}</p>
              <p>{f.vo}</p>
              <p>{f.sfx}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
