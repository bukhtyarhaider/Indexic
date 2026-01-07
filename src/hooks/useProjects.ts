import { useState, useRef, useCallback, useEffect, ChangeEvent } from "react";
import { Project } from "../types";
import * as projectService from "../services/projectService";
import { useAuth } from "../context/AuthContext";

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File input ref for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch projects on mount and when user changes
  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await projectService.getProjects();

    if (result.error) {
      setError(result.error);
      setProjects([]);
    } else {
      setProjects(result.data || []);
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = useCallback(
    async (project: Project) => {
      if (!user) return;

      // Remove id for insert, let Supabase generate it
      const { id, ...projectData } = project;

      const result = await projectService.createProject(projectData, user.id);

      if (result.error) {
        setError(result.error);
        return false;
      }

      if (result.data) {
        setProjects((prev) => [result.data!, ...prev]);
      }
      return true;
    },
    [user]
  );

  const updateProject = useCallback(
    async (updatedProject: Project) => {
      if (!user) return false;

      const result = await projectService.updateProject(
        updatedProject.id,
        updatedProject,
        user.id
      );

      if (result.error) {
        setError(result.error);
        return false;
      }

      if (result.data) {
        setProjects((prev) =>
          prev.map((p) => (p.id === result.data!.id ? result.data! : p))
        );
      }
      return true;
    },
    [user]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!user) return false;

      const result = await projectService.deleteProject(projectId, user.id);

      if (result.error) {
        setError(result.error);
        return false;
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return true;
    },
    [user]
  );

  const importJSON = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      onComplete: (msg: string) => void,
      onError: (msg: string) => void
    ) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const importedData = JSON.parse(content);

          if (Array.isArray(importedData)) {
            // Filter out duplicates based on name
            const existingNames = new Set(
              projects.map((p) => p.name.toLowerCase())
            );
            const newProjects = importedData.filter(
              (p: Project) => !existingNames.has(p.name.toLowerCase())
            );

            if (newProjects.length > 0) {
              const result = await projectService.importProjects(
                newProjects,
                user.id
              );

              if (result.error) {
                onError(`Import failed: ${result.error}`);
              } else if (result.data) {
                setProjects((prev) => [...result.data!, ...prev]);
                onComplete(`Imported ${result.data.length} new projects!`);
              }
            } else {
              onComplete("Projects loaded. No new unique projects found.");
            }
          } else {
            onError("Invalid JSON file format.");
          }
        } catch (err) {
          console.error(err);
          onError("Failed to parse JSON file.");
        }
        // Reset input value to allow selecting same file again
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsText(file);
    },
    [user, projects]
  );

  const importGithub = useCallback(
    async (newProjects: Project[]) => {
      if (!user) return;

      const projectsToInsert = newProjects.map(({ id, ...rest }) => rest);
      const result = await projectService.importProjects(
        projectsToInsert,
        user.id
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.data) {
        setProjects((prev) => [...result.data!, ...prev]);
      }
    },
    [user]
  );

  const exportJSON = useCallback(
    (filename: string) => {
      const dataStr = JSON.stringify(projects, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [projects]
  );

  const refetch = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    projects,
    setProjects,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
    importJSON,
    importGithub,
    exportJSON,
    fileInputRef,
    refetch,
    clearError,
  };
};
