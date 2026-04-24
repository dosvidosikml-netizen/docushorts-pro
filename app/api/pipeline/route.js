// app/api/pipeline/route.js
// Final NeuroCine pipeline route.

import { runNeuroCineFinalPipeline } from "@/lib/neurocineVideoPipeline";
import {
  demoImageProvider,
  demoVideoProvider,
  demoRenderProvider,
} from "@/lib/videoProviders";

export async function POST(req) {
  try {
    const body = await req.json();

    const result = await runNeuroCineFinalPipeline({
      scriptPackage: body.scriptPackage || body,
      characterDNA: body.characterDNA,
      seed: body.seed || "777777",
      referenceImage: body.referenceImage || "",
      styleLock:
        body.styleLock ||
        "cinematic, high contrast, same color grading, trailer-like continuity",
      imageProvider: demoImageProvider,
      videoProvider: demoVideoProvider,
      renderProvider: demoRenderProvider,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error?.message || "Pipeline error" },
      { status: 500 }
    );
  }
}
