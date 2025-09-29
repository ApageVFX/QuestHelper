export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  color: string;
  createdAt: Date;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  status: 'todo' | 'in-progress' | 'completed';
  color: string;
  nextQuestId?: string;
  createdBy: string;
  createdAt: Date;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  editHistory: EditEntry[];
}

export interface EditEntry {
  action: 'created' | 'edited' | 'moved' | 'connected';
  user: string;
  timestamp: Date;
  changes?: Record<string, any>;
}

export interface Tab {
  id: string;
  name: string;
  quests: Record<string, Quest>;
  createdAt: Date;
  lastModified: Date;
}

export interface Project {
  id: string;
  name: string;
  tabs: Tab[];
  collaborators: string[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  public: boolean;
  allowComments: boolean;
  versionControl: boolean;
}

export interface QuestLine {
  id: string;
  name: string;
  description: string;
  questCount: number;
  lastModified: Date;
  color: string;
  quests?: Record<string, Quest>;
}

export interface NotesCategory {
  id: string;
  name: string;
  description: string;
  noteCount: number;
  lastModified: Date;
  color: string;
  notes?: Note[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  createdAt: Date;
  lastModified: Date;
  author: string;
}