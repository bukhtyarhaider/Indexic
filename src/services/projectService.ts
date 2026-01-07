import { supabase } from "../lib/supabase";
import type { Project, ProjectLink } from "../types";

/**
 * Database row type (matching Supabase table structure)
 */
interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  profile_owner: string;
  tags: string[];
  links: ProjectLink[];
  thumbnail_url: string | null;
  last_modified: string;
  created_at: string;
}

/**
 * Convert database row to Project type
 */
const rowToProject = (row: ProjectRow): Project => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  description: row.description,
  category: row.category as Project["category"],
  profileOwner: row.profile_owner,
  tags: row.tags || [],
  links: (row.links as ProjectLink[]) || [],
  lastModified: new Date(row.last_modified).getTime(),
  thumbnailUrl: row.thumbnail_url ?? undefined,
});

/**
 * Convert Project to database insert format
 */
const projectToInsert = (project: Omit<Project, "id">, userId: string) => ({
  user_id: userId,
  name: project.name,
  description: project.description,
  category: project.category,
  profile_owner: project.profileOwner,
  tags: project.tags,
  links: project.links,
  thumbnail_url: project.thumbnailUrl ?? null,
  last_modified: new Date(project.lastModified).toISOString(),
});

/**
 * Convert Project to database update format
 */
const projectToUpdate = (project: Partial<Project>) => {
  const update: Record<string, unknown> = {};

  if (project.name !== undefined) update.name = project.name;
  if (project.description !== undefined)
    update.description = project.description;
  if (project.category !== undefined) update.category = project.category;
  if (project.profileOwner !== undefined)
    update.profile_owner = project.profileOwner;
  if (project.tags !== undefined) update.tags = project.tags;
  if (project.links !== undefined) update.links = project.links;
  if (project.thumbnailUrl !== undefined)
    update.thumbnail_url = project.thumbnailUrl ?? null;
  if (project.lastModified !== undefined) {
    update.last_modified = new Date(project.lastModified).toISOString();
  }

  return update;
};

/**
 * Map database errors to user-friendly messages
 */
const getErrorMessage = (error: { message: string; code?: string }): string => {
  const msg = error.message.toLowerCase();

  if (msg.includes("row-level security") || msg.includes("rls")) {
    return "Permission denied. Please verify your email and try logging in again.";
  }

  if (msg.includes("jwt expired") || msg.includes("token")) {
    return "Your session has expired. Please log in again.";
  }

  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }

  if (msg.includes("duplicate") || msg.includes("unique")) {
    return "A project with this name already exists.";
  }

  return error.message;
};

export interface ProjectServiceResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Get all projects for the current user
 */
export const getProjects = async (): Promise<
  ProjectServiceResult<Project[]>
> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("last_modified", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return { data: null, error: error.message };
  }

  return {
    data: ((data || []) as unknown as ProjectRow[]).map(rowToProject),
    error: null,
  };
};

/**
 * Get a single project by ID
 */
export const getProjectById = async (
  id: string
): Promise<ProjectServiceResult<Project>> => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return { data: null, error: error.message };
  }

  return {
    data: rowToProject(data as unknown as ProjectRow),
    error: null,
  };
};

/**
 * Create a new project
 */
export const createProject = async (
  project: Omit<Project, "id">,
  userId: string
): Promise<ProjectServiceResult<Project>> => {
  const insertData = projectToInsert(project, userId);

  const { data, error } = await supabase
    .from("projects")
    .insert(insertData as never)
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    return { data: null, error: getErrorMessage(error) };
  }

  return {
    data: rowToProject(data as unknown as ProjectRow),
    error: null,
  };
};

/**
 * Update an existing project
 */
export const updateProject = async (
  id: string,
  updates: Partial<Project>,
  userId?: string
): Promise<ProjectServiceResult<Project>> => {
  // If userId is provided, verify ownership first
  if (userId) {
    const { data: existingProject } = await getProjectById(id);
    if (existingProject && existingProject.userId !== userId) {
      return {
        data: null,
        error: "You do not have permission to edit this project.",
      };
    }
  }

  const updateData = projectToUpdate({
    ...updates,
    lastModified: Date.now(),
  });

  const { data, error } = await supabase
    .from("projects")
    .update(updateData as never)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    return { data: null, error: getErrorMessage(error) };
  }

  return {
    data: rowToProject(data as unknown as ProjectRow),
    error: null,
  };
};

/**
 * Delete a project
 */
export const deleteProject = async (
  id: string,
  userId?: string
): Promise<ProjectServiceResult<void>> => {
  // If userId is provided, verify ownership first
  if (userId) {
    const { data: existingProject } = await getProjectById(id);
    if (existingProject && existingProject.userId !== userId) {
      return {
        data: null,
        error: "You do not have permission to delete this project.",
      };
    }
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    return { data: null, error: getErrorMessage(error) };
  }

  return { data: undefined, error: null };
};

/**
 * Bulk import projects
 */
export const importProjects = async (
  projects: Omit<Project, "id">[],
  userId: string
): Promise<ProjectServiceResult<Project[]>> => {
  const insertData = projects.map((p) => projectToInsert(p, userId));

  const { data, error } = await supabase
    .from("projects")
    .insert(insertData as never)
    .select();

  if (error) {
    console.error("Error importing projects:", error);
    return { data: null, error: getErrorMessage(error) };
  }

  return {
    data: ((data || []) as unknown as ProjectRow[]).map(rowToProject),
    error: null,
  };
};
