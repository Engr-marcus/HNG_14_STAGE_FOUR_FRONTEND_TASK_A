const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/summarize", async (req, res) => {
  try {
    const { content } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Summarize this into clear bullet points:\n\n${content}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GEMINI RESPONSE:", data);

    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

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
