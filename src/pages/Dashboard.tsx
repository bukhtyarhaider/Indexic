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
import { Navbar } from "@/components/Navbar";
import { RecommendationModal } from "@/components/RecommendationModal";
import { MatchHistoryModal } from "@/components/MatchHistoryModal";
import { RecommendationResult, MatchRecord } from "@/types/match";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import {
  createMatchRecord,
  generateProposal,
  getProjectRecommendations,
} from "@/services/matchService";
import {
  Plus,
  Menu,
  X,
  Download,
  Upload,
  LogOut,
  Github,
  History,
  Sparkles,
  LayoutGrid,
  List,
  Search,
  Copy,
  FolderOpen,
  SearchX,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";

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
    const clientName = record.clientName?.trim();
    const senderType = record.senderType || "agency";

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
        user?.user_metadata?.full_name || "Bukhtyar Haider"
      );

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
        showError(proposalText);
        return;
      }

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
      updateMatchRecord(recordId, {
        requirements: newRequirements,
        recommendations: result.recommendations,
        selectedProjectIds: result.recommendations.map((r) => r.projectId),
        proposal: undefined,
      });
      showSuccess("Requirements re-analyzed successfully!");
    } catch (error) {
      console.error("Error re-analyzing match:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to re-analyze match";
      showError(errorMessage);
      throw error;
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
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleImportJSON}
      />

      <Navbar
        onExportJSON={handleExportJSON}
        onImportJSON={() => fileInputRef.current?.click()}
        onGithubImport={() => setIsGithubModalOpen(true)}
        onNewProject={() => setIsModalOpen(true)}
        hasProjects={projects.length > 0}
      />

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

            <div className="flex gap-2 sm:gap-4">
              <Card variant="surface" className="px-3 sm:px-4 py-1.5 sm:py-2">
                <div className="text-[10px] sm:text-xs text-text-secondary font-semibold uppercase">
                  UX/UI
                </div>
                <div className="text-lg sm:text-xl font-display font-bold text-white">
                  {
                    projects.filter((p) => p.category === ProjectCategory.UXUI)
                      .length
                  }
                </div>
              </Card>
              <Card variant="surface" className="px-3 sm:px-4 py-1.5 sm:py-2">
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
              </Card>
            </div>
          </div>

          <Card
            variant="surface"
            className="p-1.5 flex flex-col gap-2 shadow-sm"
          >
            <div className="relative flex-1 group">
              <Input
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search projects..."
                leftIcon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
                className="bg-surface-highlight border-transparent focus:border-border"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2 flex-1">
                <Select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value as any })
                  }
                  className="flex-1 sm:flex-initial sm:min-w-35 lg:min-w-40"
                >
                  <option value="All">All Categories</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>

                <Select
                  value={filters.tag}
                  onChange={(e) =>
                    setFilters({ ...filters, tag: e.target.value })
                  }
                  className="flex-1 sm:flex-initial sm:max-w-35 lg:max-w-40"
                >
                  <option value="All">All Tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="w-px bg-border my-1 mx-1 hidden md:block"></div>

              <div className="flex gap-2 justify-between sm:justify-start">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setIsHistoryModalOpen(true)}
                    title="View History"
                    leftIcon={<History className="w-4 h-4" />}
                  >
                    <span className="hidden sm:inline">History</span>
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => setIsRecommendationModalOpen(true)}
                    leftIcon={
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
                    }
                  >
                    <span>AI Match</span>
                  </Button>
                </div>

                <div className="w-px bg-border my-1 mx-1 hidden md:block"></div>

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
                    <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-text-secondary">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-inner border border-border">
              <FolderOpen className="w-10 h-10 text-text-secondary" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white text-center mb-3">
              Your portfolio is empty
            </h2>
            <p className="text-text-secondary text-center max-w-md mb-10 text-lg">
              Start building your index by adding your first project or
              importing existing repositories from GitHub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={() => setIsGithubModalOpen(true)}
                leftIcon={<Github className="w-5 h-5" />}
              >
                Import from GitHub
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Plus className="w-5 h-5" />}
              >
                Create New Project
              </Button>
            </div>
          </div>
        ) : (
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

            {filteredProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-dashed border-border mt-4">
                <div className="p-4 rounded-full bg-surface-highlight mb-4">
                  <SearchX className="w-10 h-10 text-text-secondary" />
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
          <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Copy List</span>
          <span className="sm:hidden">Copy</span>
        </button>
        <button
          onClick={() => setSelectedIds(new Set())}
          className="text-text-secondary hover:text-white transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
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
