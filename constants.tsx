
import React from 'react';
import { Database, FileEdit, ClipboardCheck, Settings } from 'lucide-react';
import { AppView, KnowledgeItem, Project, Template, PolicyItem } from './types';

export const NAVIGATION_ITEMS = [
  { id: AppView.WORKBENCH, label: '方案工作台', icon: <FileEdit className="w-5 h-5" /> },
  { id: AppView.KNOWLEDGE_BASE, label: '知识资产库', icon: <Database className="w-5 h-5" /> },
  { id: AppView.EVALUATION, label: '评估中心', icon: <ClipboardCheck className="w-5 h-5" /> },
  { id: AppView.SETTINGS, label: '系统管理', icon: <Settings className="w-5 h-5" /> },
];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: '项目建设方案',
    description: '标准技术建议书，适用于政府、国企数字化招投标',
    structure: ["1. 建设背景", "2. 现状与问题", "3. 建设目标", "4. 总体架构", "5. 产品体系", "6. 实施路径", "7. 服务保障", "8. 风险管控", "9. 成效预期"]
  },
  {
    id: 't2',
    name: '项目申报书',
    description: '适用于发改委、经信局项目立项申报',
    structure: ["一、项目必要性", "二、项目建设基础", "三、主要建设内容", "四、技术路线及创新点", "五、经济效益分析", "六、社会效益评估"]
  },
  {
    id: 't3',
    name: '可行性研究报告',
    description: '深度分析项目投资、技术及商业可行性',
    structure: ["第一章 总论", "第二章 项目建设必要性", "第三章 市场供求分析", "第四章 产品方案与建设规模", "第五章 选址与建设条件", "第六章 技术方案及工程方案"]
  }
];

export const MOCK_KNOWLEDGE: KnowledgeItem[] = [
  { id: '1', name: '智慧城市底层架构白皮书.pdf', type: 'PDF', domain: '智慧城市', scenario: '底层架构', version: 'V2.1', updateTime: '2026-01-20', securityLevel: '内部', size: '4.5MB' },
  { id: '2', name: '金融云安全合规手册.docx', type: 'DOCX', domain: '金融科技', scenario: '安全合规', version: 'V1.5', updateTime: '2026-02-01', securityLevel: '机密', size: '1.2MB' },
  { id: 'url-1', name: '讯飞EPDM-语音识别产品规范', type: 'URL', domain: '人工智能', scenario: '产品规范', version: 'Realtime', updateTime: '2026-02-05', securityLevel: '内部', size: 'N/A', url: 'https://epdm.iflytek.com/web/...' },
  { id: '3', name: '全渠道零售解决方案PPT.pptx', type: 'PPTX', domain: '零售电商', scenario: '全渠道融合', version: 'V3.0', updateTime: '2026-02-03', securityLevel: '公开', size: '12.8MB' },
];

export const MOCK_POLICIES: PolicyItem[] = [
  { 
    id: 'p1', 
    name: '关于加快公共数据资源普查与授权运营的指导意见', 
    type: 'POLICY', 
    domain: '数据要素', 
    scenario: '公共数据', 
    version: '2025年12号', 
    updateTime: '2025-12-15', 
    securityLevel: '公开', 
    size: 'N/A',
    authority: '国家数据局',
    effectiveness: '行政法规',
    tags: ['数据要素', '授权运营'],
    recommendReason: '基于您近期生成的“智慧政务平台”方案，该文件对数据共享章节有重要指导作用。'
  },
  { 
    id: 'p2', 
    name: '金融分布式账本技术安全规范 (JR/T 0184—2024)', 
    type: 'POLICY', 
    domain: '金融科技', 
    scenario: '区块链安全', 
    version: '行业标准', 
    updateTime: '2024-11-20', 
    securityLevel: '公开', 
    size: 'N/A',
    authority: '中国人民银行',
    effectiveness: '部门规章',
    tags: ['区块链', '金融安全'],
    recommendReason: '匹配您的专业领域“金融科技”，建议作为底层安全设计依据。'
  },
  { 
    id: 'p3', 
    name: '“人工智能+”行动计划实施指南 (2025-2027)', 
    type: 'POLICY', 
    domain: '人工智能', 
    scenario: '算力基础设施', 
    version: '征求意见稿', 
    updateTime: '2026-01-05', 
    securityLevel: '公开', 
    size: 'N/A',
    authority: '工业和信息化部',
    effectiveness: '部门规章',
    tags: ['AI+', '算力中心'],
    recommendReason: '全网热点：近期该政策对 AI 基础设施方案的立项申报具有高权重影响。'
  }
];

export const MOCK_PROJECTS: Project[] = [
  { id: '1', name: '2026年XX市智慧政务平台建设方案', status: '已完成', progress: 100, lastModified: '2026-02-05', author: 'Ginny Xie' },
  { id: '2', name: 'XX银行金融数据跨境流动安全评估', status: '进行中', progress: 65, lastModified: '2026-02-06', author: 'Ginny Xie' },
  { id: '3', name: 'XX零售集团全渠道私域运营技术方案', status: '待审核', progress: 85, lastModified: '2026-02-04', author: 'Ginny Xie' },
];
