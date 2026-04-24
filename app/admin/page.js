"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ds_billing";
const DEFAULT_CREDITS = 3;

function todayKey() {
  return new Date().toLocaleDateString();
}

function readCredits() {
  if (typeof window === "undefined") return { tokens: DEFAULT_CREDITS, date: todayKey() };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tokens: DEFAULT_CREDITS, date: todayKey() };
    const parsed = JSON.parse(raw);
    const tokens = Number.isFinite(Number(parsed?.tokens)) ? Number(parsed.tokens) : DEFAULT_CREDITS;
    return { tokens, date: parsed?.date || todayKey() };
  } catch {
    return { tokens: DEFAULT_CREDITS, date: todayKey() };
  }
}

function writeCredits(tokens) {
  const payload = { tokens: Math.max(0, Math.floor(Number(tokens) || 0)), date: todayKey() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: JSON.stringify(payload) }));
  return payload;
}

export default function AdminCreditsPage() {
  const [pin, setPin] = useState("");
  const [amount, setAmount] = useState(100);
  const [billing, setBilling] = useState({ tokens: DEFAULT_CREDITS, date: todayKey() });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setBilling(readCredits());
  }, []);

  const currentLabel = useMemo(() => `${billing.tokens} 💎`, [billing.tokens]);

  async function runAction(action) {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, amount, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Admin check failed");

      let nextTokens = billing.tokens;
      if (action === "set") nextTokens = data.amount;
      if (action === "add") nextTokens = billing.tokens + data.amount;
      if (action === "subtract") nextTokens = Math.max(0, billing.tokens - data.amount);
      if (action === "reset") nextTokens = DEFAULT_CREDITS;

      const nextBilling = writeCredits(nextTokens);
      setBilling(nextBilling);
      setUnlocked(true);
      setStatus(`Готово: баланс обновлён до ${nextBilling.tokens} 💎`);
    } catch (err) {
      setStatus(err?.message === "Forbidden" ? "Неверный PIN" : `Ошибка: ${err?.message || "не удалось обновить баланс"}`);
    } finally {
      setBusy(false);
    }
  }

  function refresh() {
    setBilling(readCredits());
    setStatus("Баланс перечитан из localStorage");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#070711", color: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif", padding: 24 }}>
      <section style={{ maxWidth: 760, margin: "0 auto", paddingTop: 48 }}>
        <div style={{ border: "1px solid rgba(168,85,247,.35)", background: "linear-gradient(180deg, rgba(24,24,37,.96), rgba(9,9,16,.96))", borderRadius: 24, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,.45)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "#a78bfa", fontWeight: 900, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>NeuroCine Admin</div>
              <h1 style={{ margin: "10px 0 8px", fontSize: 34, lineHeight: 1.05 }}>Управление кристаллами</h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>Эта панель меняет баланс в текущем браузере проекта через защищённую проверку PIN на сервере.</p>
            </div>
            <a href="/" style={{ color: "#c4b5fd", textDecoration: "none", fontWeight: 800, border: "1px solid rgba(196,181,253,.25)", borderRadius: 12, padding: "10px 14px" }}>← На сайт</a>
          </div>

          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 18 }}>
              <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Текущий баланс</div>
              <div style={{ fontSize: 42, fontWeight: 950, marginTop: 8 }}>{currentLabel}</div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>Дата записи: {billing.date}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 18, padding: 18 }}>
              <div style={{ color: unlocked ? "#34d399" : "#fbbf24", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>{unlocked ? "PIN принят" : "PIN нужен"}</div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 10 }}>PIN берётся из <b>ADMIN_PIN</b>, если он задан. Если нет — из <b>DEV_LOCK_PIN</b>.</div>
            </div>
          </div>

          <label style={{ display: "block", marginTop: 24, color: "#cbd5e1", fontSize: 13, fontWeight: 800 }}>Admin PIN</label>
          <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" placeholder="Введи PIN" style={{ width: "100%", marginTop: 8, boxSizing: "border-box", background: "#0f1020", border: "1px solid rgba(255,255,255,.12)", color: "#fff", borderRadius: 14, padding: "14px 16px", fontSize: 16, outline: "none" }} />

          <label style={{ display: "block", marginTop: 18, color: "#cbd5e1", fontSize: 13, fontWeight: 800 }}>Количество</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" step="1" style={{ width: "100%", marginTop: 8, boxSizing: "border-box", background: "#0f1020", border: "1px solid rgba(255,255,255,.12)", color: "#fff", borderRadius: 14, padding: "14px 16px", fontSize: 16, outline: "none" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10, marginTop: 20 }}>
            <button disabled={busy} onClick={() => runAction("set")} style={btnStyle}>Поставить</button>
            <button disabled={busy} onClick={() => runAction("add")} style={btnStyle}>Начислить +</button>
            <button disabled={busy} onClick={() => runAction("subtract")} style={btnStyle}>Списать −</button>
            <button disabled={busy} onClick={() => runAction("reset")} style={dangerBtnStyle}>Сброс до 3</button>
            <button disabled={busy} onClick={refresh} style={ghostBtnStyle}>Обновить</button>
          </div>

          {status && <div style={{ marginTop: 18, color: status.startsWith("Ошибка") || status.includes("Неверный") ? "#f87171" : "#34d399", fontWeight: 800 }}>{status}</div>}

          <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 18, color: "#94a3b8", fontSize: 13, lineHeight: 1.55 }}>
            <b style={{ color: "#e2e8f0" }}>Важно:</b> текущий движок хранит кристаллы в <code>localStorage</code>, поэтому эта админка управляет балансом именно в этом браузере. Для общей SaaS-системы на всех пользователей нужна база данных и userId.
          </div>
        </div>
      </section>
    </main>
  );
}

const baseButton = {
  border: 0,
  borderRadius: 14,
  padding: "13px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const btnStyle = {
  ...baseButton,
  color: "white",
  background: "linear-gradient(135deg, #7c3aed, #db2777)",
};

const dangerBtnStyle = {
  ...baseButton,
  color: "#fecaca",
  background: "rgba(239,68,68,.16)",
  border: "1px solid rgba(239,68,68,.25)",
};

const ghostBtnStyle = {
  ...baseButton,
  color: "#c4b5fd",
  background: "rgba(196,181,253,.08)",
  border: "1px solid rgba(196,181,253,.18)",
};
