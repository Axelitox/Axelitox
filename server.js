const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const client = new Anthropic();

const SYSTEM_PROMPT = `You rewrite text so it reads as naturally human-written, while keeping the original meaning, facts, and length in the same ballpark.

Vary sentence length and rhythm. Cut stock AI phrasing ("In conclusion", "It is important to note", "Furthermore", "Overall, ..."). Prefer plain, concrete words over inflated ones. Allow small imperfections a person would leave: an occasional sentence fragment, a contraction, a slightly informal transition. Keep any technical terms, numbers, and proper nouns exactly as given. Do not add new claims or remove important information.

Respond with only the rewritten text — no preamble, no explanation, no quotes around it.`;

app.post("/api/humanize", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "Le champ 'text' est requis." });
  }
  if (text.length > 20000) {
    return res.status(400).json({ error: "Texte trop long (20000 caractères max)." });
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      thinking: { type: "disabled" },
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    if (response.stop_reason === "refusal") {
      return res.status(422).json({ error: "La demande a été refusée par les filtres de sécurité." });
    }

    const textBlock = response.content.find((block) => block.type === "text");
    return res.json({ result: textBlock ? textBlock.text : "" });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "Échec de l'appel au modèle." });
  }
});

app.listen(port, () => {
  console.log(`Humanizer running on http://localhost:${port}`);
});
