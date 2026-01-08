import React, { useState } from "react";
import { Project } from "../types";
import { RecommendationResult } from "../types/match";
import {
  getProjectRecommendations,
  generateProposal,
  validateMatchRequirements,
  validateProposalConfig,
} from "../services/matchService";
import { useToast } from "../context/ToastContext";
import {
  Sparkles,
  X,
  Search,
  Check,
  Copy,
  ChevronLeft,
  FileText,
  Loader2,
  Info,
  User,
  Building2,
  Briefcase,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
  ) => string;
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

      if (recommendations.length === 0) {
        setMessage(message || "No recommendations found.");
        setHasSearched(false);
        return;
      }

      setResults(recommendations);
      setMessage(message);
      setSelectedResultIds(new Set(recommendations.map((r) => r.projectId)));
      setHasSearched(true);

      const matchId = onSaveMatch(
        requirements,
        recommendations,
        recommendations.map((r) => r.projectId),
        undefined,
        undefined,
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
    onSelectProjects(Array.from(selectedResultIds));
    handleClose();
  };

  const handleClose = () => {
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

  // Render View 3: Proposal Display
  if (step === "proposal" && proposal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
        <Card variant="surface" className="w-full sm:max-w-3xl h-[90vh] sm:h-[85vh] flex flex-col border border-border p-0 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Generated Proposal
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => setStep("config")}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back to Config
            </Button>
          </div>
          <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
            <textarea
              readOnly
              value={proposal}
              className="w-full h-full p-3 sm:p-4 bg-surface-highlight border border-border text-white rounded-lg sm:rounded-xl focus:outline-none resize-none font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>
          <div className="p-4 sm:p-6 border-t border-border bg-surface flex flex-col sm:flex-row justify-between items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="hidden sm:flex"
            >
              Close
            </Button>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={() => setStep("config")}
                className="flex-1 sm:flex-initial"
              >
                Regenerate
              </Button>
              <Button
                variant="primary"
                onClick={copyProposalToClipboard}
                className="flex-1 sm:flex-initial shadow-glow"
                leftIcon={<Copy className="w-4 h-4" />}
              >
                Copy Text
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Render View 2: Configuration
  if (step === "config") {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
        <Card variant="surface" className="w-full sm:max-w-lg flex flex-col border border-border max-h-[90vh] overflow-y-auto p-0">
          <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Proposal Settings
              </h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => setStep("search")}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-main mb-1.5 sm:mb-2">
                Client Name <span className="text-red-400 font-normal">*</span>
              </label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="text-white"
                leftIcon={<Briefcase className="w-4 h-4 text-text-secondary" />}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-main mb-2 sm:mb-3">
                Sender Identity
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
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className={`w-4 h-4 ${senderType === "agency" ? "text-primary" : "text-text-secondary"}`} />
                    <div className="font-bold text-white text-xs sm:text-sm">
                      Agency
                    </div>
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
                  <div className="flex items-center gap-2 mb-1">
                    <User className={`w-4 h-4 ${senderType === "individual" ? "text-primary" : "text-text-secondary"}`} />
                    <div className="font-bold text-white text-xs sm:text-sm">
                      Individual
                    </div>
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
                  <Input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="text-white"
                  />
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 bg-surface-highlight/50 rounded-lg sm:rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2 text-primary">
                <Info className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white">
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

          <div className="p-4 sm:p-6 border-t border-border bg-surface flex justify-end">
            <Button
              onClick={handleGenerateProposal}
              disabled={generatingProposal}
              isLoading={generatingProposal}
              variant="primary"
              className="w-full sm:w-auto shadow-glow"
              leftIcon={!generatingProposal && <Wand2 className="w-4 h-4" />}
            >
              Generate Proposal
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render View 1: Main Search & Selection (Default)
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
      <Card variant="surface" className="w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-border p-0 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary text-white p-1.5 sm:p-2 rounded-lg shadow-glow">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-text-secondary hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
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
              <Button
                onClick={handleAnalyze}
                disabled={loading || !requirements.trim()}
                isLoading={loading}
                variant="primary"
                className="shadow-glow"
                leftIcon={!loading && <Sparkles className="w-4 h-4" />}
              >
                Analyze Matches
              </Button>
            </div>
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Results Section */}
          <div>
            {!hasSearched && !loading && (
              <div className="text-center py-6 sm:py-8 text-text-secondary">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-20" />
                <p className="text-xs sm:text-sm">
                  Enter requirements above to see AI-recommended projects.
                </p>
              </div>
            )}

            {hasSearched && (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
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
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-1">
                                <h4 className="font-bold text-white font-display text-sm sm:text-base truncate">
                                  {project.name}
                                </h4>
                                <Badge className="w-fit">{project.category}</Badge>
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
        <div className="p-4 sm:p-6 border-t border-border bg-surface flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs sm:text-sm text-text-secondary order-2 sm:order-1">
            {selectedResultIds.size} projects selected
          </span>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>

            {hasSearched && (
              <Button
                variant="secondary"
                onClick={handleProceedToConfig}
                disabled={selectedResultIds.size === 0}
                className="flex-1 sm:flex-initial bg-surface-highlight border-primary/30 text-primary hover:bg-primary/10"
                leftIcon={<FileText className="w-4 h-4" />}
              >
                <span className="hidden xs:inline">Generate Proposal</span>
                <span className="xs:hidden">Proposal</span>
              </Button>
            )}

            <Button
              variant="primary"
              onClick={handleApply}
              disabled={selectedResultIds.size === 0}
              className="flex-1 sm:flex-initial shadow-glow"
            >
              <span className="hidden xs:inline">
                Select {selectedResultIds.size}
              </span>
              <span className="xs:hidden">Select</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
