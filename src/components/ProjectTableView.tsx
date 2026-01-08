import React from "react";
import { Project, LinkType, ProjectCategory } from "../types";
import { Figma, Github, ExternalLink, Link as LinkIcon, Edit2, Copy, Trash2 } from "lucide-react";

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
        return <Figma className="w-3.5 h-3.5" />;
      case LinkType.GITHUB:
        return <Github className="w-3.5 h-3.5" />;
      case LinkType.LIVE:
        return <ExternalLink className="w-3.5 h-3.5" />;
      default:
        return <LinkIcon className="w-3.5 h-3.5" />;
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
                      {projects.length > 0 && // Just logic check, always true in map
                        project.tags.slice(0, 2).map((tag) => (
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
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onCopy(project)}
                        className="text-text-secondary hover:text-white transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4" />
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
                        <Trash2 className="w-4 h-4" />
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
