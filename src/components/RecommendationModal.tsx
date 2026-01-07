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
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred while analyzing. Please try again.";
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
        <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl h-[90vh] sm:h-[85vh] flex flex-col border border-border">
          <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface rounded-t-2xl sm:rounded-t-2xl">
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              Generated Proposal
            </h2>
            <button
              onClick={() => setStep("config")}
              className="text-text-secondary hover:text-white transition-colors"
            >
              <span className="text-xs sm:text-sm font-semibold">
                Back to Config
              </span>
            </button>
          </div>
          <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
            <textarea
              readOnly
              value={proposal}
              className="w-full h-full p-3 sm:p-4 bg-surface-highlight border border-border text-white rounded-lg sm:rounded-xl focus:outline-none resize-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>
          <div className="p-4 sm:p-6 border-t border-border bg-surface rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={handleClose}
              className="hidden sm:block px-5 py-2.5 border border-border rounded-xl text-text-main font-semibold hover:bg-surface-highlight transition-colors"
            >
              Close
            </button>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setStep("config")}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl text-text-main font-semibold hover:bg-surface-highlight transition-colors text-sm"
              >
                Regenerate
              </button>
              <button
                onClick={copyProposalToClipboard}
                className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-white font-semibold rounded-lg sm:rounded-xl hover:bg-primary-hover shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
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
                <span className="hidden xs:inline">Copy Plain Text</span>
                <span className="xs:hidden">Copy</span>
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
        <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col border border-border max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface rounded-t-2xl">
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              Proposal Settings
            </h2>
            <button
              onClick={() => setStep("search")}
              className="text-text-secondary hover:text-white transition-colors"
            >
              <span className="text-xs sm:text-sm font-semibold">Back</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-main mb-1.5 sm:mb-2">
                Client Name <span className="text-red-400 font-normal">*</span>
                <span className="text-text-secondary font-normal text-[10px] sm:text-xs ml-1">
                  (Required for proposal)
                </span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. John Smith, or Acme Corp"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-surface-highlight border border-border text-white rounded-lg sm:rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-text-secondary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-main mb-2 sm:mb-3">
                Sender Identity{" "}
                <span className="text-text-secondary font-normal text-[10px] sm:text-xs">
                  (Who is sending this?)
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <button
                  onClick={() => setSenderType("agency")}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border text-left transition-all ${
                    senderType === "agency"
                      ? "bg-primary/10 border-primary ring-1 ring-primary"
                      : "bg-surface-highlight border-border hover:border-text-secondary"
                  }`}
                >
                  <div className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">
                    Agency
                  </div>
                  <div className="text-[10px] sm:text-xs text-text-secondary">
                    ProntX (Software & Design)
                  </div>
                </button>

                <button
                  onClick={() => setSenderType("individual")}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border text-left transition-all ${
                    senderType === "individual"
                      ? "bg-primary/10 border-primary ring-1 ring-primary"
                      : "bg-surface-highlight border-border hover:border-text-secondary"
                  }`}
                >
                  <div className="font-bold text-white text-xs sm:text-sm mb-0.5 sm:mb-1">
                    Individual
                  </div>
                  <div className="text-[10px] sm:text-xs text-text-secondary">
                    Freelancer / Consultant
                  </div>
                </button>
              </div>

              {senderType === "individual" && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] sm:text-xs font-semibold text-text-secondary mb-1 sm:mb-1.5 uppercase tracking-wide">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-surface-highlight border border-border text-white rounded-lg sm:rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 bg-surface-highlight/50 rounded-lg sm:rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary"
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
                <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                  Note
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-text-secondary">
                The proposal will include{" "}
                <strong>{selectedResultIds.size} selected projects</strong>. It
                will be generated in <strong>Plain Text</strong> format.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-border bg-surface rounded-b-2xl flex justify-end">
            <button
              onClick={handleGenerateProposal}
              disabled={generatingProposal}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-gradient-to-r from-primary-gradient-start to-primary-gradient-end text-white font-semibold rounded-lg sm:rounded-xl hover:brightness-110 shadow-glow transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-border">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface z-10 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary text-white p-1.5 sm:p-2 rounded-lg shadow-glow">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
              <h2 className="text-base sm:text-xl font-bold font-display text-white">
                AI Requirement Match
              </h2>
              <p className="text-[10px] sm:text-xs text-text-secondary hidden sm:block">
                Input client needs to find the best portfolio matches.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-white transition-colors p-1"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Input Section */}
          <div className="space-y-2 sm:space-y-3">
            <label className="block text-xs sm:text-sm font-semibold text-text-main">
              Client Requirements / Project Brief
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-highlight border border-border text-white rounded-lg sm:rounded-xl h-24 sm:h-32 resize-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-text-secondary/50 text-sm"
              placeholder="e.g., The client needs a fintech dashboard with dark mode and real-time stock visualization..."
            />
            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading || !requirements.trim()}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-white font-semibold rounded-lg sm:rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow active:scale-95 flex items-center gap-2 text-sm"
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
              <div className="text-center py-6 sm:py-8 text-text-secondary">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-20"
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
                <p className="text-xs sm:text-sm">
                  Enter requirements above to see AI-recommended projects.
                </p>
              </div>
            )}

            {hasSearched && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5"
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
                  <p className="text-xs sm:text-sm text-text-main">{message}</p>
                </div>

                {results.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
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
                          className={`group p-3 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-surface-highlight border-primary ring-1 ring-primary"
                              : "bg-surface border-border hover:bg-surface-highlight"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 sm:gap-4">
                            <div
                              className={`mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-text-secondary bg-transparent"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white"
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
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-1">
                                <h4 className="font-bold text-white font-display text-sm sm:text-base truncate">
                                  {project.name}
                                </h4>
                                <span className="text-[9px] sm:text-[10px] uppercase bg-surface border border-border px-1.5 sm:px-2 py-0.5 rounded text-text-secondary w-fit flex-shrink-0">
                                  {project.category}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-primary mb-1.5 sm:mb-2 font-semibold">
                                Match:{" "}
                                <span className="text-text-secondary font-normal">
                                  {result.reason}
                                </span>
                              </p>
                              <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 pl-2 sm:pl-3 border-l-2 border-border italic">
                                "{project.description}"
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-text-secondary text-xs sm:text-sm">
                      No specific projects matched your criteria.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-surface rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs sm:text-sm text-text-secondary order-2 sm:order-1">
            {selectedResultIds.size} projects selected
          </span>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl text-text-main font-semibold hover:bg-surface-highlight transition-colors text-sm"
            >
              Cancel
            </button>

            {hasSearched && (
              <button
                onClick={handleProceedToConfig}
                disabled={selectedResultIds.size === 0}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 bg-surface-highlight border border-primary/30 text-primary font-semibold rounded-lg sm:rounded-xl hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-sm"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                <span className="hidden xs:inline">Generate Proposal</span>
                <span className="xs:hidden">Proposal</span>
              </button>
            )}

            <button
              onClick={handleApply}
              disabled={selectedResultIds.size === 0}
              className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-white border border-border rounded-lg sm:rounded-xl hover:text-white hover:bg-primary/70 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow transition-all active:scale-95 text-sm"
            >
              <span className="hidden xs:inline">
                Select {selectedResultIds.size}
              </span>
              <span className="xs:hidden">Select</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
