import { useState, useMemo } from "react";
import { Project, FilterState } from "../types";
import { normalizeTag } from "../utils/tagNormalization";

export const useFilters = (projects: Project[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "All",
    tag: "All",
  });

  // Extract all unique tags for filter dropdown
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((p) => p.tags.forEach((t) => tags.add(normalizeTag(t))));
    return Array.from(tags).sort();
  }, [projects]);

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.profileOwner.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory =
        filters.category === "All" || p.category === filters.category;
      const matchesTag =
        filters.tag === "All" ||
        p.tags.some((t) => normalizeTag(t) === filters.tag);
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [projects, filters]);

  return {
    filters,
    setFilters,
    filteredProjects,
    allTags,
  };
};
