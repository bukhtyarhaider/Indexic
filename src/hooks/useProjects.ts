import { useState, useRef, ChangeEvent } from 'react';
import { Project } from '../types';
import { INITIAL_PROJECTS } from '../constants';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  
  // File input ref for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addProject = (project: Project) => {
    setProjects([project, ...projects]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const importJSON = (e: ChangeEvent<HTMLInputElement>, onComplete: (msg: string) => void, onError: (msg: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (Array.isArray(importedData)) {
          // Merge Strategy: Add projects that don't exist by ID
          let addedCount = 0;
          setProjects(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProjects = importedData.filter((p: any) => !existingIds.has(p.id));
            addedCount = newProjects.length;
            return [...newProjects, ...prev];
          });
          
          if (addedCount > 0) {
             onComplete(`Imported ${addedCount} new projects!`);
          } else {
             onComplete('Projects loaded. No new unique projects found.');
          }

        } else {
          onError('Invalid JSON file format.');
        }
      } catch (err) {
        console.error(err);
        onError('Failed to parse JSON file.');
      }
      // Reset input value to allow selecting same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const importGithub = (newProjects: Project[]) => {
    setProjects(prev => [...newProjects, ...prev]);
  };
  
  const exportJSON = (filename: string) => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProject,
    importJSON,
    importGithub,
    exportJSON,
    fileInputRef
  };
};
