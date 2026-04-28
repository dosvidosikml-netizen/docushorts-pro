import Link from "next/link";
import TopNav from "../components/TopNav";

export default function HomePage() {
  return (
    <main className="page">
      <div className="wrap">
        <header className="header">
          <div className="brand">
            <div>
              <div className="kicker">NeuroCine Online</div>
              <h1>AI Production Studio</h1>
              <p className="subtitle">
                Полный пайплайн: сценарий → storyboard → кадры → IMAGE / VIDEO prompts → VO → SFX → JSON.
              </p>
            </div>
            <div className="actions">
              <Link className="btn" href="/chat">Открыть Chat</Link>
              <Link className="btn red" href="/storyboard">Storyboard Studio</Link>
            </div>
          </div>
          <TopNav active="home" />
        </header>

        <section className="grid two mt">
          <div className="card">
            <h2>Что внутри</h2>
            <div className="grid">
              <div className="drop">✅ /app/chat — генератор сценария и идей</div>
              <div className="drop">✅ /app/storyboard — полный покадровый production workflow</div>
              <div className="drop">✅ /app/api/storyboard — API под OpenRouter GPT-5.4 / Claude Sonnet 4.5</div>
              <div className="drop">✅ engine fallback — работает даже без API ключа</div>
            </div>
          </div>

          <div className="card">
            <h2>Быстрый старт</h2>
            <pre>{`npm install
cp .env.local.example .env.local
npm run dev

http://localhost:3000`}</pre>
          </div>
        </section>
      </div>
    </main>
  );
}
