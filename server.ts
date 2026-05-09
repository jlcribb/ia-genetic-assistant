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
    console.log(`[AI Proxy] Request received. Provider: ${provider}`);
    
    try {
      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey.trim() === "") {
          console.error("[AI Proxy] GEMINI_API_KEY is missing or invalid in server environment");
          throw new Error("Missing GEMINI_API_KEY in server environment. Please check Cloud Run secrets.");
        }

        console.log(`[AI Proxy] Calling Gemini API (Key length: ${apiKey.length})...`);
        const genAI = new GoogleGenAI({ apiKey });
        
        // Using a standard, supported model
        const response = await genAI.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });

        if (!response || !response.text) {
          console.error("[AI Proxy] No text returned from Gemini");
          throw new Error("No text returned from Gemini");
        }

        console.log("[AI Proxy] Gemini response success");
        return res.json({ text: response.text });
      }

      if (provider === 'groq') {
        const apiKey = process.env.VITE_GENASISSTANTGROQAPI || process.env.GROQ_API_KEY;
        if (!apiKey) {
          console.error("[AI Proxy] Missing Groq API Key");
          throw new Error("Missing Groq API Key");
        }
        
        console.log("[AI Proxy] Calling Groq API...");
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

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[AI Proxy] Groq error: ${response.status} - ${errorText}`);
          throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("[AI Proxy] Groq response success");
        return res.json({ text: data.choices?.[0]?.message?.content || "" });
      }

      if (provider === 'openrouter') {
        const apiKey = process.env.VITE_GENASISSTANTOROUTERAPI || process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          console.error("[AI Proxy] Missing OpenRouter API Key");
          throw new Error("Missing OpenRouter API Key");
        }

        console.log("[AI Proxy] Calling OpenRouter API...");
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

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[AI Proxy] OpenRouter error: ${response.status} - ${errorText}`);
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("[AI Proxy] OpenRouter response success");
        return res.json({ text: data.choices?.[0]?.message?.content || "" });
      }

      console.warn(`[AI Proxy] Unsupported provider: ${provider}`);
      res.status(400).json({ error: "Unsupported provider" });
    } catch (error: any) {
      console.error("[AI Proxy Error]:", error);
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
