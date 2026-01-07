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
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
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
      throw this.handleError(error);
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
      throw this.handleError(error);
    }
  }

  /**
   * Centralized error handler for user-friendly messages
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Rate limit / quota exceeded errors
      if (
        message.includes("429") ||
        message.includes("quota") ||
        message.includes("rate") ||
        message.includes("resource_exhausted") ||
        message.includes("exceeded")
      ) {
        return new Error(
          "AI service is temporarily busy. Please wait a moment and try again."
        );
      }

      // Network errors
      if (message.includes("fetch") || message.includes("network")) {
        return new Error(
          "Unable to connect to AI service. Please check your internet connection."
        );
      }

      // API key errors
      if (
        message.includes("api_key") ||
        message.includes("unauthorized") ||
        message.includes("401")
      ) {
        return new Error(
          "AI service configuration error. Please contact support."
        );
      }

      // Model not found
      if (message.includes("model") && message.includes("not found")) {
        return new Error(
          "AI model temporarily unavailable. Please try again later."
        );
      }
    }

    // Generic fallback
    return new Error(
      "Unable to process your request. Please try again in a moment."
    );
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
