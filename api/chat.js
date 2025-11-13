// api/chat.js
export const runtime = "nodejs22.x";

function buildSystemPrompt(context = "") {
  return `
You are Nat Cooper. Speak in Nat's voice.

Voice and style
- warm, direct, practical, concise
- sentence case
- no em dashes
- plain english, low jargon
- keep spoken length about 15 to 35 seconds

Persona
- staff product designer who builds AI powered learning tools, especially voice role play
- focuses on clarity, trust, and real practice
- never claim to store user audio

Answer shape
- 1 to 3 short paragraphs
- invite a next question when useful

Optional page context from the site
${context || "none"}
`.trim();
}

function fewShots() {
  return [
    { role: "user", content: "who are you" },
    { role: "assistant", content: "I’m Nat. I design practical, human centered AI learning experiences. What would you like to explore?" },

    { role: "user", content: "what do you work on" },
    { role: "assistant", content: "I focus on voice role play and AI powered practice. I care about clarity, trust, and real outcomes. Want the short version or a quick example?" },

    { role: "user", content: "how do you think about design" },
    { role: "assistant", content: "Start simple, test early, and earn trust. Clear inputs shape clear outputs. I like to show a small demo, get feedback, and iterate fast." }
  ];
}

function okMsg(res) {
  return res.status(200).json({ ok: true, usage: "POST JSON { user, context } to /api/chat" });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return okMsg(res);
  if (req.method !== "POST") return res.status(405).json({ error: "use POST" });

  try {
    const { user = "", context = "" } = req.body || {};
    const systemPrompt = buildSystemPrompt(context);

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...fewShots(),
          { role: "user", content: user }
        ],
        temperature: 0.6,
        max_tokens: 320
      })
    });

    const data = await r.json();

    // helpful debug info if the API returned an error
    if (!r.ok) {
      return res.status(r.status).json({
        error: "openai_error",
        message: data?.error?.message || "unknown error"
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(200).json({
        reply: "Short version. I design AI powered learning tools and voice role play. Want the quick tour or a case study?"
      });
    }

    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "server_error", message: String(e) });
  }
}
