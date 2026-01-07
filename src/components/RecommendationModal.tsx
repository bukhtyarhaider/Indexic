import React, { useState } from "react";
import { Project } from "../types";
import { RecommendationResult } from "../types/match";
import {
  getProjectRecommendations,
  generateProposal,
  createMatchRecord,
  validateMatchRequirements,
  validateProposalConfig,
} from "../services/matchService";
import { useToast } from "../context/ToastContext";

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProjects: (projectIds: string[]) => void;
  onSaveMatch: (
    requirements: string,
    recommendations: RecommendationResult[],
    selectedProjectIds: string[],
    clientName?: string,
    proposal?: string,
    senderType?: "agency" | "individual"
  ) => string; // Returns the match record ID
  onUpdateMatch: (
    matchId: string,
    updates: { proposal?: string; clientName?: string }
  ) => void;
}

type ModalStep = "search" | "config" | "proposal";

export const RecommendationModal: React.FC<RecommendationModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectProjects,
  onSaveMatch,
  onUpdateMatch,
}) => {
  const { showError } = useToast();
  const [step, setStep] = useState<ModalStep>("search");
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

  // Search State
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [message, setMessage] = useState("");
  const [selectedResultIds, setSelectedResultIds] = useState<Set<string>>(
    new Set()
  );
  const [hasSearched, setHasSearched] = useState(false);

  // Config State
  const [clientName, setClientName] = useState("");
  const [senderType, setSenderType] = useState<"agency" | "individual">(
    "agency"
  );
  const [senderName, setSenderName] = useState("Bukhtyar Haider");

  // Proposal State
  const [proposal, setProposal] = useState<string | null>(null);
  const [generatingProposal, setGeneratingProposal] = useState(false);

  const handleAnalyze = async () => {
    const validation = validateMatchRequirements(requirements);
    if (!validation.isValid) {
      setMessage(validation.error || "Invalid requirements");
      return;
    }

    setLoading(true);
    setHasSearched(false);
    setResults([]);
    setMessage("");

    try {
      const { recommendations, message } = await getProjectRecommendations(
        requirements,
        projects
      );

      // Only proceed if we got successful recommendations
      if (recommendations.length === 0) {
        setMessage(message || "No recommendations found.");
        setHasSearched(false);
        return;
      }

      setResults(recommendations);
      setMessage(message);
      // Auto-select all recommendations by default
      setSelectedResultIds(new Set(recommendations.map((r) => r.projectId)));
      setHasSearched(true);

      // Save match to history immediately after successful analysis
      const matchId = onSaveMatch(
        requirements,
        recommendations,
        recommendations.map((r) => r.projectId),
        undefined, // No client name yet
        undefined, // No proposal yet
        senderType
      );
      setCurrentMatchId(matchId);
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMsg = error instanceof Error ? error.message : "An error occurred while analyzing. Please try again.";
      showError(errorMsg);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToConfig = () => {
    setStep("config");
  };

  const handleGenerateProposal = async () => {
    // Require client name for proposal generation
    if (!clientName.trim()) {
      setMessage("Client name is required to generate a proposal.");
      return;
    }

    const validation = validateProposalConfig(
      Array.from(selectedResultIds),
      senderName,
      senderType
    );

    if (!validation.isValid) {
      setMessage(validation.error || "Invalid configuration");
      return;
    }

    setGeneratingProposal(true);
    try {
      const selectedProjects = projects.filter((p) =>
        selectedResultIds.has(p.id)
      );
      const text = await generateProposal(
        requirements,
        selectedProjects,
        clientName.trim(),
        senderType,
        senderName
      );
      setProposal(text);
      setStep("proposal");

      // Update existing match record with proposal and client name
      if (currentMatchId) {
        onUpdateMatch(currentMatchId, {
          proposal: text,
          clientName: clientName.trim(),
        });
      }
    } catch (e) {
      console.error("Proposal generation error:", e);
      const errorMsg =
        e instanceof Error ? e.message : "Failed to generate proposal.";
      showError(errorMsg);
      // Don't change step, stay on config so user can retry
    } finally {
      setGeneratingProposal(false);
    }
  };

  const copyProposalToClipboard = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedResultIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedResultIds(newSet);
  };

  const handleApply = () => {
    // Match already saved during analysis
    onSelectProjects(Array.from(selectedResultIds));
    handleClose();
  };

  const handleClose = () => {
    // Reset all states
    setStep("search");
    setRequirements("");
    setResults([]);
    setHasSearched(false);
    setMessage("");
    setProposal(null);
    setClientName("");
    setSenderType("agency");
    setSenderName("Bukhtyar Haider");
    setCurrentMatchId(null);
    onClose();
  };

  if (!isOpen) return null;

  // View 3: Proposal Display
  if (step === "proposal" && proposal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col border border-border">
          <div className="p-6 border-b border-border flex justify-between items-center bg-surface rounded-t-2xl">
            <h2 className="text-xl font-bold font-display text-white">
              Generated Proposal
            </h2>
            <button
              onClick={() => setStep("config")}
              className="text-textSecondary hover:text-white transition-colors"
            >
              <span className="text-sm font-semibold">Back to Config</span>
            </button>
          </div>
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <textarea
              readOnly
              value={proposal}
              className="w-full h-full p-4 bg-surfaceHighlight border border-border text-white rounded-xl focus:outline-none resize-none font-mono text-sm leading-relaxed"
            />
          </div>
          <div className="p-6 border-t border-border bg-surface rounded-b-2xl flex justify-between items-center">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 border border-border rounded-xl text-textMain font-semibold hover:bg-surfaceHighlight transition-colors"
            >
              Close
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("config")}
                className="px-5 py-2.5 border border-border rounded-xl text-textMain font-semibold hover:bg-surfaceHighlight transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={copyProposalToClipboard}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primaryHover shadow-glow transition-all active:scale-95 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                Copy Plain Text
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Configuration
  if (step === "config") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-border">
          <div className="p-6 border-b border-border flex justify-between items-center bg-surface rounded-t-2xl">
            <h2 className="text-xl font-bold font-display text-white">
              Proposal Settings
            </h2>
            <button
              onClick={() => setStep("search")}
              className="text-textSecondary hover:text-white transition-colors"
            >
              <span className="text-sm font-semibold">Back</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-textMain mb-2">
                Client Name <span className="text-red-400 font-normal">*</span>
                <span className="text-textSecondary font-normal text-xs ml-1">
                  (Required for proposal generation)
                </span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. John Smith, or Acme Corp"
                className="w-full px-4 py-2.5 bg-surfaceHighlight border border-border text-white rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-textSecondary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-textMain mb-3">
                Sender Identity{" "}
                <span className="text-textSecondary font-normal">
                  (Who is sending this?)
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setSenderType("agency")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    senderType === "agency"
                      ? "bg-primary/10 border-primary ring-1 ring-primary"
                      : "bg-surfaceHighlight border-border hover:border-textSecondary"
                  }`}
                >
                  <div className="font-bold text-white mb-1">Agency</div>
                  <div className="text-xs text-textSecondary">
                    ProntX (Software & Design Agency)
                  </div>
                </button>

                <button
                  onClick={() => setSenderType("individual")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    senderType === "individual"
                      ? "bg-primary/10 border-primary ring-1 ring-primary"
                      : "bg-surfaceHighlight border-border hover:border-textSecondary"
                  }`}
                >
                  <div className="font-bold text-white mb-1">Individual</div>
                  <div className="text-xs text-textSecondary">
                    Freelancer / Consultant
                  </div>
                </button>
              </div>

              {senderType === "individual" && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wide">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surfaceHighlight border border-border text-white rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <div className="p-4 bg-surfaceHighlight/50 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Note
                </span>
              </div>
              <p className="text-xs text-textSecondary">
                The proposal will include{" "}
                <strong>{selectedResultIds.size} selected projects</strong>. It
                will be generated in <strong>Plain Text</strong> format, ready
                for email.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-surface rounded-b-2xl flex justify-end">
            <button
              onClick={handleGenerateProposal}
              disabled={generatingProposal}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primaryGradientStart to-primaryGradientEnd text-white font-semibold rounded-xl hover:brightness-110 shadow-glow transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generatingProposal ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Writing Proposal...
                </>
              ) : (
                "Generate Proposal"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 1: Main Search & Selection (Default)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-border">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primaryGradientStart to-primaryGradientEnd text-white p-2 rounded-lg shadow-glow">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                AI Requirement Match
              </h2>
              <p className="text-xs text-textSecondary">
                Input client needs to find the best portfolio matches.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-textSecondary hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-textMain">
              Client Requirements / Project Brief
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full px-4 py-3 bg-surfaceHighlight border border-border text-white rounded-xl h-32 resize-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-textSecondary/50"
              placeholder="e.g., The client needs a fintech dashboard with dark mode and real-time stock visualization. They like vibrant colors..."
            />
            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading || !requirements.trim()}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow active:scale-95 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span>Analyze Matches</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Results Section */}
          <div>
            {!hasSearched && !loading && (
              <div className="text-center py-8 text-textSecondary">
                <svg
                  className="w-12 h-12 mx-auto mb-3 opacity-20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p>Enter requirements above to see AI-recommended projects.</p>
              </div>
            )}

            {hasSearched && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <svg
                    className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-textMain">{message}</p>
                </div>

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {results.map((result) => {
                      const project = projects.find(
                        (p) => p.id === result.projectId
                      );
                      if (!project) return null;
                      const isSelected = selectedResultIds.has(
                        result.projectId
                      );

                      return (
                        <div
                          key={result.projectId}
                          onClick={() => toggleSelect(result.projectId)}
                          className={`group p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-surfaceHighlight border-primary ring-1 ring-primary"
                              : "bg-surface border-border hover:bg-surfaceHighlight"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-textSecondary bg-transparent"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3.5 h-3.5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-white font-display">
                                  {project.name}
                                </h4>
                                <span className="text-[10px] uppercase bg-surface border border-border px-2 py-0.5 rounded text-textSecondary">
                                  {project.category}
                                </span>
                              </div>
                              <p className="text-xs text-primary mb-2 font-semibold">
                                Match Reason:{" "}
                                <span className="text-textSecondary font-normal">
                                  {result.reason}
                                </span>
                              </p>
                              <p className="text-sm text-textSecondary line-clamp-2 pl-3 border-l-2 border-border italic">
                                "{project.description}"
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-textSecondary">
                      No specific projects matched your criteria.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surface rounded-b-2xl flex justify-between items-center">
          <span className="text-sm text-textSecondary">
            {selectedResultIds.size} projects selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 border border-border rounded-xl text-textMain font-semibold hover:bg-surfaceHighlight transition-colors"
            >
              Cancel
            </button>

            {hasSearched && (
              <button
                onClick={handleProceedToConfig}
                disabled={selectedResultIds.size === 0}
                className="px-5 py-2.5 bg-surfaceHighlight border border-primary/30 text-primary font-semibold rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Generate Proposal
              </button>
            )}

            <button
              onClick={handleApply}
              disabled={selectedResultIds.size === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-primaryGradientStart to-primaryGradientEnd text-white font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow transition-all active:scale-95"
            >
              Select {selectedResultIds.size} Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
