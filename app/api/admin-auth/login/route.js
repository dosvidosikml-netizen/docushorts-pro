import { cookies } from "next/headers";
import { createAdminSession, getAdminCookieOptions, SESSION_COOKIE } from "../../../../lib/adminAuth";

function getExpectedPin() {
  return process.env.ADMIN_PIN || process.env.DEV_LOCK_PIN || "";
}

function safeEqual(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (!left || !right || left.length !== right.length) return false;
  let out = 0;
  for (let i = 0; i < left.length; i++) out |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return out === 0;
}

export async function POST(req) {
  try {
    const expectedPin = getExpectedPin();
    if (!expectedPin || expectedPin === "change_this_admin_pin") {
      return Response.json({ ok: false, error: "ADMIN_PIN is not configured" }, { status: 500 });
    }

    const { pin } = await req.json();
    if (!safeEqual(pin, expectedPin)) {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const token = await createAdminSession();
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, getAdminCookieOptions());

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || "Login failed" }, { status: 500 });
  }
}
