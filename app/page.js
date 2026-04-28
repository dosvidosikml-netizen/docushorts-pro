import Link from "next/link";

export default function HomePage() {
  return (
    <div className="landing">
      <div className="landing-inner">

        <div className="landing-hero">
          <div className="hero-kicker">NeuroCine Director Studio</div>
          <h1 className="hero-title">Production<br/>Pipeline</h1>
          <p className="hero-sub">
            Полный AI пайплайн от темы до видео: сценарий, storyboard,
            кадры, вариации, 2K промты, видео промты.
          </p>
          <div className="hero-flow">
            <strong>Тема</strong><span>→</span>
            <strong>Сценарий</strong><span>→</span>
            <strong>Storyboard</strong><span>→</span>
            <strong>Сетка кадров</strong><span>→</span>
            <strong>4 варианта</strong><span>→</span>
            <strong>2K Prompt</strong><span>→</span>
            <strong>Video Prompt</strong>
          </div>
          <div className="hero-btns">
            <Link href="/storyboard" className="btn btn-red" style={{ padding: "14px 28px", fontSize: 15, borderRadius: 14 }}>
              ▶ Открыть Studio
            </Link>
            <Link href="/chat" className="btn" style={{ padding: "14px 28px", fontSize: 15, borderRadius: 14 }}>
              Chat Generator
            </Link>
          </div>
        </div>

        <div className="landing-grid">
          <div className="landing-card">
            <h3>🎬 Сценарий + JSON</h3>
            <p>Введи тему, выбери жанр, стиль, формат и длину. Получи готовый текст диктора и JSON для пайплайна.</p>
          </div>
          <div className="landing-card">
            <h3>🎞 Storyboard</h3>
            <p>Разбивка на кадры с image prompts, video prompts, VO, SFX и continuity notes. Промт для генерации всей сетки.</p>
          </div>
          <div className="landing-card">
            <h3>🖼 Production Pipeline</h3>
            <p>Загружай сетку кадров, выбирай кадр, получай 4 варианта ракурсов, 2K image prompt и video prompt покадрово.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
