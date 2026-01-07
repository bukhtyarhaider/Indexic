import React from "react";
import { Project, LinkType, ProjectCategory } from "../types";

interface ProjectTableViewProps {
  projects: Project[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onCopy: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  currentUserId?: string;
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  projects,
  selectedIds,
  onToggleSelect,
  onCopy,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case ProjectCategory.UXUI:
        return "bg-purple-900/20 text-purple-400";
      case ProjectCategory.DEVELOPMENT:
        return "bg-indigo-900/20 text-indigo-400";
      case ProjectCategory.MOBILE:
        return "bg-sky-900/20 text-sky-400";
      case ProjectCategory.WORDPRESS:
        return "bg-blue-900/20 text-blue-400";
      default:
        return "bg-white/10 text-text-secondary";
    }
  };

  const getLinkIcon = (type: LinkType) => {
    switch (type) {
      case LinkType.FIGMA:
        return (
          <svg className="w-3.5 h-3.5" viewBox="0 0 15 23" fill="none">
            <path
              d="M3.75 22.5C5.82107 22.5 7.5 20.8211 7.5 18.75V11.25H3.75C1.67893 11.25 0 12.9289 0 15C0 17.0711 1.67893 18.75 3.75 18.75V22.5Z"
              fill="#1ABCFE"
            />
            <path
              d="M0 7.5C0 5.42893 1.67893 3.75 3.75 3.75H7.5V11.25H3.75C1.67893 11.25 0 9.57107 0 7.5Z"
              fill="#A259FF"
            />
            <path
              d="M15 7.5C15 9.57107 13.3211 11.25 11.25 11.25H7.5V3.75H11.25C13.3211 3.75 15 5.42893 15 7.5Z"
              fill="#1ABCFE"
            />
            <path
              d="M0 15C0 12.9289 1.67893 11.25 3.75 11.25H7.5V18.75H3.75C1.67893 18.75 0 17.0711 0 15Z"
              fill="#F24E1E"
            />
            <path
              d="M7.5 0H11.25C13.3211 0 15 1.67893 15 3.75V7.5H7.5V0Z"
              fill="#FF7262"
            />
          </svg>
        );
      case LinkType.GITHUB:
        return (
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        );
      case LinkType.LIVE:
        return (
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        );
      default:
        return (
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
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-surface rounded-lg sm:rounded-xl border border-border overflow-hidden shadow-soft">
      <div className="overflow-x-auto max-h-[60vh] sm:max-h-[70vh] -mx-px">
        <table className="min-w-full divide-y divide-border relative">
          <thead className="bg-surface-highlight sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider w-8 sm:w-10 bg-surface-highlight border-b border-border"
              >
                <span className="sr-only">Select</span>
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider bg-surface-highlight border-b border-border min-w-[150px] sm:min-w-[200px]"
              >
                Project
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider bg-surface-highlight border-b border-border min-w-[80px] sm:min-w-[100px]"
              >
                Category
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider bg-surface-highlight border-b border-border"
              >
                Owner
              </th>
              <th
                scope="col"
                className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider bg-surface-highlight border-b border-border"
              >
                Stack / Tags
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider bg-surface-highlight border-b border-border"
              >
                Links
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider bg-surface-highlight border-b border-border"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-white/5">
            {projects.map((project) => {
              const isOwner = currentUserId === project.userId;
              return (
                <tr
                  key={project.id}
                  className={`hover:bg-white/5 transition-colors group ${
                    selectedIds.has(project.id) ? "bg-primary/10" : ""
                  }`}
                >
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(project.id)}
                      onChange={() => onToggleSelect(project.id)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-border bg-surface-highlight text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-xs sm:text-sm font-semibold text-white font-display">
                      {project.name}
                    </div>
                    <div className="text-[10px] sm:text-xs text-text-secondary truncate max-w-[120px] sm:max-w-xs mt-0.5">
                      {project.description}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span
                      className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 inline-flex text-[9px] sm:text-[11px] leading-4 font-semibold rounded-full ${getCategoryBadge(
                        project.category
                      )}`}
                    >
                      {project.category}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-surface-highlight flex items-center justify-center text-[8px] sm:text-[10px] text-text-secondary font-bold mr-1.5 sm:mr-2 border border-border">
                        {project.profileOwner.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs sm:text-sm text-text-secondary truncate max-w-[80px] sm:max-w-none">
                        {project.profileOwner}
                      </span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[11px] font-medium bg-surface-highlight border border-white/5 text-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 2 && (
                        <span className="text-[9px] sm:text-[10px] text-text-secondary/50 py-0.5 ml-0.5 sm:ml-1">
                          +{project.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {project.links.slice(0, 2).map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-secondary hover:text-white transition-colors p-0.5 sm:p-1 hover:bg-white/10 rounded"
                          title={`${link.type}: ${link.label}`}
                        >
                          {getLinkIcon(link.type)}
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => {
                          if (isOwner) onEdit(project);
                        }}
                        className={`transition-colors ${
                          isOwner
                            ? "text-text-secondary hover:text-white cursor-pointer"
                            : "text-text-secondary/30 cursor-not-allowed"
                        }`}
                        title={
                          isOwner
                            ? "Edit"
                            : "You can only edit your own projects"
                        }
                        disabled={!isOwner}
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
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onCopy(project)}
                        className="text-text-secondary hover:text-white transition-colors"
                        title="Copy"
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (isOwner) onDelete(project);
                        }}
                        className={`transition-colors ${
                          isOwner
                            ? "text-text-secondary hover:text-red-500 cursor-pointer"
                            : "text-text-secondary/30 cursor-not-allowed"
                        }`}
                        title={
                          isOwner
                            ? "Delete"
                            : "You can only delete your own projects"
                        }
                        disabled={!isOwner}
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
