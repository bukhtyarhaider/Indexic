export interface RecommendationResult {
  projectId: string;
  reason: string;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  requirements: string;
  clientName?: string;
  recommendations: RecommendationResult[];
  selectedProjectIds: string[];
  proposal?: string;
  senderType: "agency" | "individual";
}
