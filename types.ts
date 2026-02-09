
export enum AppView {
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  WORKBENCH = 'WORKBENCH',
  EVALUATION = 'EVALUATION',
  SETTINGS = 'SETTINGS'
}

export interface KnowledgeItem {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'PPTX' | 'URL' | 'XLSX' | 'POLICY' | 'FOLDER' | 'TXT' | 'JPG' | 'PNG' | 'MP4';
  domain: string;
  scenario: string;
  version: string;
  updateTime: string;
  securityLevel: '公开' | '内部' | '机密';
  size: string;
  url?: string;
  source?: string;
  parentFolderId?: string; 
  author?: string;
  content?: string; 
  isDeleted?: boolean;
  deletedAt?: string;
  originalParentId?: string;
  parseStatus?: 'PENDING' | 'PARSING' | 'SUCCESS' | 'FAILED'; // 解析状态
}

// Added Project interface to fix import error in constants.tsx
export interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  lastModified: string;
  author: string;
}

export interface PolicyItem extends KnowledgeItem {
  authority: string;
  effectiveness: string;
  tags: string[];
  recommendReason: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'UPLOAD' | 'DELETE' | 'MOVE' | 'RENAME' | 'DOWNLOAD' | 'RESTORE' | 'PERMANENT_DELETE' | 'EMPTY_RECYCLE_BIN';
  targetId: string;
  targetName: string;
  timestamp: string;
  beforeState?: string;
  afterState?: string;
  ip?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  structure: string[];
  isCustom?: boolean;
}

export interface WorkbenchState {
  demand: string;
  result: string | null;
  proposalTitle: string;
  selectedFiles: KnowledgeItem[];
  selectedTemplateId: string;
  templates: Template[];
}

export interface KBState {
  viewMode: 'standard' | 'policy' | 'recycle' | 'audit';
  searchTerm: string;
  currentFolderId: string | null;
  items: KnowledgeItem[];
  logs: AuditLog[];
}

export interface EvaluationState {
  content: string;
  standard: string;
  result: any | null;
}

export interface AppPersistenceState {
  lastUpdated: number;
  currentView: AppView;
  workbench: WorkbenchState;
  kb: KBState;
  evaluation: EvaluationState;
}