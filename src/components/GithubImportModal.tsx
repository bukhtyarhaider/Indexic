import React, { useState } from "react";
import { Project, ProjectCategory, LinkType } from "../types";

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
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-surface-highlight text-white p-1.5 sm:p-2 rounded-lg border border-border">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-highlight/30">
          {step === "input" && (
            <div className="max-w-md mx-auto mt-4 sm:mt-8">
              <form onSubmit={handleFetch} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-text-main mb-1 sm:mb-1.5">
                    GitHub Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 sm:top-2.5 text-text-secondary font-medium text-sm sm:text-base">
                      @
                    </span>
                    <input
                      autoFocus
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-surface border border-border text-white rounded-lg sm:rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-text-secondary text-sm sm:text-base"
                      placeholder="username"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 sm:p-3 bg-red-900/20 text-red-400 text-xs sm:text-sm rounded-lg border border-red-900/50 flex items-start gap-2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !username}
                  className="w-full py-2.5 sm:py-3 bg-primary text-white font-semibold rounded-lg sm:rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex justify-center items-center gap-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                      Fetching...
                    </>
                  ) : (
                    "Fetch Repositories"
                  )}
                </button>
              </form>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  Found {fetchedProjects.length} Repositories
                </h3>
                <button
                  onClick={toggleSelectAll}
                  className="text-xs sm:text-sm text-primary font-medium hover:underline"
                >
                  {selectedIndices.size === fetchedProjects.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
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
                              <span
                                key={tag}
                                className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-surface-highlight text-text-secondary border border-border"
                              >
                                {tag}
                              </span>
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
            <button
              onClick={() => setStep("input")}
              className="hidden sm:block text-text-secondary font-semibold hover:text-white"
            >
              Back
            </button>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handleClose}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 border border-border rounded-lg sm:rounded-xl text-text-main font-semibold hover:bg-surface-highlight transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selectedIndices.size === 0}
                className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-white font-semibold rounded-lg sm:rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-glow transition-all active:scale-95 text-sm"
              >
                Import {selectedIndices.size}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
