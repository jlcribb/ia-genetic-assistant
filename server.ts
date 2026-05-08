import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Proxy
  app.post("/api/ai", async (req, res) => {
    const { prompt, provider } = req.body;
    
    try {
      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("Missing GEMINI_API_KEY in environment");
        }
        const genAI = new GoogleGenAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return res.json({ text: response.text() });
      }

      if (provider === 'groq') {
        const apiKey = process.env.VITE_GENASISSTANTGROQAPI || process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("Missing Groq API Key");
        
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }]
          })
        });
        const data = await response.json();
        return res.json({ text: data.choices?.[0]?.message?.content || "" });
      }

      if (provider === 'openrouter') {
        const apiKey = process.env.VITE_GENASISSTANTOROUTERAPI || process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("Missing OpenRouter API Key");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Title": "Genetic Assistant"
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: prompt }]
          })
        });
        const data = await response.json();
        return res.json({ text: data.choices?.[0]?.message?.content || "" });
      }

      res.status(400).json({ error: "Unsupported provider" });
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
