import React, { useState } from "react";
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
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  projects,
  selectedRecordId,
  onSelectRecord,
  onDeleteRecord,
  onGenerateProposal,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  // Ensure history is an array
  const safeHistory = Array.isArray(history) ? history : [];

  const selectedRecord = safeHistory.find((r) => r.id === selectedRecordId);
  const sortedHistory = [...safeHistory].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const getMatchedProjects = (record: MatchRecord) => {
    if (
      !record ||
      !record.selectedProjectIds ||
      !Array.isArray(record.selectedProjectIds)
    ) {
      return [];
    }
    return record.selectedProjectIds
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
      setIsGenerating(true);
      try {
        await onGenerateProposal(selectedRecord);
      } finally {
        setIsGenerating(false);
      }
    }
  };

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
              Saved searches & proposals
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
                      {record.proposal && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold">
                          Proposal
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-white text-sm truncate mb-1">
                      {record.clientName || "Unknown Client"}
                    </h4>
                    <p className="text-xs text-textSecondary line-clamp-2">
                      {String(record.requirements || "")}
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
              <div className="p-5 border-b border-border bg-surface flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {selectedRecord.clientName
                      ? `Match for ${selectedRecord.clientName}`
                      : "Match Details"}
                  </h3>
                  <p className="text-xs text-textSecondary">
                    Sender: {String(selectedRecord.senderType || "agency")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Generate/Regenerate Proposal Button */}
                  <button
                    onClick={handleGenerateProposal}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    {isGenerating ? (
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
                        Generating...
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {selectedRecord.proposal ? "Regenerate" : "Generate"}{" "}
                        Proposal
                      </>
                    )}
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

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Requirements */}
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <h4 className="text-xs font-bold text-textSecondary uppercase mb-2">
                    Requirements
                  </h4>
                  <p className="text-sm text-textMain">
                    {String(selectedRecord.requirements || "")}
                  </p>
                </div>

                {/* Matched Projects */}
                <div>
                  <h4 className="text-xs font-bold text-textSecondary uppercase mb-3 px-1">
                    Selected Projects (
                    {selectedRecord.selectedProjectIds?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {getMatchedProjects(selectedRecord).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg"
                      >
                        <div className="h-8 w-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-xs font-bold text-textSecondary">
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
                          className="text-primary hover:text-white text-xs font-medium"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposal */}
                {selectedRecord.proposal && (
                  <div className="flex flex-col h-96">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <h4 className="text-xs font-bold text-textSecondary uppercase">
                        Generated Proposal
                      </h4>
                      <button
                        onClick={() => copyProposal(selectedRecord.proposal!)}
                        className="text-xs text-primary hover:underline"
                      >
                        Copy Text
                      </button>
                    </div>
                    <textarea
                      readOnly
                      className="flex-1 w-full p-4 bg-surface border border-border rounded-xl text-white font-mono text-sm resize-none focus:outline-none"
                      value={selectedRecord.proposal}
                    />
                  </div>
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
              Are you sure you want to delete this match for{" "}
              <strong className="text-white">
                {selectedRecord.clientName || "Unknown Client"}
              </strong>
              ? This action cannot be undone.
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
