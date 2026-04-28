import { NextResponse } from "next/server";
import { generateVideoPrompt } from "../../../engine/directorEngine_v4";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await generateVideoPrompt(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Video prompt failed" }, { status: 500 });
  }
}
