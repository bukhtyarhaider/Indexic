import React, { useState, useEffect } from "react";
import { Project, ProjectCategory, LinkType } from "../types";
import { CATEGORY_OPTIONS, LINK_TYPE_OPTIONS } from "../constants";
import { generateProjectEnhancements } from "../services/geminiService";
import { useToast } from "../context/ToastContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  Tag,
  User,
  FolderOpen,
  FileText,
} from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  initialData?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    description: "",
    category: ProjectCategory.UXUI,
    profileOwner: "Bukhtyar Haider",
    tags: [],
    links: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [linkInput, setLinkInput] = useState<{
    label: string;
    url: string;
    type: LinkType;
  }>({
    label: "",
    url: "",
    type: LinkType.GITHUB,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          name: "",
          description: "",
          category: ProjectCategory.UXUI,
          profileOwner: "Bukhtyar Haider",
          tags: [],
          links: [],
        });
      }
      setTagInput("");
      setLinkInput({ label: "", url: "", type: LinkType.GITHUB });
    }
  }, [isOpen, initialData]);

  const handleEnhance = async () => {
    if (!formData.name || !formData.category) return;
    setLoading(true);
    try {
      const { refinedDescription, suggestedTags } =
        await generateProjectEnhancements(
          formData.name,
          formData.description || "",
          formData.category
        );
      setFormData((prev) => ({
        ...prev,
        description: refinedDescription,
        tags: Array.from(new Set([...(prev.tags || []), ...suggestedTags])),
      }));
    } catch (e) {
      console.error("Enhancement error:", e);
      const errorMsg =
        e instanceof Error
          ? e.message
          : "Failed to enhance project. Please try again.";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    if (linkInput.url && linkInput.label) {
      setFormData((prev) => ({
        ...prev,
        links: [
          ...(prev.links || []),
          { ...linkInput, id: Date.now().toString() },
        ],
      }));
      setLinkInput({ label: "", url: "", type: LinkType.GITHUB });
    }
  };

  const handleRemoveLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links?.filter((l) => l.id !== id),
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;

    const savedProject: Project = {
      id: initialData?.id || Date.now().toString(),
      userId: initialData?.userId || "",
      name: formData.name,
      description: formData.description || "",
      category: formData.category,
      profileOwner: formData.profileOwner || "General",
      tags: formData.tags || [],
      links: formData.links || [],
      lastModified: Date.now(),
    };
    onSave(savedProject);
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm">
      <Card
        variant="glass"
        className="w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-surface/90 backdrop-blur-xl sticky top-0 z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              {isEditMode ? "Edit Project" : "Add Project"}
            </h2>
            <p className="text-[10px] sm:text-xs text-text-secondary">
              {isEditMode
                ? "Update project details and links."
                : "Add a new project to your portfolio."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-text-secondary hover:text-white"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-5 sm:space-y-6"
          >
            {/* Main Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-text-main">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Portfolio v3"
                  className="bg-surface-highlight border-border text-white focus:ring-primary focus:border-primary"
                  leftIcon={<FolderOpen className="w-4 h-4 text-text-secondary" />}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-text-main">
                  Category <span className="text-red-400">*</span>
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as ProjectCategory,
                    })
                  }
                  className="text-white"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option
                      key={opt}
                      value={opt}
                      className="bg-surface text-white"
                    >
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs sm:text-sm font-semibold text-text-main">
                  Description
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEnhance}
                  disabled={loading || !formData.name}
                  isLoading={loading}
                  className="text-primary hover:text-primary-hover hover:bg-primary/10 p-1 h-auto text-[10px] sm:text-xs font-bold uppercase tracking-wide gap-1.5"
                >
                  {!loading && <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  AI Enhance
                </Button>
              </div>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2.5 bg-surface-highlight border border-border text-white rounded-lg sm:rounded-xl h-24 sm:h-32 resize-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-text-secondary/50 text-sm leading-relaxed"
                  placeholder="Describe the project's goals, technologies used, and your role..."
                />
                <div className="absolute top-3 right-3 text-text-secondary pointer-events-none">
                    <FileText className="w-4 h-4 opacity-20" />
                </div>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-text-main">
                  Owner / Client
                </label>
                <Input
                  value={formData.profileOwner}
                  onChange={(e) =>
                    setFormData({ ...formData, profileOwner: e.target.value })
                  }
                  placeholder="e.g. Bukhtyar Haider"
                  className="bg-surface-highlight border-border text-white"
                  leftIcon={<User className="w-4 h-4 text-text-secondary" />}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-text-main">
                  Tags
                </label>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag and press Enter"
                  className="bg-surface-highlight border-border text-white"
                  leftIcon={<Tag className="w-4 h-4 text-text-secondary" />}
                />
              </div>
            </div>

            {/* Tag Badges */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 bg-surface-highlight/30 p-3 rounded-lg border border-white/5">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    onRemove={() =>
                      setFormData({
                        ...formData,
                        tags: formData.tags?.filter((t) => t !== tag),
                      })
                    }
                    className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Links Section */}
            <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <LinkIcon className="w-4 h-4 text-text-secondary" />
                    <label className="block text-xs sm:text-sm font-semibold text-text-main">
                        Project Links
                    </label>
                </div>

              {/* Add Link Row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full sm:w-1/3">
                  <Select
                    value={linkInput.type}
                    onChange={(e) =>
                      setLinkInput({
                        ...linkInput,
                        type: e.target.value as LinkType,
                      })
                    }
                    className="bg-surface-highlight text-white text-xs sm:text-sm h-10"
                  >
                    {LINK_TYPE_OPTIONS.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                        className="bg-surface text-white"
                      >
                        {opt}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={linkInput.label}
                    onChange={(e) =>
                      setLinkInput({ ...linkInput, label: e.target.value })
                    }
                    className="bg-surface-highlight border-border text-white text-xs sm:text-sm h-10"
                    placeholder="Label (e.g. GitHub)"
                    wrapperClassName="flex-1"
                  />
                  <Input
                    type="url"
                    value={linkInput.url}
                    onChange={(e) =>
                      setLinkInput({ ...linkInput, url: e.target.value })
                    }
                    className="bg-surface-highlight border-border text-white text-xs sm:text-sm h-10"
                    placeholder="URL (https://...)"
                    wrapperClassName="flex-[1.5]"
                  />
                  <Button
                    type="button"
                    onClick={handleAddLink}
                    variant="secondary"
                    className="h-10 w-10 p-0 flex items-center justify-center shrink-0"
                    title="Add Link"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Links List */}
              <div className="space-y-2">
                {formData.links?.map((link) => (
                  <div
                    key={link.id}
                    className="group flex items-center justify-between text-sm bg-surface-highlight/50 p-2.5 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-white/5 whitespace-nowrap">
                        {link.type}
                      </span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:text-white hover:underline truncate flex items-center gap-1.5 font-medium"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </a>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-text-secondary hover:text-red-400 hover:bg-red-500/10 h-7 w-7"
                      onClick={() => handleRemoveLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {formData.links?.length === 0 && (
                  <div className="text-center py-4 text-text-secondary text-xs sm:text-sm italic border border-dashed border-white/10 rounded-lg">
                    No links added yet.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-surface/90 backdrop-blur-xl flex justify-end gap-2 sm:gap-3 sticky bottom-0 z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-text-main font-semibold hover:bg-white/10 rounded-lg sm:rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            className="shadow-glow font-semibold rounded-lg sm:rounded-xl px-6"
          >
            {isEditMode ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
