// api/ping.js
export const runtime = "nodejs22.x";

export default function handler(req, res) {
  res.status(200).json({ ok: true, route: "/api/ping" });
}
