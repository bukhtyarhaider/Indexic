import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateProjectEnhancements = async (
  name: string,
  rawDescription: string,
  category: string
): Promise<{ refinedDescription: string; suggestedTags: string[] }> => {
  if (!apiKey) {
    console.warn("API Key missing for Gemini");
    return { refinedDescription: rawDescription, suggestedTags: [] };
  }

  try {
    const prompt = `
      I am building a portfolio index for a software and design agency.
      Please improve the description and suggest tags for the following project.
      
      Project Name: ${name}
      Raw Input: ${rawDescription}
      Category: ${category}

      Output strict JSON format:
      {
        "refinedDescription": "A professional, concise, client-facing description (max 2 sentences).",
        "suggestedTags": ["Tag1", "Tag2", "Tag3", "Tag4"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return {
      refinedDescription: data.refinedDescription || rawDescription,
      suggestedTags: data.suggestedTags || []
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return { refinedDescription: rawDescription, suggestedTags: [] };
  }
};
