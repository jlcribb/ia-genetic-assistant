import { Provider } from "../types";

export const generateResponse = async (prompt: string, provider: Provider = 'gemini', isFallback: boolean = false): Promise<string> => {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, provider }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "No response from AI.";
  } catch (error: any) {
    const errorMsg = error.message;

    // Automatic fallback to Gemini if Groq or OpenRouter fail
    if (!isFallback && provider !== 'gemini' && (errorMsg.includes('429') || errorMsg.includes('503') || errorMsg.includes('504') || errorMsg.includes('Key'))) {
      console.warn(`Provider ${provider} failed. Falling back to Gemini...`);
      return await generateResponse(prompt, 'gemini', true);
    }

    throw error;
  }
};
