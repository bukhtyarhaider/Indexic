/**
 * Gemini Service
 * Legacy service file - maintained for backward compatibility
 * New code should use @/services/matchService.ts and @/lib/geminiClient.ts
 */

import { Project } from "@/types";
import { RecommendationResult } from "@/types/match";
import { geminiClient } from "@/lib/geminiClient";
import { createProjectEnhancementPrompt } from "@/constants/aiPrompts";
import {
  getProjectRecommendations as getRecommendations,
  generateProposal as createProposal,
} from "./matchService";

/**
 * Generate project enhancements (description refinement and tags)
 * @deprecated Consider using dedicated enhancement service if created
 */
export const generateProjectEnhancements = async (
  name: string,
  rawDescription: string,
  category: string
): Promise<{ refinedDescription: string; suggestedTags: string[] }> => {
  if (!geminiClient.isConfigured()) {
    console.warn("API Key missing for Gemini");
    return { refinedDescription: rawDescription, suggestedTags: [] };
  }

  try {
    const prompt = createProjectEnhancementPrompt(
      name,
      rawDescription,
      category
    );

    const data = await geminiClient.generateJSON<{
      refinedDescription: string;
      suggestedTags: string[];
    }>(prompt);

    return {
      refinedDescription: data.refinedDescription || rawDescription,
      suggestedTags: data.suggestedTags || [],
    };
  } catch (error) {
    console.error("Gemini Enhancement Error:", error);
    return { refinedDescription: rawDescription, suggestedTags: [] };
  }
};

/**
 * Get project recommendations based on requirements
 * Delegates to matchService for better separation of concerns
 */
export const getProjectRecommendations = async (
  requirements: string,
  projects: Project[]
): Promise<{ recommendations: RecommendationResult[]; message: string }> => {
  return getRecommendations(requirements, projects);
};

/**
 * Generate proposal for selected projects
 * Delegates to matchService for better separation of concerns
 */
export const generateProposal = async (
  requirements: string,
  selectedProjects: Project[],
  clientName: string,
  senderType: "agency" | "individual",
  senderName: string
): Promise<string> => {
  return createProposal(
    requirements,
    selectedProjects,
    clientName,
    senderType,
    senderName
  );
};
