import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips Markdown code blocks and parses the JSON content.
 * Includes a recursive repair attempt for truncated JSON.
 */
export function parseAIResponse<T>(text: string | undefined | null, fallback: T): T {
  if (!text) return fallback;

  const tryParse = (jsonStr: string): T | null => {
    try {
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      // Try to repair truncated JSON if it looks like it was cut off
      if (jsonStr.trim().startsWith('{')) {
        let repaired = jsonStr.trim();
        // Simple balance of braces and brackets
        const openBraces = (repaired.match(/\{/g) || []).length;
        const closeBraces = (repaired.match(/\}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;

        if (openBraces > closeBraces) {
          repaired += '}'.repeat(openBraces - closeBraces);
        }
        if (openBrackets > closeBrackets) {
          repaired += ']'.repeat(openBrackets - closeBrackets);
        }

        try {
          return JSON.parse(repaired) as T;
        } catch (innerE) {
          return null;
        }
      }
      return null;
    }
  };

  // 1. Try stripping markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    const result = tryParse(jsonMatch[1].trim());
    if (result) return result;
  }
  
  // 2. Try direct parse
  const directResult = tryParse(text.trim());
  if (directResult) return directResult;

  // 3. Substring approach: find the first '{' and maybe the last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  
  if (firstBrace !== -1) {
    const potentialJson = lastBrace > firstBrace 
      ? text.substring(firstBrace, lastBrace + 1)
      : text.substring(firstBrace);
    
    const subResult = tryParse(potentialJson.trim());
    if (subResult) return subResult;
  }

  console.error("Could not parse AI response as JSON:", text);
  return fallback;
}
