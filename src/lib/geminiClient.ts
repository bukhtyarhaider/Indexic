import { GoogleGenAI } from "@google/genai";

/**
 * Gemini AI Client Configuration
 * Provides a centralized client for all AI interactions
 */
class GeminiClient {
  private client: GoogleGenAI | null = null;
  private readonly apiKey: string;

  private readonly defaultModel = "gemini-2.5-flash";

  // TODO: add fallback support later
  private readonly fallbackModels = [
    "gemini-3-flash-preview",
    "gemini-2-flash",
    "gemini-pro-3",
    "gemini-2.5-pro",
  ];

  constructor() {
    this.apiKey = process.env.API_KEY || "";
    if (this.apiKey) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
      console.log(
        "Gemini client initialized with API key:",
        this.apiKey ? "✓ Key present" : "✗ No key"
      );
    } else {
      console.warn("Gemini API key not found in environment variables");
    }
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return !!this.client && !!this.apiKey;
  }

  /**
   * Generate content with JSON response
   */
  async generateJSON<T>(prompt: string, model?: string): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error("Gemini API Key is not configured");
    }

    try {
      const response = await this.client!.models.generateContent({
        model: model || this.defaultModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI model");
      }

      return JSON.parse(text) as T;
    } catch (error) {
      console.error("Gemini JSON Generation Error:", error);

      // Provide more helpful error message
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          throw new Error(
            "Network error: Unable to connect to Gemini API. Please check your internet connection and API key."
          );
        }
        throw new Error(`AI generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate plain text content
   */
  async generateText(prompt: string, model?: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("Gemini API Key is not configured");
    }

    try {
      const response = await this.client!.models.generateContent({
        model: model || this.defaultModel,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI model");
      }

      return text;
    } catch (error) {
      console.error("Gemini Text Generation Error:", error);

      // Provide more helpful error message
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          throw new Error(
            "Network error: Unable to connect to Gemini API. Please check your internet connection and API key."
          );
        }
        throw new Error(`AI generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get default model name
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();
