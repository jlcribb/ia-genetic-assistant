import { GoogleGenAI } from "@google/genai";
import { Provider } from "../types";

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const generateResponse = async (prompt: string, provider: Provider = 'gemini', isFallback: boolean = false): Promise<string> => {
  const tryGenerate = async (currentProvider: Provider): Promise<string> => {
    try {
      if (currentProvider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'undefined' || apiKey === '') {
          throw new Error("Gemini API key is missing.");
        }
        const response = await gemini.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        return response.text || "No response from AI.";
      }

      if (currentProvider === 'groq') {
        const apiKey = import.meta.env.VITE_GENASISSTANTGROQAPI;
        if (!apiKey || apiKey === 'undefined' || apiKey === '') {
          throw new Error("Groq API key is missing.");
        }
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
          if (response.status === 429) throw new Error("429");
          if (response.status === 503) throw new Error("503");
          if (response.status === 504) throw new Error("504");
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
      }

      if (currentProvider === 'openrouter') {
        const apiKey = import.meta.env.VITE_GENASISSTANTOROUTERAPI;
        if (!apiKey || apiKey === 'undefined' || apiKey === '') {
          throw new Error("OpenRouter API key is missing.");
        }
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Genetic Assistant"
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: prompt }]
          })
        });
        if (!response.ok) {
          if (response.status === 429) throw new Error("429");
          if (response.status === 503) throw new Error("503");
          if (response.status === 504) throw new Error("504");
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
      }

      return "Unsupported provider.";
    } catch (error: any) {
      throw error;
    }
  };

  try {
    return await tryGenerate(provider);
  } catch (error: any) {
    const errorMsg = error.message;
    
    // Automatic fallback to Gemini if Groq or OpenRouter fail with rate limits or temporary errors
    if (!isFallback && provider !== 'gemini' && (errorMsg === '429' || errorMsg === '503' || errorMsg === '504' || errorMsg.includes('missing'))) {
      console.warn(`Provider ${provider} failed with ${errorMsg}. Falling back to Gemini...`);
      return await generateResponse(prompt, 'gemini', true);
    }

    // Translate technical errors for the end user if we can't fall back
    if (errorMsg === '429') throw new Error(`${provider.toUpperCase()} rate limit exceeded. Please wait a moment.`);
    if (errorMsg === '503') throw new Error(`${provider.toUpperCase()} service unavailable.`);
    if (errorMsg === '504') throw new Error(`${provider.toUpperCase()} gateway timeout.`);
    
    throw error;
  }
};
