import React, { useState } from "react";
import { Project, ProjectCategory } from "../types";
import { CATEGORY_OPTIONS } from "../constants";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectTableView } from "../components/ProjectTableView";
import { ProjectModal } from "../components/ProjectModal";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { GithubImportModal } from "../components/GithubImportModal";
import { useProjects } from "../hooks/useProjects";
import { useFilters } from "../hooks/useFilters";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

import logo from "../assets/logo.png";
import { RecommendationModal } from "@/components/RecommendationModal";
import { MatchHistoryModal } from "@/components/MatchHistoryModal";
import { RecommendationResult, MatchRecord } from "@/types/match";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import {
  createMatchRecord,
  generateProposal,
  getProjectRecommendations,
} from "@/services/matchService";
import { Plus, Menu, X } from "lucide-react";

type ViewMode = "grid" | "table";

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    importJSON,
    importGithub,
    exportJSON,
    fileInputRef,
    isLoading,
    error,
    clearError,
  } = useProjects();

  const { filters, setFilters, filteredProjects, allTags } =
    useFilters(projects);
  const { showSuccess, showError } = useToast();

  // Removed local toast state as it's now global

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Match History Hook
  const {
    history: matchHistory,
    selectedRecordId,
    setSelectedRecordId,
    addRecord: addMatchRecord,
    deleteRecord: deleteMatchRecord,
    updateRecord: updateMatchRecord,
  } = useMatchHistory();

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] =
    useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Handlers
  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCopySingle = (project: Project) => {
    const text = `${project.name} (${project.category})\n${
      project.description
    }\nLinks: ${project.links.map((l) => l.url).join(", ")}`;
    navigator.clipboard.writeText(text);
    showSuccess("Project details copied!");
  };

  const handleBulkCopy = () => {
    const selectedProjects = projects.filter((p) => selectedIds.has(p.id));
    const text = selectedProjects
      .map(
        (p) =>
          `${p.name}\t${p.category}\t${p.profileOwner}\t${
            p.links[0]?.url || "No link"
          }`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    showSuccess(`${selectedProjects.length} projects copied (Excel format)!`);
  };

  const handleExportJSON = () => {
    exportJSON(
      `indexic-projects-${new Date().toISOString().split("T")[0]}.json`
    );
    showSuccess("All projects exported successfully!");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    importJSON(e, showSuccess, showError);
  };

  const handleSaveProject = (savedProject: Project) => {
    if (editingProject) {
      updateProject(savedProject);
      showSuccess("Project updated successfully!");
    } else {
      addProject(savedProject);
      showSuccess("New project indexed successfully!");
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleRecommendationSelect = (projectIds: string[]) => {
    const newSelected = new Set(selectedIds);
    projectIds.forEach((id) => newSelected.add(id));
    setSelectedIds(newSelected);
    showSuccess(`Selected ${projectIds.length} recommended projects.`);
  };

  const handleSaveMatch = (
    requirements: string,
    recommendations: RecommendationResult[],
    selectedProjectIds: string[],
    clientName?: string,
    proposal?: string,
    senderType: "agency" | "individual" = "agency"
  ): string => {
    const record = createMatchRecord(
      requirements,
      recommendations,
      selectedProjectIds,
      clientName,
      proposal,
      senderType
    );
    addMatchRecord(record);
    showSuccess("Match saved to history.");
    return record.id; // Return the ID so it can be updated later
  };

  const handleUpdateMatch = (
    matchId: string,
    updates: { proposal?: string; clientName?: string }
  ) => {
    updateMatchRecord(matchId, updates);
    showSuccess("Match updated successfully.");
  };

  const handleApplyMatch = (projectIds: string[]) => {
    const newSelected = new Set(projectIds);
    setSelectedIds(newSelected);
    showSuccess(`Selected ${projectIds.length} projects from match history.`);
  };

  const handleRemoveProject = (recordId: string, projectId: string) => {
    const record = matchHistory.find((r) => r.id === recordId);
    if (record) {
      const updatedProjectIds = record.selectedProjectIds.filter(
        (id) => id !== projectId
      );
      updateMatchRecord(recordId, {
        selectedProjectIds: updatedProjectIds,
        proposal: undefined, // Clear proposal since project list changed
      });
      showSuccess("Project removed from match.");
    }
  };

  const handleDeleteMatch = (recordId: string) => {
    deleteMatchRecord(recordId);
    showSuccess("Match deleted from history.");
  };

  const handleGenerateProposal = async (record: MatchRecord) => {
    // Client name and sender type are now set in the modal's Proposal tab
    const clientName = record.clientName?.trim();
    const senderType = record.senderType || "agency";

    // Client name is optional but recommended for personalized proposals
    if (!clientName) {
      const proceed = window.confirm(
        "No client name provided. The proposal will be generic. Continue anyway?"
      );
      if (!proceed) return;
    }

    try {
      const selectedProjects = projects.filter((p) =>
        record.selectedProjectIds.includes(p.id)
      );

      if (selectedProjects.length === 0) {
        showError(
          "No projects selected for this match. Please select projects in the AI Recommendations tab."
        );
        return;
      }

      const proposalText = await generateProposal(
        record.requirements,
        selectedProjects,
        clientName || "Client",
        senderType,
        "Bukhtyar Haider" // You might want to make this configurable
      );

      // Check if the response is an error message (not a valid proposal)
      const errorIndicators = [
        "unable to",
        "failed to",
        "error",
        "temporarily busy",
        "try again",
        "please wait",
        "configuration error",
      ];
      const isError = errorIndicators.some((indicator) =>
        proposalText.toLowerCase().includes(indicator)
      );

      if (isError || proposalText.length < 100) {
        // Too short to be a real proposal or contains error text
        showError(proposalText);
        return;
      }

      // Update the record with the new proposal
      updateMatchRecord(record.id, {
        proposal: proposalText,
        clientName: clientName || undefined,
        senderType: senderType,
        selectedProjectIds: record.selectedProjectIds,
      });
      showSuccess(
        record.proposal
          ? "Proposal regenerated successfully!"
          : "Proposal generated successfully!"
      );
    } catch (error) {
      console.error("Error generating proposal:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate proposal. Please try again.";
      showError(errorMessage);
    }
  };

  const handleReanalyzeMatch = async (
    recordId: string,
    newRequirements: string
  ) => {
    try {
      const result = await getProjectRecommendations(newRequirements, projects);

      // Update the record with new recommendations
      updateMatchRecord(recordId, {
        requirements: newRequirements,
        recommendations: result.recommendations,
        selectedProjectIds: result.recommendations.map((r) => r.projectId),
        proposal: undefined, // Clear proposal since requirements changed
      });

      showSuccess("Requirements re-analyzed successfully!");
    } catch (error) {
      console.error("Error re-analyzing match:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to re-analyze match";
      showError(errorMessage);
      throw error; // Re-throw so the modal knows it failed
    }
  };

  const handleGithubImport = (newProjects: Project[]) => {
    importGithub(newProjects);
    showSuccess(
      `Successfully imported ${newProjects.length} projects from GitHub!`
    );
    setIsGithubModalOpen(false);
  };

  const handleDeleteClick = (project: Project) => {
    setDeletingProject(project);
  };

  const handleConfirmDelete = () => {
    if (deletingProject) {
      deleteProject(deletingProject.id);
      // Also remove from selection if present
      if (selectedIds.has(deletingProject.id)) {
        const newSelected = new Set(selectedIds);
        newSelected.delete(deletingProject.id);
        setSelectedIds(newSelected);
      }
      setDeletingProject(null);
      showSuccess("Project deleted successfully.");
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="min-h-screen bg-background text-text-main font-sans pb-32">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleImportJSON}
      />

      {/* Navigation Bar */}
      <nav className="glass sticky top-0 z-40 border-b-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Logo - PRONTX Style X or Icon */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary opacity-20 blur-lg rounded-full"></div>
                <div className="relative flex items-center justify-center">
                  <img
                    src={logo}
                    alt="Indexic Logo"
                    className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-base sm:text-lg text-white leading-none">
                  INDEXIC
                </span>
                <span className="text-[8px] sm:text-[10px] text-text-secondary font-medium uppercase tracking-wider hidden sm:block">
                  Manage your projects
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Mobile: Add Project Button */}
              <button
                className="sm:hidden flex items-center justify-center w-9 h-9 bg-primary text-white rounded-lg"
                title="Add Project"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Mobile: Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden flex items-center justify-center w-9 h-9 bg-surface border border-border text-text-secondary rounded-lg hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {/* Desktop buttons */}
              <button
                onClick={handleExportJSON}
                disabled={projects.length === 0}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-surface text-text-secondary border border-border rounded-lg text-sm font-semibold hover:bg-surface-highlight hover:text-white transition-all disabled:opacity-50"
                title="Export Data"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-surface text-text-secondary border border-border rounded-lg text-sm font-semibold hover:bg-surface-highlight hover:text-white transition-all"
                title="Import Data"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import
              </button>

              <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

              <button
                onClick={onLogout}
                className="hidden sm:flex text-text-secondary hover:text-primary text-sm font-semibold transition-colors mr-2"
              >
                Logout
              </button>

              <button
                onClick={() => setIsGithubModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 bg-surface text-white border border-border rounded-lg text-sm font-semibold hover:bg-surface-highlight hover:border-white/20 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden lg:inline">Import GitHub</span>
                <span className="lg:hidden">GitHub</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 lg:px-4 py-2 bg-primary text-white border border-border rounded-lg text-sm font-semibold hover:bg-primary-hover hover:border-white/20 transition-all"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden lg:inline">New Project</span>
                <span className="lg:hidden">New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop to close menu */}
            <div
              className="sm:hidden fixed inset-0 top-14 bg-black/40 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="sm:hidden absolute left-0 right-0 top-full z-50 border-t border-border bg-surface/98 backdrop-blur-xl shadow-xl">
              <div className="px-4 py-4 space-y-2">
                <button
                  onClick={() => {
                    setIsGithubModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-surface-highlight border border-border rounded-xl text-sm font-medium text-white active:scale-[0.98] transition-transform"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Import from GitHub
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-surface-highlight border border-border rounded-xl text-sm font-medium text-text-secondary active:scale-[0.98] transition-transform"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Import JSON
                </button>
                <button
                  onClick={() => {
                    handleExportJSON();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={projects.length === 0}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-surface-highlight border border-border rounded-xl text-sm font-medium text-text-secondary disabled:opacity-50 active:scale-[0.98] transition-transform"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export JSON
                </button>
                <div className="h-px bg-border my-3"></div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 active:scale-[0.98] transition-transform"
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Hero / Filter Section */}
      <div className="bg-background border-b border-border pt-4 sm:pt-8 pb-4 sm:pb-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-4 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white mb-1 sm:mb-2">
                Portfolio Overview
              </h1>
              <p className="text-text-secondary text-sm sm:text-base max-w-2xl">
                Manage, filter, and share your team's project portfolio.
                Currently showing{" "}
                <span className="font-semibold text-primary">
                  {filteredProjects.length}
                </span>{" "}
                projects.
              </p>
            </div>

            {/* Dashboard Stats (Mini) */}
            <div className="flex gap-2 sm:gap-4">
              <div className="bg-surface px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-border">
                <div className="text-[10px] sm:text-xs text-text-secondary font-semibold uppercase">
                  UX/UI
                </div>
                <div className="text-lg sm:text-xl font-display font-bold text-white">
                  {
                    projects.filter((p) => p.category === ProjectCategory.UXUI)
                      .length
                  }
                </div>
              </div>
              <div className="bg-surface px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-border">
                <div className="text-[10px] sm:text-xs text-text-secondary font-semibold uppercase">
                  Dev
                </div>
                <div className="text-lg sm:text-xl font-display font-bold text-white">
                  {
                    projects.filter(
                      (p) =>
                        p.category === ProjectCategory.DEVELOPMENT ||
                        p.category === ProjectCategory.WORDPRESS ||
                        p.category === ProjectCategory.MOBILE
                    ).length
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Unified Filter Bar */}
          <div className="bg-surface p-1.5 rounded-xl sm:rounded-2xl border border-border flex flex-col gap-2 shadow-sm">
            {/* Search - Full width on mobile */}
            <div className="relative flex-1 group">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-3.5 top-2.5 sm:top-3 text-text-secondary group-focus-within:text-primary transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-surface-highlight border border-transparent rounded-lg sm:rounded-xl text-sm text-text-main focus:border-border focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-secondary"
              />
            </div>

            {/* Filters Row - Scrollable on mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Dropdowns */}
              <div className="flex gap-2 flex-1">
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value as any })
                  }
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-surface-highlight border border-transparent rounded-lg sm:rounded-xl text-sm text-text-main focus:border-border focus:ring-1 focus:ring-primary outline-none hover:bg-surface-highlight/80 cursor-pointer sm:min-w-[140px] lg:min-w-[160px]"
                >
                  <option value="All">All Categories</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.tag}
                  onChange={(e) =>
                    setFilters({ ...filters, tag: e.target.value })
                  }
                  className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-surface-highlight border border-transparent rounded-lg sm:rounded-xl text-sm text-text-main focus:border-border focus:ring-1 focus:ring-primary outline-none hover:bg-surface-highlight/80 cursor-pointer sm:max-w-[140px] lg:max-w-[160px]"
                >
                  <option value="All">All Tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-px bg-border my-1 mx-1 hidden md:block"></div>

              {/* Action buttons row */}
              <div className="flex gap-2 justify-between sm:justify-start">
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-surface text-text-secondary border border-border rounded-lg sm:rounded-xl text-sm font-semibold hover:text-white hover:bg-surface-highlight transition-all"
                    title="View History"
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="hidden sm:inline">History</span>
                  </button>

                  {/* AI Match Button */}
                  <button
                    onClick={() => setIsRecommendationModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary  text-text-secondary border border-border rounded-lg sm:rounded-xl text-sm font-semibold hover:text-white hover:bg-primary/70 transition-all"
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
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                    <span>AI Match</span>
                  </button>
                </div>

                <div className="w-px bg-border my-1 mx-1 hidden md:block"></div>

                {/* View Toggle */}
                <div className="flex bg-surface-highlight rounded-lg sm:rounded-xl p-1 border border-border">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg flex items-center justify-center transition-all ${
                      viewMode === "grid"
                        ? "bg-surface shadow text-primary"
                        : "text-text-secondary hover:text-white"
                    }`}
                    title="Grid View"
                  >
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md sm:rounded-lg flex items-center justify-center transition-all ${
                      viewMode === "table"
                        ? "bg-surface shadow text-primary"
                        : "text-text-secondary hover:text-white"
                    }`}
                    title="Table View"
                  >
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
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
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
        )}

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-text-secondary">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-inner border border-border">
              <svg
                className="w-10 h-10 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 002 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-bold text-white text-center mb-3">
              Your portfolio is empty
            </h2>
            <p className="text-text-secondary text-center max-w-md mb-10 text-lg">
              Start building your index by adding your first project or
              importing existing repositories from GitHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => setIsGithubModalOpen(true)}
                className="btn-secondary"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Import from GitHub
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Project
              </button>
            </div>
          </div>
        ) : (
          /* LIST VIEW - Projects exist */
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedIds.has(project.id)}
                    onToggleSelect={handleToggleSelect}
                    onCopy={handleCopySingle}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            ) : (
              <ProjectTableView
                projects={filteredProjects}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onCopy={handleCopySingle}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                currentUserId={user?.id}
              />
            )}

            {/* No filtered results state (distinct from empty state) */}
            {filteredProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-dashed border-border mt-4">
                <div className="p-4 rounded-full bg-surface-highlight mb-4">
                  <svg
                    className="w-10 h-10 text-text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-display font-semibold text-white">
                  No projects found
                </h3>
                <p className="text-text-secondary mt-2 text-center max-w-sm">
                  We couldn't find any projects matching your search. Try
                  adjusting your filters.
                </p>
                <button
                  onClick={() =>
                    setFilters({ search: "", category: "All", tag: "All" })
                  }
                  className="mt-6 text-primary font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Action Bar */}
      <div
        className={`fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 bg-surface-highlight/95 backdrop-blur-lg text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-8 transition-all duration-300 z-50 border border-white/10 max-w-[calc(100%-2rem)] sm:max-w-none ${
          selectedIds.size > 0
            ? "translate-y-0 opacity-100"
            : "translate-y-32 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-primary text-white text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center">
            {selectedIds.size}
          </div>
          <span className="font-semibold text-xs sm:text-sm">Selected</span>
        </div>
        <div className="h-5 sm:h-6 w-px bg-white/20"></div>
        <button
          onClick={handleBulkCopy}
          className="text-xs sm:text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5 sm:gap-2"
        >
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
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          <span className="hidden sm:inline">Copy List</span>
          <span className="sm:hidden">Copy</span>
        </button>
        <button
          onClick={() => setSelectedIds(new Set())}
          className="text-text-secondary hover:text-white transition-colors"
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

      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveProject}
        initialData={editingProject}
      />

      <GithubImportModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        onImport={handleGithubImport}
      />

      <RecommendationModal
        isOpen={isRecommendationModalOpen}
        onClose={() => setIsRecommendationModalOpen(false)}
        projects={projects}
        onSelectProjects={handleRecommendationSelect}
        onSaveMatch={handleSaveMatch}
        onUpdateMatch={handleUpdateMatch}
      />

      <MatchHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={matchHistory}
        projects={projects}
        selectedRecordId={selectedRecordId}
        onSelectRecord={setSelectedRecordId}
        onDeleteRecord={handleDeleteMatch}
        onGenerateProposal={handleGenerateProposal}
        onApplyMatch={handleApplyMatch}
        onRemoveProject={handleRemoveProject}
        onUpdateRecord={updateMatchRecord}
        onReanalyzeMatch={handleReanalyzeMatch}
      />

      <ConfirmationModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};
