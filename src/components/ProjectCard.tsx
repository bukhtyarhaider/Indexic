import React from "react";
import { Project, LinkType, ProjectCategory } from "../types";
import { Figma, Github, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onCopy: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  currentUserId?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  onToggleSelect,
  onCopy,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  const isOwner = currentUserId === project.userId;

  const getLinkIcon = (type: LinkType) => {
    switch (type) {
      case LinkType.FIGMA:
        return <Figma className="w-4 h-4" />;
      case LinkType.GITHUB:
        return <Github className="w-4 h-4" />;
      case LinkType.LIVE:
        return <ExternalLink className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getCategoryStyles = (cat: string) => {
    // Using dark transparent backgrounds for categories
    switch (cat) {
      case ProjectCategory.UXUI:
        return "bg-purple-900/20 text-purple-400 border-purple-800/30";
      case ProjectCategory.DEVELOPMENT:
        return "bg-indigo-900/20 text-indigo-400 border-indigo-800/30";
      case ProjectCategory.MOBILE:
        return "bg-sky-900/20 text-sky-400 border-sky-800/30";
      case ProjectCategory.WORDPRESS:
        return "bg-blue-900/20 text-blue-400 border-blue-800/30";
      default:
        return "bg-white/5 text-text-secondary border-white/10";
    }
  };

  const getProfileAvatar = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const colors = [
      "bg-pink-600",
      "bg-indigo-600",
      "bg-emerald-600",
      "bg-orange-600",
      "bg-cyan-600",
    ];
    const colorIndex = name.length % colors.length;
    return (
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${colors[colorIndex]} ring-2 ring-surface`}
      >
        {initials}
      </div>
    );
  };

  return (
    <div
      className={`group relative flex flex-col h-full bg-surface/40 backdrop-blur-sm border transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden ${
        isSelected
          ? "border-primary ring-1 ring-primary shadow-lg shadow-primary/20"
          : "border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
      }`}
    >
      <div className="p-3 sm:p-5 flex flex-col h-full">
        {/* Header: Checkbox & Category */}
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="relative z-20">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(project.id)}
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-surface text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "opacity-100 scale-110"
                  : "opacity-60 hover:opacity-100"
              }`}
              title="Select Project"
            />
          </div>
          <span
            className={`text-[9px] sm:text-[10px] uppercase tracking-widest font-bold px-1.5 sm:px-2 py-0.5 rounded border ${getCategoryStyles(
              project.category
            )}`}
          >
            {project.category}
          </span>
        </div>

        {/* Title & Description */}
        <div className="mb-3 sm:mb-4 flex-1">
          <div className="flex justify-between items-start gap-2 mb-1 sm:mb-2">
            <h3
              className="text-base sm:text-lg font-semibold text-white group-hover:text-primary transition-colors line-clamp-1"
              title={project.name}
            >
              {project.name}
            </h3>
            {/* Links Inline with Title (optional) or keep in footer */}
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2 sm:line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4 min-h-[1.25rem] sm:min-h-[1.5rem]">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] sm:text-[10px] bg-white/5 text-text-secondary px-1.5 sm:px-2 py-0.5 rounded-md border border-white/5 font-medium"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-[9px] sm:text-[10px] text-text-secondary/40 self-center">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* Footer: Owner, Links, Actions */}
        <div className="pt-3 sm:pt-4 border-t border-white/5 flex items-center justify-between gap-2">
          {/* Owner */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {getProfileAvatar(project.profileOwner)}
            <span className="text-[10px] sm:text-xs font-medium text-text-secondary/70 truncate hidden xs:block max-w-[60px] sm:max-w-[80px]">
              {project.profileOwner}
            </span>
          </div>

          {/* Actions & Links Container */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Links */}
            <div className="flex items-center gap-0.5 sm:gap-1 mr-1 sm:mr-2 border-r border-white/10 pr-1 sm:pr-2">
              {project.links.slice(0, 2).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${link.type}: ${link.label}`}
                  className="p-1 sm:p-1.5 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {getLinkIcon(link.type)}
                </a>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOwner) onEdit(project);
                }}
                className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
                  isOwner
                    ? "text-text-secondary hover:text-white hover:bg-white/10 cursor-pointer"
                    : "text-text-secondary/30 cursor-not-allowed"
                }`}
                title={isOwner ? "Edit" : "You can only edit your own projects"}
                disabled={!isOwner}
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(project);
                }}
                className="p-1 sm:p-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Copy"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOwner) onDelete(project);
                }}
                className={`p-1 sm:p-1.5 rounded-lg transition-colors ${
                  isOwner
                    ? "text-text-secondary hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                    : "text-text-secondary/30 cursor-not-allowed"
                }`}
                title={
                  isOwner ? "Delete" : "You can only delete your own projects"
                }
                disabled={!isOwner}
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
          </div>
        </div>
      </div>
    </div>
  );
};
