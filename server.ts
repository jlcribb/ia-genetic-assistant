import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchWithRetry(url: string, options: any, maxRetries = 2, delay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries + 1; i++) {
    try {
      const response = await fetch(url, options);
      
      // If success, just return
      if (response.ok) return response;
      
      // For specific retryable errors
      if (response.status === 504 || response.status === 503 || response.status === 429) {
        const errorText = await response.clone().text();
        console.warn(`[AI Proxy] Attempt ${i + 1} failed with status ${response.status}. Error: ${errorText}`);
        
        if (i < maxRetries) {
          const waitTime = response.status === 429 ? delay * 3 : delay; // Wait longer for 429
          console.warn(`[AI Proxy] Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          delay *= 2; // Exponential backoff
          continue;
        }
      }
      
      return response; // Return even if it's an error (like 400 or 401) so caller can handle it
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        console.warn(`[AI Proxy] Network error on attempt ${i + 1}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }
  throw lastError;
}

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
        if (!apiKey) {
          console.error("[AI Proxy] Missing Gemini API Key");
          throw new Error("Missing Gemini API Key");
        }

        console.log(`[AI Proxy] Calling Gemini API (model: gemini-3-flash-preview)...`);
        const ai = new GoogleGenAI({ 
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
          });
          
          const text = response.text;
          console.log("[AI Proxy] Gemini response success");
          return res.json({ text });
        } catch (err: any) {
          console.error("[AI Proxy] Gemini error:", err);
          throw new Error(`Gemini error: ${err.message}`);
        }
      }

      if (provider === 'groq') {
        const apiKey = process.env.VITE_GENASISSTANTGROQAPI || process.env.GROQ_API_KEY;
        if (!apiKey) {
          console.error("[AI Proxy] Missing Groq API Key");
          throw new Error("Missing Groq API Key");
        }
        
        console.log("[AI Proxy] Calling Groq API...");
        const response = await fetchWithRetry("https://api.groq.com/openai/v1/chat/completions", {
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
          throw new Error(`Groq API error: ${response.status} - ${errorText}`);
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

        const models = [
          "google/gemini-2.0-flash-001",
          "google/gemini-pro-1.5",
          "anthropic/claude-3-haiku-20240307",
          "meta-llama/llama-3.1-8b-instruct"
        ];

        let lastModelError;
        for (const model of models) {
          try {
            console.log(`[AI Proxy] Calling OpenRouter API with model: ${model}...`);
            const response = await fetchWithRetry("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "X-Title": "GeneTrust AI"
              },
              body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                timeout: 30000 // 30s timeout per attempt
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`[AI Proxy] OpenRouter error for ${model}: ${response.status} - ${errorText}`);
              lastModelError = new Error(`OpenRouter API error (${model}): ${response.status} - ${errorText}`);
              continue; // Try next model
            }

            const data = await response.json();
            console.log(`[AI Proxy] OpenRouter response success with ${model}`);
            return res.json({ text: data.choices?.[0]?.message?.content || "" });
          } catch (err: any) {
            console.warn(`[AI Proxy] Model ${model} failed: ${err.message}. Trying next...`);
            lastModelError = err;
          }
        }
        
        throw lastModelError || new Error("All models failed on OpenRouter");
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
