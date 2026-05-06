// app/api/cover/route.js
// NeuroCine Cover/Thumbnail Engine — 2 виральных варианта обложки.
// Детерминированно (без LLM запроса) — instant response.

import { buildCoverVariants } from "../../../engine/coverEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").trim();
    const storyboard = body.storyboard || null;
    const hook = String(body.hook || "").trim();

    if (!topic && !storyboard?.scenes?.length) {
      return Response.json({ error: "Нужны topic или storyboard со сценами" }, { status: 400 });
    }

    const result = buildCoverVariants({ topic, storyboard, hook });
    return Response.json({ ...result, mode: "deterministic" });
  } catch (e) {
    return Response.json({ error: e.message || "Cover engine error" }, { status: 500 });
  }
}
