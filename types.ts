
export enum AppView {
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  WORKBENCH = 'WORKBENCH',
  EVALUATION = 'EVALUATION',
  SETTINGS = 'SETTINGS'
}

export interface KnowledgeItem {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'PPTX' | 'URL' | 'XLSX' | 'POLICY';
  domain: string;
  scenario: string;
  version: string;
  updateTime: string;
  securityLevel: '公开' | '内部' | '机密';
  size: string;
  url?: string;
  source?: string;
}

export interface PolicyItem extends KnowledgeItem {
  authority: string; // 发布机构
  effectiveness: '法律' | '行政法规' | '部门规章' | '地方性法规'; // 效力级别
  tags: string[];
  recommendReason?: string; // AI 推荐理由
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
