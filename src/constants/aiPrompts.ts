import { Project } from "@/types";

/**
 * AI Prompt Templates
 * Centralized location for all AI prompts used throughout the application
 */

export interface ProjectContext {
  id: string;
  name: string;
  description: string;
  tags: string;
  category: string;
}

export interface ProposalContext {
  senderIdentity: string;
  clientIdentity: string;
  requirements: string;
  projects: {
    name: string;
    description: string;
    category: string;
    tags: string;
    links: string;
  }[];
}

/**
 * Project Enhancement Prompt
 * Used to refine project descriptions and generate relevant tags
 */
export const createProjectEnhancementPrompt = (
  name: string,
  rawDescription: string,
  category: string
): string => {
  return `
I am building a portfolio index for a software and design agency.
Please improve the description and suggest tags for the following project.

Project Name: ${name}
Raw Input: ${rawDescription}
Category: ${category}

For tags, please suggest tags from these categories: Domain (Business area), Platform (Web/Mobile), Style (Design style), Feature (Key functionality), Technology (Stack). Use standard industry terms.

Output strict JSON format:
{
  "refinedDescription": "A professional, concise, client-facing description (max 2 sentences).",
  "suggestedTags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}
  `.trim();
};

/**
 * Project Recommendation Prompt
 * Used to match client requirements with portfolio projects
 */
export const createRecommendationPrompt = (
  requirements: string,
  projects: ProjectContext[]
): string => {
  return `
You are a senior solution architect and sales expert at a software agency.

Client Requirements:
"${requirements}"

Task:
Analyze the provided Portfolio Projects and identify which ones are most relevant to the client's requirements.
Return a list of the best matching projects. For each match, explain *specifically* why it is a good reference (e.g., similar tech stack, industry, or design feature).

If no projects match well, return an empty list and a polite message explaining that we don't have an exact match but can build custom solutions.

Portfolio Projects:
${JSON.stringify(projects)}

Output strict JSON format:
{
  "recommendations": [
    { "projectId": "id_here", "reason": "Specific reason why this matches..." }
  ],
  "message": "A summary message to the user."
}
  `.trim();
};

/**
 * Proposal Generation Prompt
 * Used to create professional proposals for clients
 */
export const createProposalPrompt = (context: ProposalContext): string => {
  const { senderIdentity, clientIdentity, requirements, projects } = context;

  return `
You are writing a professional project proposal/response on behalf of ${senderIdentity}.

Target Client: ${clientIdentity}
Client Requirements: "${requirements}"

Selected Portfolio Matches to Showcase:
${JSON.stringify(projects)}

Structure:
1. Greeting & Understanding: Professional greeting to ${clientIdentity}. Briefly acknowledge their specific needs to show we understood the brief.
2. Proposed Solution / Relevant Experience: A concise intro to why ${senderIdentity} is the right fit for this work.
3. Portfolio Showcase: List the selected projects below. For each, write a persuasive 1-2 sentences linking it back to the client's needs. 
   Format: Project Name - Description. (Link)
4. Closing: Professional sign-off from ${senderIdentity}.

IMPORTANT FORMATTING RULES:
- Use PLAIN TEXT only. 
- DO NOT use Markdown characters (no asterisks **, no hashes ##, no brackets [] for links). 
- Write URLs directly in parentheses like (https://...).
- Use standard spacing and numbering (1. 2. 3.).
- Keep the tone professional, confident, and ready to copy-paste into an email.
  `.trim();
};

/**
 * Helper to convert projects to simplified context
 */
export const projectsToContext = (projects: Project[]): ProjectContext[] => {
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    tags: p.tags.join(", "),
    category: p.category,
  }));
};

/**
 * Helper to prepare proposal context
 */
export const prepareProposalContext = (
  requirements: string,
  selectedProjects: Project[],
  clientName: string,
  senderType: "agency" | "individual",
  senderName: string
): ProposalContext => {
  const senderIdentity = senderType === "agency" ? "ProntX" : senderName;
  const clientIdentity = clientName || "the client";

  const projectsContext = selectedProjects.map((p) => ({
    name: p.name,
    description: p.description,
    category: p.category,
    tags: p.tags.join(", "),
    links: p.links.map((l) => l.url).join(", "),
  }));

  return {
    senderIdentity,
    clientIdentity,
    requirements,
    projects: projectsContext,
  };
};
