import { Project } from "@/types";
import { RecommendationResult, MatchRecord } from "@/types/match";
import { geminiClient } from "@/lib/geminiClient";
import {
  createRecommendationPrompt,
  createProposalPrompt,
  projectsToContext,
  prepareProposalContext,
} from "@/constants/aiPrompts";

/**
 * Match Service
 * Handles all AI-powered matching and proposal generation logic
 */

interface RecommendationResponse {
  recommendations: RecommendationResult[];
  message: string;
}

/**
 * Get AI-powered project recommendations based on client requirements
 */
export const getProjectRecommendations = async (
  requirements: string,
  projects: Project[]
): Promise<RecommendationResponse> => {
  if (!geminiClient.isConfigured()) {
    return {
      recommendations: [],
      message: "AI service is not configured. Cannot generate recommendations.",
    };
  }

  if (!requirements.trim()) {
    return {
      recommendations: [],
      message: "Please provide client requirements to analyze.",
    };
  }

  if (projects.length === 0) {
    return {
      recommendations: [],
      message: "No projects available to analyze.",
    };
  }

  try {
    // Simplify project data to save context window and improve focus
    const projectsContext = projectsToContext(projects);
    const prompt = createRecommendationPrompt(requirements, projectsContext);

    const data = await geminiClient.generateJSON<RecommendationResponse>(
      prompt
    );

    return {
      recommendations: data.recommendations || [],
      message: data.message || "Analysis complete.",
    };
  } catch (error) {
    console.error("Project Recommendation Error:", error);
    return {
      recommendations: [],
      message: "Failed to generate recommendations. Please try again.",
    };
  }
};

/**
 * Generate a professional proposal for selected projects
 */
export const generateProposal = async (
  requirements: string,
  selectedProjects: Project[],
  clientName: string,
  senderType: "agency" | "individual",
  senderName: string
): Promise<string> => {
  if (!geminiClient.isConfigured()) {
    return "AI service is not configured. Please set up your API key.";
  }

  if (selectedProjects.length === 0) {
    return "No projects selected for proposal.";
  }

  try {
    const context = prepareProposalContext(
      requirements,
      selectedProjects,
      clientName,
      senderType,
      senderName
    );

    const prompt = createProposalPrompt(context);
    const proposalText = await geminiClient.generateText(prompt);

    return proposalText || "Failed to generate proposal text.";
  } catch (error) {
    console.error("Proposal Generation Error:", error);

    // Return more specific error message
    if (error instanceof Error) {
      return `Error generating proposal: ${error.message}`;
    }
    return "An error occurred while generating the proposal. Please check your API key and try again.";
  }
};

/**
 * Create a new match record for history tracking
 */
export const createMatchRecord = (
  requirements: string,
  recommendations: RecommendationResult[],
  selectedProjectIds: string[],
  clientName?: string,
  proposal?: string,
  senderType: "agency" | "individual" = "agency"
): MatchRecord => {
  return {
    id: Date.now().toString(),
    timestamp: Date.now(),
    requirements,
    clientName,
    recommendations,
    selectedProjectIds,
    proposal,
    senderType,
  };
};

/**
 * Validate match requirements
 */
export const validateMatchRequirements = (
  requirements: string
): {
  isValid: boolean;
  error?: string;
} => {
  if (!requirements.trim()) {
    return {
      isValid: false,
      error: "Please provide client requirements.",
    };
  }

  if (requirements.length < 10) {
    return {
      isValid: false,
      error: "Requirements are too short. Please provide more details.",
    };
  }

  return { isValid: true };
};

/**
 * Validate proposal configuration
 */
export const validateProposalConfig = (
  selectedProjectIds: string[],
  senderName: string,
  senderType: "agency" | "individual"
): {
  isValid: boolean;
  error?: string;
} => {
  if (selectedProjectIds.length === 0) {
    return {
      isValid: false,
      error: "Please select at least one project for the proposal.",
    };
  }

  if (senderType === "individual" && !senderName.trim()) {
    return {
      isValid: false,
      error: "Please provide a sender name.",
    };
  }

  return { isValid: true };
};
