
export enum AppView {
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  WORKBENCH = 'WORKBENCH',
  EVALUATION = 'EVALUATION',
  SETTINGS = 'SETTINGS'
}

export interface KnowledgeItem {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'PPTX' | 'URL' | 'XLSX' | 'POLICY' | 'FOLDER' | 'TXT' | 'JPG' | 'PNG';
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
  // 回收站与生命周期管理
  isDeleted?: boolean;
  deletedAt?: string;
  originalParentId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'UPLOAD' | 'DELETE' | 'MOVE' | 'RENAME' | 'DOWNLOAD' | 'RESTORE' | 'PERMANENT_DELETE';
  targetId: string;
  targetName: string;
  timestamp: string;
  beforeState?: string;
  afterState?: string;
  ip?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentFolderId?: string;
  updateTime: string;
  author: string;
}

export interface PolicyItem extends KnowledgeItem {
  authority: string; 
  effectiveness: '法律' | '行政法规' | '部门规章' | '地方性法规';
  tags: string[];
  recommendReason?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  structure: string[];
  isCustom?: boolean;
}

export interface Project {
  id: string;
  name: string;
  status: '进行中' | '已完成' | '待审核';
  progress: number;
  lastModified: string;
  author: string;
}

export interface EvaluationResult {
  scores: {
    policy: number;
    requirement: number;
    product: number;
    logic: number;
    business: number;
  };
  totalScore: number;
  suggestions: {
    dimension: string;
    advice: string;
    basis: string;
  }[];
}
