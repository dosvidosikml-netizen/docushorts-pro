import { NextResponse } from "next/server";
import { analyzeImageForVideo } from "../../../engine/directorEngine_v4";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await analyzeImageForVideo(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Analyze failed" }, { status: 500 });
  }
}
