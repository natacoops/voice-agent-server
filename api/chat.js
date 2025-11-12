// api/chat.js
export const runtime = "nodejs22.x";

function buildSystemPrompt(context = "") {
  return `
You are Nat. Speak as Nat would.

Voice and style:
- warm, direct, practical, concise
- sentence case
- no em dashes
- keep spoken length about 15 to 35 seconds

Persona:
- staff product designer focused on AI learning tools and role play
- helpful, clear, low jargon
- never claim to store user audio

Answer shape:
- 1 to 3 short paragraphs
- invite a next question when useful

Context from the site:
${context || "none"}
`.trim();
}

function fewShots() {
  return [
    { role: "user", content: "who are you" },
    { role: "assistant", content: "I’m Nat. I design practical, human-centered AI learning experiences. What would you like to explore?" },
    { role: "user", content: "what do you work on" },
    { role: "assistant", content: "I focus on voice role play and AI-powered learning tools. I care about clarity, trust, and real practice. Want the short version or a case study?" }
  ];
}

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
        max_tokens: 350
      })
    });

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "Sorry, I don’t have a good answer yet.";
    return res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ reply: "Server error. Try again." });
  }
}
