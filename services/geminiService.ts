import { GoogleGenAI, Type } from "@google/genai";
import { DetectedError, ErrorCategory } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeStudentWork = async (base64Image: string): Promise<{ summary: string; errors: DetectedError[] }> => {
  const modelId = "gemini-2.5-flash"; // Fast and capable for this task

  const prompt = `
    Analyze the handwriting or text in this image of a student's school work. 
    Identify specific errors in grammar, spelling, punctuation, capitalization, and syntax.
    
    If the image is not readable or does not contain text, return an empty error list and a summary stating that.
    
    For each error found:
    1. Quote the original text containing the error.
    2. Provide the corrected version.
    3. Categorize it into one of these types: Spelling, Grammar, Punctuation, Capitalization, Syntax, Vocabulary, Other.
    4. Provide a brief, helpful explanation suitable for a teacher to use.

    Also provide a brief 1-2 sentence summary of the overall work quality.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalText: { type: Type.STRING },
                  correction: { type: Type.STRING },
                  category: { type: Type.STRING, enum: Object.values(ErrorCategory) },
                  explanation: { type: Type.STRING },
                },
                required: ["originalText", "correction", "category", "explanation"],
              },
            },
          },
          required: ["summary", "errors"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as { summary: string; errors: DetectedError[] };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
