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
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `HTTP error! status: ${response.status}` };
      }
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    return data.text || "No response from AI.";
  } catch (error: any) {
    const errorStr = error.message;

    // Automatic fallback logic
    if (!isFallback) {
      const errorJson = errorStr.toLowerCase();
      console.warn(`AI request failed: ${errorStr}. Attempting fallback...`);
      
      // If native Gemini or any provider fails with specific timeout/load errors
      const isRetryable = errorJson.includes('504') || 
                          errorJson.includes('503') || 
                          errorJson.includes('429') || 
                          errorJson.includes('aborted') || 
                          errorJson.includes('timeout') ||
                          errorJson.includes('deadline');

      if (isRetryable) {
        // Switch provider for fallback
        const nextProvider = provider === 'gemini' ? 'openrouter' : 'gemini';
        console.log(`Switching provider to ${nextProvider} as fallback...`);
        return await generateResponse(prompt, nextProvider, true);
      }
      
      // Handle the case where the error is a JSON string from our API
      try {
        const parsed = JSON.parse(errorStr);
        const nestedError = parsed.error?.toLowerCase() || '';
        if (nestedError.includes('504') || nestedError.includes('timeout') || nestedError.includes('aborted')) {
          const nextProvider = provider === 'gemini' ? 'openrouter' : 'gemini';
          return await generateResponse(prompt, nextProvider, true);
        }
      } catch (e) {
        // Not JSON, continue
      }
    }

    throw error;
  }
};
