// api/health/index.js
export const runtime = "nodejs22.x";

export default async function handler(req) {
  const body = JSON.stringify({
    ok: true,
    routes: ["/api/chat (POST or GET)", "/api/tts (POST or GET)"]
  });
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}
