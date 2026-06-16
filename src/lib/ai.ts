import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
// Initialize Google Gen AI client if API Key is present
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface AIAnalysisResult {
  summary: string;
  keywords: string[];
  suggestedGenres: string[];
  readingTime: string;
  contentRating: string;
}

export interface AICoverResult {
  score: number;
  suggestions: string;
}

/**
 * Analyzes manuscript content using Gemini or fallback rules.
 */
export async function analyzeManuscript(title: string, content: string): Promise<AIAnalysisResult> {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const computedMins = Math.max(1, Math.round(wordCount / 200));
  const readingTime = `${computedMins} min read`;

  if (ai) {
    try {
      const prompt = `
        You are a professional acquisitions editor and literary critic. Analyze the following story/manuscript snippet:
        Title: "${title}"
        Content: "${content.substring(0, 4000)}"
        
        Provide your analysis in JSON format matching this structure:
        {
          "summary": "Short 1-2 sentence plot summary.",
          "keywords": ["keyword1", "keyword2", "keyword3"],
          "suggestedGenres": ["Genre1", "Genre2"],
          "contentRating": "Everyone or Teen or Mature, with brief justification."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return {
        summary: parsed.summary || `${title} is a story of suspense and discovery, exploring the depth of characters under tension.`,
        keywords: parsed.keywords || ["manuscript", "draft", "story"],
        suggestedGenres: parsed.suggestedGenres || ["Drama"],
        readingTime,
        contentRating: parsed.contentRating || "Everyone",
      };
    } catch (error) {
      console.error("Gemini manuscript analysis error, using fallback:", error);
    }
  }

  // Smart local rules-based fallback
  const contentLower = content.toLowerCase();
  const keywords = ["adventure", "journey"];
  const suggestedGenres = ["Fiction"];
  let contentRating = "Everyone";

  if (contentLower.includes("magic") || contentLower.includes("spell") || contentLower.includes("sword")) {
    suggestedGenres.unshift("Fantasy");
    keywords.push("magic", "fantasy");
  }
  if (contentLower.includes("space") || contentLower.includes("laser") || contentLower.includes("cyber") || contentLower.includes("robot")) {
    suggestedGenres.unshift("Sci-Fi");
    keywords.push("cyberpunk", "futuristic");
  }
  if (contentLower.includes("love") || contentLower.includes("kiss") || contentLower.includes("heart")) {
    suggestedGenres.unshift("Romance");
    keywords.push("romance", "drama");
  }
  if (contentLower.includes("kill") || contentLower.includes("blood") || contentLower.includes("murder") || contentLower.includes("death")) {
    suggestedGenres.unshift("Mystery");
    keywords.push("crime", "dark");
    contentRating = "Teen (Contains dark themes/violence)";
  }
  if (contentLower.includes("fuck") || contentLower.includes("naked") || contentLower.includes("sex")) {
    contentRating = "Mature (Adult themes and strong language)";
  }

  // Clean duplicates
  const uniqueGenres = Array.from(new Set(suggestedGenres));
  const uniqueKeywords = Array.from(new Set(keywords));

  return {
    summary: `An engaging story titled "${title}" about character struggles and thematic journeys.`,
    keywords: uniqueKeywords,
    suggestedGenres: uniqueGenres,
    readingTime,
    contentRating,
  };
}

/**
 * Critiques cover image options using Gemini (if key provided) or local heuristics.
 */
export async function reviewCover(imageUrl: string | null): Promise<AICoverResult> {
  if (!imageUrl) {
    return {
      score: 40,
      suggestions: "No cover image provided. Having a cover increases reader click rates by over 80%. Consider generating or uploading a cover image.",
    };
  }

  if (ai) {
    try {
      const prompt = `
        You are a book cover designer. Critique the quality of this book cover image URL: "${imageUrl}"
        Explain visual balance, font legibility, color aesthetics, and suggestions for improvement.
        Provide your response in JSON format:
        {
          "score": 85,
          "suggestions": "Detailed design critique and suggestions."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return {
        score: parsed.score || 80,
        suggestions: parsed.suggestions || "Great visual contrast. Ensure text alignment fits typical book layouts.",
      };
    } catch (e) {
      console.error("Gemini cover review error, using fallback:", e);
    }
  }

  // Local rules-based advice based on placeholder styles
  let score = 75;
  let suggestions = "The cover image is present, which is a great start. To make it premium: ensure there is a clear title and author typography overlay, use high-contrast color tones that fit your genre, and use a vertical aspect ratio of 3:4 or 2:3.";

  if (imageUrl.includes("unsplash.com")) {
    score = 85;
    suggestions = "Excellent cover visual selection. The high-resolution photo from Unsplash provides a highly professional backdrop. Ensure your title text is aligned in the upper third with high contrast against the background colors.";
  }

  return { score, suggestions };
}
