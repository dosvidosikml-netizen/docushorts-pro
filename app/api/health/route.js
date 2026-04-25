export async function GET() {
  return Response.json({ ok: true, service: "neurocine", timestamp: new Date().toISOString() });
}
