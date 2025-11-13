// api/health.js
export const runtime = "nodejs22.x";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    routes: [
      "/api/chat (POST or GET)",
      "/api/tts (POST or GET)"
    ]
  });
}
