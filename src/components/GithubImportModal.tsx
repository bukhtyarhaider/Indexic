import React, { useState } from "react";
import { Project, ProjectCategory, LinkType } from "../types";
import { Github, Loader2, X, Search, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface GithubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projects: Project[]) => void;
}

export const GithubImportModal: React.FC<GithubImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [fetchedProjects, setFetchedProjects] = useState<Project[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
      );

      if (!response.ok) {
        if (response.status === 404) throw new Error("User not found");
        if (response.status === 403)
          throw new Error("API rate limit exceeded. Please try again later.");
        throw new Error("Failed to fetch repositories");
      }

      const repos = await response.json();

      if (!Array.isArray(repos) || repos.length === 0) {
        throw new Error("No public repositories found for this user.");
      }

      const mappedProjects: Project[] = repos.map((repo: any) => ({
        id: `gh-${repo.id}`,
        name: repo.name,
        description: repo.description || "No description provided.",
        category: ProjectCategory.DEVELOPMENT,
        profileOwner: repo.owner.login,
        userId: "current-user", // Placeholder, logic should update this on save
        tags: [repo.language, ...(repo.topics || [])].filter(Boolean),
        lastModified: new Date(repo.updated_at).getTime(),
        links: [
          {
            id: `link-gh-${repo.id}`,
            label: "Repository",
            url: repo.html_url,
            type: LinkType.GITHUB,
          },
          ...(repo.homepage
            ? [
                {
                  id: `link-live-${repo.id}`,
                  label: "Live Demo",
                  url: repo.homepage,
                  type: LinkType.LIVE,
                },
              ]
            : []),
        ],
      }));

      setFetchedProjects(mappedProjects);
      // Select all by default
      setSelectedIndices(new Set(mappedProjects.map((_, i) => i)));
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === fetchedProjects.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(fetchedProjects.map((_, i) => i)));
    }
  };

  const handleImport = () => {
    const projectsToImport = fetchedProjects.filter((_, i) =>
      selectedIndices.has(i)
    );
    onImport(projectsToImport);
    handleClose();
  };

  const handleClose = () => {
    setStep("input");
    setUsername("");
    setFetchedProjects([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
      <Card variant="surface" className="w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-surface-highlight text-white p-1.5 sm:p-2 rounded-lg border border-border">
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Import from GitHub
              </h2>
              <p className="text-[10px] sm:text-xs text-text-secondary hidden sm:block">
                Fetch public repositories and add them as projects.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-text-secondary hover:text-white"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-highlight/30">
          {step === "input" && (
            <div className="max-w-md mx-auto mt-4 sm:mt-8">
              <form onSubmit={handleFetch} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-text-main mb-1 sm:mb-1.5">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 sm:top-3 z-10 text-text-secondary font-medium text-sm sm:text-base">
                      @
                    </span>
                    <Input
                      autoFocus
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-7 sm:pl-8 text-white"
                      placeholder="username"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 sm:p-3 bg-red-900/20 text-red-400 text-xs sm:text-sm rounded-lg border border-red-900/50 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full shadow-lg"
                  disabled={loading || !username}
                  isLoading={loading}
                >
                  Fetch Repositories
                </Button>
              </form>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  Found {fetchedProjects.length} Repositories
                </h3>
                <Button
                  variant="ghost"
                  onClick={toggleSelectAll}
                  className="text-xs sm:text-sm text-primary font-medium hover:underline hover:bg-transparent p-0 h-auto"
                >
                  {selectedIndices.size === fetchedProjects.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="bg-surface border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
                <ul className="divide-y divide-border">
                  {fetchedProjects.map((project, idx) => (
                    <li
                      key={project.id}
                      className="hover:bg-surface-highlight/50 transition-colors"
                    >
                      <label className="flex items-start gap-2.5 sm:gap-4 p-3 sm:p-4 cursor-pointer">
                        <div className="pt-0.5 sm:pt-1">
                          <input
                            type="checkbox"
                            checked={selectedIndices.has(idx)}
                            onChange={() => toggleSelect(idx)}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-border bg-surface-highlight text-primary focus:ring-primary"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                            <span className="font-bold text-white text-xs sm:text-sm truncate">
                              {project.name}
                            </span>
                            {project.links.find(
                              (l) => l.type === LinkType.LIVE
                            ) && (
                              <span className="px-1 sm:px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-wide border border-green-800/50">
                                Demo
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-text-secondary line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                            {project.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} className="text-[9px] sm:text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions for Preview mode */}
        {step === "preview" && (
          <div className="p-4 sm:p-6 border-t border-border bg-surface flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => setStep("input")}
              className="hidden sm:flex text-text-secondary font-semibold hover:text-white"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={selectedIndices.size === 0}
                className="flex-1 sm:flex-initial shadow-glow"
              >
                Import {selectedIndices.size}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
