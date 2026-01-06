export enum ProjectCategory {
  UXUI = 'UX/UI Design',
  DEVELOPMENT = 'Development',
  WORDPRESS = 'WordPress',
  MOBILE = 'Mobile App',
  BRANDING = 'Branding',
  RESEARCH = 'Research',
  OTHER = 'Other'
}

export enum LinkType {
  FIGMA = 'Figma',
  GITHUB = 'GitHub',
  LIVE = 'Live Site',
  DRIVE = 'Google Drive',
  DOC = 'Documentation',
  OTHER = 'Other'
}

export interface ProjectLink {
  id: string;
  label: string;
  url: string;
  type: LinkType;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  profileOwner: string; // The "Profile" column from the excel (e.g., "Agency Portfolio" or specific designer)
  tags: string[];
  links: ProjectLink[];
  lastModified: number;
  thumbnailUrl?: string; // Optional generic thumbnail
}

export interface FilterState {
  search: string;
  category: ProjectCategory | 'All';
  tag: string | 'All';
}