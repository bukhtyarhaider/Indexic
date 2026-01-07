import React, { useState, useEffect } from "react";
import { MatchRecord } from "../types/match";
import { Project } from "../types";

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
      // Update the record with proposal settings and selected projects before generating
      const updatedRecord: MatchRecord = {
        ...selectedRecord,
        clientName: proposalClientName.trim() || undefined,
        senderType: proposalSenderType,
        selectedProjectIds: localSelectedIds,
      };

      // Update record if handler available
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
      } finally {
        setIsReanalyzing(false);
      }
    }
  };

  // Count of selected projects
  const selectedCount = localSelectedIds.length;
  const recommendedProjects = selectedRecord
    ? getRecommendedProjects(selectedRecord)
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex border border-border overflow-hidden">
        {/* Left Sidebar: List */}
        <div className="w-1/3 border-r border-border flex flex-col bg-surface">
          <div className="p-5 border-b border-border">
            <h2 className="text-xl font-bold font-display text-white">
              Match History
            </h2>
            <p className="text-xs text-textSecondary mt-1">
              AI matches & proposals
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sortedHistory.length === 0 ? (
              <div className="p-8 text-center text-textSecondary">
                <p className="text-sm">No history yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedHistory.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => onSelectRecord(record.id)}
                    className={`w-full text-left p-4 hover:bg-surfaceHighlight transition-colors ${
                      selectedRecordId === record.id
                        ? "bg-surfaceHighlight border-l-2 border-primary"
                        : "border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono text-textSecondary">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        {record.proposal && (
                          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold">
                            Proposal
                          </span>
                        )}
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold">
                          {record.selectedProjectIds?.length || 0} Projects
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-textSecondary line-clamp-3 mt-1">
                      {String(record.requirements || "").slice(0, 100)}...
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Details */}
        <div className="w-2/3 bg-surfaceHighlight/20 flex flex-col">
          {selectedRecord ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-border bg-surface flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-lg">
                    AI Match Results
                  </h3>
                  <p className="text-xs text-textSecondary">
                    {new Date(selectedRecord.timestamp).toLocaleString()} •{" "}
                    {selectedCount} of {recommendedProjects.length} selected
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Apply Selection Button */}
                  <button
                    onClick={handleApplySelectedProjects}
                    disabled={selectedCount === 0}
                    className="px-3 py-1.5 bg-surface-highlight border border-border text-white text-xs font-semibold rounded-lg hover:bg-surface hover:border-primary transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    title="Apply selected projects to dashboard"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Apply Selection
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1.5 text-textSecondary hover:text-red-400 transition-colors"
                    title="Delete match"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="p-1.5 text-textSecondary hover:text-white transition-colors"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border bg-surface">
                <button
                  onClick={() => setActiveTab("recommendations")}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === "recommendations"
                      ? "text-primary border-b-2 border-primary bg-surfaceHighlight/30"
                      : "text-textSecondary hover:text-white hover:bg-surfaceHighlight/20"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    AI Recommendations
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                      {recommendedProjects.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("proposal")}
                  className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === "proposal"
                      ? "text-primary border-b-2 border-primary bg-surfaceHighlight/30"
                      : "text-textSecondary hover:text-white hover:bg-surfaceHighlight/20"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
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
                    Proposal
                    {selectedRecord.proposal && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                        Generated
                      </span>
                    )}
                  </div>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === "recommendations" ? (
                  /* Recommendations Tab */
                  <>
                    {/* Requirements Section with Edit Option */}
                    <div className="bg-surface p-4 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-textSecondary uppercase">
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
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            {showEditRequirements
                              ? "Cancel"
                              : "Edit & Re-analyze"}
                          </button>
                        )}
                      </div>

                      {showEditRequirements ? (
                        <div className="space-y-3">
                          <textarea
                            value={editRequirements}
                            onChange={(e) =>
                              setEditRequirements(e.target.value)
                            }
                            className="w-full h-32 px-3 py-2 bg-surfaceHighlight border border-border rounded-lg text-white text-sm focus:outline-none focus:border-primary resize-none"
                            placeholder="Enter project requirements for AI matching"
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-textSecondary">
                              Update requirements and get new AI recommendations
                            </p>
                            <button
                              onClick={handleReanalyze}
                              disabled={
                                isReanalyzing ||
                                !editRequirements.trim() ||
                                editRequirements.trim() ===
                                  selectedRecord.requirements
                              }
                              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                              {isReanalyzing ? (
                                <>
                                  <svg
                                    className="animate-spin h-3.5 w-3.5"
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
                                  Re-analyzing...
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                  </svg>
                                  Re-analyze
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-textMain whitespace-pre-wrap">
                          {String(selectedRecord.requirements || "")}
                        </p>
                      )}
                    </div>

                    {/* Selection Help */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-xs text-blue-300">
                        <span className="font-semibold">Tip:</span> Click on
                        projects to select/unselect them. Selected projects will
                        be used when generating a proposal.
                      </p>
                    </div>

                    {/* Recommended Projects with Selection */}
                    <div>
                      <h4 className="text-xs font-bold text-textSecondary uppercase mb-3 px-1">
                        AI Recommended Projects ({recommendedProjects.length})
                        <span className="text-primary ml-2">
                          • {selectedCount} selected
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {recommendedProjects.map(({ project: p, reason }) => {
                          const isSelected = localSelectedIds.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => toggleProjectSelection(p.id)}
                              className={`flex flex-col gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-primary/10 border-primary/50"
                                  : "bg-surface border-border hover:border-primary/30"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Checkbox */}
                                <div
                                  className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "border-border"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-3 h-3 text-white"
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
                                <div className="h-8 w-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-xs font-bold text-textSecondary flex-shrink-0">
                                  {p.profileOwner.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-bold text-white truncate">
                                    {p.name}
                                  </h5>
                                  <div className="flex gap-2 text-xs text-textSecondary">
                                    <span>{p.category}</span>
                                  </div>
                                </div>
                                <a
                                  href={p.links[0]?.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-primary hover:text-white text-xs font-medium flex-shrink-0 px-2 py-1 hover:bg-primary/20 rounded transition-colors"
                                >
                                  View
                                </a>
                              </div>
                              {reason && (
                                <div className="pl-14 pr-2">
                                  <p className="text-xs text-textSecondary italic">
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
                    <div className="bg-surface p-4 rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-textSecondary uppercase">
                          Proposal Settings
                        </h4>
                        <button
                          onClick={() =>
                            setShowProposalSettings(!showProposalSettings)
                          }
                          className="text-xs text-primary hover:underline"
                        >
                          {showProposalSettings ? "Hide" : "Edit"}
                        </button>
                      </div>

                      {showProposalSettings ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-textSecondary mb-1.5">
                              Client Name{" "}
                              <span className="text-textSecondary/60">
                                (for personalized proposal)
                              </span>
                            </label>
                            <input
                              type="text"
                              value={proposalClientName}
                              onChange={(e) =>
                                setProposalClientName(e.target.value)
                              }
                              className="w-full px-3 py-2 bg-surfaceHighlight border border-border rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                              placeholder="Enter client name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-textSecondary mb-1.5">
                              Sender Type
                            </label>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setProposalSenderType("agency")}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  proposalSenderType === "agency"
                                    ? "bg-primary text-white"
                                    : "bg-surfaceHighlight text-textSecondary hover:text-white"
                                }`}
                              >
                                Agency
                              </button>
                              <button
                                onClick={() =>
                                  setProposalSenderType("individual")
                                }
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  proposalSenderType === "individual"
                                    ? "bg-primary text-white"
                                    : "bg-surfaceHighlight text-textSecondary hover:text-white"
                                }`}
                              >
                                Individual
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-textSecondary">Client: </span>
                            <span className="text-white">
                              {proposalClientName || "Not set"}
                            </span>
                          </div>
                          <div>
                            <span className="text-textSecondary">Sender: </span>
                            <span className="text-white capitalize">
                              {proposalSenderType}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selected Projects for Proposal */}
                    <div className="bg-surface p-4 rounded-xl border border-border">
                      <h4 className="text-xs font-bold text-textSecondary uppercase mb-3">
                        Projects for Proposal ({selectedCount})
                      </h4>
                      {selectedCount > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {getSelectedProjects().map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full"
                            >
                              <span className="text-sm text-white">
                                {p.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-textSecondary">
                          No projects selected. Go to the "AI Recommendations"
                          tab to select projects.
                        </p>
                      )}
                    </div>

                    {/* Generate Proposal Button */}
                    <button
                      onClick={handleGenerateProposal}
                      disabled={isGenerating || selectedCount === 0}
                      className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
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
                          Generating Proposal...
                        </>
                      ) : (
                        <>
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
                          {selectedRecord.proposal ? "Regenerate" : "Generate"}{" "}
                          Proposal
                        </>
                      )}
                    </button>

                    {/* Generated Proposal */}
                    {selectedRecord.proposal && (
                      <div className="flex flex-col h-80">
                        <div className="flex justify-between items-center mb-2 px-1">
                          <h4 className="text-xs font-bold text-textSecondary uppercase">
                            Generated Proposal
                          </h4>
                          <button
                            onClick={() =>
                              copyProposal(selectedRecord.proposal!)
                            }
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <svg
                              className="w-3.5 h-3.5"
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
                            Copy
                          </button>
                        </div>
                        <textarea
                          readOnly
                          className="flex-1 w-full p-4 bg-surface border border-border rounded-xl text-white font-mono text-sm resize-none focus:outline-none"
                          value={selectedRecord.proposal}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-textSecondary">
              <svg
                className="w-16 h-16 mb-4 opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>Select a history item to view details</p>
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-surfaceHighlight"
              >
                Close History
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-2xl max-w-md w-full border border-border p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              Delete Match History?
            </h3>
            <p className="text-sm text-textSecondary mb-6">
              Are you sure you want to delete this AI match? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-border rounded-lg text-textMain font-semibold hover:bg-surfaceHighlight transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
