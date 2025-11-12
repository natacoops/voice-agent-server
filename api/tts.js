// api/tts.js
export const runtime = "nodejs22.x";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "use POST" });

  try {
    const { text = "" } = req.body || {};
    if (!text) return res.status(400).send("missing text");

    const voiceId = process.env.ELEVEN_VOICE_ID;
    const apiKey = process.env.ELEVEN_API_KEY;

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true
        }
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).send(errText);
    }

    const arrayBuf = await r.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    return res.status(200).send(Buffer.from(arrayBuf));
  } catch (e) {
    console.error(e);
    return res.status(500).send("tts error");
  }
}
