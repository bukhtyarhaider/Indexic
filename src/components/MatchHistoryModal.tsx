import React, { useState, useEffect } from "react";
import { MatchRecord } from "../types/match";
import { Project } from "../types";
import { useToast } from "../context/ToastContext";
import {
  X,
  Clock,
  Sparkles,
  ChevronLeft,
  Trash2,
  Check,
  Play,
  FileText,
  RotateCcw,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MatchRecord[];
  projects: Project[];
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
  onDeleteRecord: (recordId: string) => void;
  onGenerateProposal: (record: MatchRecord) => Promise<void>;
  onApplyMatch: (projectIds: string[]) => void;
  onRemoveProject: (recordId: string, projectId: string) => void;
  onUpdateRecord?: (recordId: string, updates: Partial<MatchRecord>) => void;
  onReanalyzeMatch?: (recordId: string, requirements: string) => Promise<void>;
}

type TabType = "recommendations" | "proposal";

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  projects,
  selectedRecordId,
  onSelectRecord,
  onDeleteRecord,
  onGenerateProposal,
  onApplyMatch,
  onRemoveProject,
  onUpdateRecord,
  onReanalyzeMatch,
}) => {
  const { showError } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("recommendations");

  // Proposal-specific fields
  const [proposalClientName, setProposalClientName] = useState("");
  const [proposalSenderType, setProposalSenderType] = useState<
    "agency" | "individual"
  >("agency");
  const [showProposalSettings, setShowProposalSettings] = useState(false);

  // Re-analysis fields
  const [showEditRequirements, setShowEditRequirements] = useState(false);
  const [editRequirements, setEditRequirements] = useState("");
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Track locally selected project IDs (for selection/unselection without removal)
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);

  // Ensure history is an array
  const safeHistory = Array.isArray(history) ? history : [];

  const selectedRecord = safeHistory.find((r) => r.id === selectedRecordId);
  const sortedHistory = [...safeHistory].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  // Initialize local selection when record changes
  useEffect(() => {
    if (selectedRecord) {
      setLocalSelectedIds(selectedRecord.selectedProjectIds || []);
      setProposalClientName(selectedRecord.clientName || "");
      setProposalSenderType(selectedRecord.senderType || "agency");
      setShowProposalSettings(false);
      setShowEditRequirements(false);
      setEditRequirements(selectedRecord.requirements || "");
    }
  }, [selectedRecordId, selectedRecord?.selectedProjectIds?.length]);

  // Get all recommended projects (both selected and unselected)
  const getRecommendedProjects = (record: MatchRecord) => {
    if (
      !record ||
      !record.recommendations ||
      !Array.isArray(record.recommendations)
    ) {
      return [];
    }
    return record.recommendations
      .map((rec) => ({
        project: projects.find((p) => p.id === rec.projectId),
        reason: rec.reason,
      }))
      .filter(
        (item): item is { project: Project; reason: string } => !!item.project
      );
  };

  // Get only selected projects for proposal
  const getSelectedProjects = () => {
    return localSelectedIds
      .map((id) => projects.find((p) => p.id === id))
      .filter((p): p is Project => !!p);
  };

  const copyProposal = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDelete = () => {
    if (selectedRecord) {
      onDeleteRecord(selectedRecord.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (selectedRecord && !isGenerating) {
      const updatedRecord: MatchRecord = {
        ...selectedRecord,
        clientName: proposalClientName.trim() || undefined,
        senderType: proposalSenderType,
        selectedProjectIds: localSelectedIds,
      };

      if (onUpdateRecord) {
        onUpdateRecord(selectedRecord.id, {
          clientName: proposalClientName.trim() || undefined,
          senderType: proposalSenderType,
          selectedProjectIds: localSelectedIds,
        });
      }

      setIsGenerating(true);
      try {
        await onGenerateProposal(updatedRecord);
      } catch (error) {
        console.error("Error generating proposal:", error);
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to generate proposal. Please try again.";
        showError(errorMsg);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleApplySelectedProjects = () => {
    onApplyMatch(localSelectedIds);
  };

  const handleReanalyze = async () => {
    if (selectedRecord && editRequirements.trim() && onReanalyzeMatch) {
      setIsReanalyzing(true);
      try {
        await onReanalyzeMatch(selectedRecord.id, editRequirements.trim());
        setShowEditRequirements(false);
      } catch (error) {
        console.error("Error re-analyzing:", error);
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to re-analyze. Please try again.";
        showError(errorMsg);
      } finally {
        setIsReanalyzing(false);
      }
    }
  };

  const selectedCount = localSelectedIds.length;
  const recommendedProjects = selectedRecord
    ? getRecommendedProjects(selectedRecord)
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card
        variant="surface"
        className="w-full h-full sm:h-[85vh] sm:max-w-5xl flex flex-col sm:flex-row border-0 sm:border border-border overflow-hidden p-0"
      >
        {/* Left Sidebar: History List */}
        <div
          className={`${
            selectedRecordId ? "hidden sm:flex" : "flex"
          } w-full sm:w-1/3 border-r-0 sm:border-r border-border flex-col bg-surface h-full`}
        >
          {/* Mobile Header */}
          <div className="p-4 sm:p-5 border-b border-border flex justify-between items-center sticky top-0 bg-surface z-10">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Match History
              </h2>
              <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5 sm:mt-1">
                AI matches & proposals
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sortedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center text-text-secondary">
                <Clock className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-20" />
                <p className="text-sm sm:text-base font-medium text-text-main mb-1">
                  No history yet
                </p>
                <p className="text-xs sm:text-sm max-w-[200px]">
                  AI match results will appear here after you run your first
                  match.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedHistory.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => onSelectRecord(record.id)}
                    className={`w-full text-left p-3 sm:p-4 hover:bg-surface-highlight transition-colors ${
                      selectedRecordId === record.id
                        ? "bg-surface-highlight border-l-2 border-primary"
                        : "border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] sm:text-xs font-mono text-text-secondary">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        {record.proposal && (
                          <Badge variant="success" className="text-[9px] py-0">
                            Proposal
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[9px] py-0">
                          {record.selectedProjectIds?.length || 0} Projects
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-text-secondary line-clamp-2 sm:line-clamp-3 mt-1">
                      {String(record.requirements || "").slice(0, 100)}...
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Details */}
        <div
          className={`${
            selectedRecordId ? "flex" : "hidden sm:flex"
          } flex-1 w-full sm:w-2/3 bg-surface sm:bg-surface-highlight/20 flex-col h-full`}
        >
          {selectedRecord ? (
            <>
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-border bg-surface flex items-center gap-3">
                {/* Mobile Back Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden -ml-2"
                  onClick={() => onSelectRecord("")}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base sm:text-lg truncate">
                    AI Match Results
                  </h3>
                  <p className="text-[10px] sm:text-xs text-text-secondary">
                    {new Date(selectedRecord.timestamp).toLocaleDateString()} •{" "}
                    {selectedCount}/{recommendedProjects.length} selected
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    onClick={handleApplySelectedProjects}
                    disabled={selectedCount === 0}
                    variant="secondary"
                    className="text-primary hover:text-primary-hover border-primary/20 bg-surface-highlight"
                    leftIcon={<Check className="w-4 h-4" />}
                    title="Apply selected projects"
                  >
                    <span className="hidden sm:inline">Apply</span>
                  </Button>

                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="ghost"
                    className="text-text-secondary hover:text-red-400 hover:bg-red-500/10"
                    size="icon"
                    title="Delete match"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={onClose}
                    size="icon"
                    className="hidden sm:flex"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border bg-surface">
                <button
                  onClick={() => setActiveTab("recommendations")}
                  className={`flex-1 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    activeTab === "recommendations"
                      ? "text-primary border-b-2 border-primary bg-surface-highlight/30"
                      : "text-text-secondary hover:text-white hover:bg-surface-highlight/20"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Recommendations</span>
                  <span className="sm:hidden">Projects</span>
                  <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px]">
                    {recommendedProjects.length}
                  </Badge>
                </button>
                <button
                  onClick={() => setActiveTab("proposal")}
                  className={`flex-1 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    activeTab === "proposal"
                      ? "text-primary border-b-2 border-primary bg-surface-highlight/30"
                      : "text-text-secondary hover:text-white hover:bg-surface-highlight/20"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Proposal
                  {selectedRecord.proposal && (
                    <Badge variant="success" className="px-1.5 py-0.5 text-[10px]">✓</Badge>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {activeTab === "recommendations" ? (
                  /* Recommendations Tab */
                  <>
                    {/* Requirements Section */}
                    <Card variant="surface" className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase">
                          Requirements
                        </h4>
                        {onReanalyzeMatch && (
                          <button
                            onClick={() => {
                              setShowEditRequirements(!showEditRequirements);
                              if (!showEditRequirements) {
                                setEditRequirements(
                                  selectedRecord.requirements || ""
                                );
                              }
                            }}
                            className="text-[10px] sm:text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            {showEditRequirements
                              ? "Cancel"
                              : "Edit & Re-analyze"}
                          </button>
                        )}
                      </div>

                      {showEditRequirements ? (
                        <div className="space-y-2 sm:space-y-3">
                          <textarea
                            value={editRequirements}
                            onChange={(e) =>
                              setEditRequirements(e.target.value)
                            }
                            className="w-full h-24 sm:h-32 px-2.5 sm:px-3 py-2 bg-surface-highlight border border-border rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-primary resize-none"
                            placeholder="Enter project requirements for AI matching"
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <p className="text-[10px] sm:text-xs text-text-secondary">
                              Update requirements and get new AI recommendations
                            </p>
                            <Button
                              onClick={handleReanalyze}
                              disabled={
                                isReanalyzing ||
                                !editRequirements.trim() ||
                                editRequirements.trim() ===
                                  selectedRecord.requirements
                              }
                              isLoading={isReanalyzing}
                              variant="primary"
                              size="sm"
                            >
                              Re-analyze
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-text-main whitespace-pre-wrap line-clamp-4 sm:line-clamp-none">
                          {String(selectedRecord.requirements || "")}
                        </p>
                      )}
                    </Card>

                    {/* Selection Help */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-blue-300">
                        <span className="font-semibold">Tip:</span> Click on
                        projects to select/unselect them. Selected projects will
                        be used when generating a proposal.
                      </p>
                    </div>

                    {/* Recommended Projects with Selection */}
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase mb-2 sm:mb-3 px-1">
                        AI Recommended Projects ({recommendedProjects.length})
                        <span className="text-primary ml-1 sm:ml-2">
                          • {selectedCount} selected
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        {recommendedProjects.map(({ project: p, reason }) => {
                          const isSelected = localSelectedIds.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => toggleProjectSelection(p.id)}
                              className={`flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-primary/10 border-primary/50"
                                  : "bg-surface border-border hover:border-primary/30"
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                {/* Checkbox */}
                                <div
                                  className={`h-4 w-4 sm:h-5 sm:w-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "border-border"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-surface-highlight flex items-center justify-center text-[10px] sm:text-xs font-bold text-text-secondary flex-shrink-0">
                                  {p.profileOwner.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                                    {p.name}
                                  </h5>
                                  <div className="flex gap-2 text-[10px] sm:text-xs text-text-secondary">
                                    <span>{p.category}</span>
                                  </div>
                                </div>
                                <a
                                  href={p.links[0]?.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-primary hover:text-white flex-shrink-0 p-1 hover:bg-primary/20 rounded transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                              {reason && (
                                <div className="pl-8 sm:pl-14 pr-1 sm:pr-2">
                                  <p className="text-[10px] sm:text-xs text-text-secondary italic line-clamp-2">
                                    <span className="font-semibold text-primary">
                                      Why:
                                    </span>{" "}
                                    {reason}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Proposal Tab */
                  <>
                    {/* Proposal Settings */}
                    <Card variant="surface" className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase">
                          Proposal Settings
                        </h4>
                        <button
                          onClick={() =>
                            setShowProposalSettings(!showProposalSettings)
                          }
                          className="text-[10px] sm:text-xs text-primary hover:underline"
                        >
                          {showProposalSettings ? "Hide" : "Edit"}
                        </button>
                      </div>

                      {showProposalSettings ? (
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-text-secondary mb-1 sm:mb-1.5">
                              Client Name{" "}
                              <span className="text-text-secondary/60">
                                (for personalized proposal)
                              </span>
                            </label>
                            <Input
                              value={proposalClientName}
                              onChange={(e) =>
                                setProposalClientName(e.target.value)
                              }
                              placeholder="Enter client name"
                              className="text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-text-secondary mb-1 sm:mb-1.5">
                              Sender Type
                            </label>
                            <div className="flex gap-2 sm:gap-3">
                              <button
                                onClick={() => setProposalSenderType("agency")}
                                className={`flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                  proposalSenderType === "agency"
                                    ? "bg-primary text-white"
                                    : "bg-surface-highlight text-text-secondary hover:text-white"
                                }`}
                              >
                                Agency
                              </button>
                              <button
                                onClick={() =>
                                  setProposalSenderType("individual")
                                }
                                className={`flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                  proposalSenderType === "individual"
                                    ? "bg-primary text-white"
                                    : "bg-surface-highlight text-text-secondary hover:text-white"
                                }`}
                              >
                                Individual
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-text-secondary">
                              Client:{" "}
                            </span>
                            <span className="text-white">
                              {proposalClientName || "Not set"}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-secondary">
                              Sender:{" "}
                            </span>
                            <span className="text-white capitalize">
                              {proposalSenderType}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Selected Projects for Proposal */}
                    <Card variant="surface" className="p-3 sm:p-4">
                      <h4 className="text-[10px] sm:text-xs font-bold text-text-secondary uppercase mb-2 sm:mb-3">
                        Projects for Proposal ({selectedCount})
                      </h4>
                      {selectedCount > 0 ? (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {getSelectedProjects().map((p) => (
                            <Badge key={p.id} variant="secondary">
                              {p.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-text-secondary">
                          No projects selected. Go to the "AI Recommendations"
                          tab to select projects.
                        </p>
                      )}
                    </Card>

                    {/* Generate Proposal Button */}
                    <Button
                      onClick={handleGenerateProposal}
                      disabled={isGenerating || selectedCount === 0}
                      isLoading={isGenerating}
                      className="w-full"
                      variant="primary"
                    >
                      Generating Proposal
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Empty State for Right content */
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-text-secondary">
              <Sparkles className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-text-main">
                Select a match record
              </p>
              <p className="max-w-xs">
                Choose a history item from the list to view details, update
                requirements, or generate proposals.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal (Native-ish logic but styled) */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card variant="surface" className="w-[90%] max-w-sm p-6 border border-border shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Delete Match?
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Are you sure you want to delete this match record? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleDelete} variant="danger">
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
