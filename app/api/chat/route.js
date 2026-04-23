export async function GET() {
  return Response.json({ ok: true, message: "chat route works" });
}

export async function POST(req) {
  return Response.json({ ok: true, message: "POST works" });
}
