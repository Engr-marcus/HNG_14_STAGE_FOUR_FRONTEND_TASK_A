const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


app.post("/summarize", async (req, res) => {
  try {
    const { content } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You summarize articles into clear bullet points."
          },
          {
            role: "user",
            content: `Summarize this article:\n\n${content}`
          }
        ]
      })
    });

    const data = await response.json();

   
console.log("OPENAI RAW RESPONSE:", JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});