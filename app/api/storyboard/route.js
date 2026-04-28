import { NextResponse } from "next/server";
import { generateStoryboard } from "../../../engine/directorEngine_v4";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await generateStoryboard(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Storyboard generation failed" }, { status: 500 });
  }
}
