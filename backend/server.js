const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/summarize", async (req, res) => {
  try {
    const { content } = req.body;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // cheap + reliable
        messages: [
          {
            role: "user",
            content: `Summarize this into clear bullet points:\n\n${content}`
          }
        ]
      })
    });

    const data = await response.json();

    console.log("OPENROUTER RESPONSE:", JSON.stringify(data, null, 2));

    if (data.error) {
      return res.json({
        summary: `Error: ${data.error.message}`
      });
    }

    const summary = data?.choices?.[0]?.message?.content;

    res.json({
      summary: summary || "No summary generated"
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});