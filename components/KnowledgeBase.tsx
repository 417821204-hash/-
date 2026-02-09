
import React, { useState, useRef, useMemo } from 'react';
import { Search, FileText, Download, Trash2, X, Folder, ChevronRight, Upload, History, ClipboardList, Loader2, RotateCcw, FileVideo, FileImage, FileSpreadsheet, FileArchive, Globe, Trash, FileSearch } from 'lucide-react';
import { KBState, KnowledgeItem } from '../types';

interface KBProps {
  state: KBState;
  onUpdate: (patch: Partial<KBState>) => void;
}

const KnowledgeBase: React.FC<KBProps> = ({ state, onUpdate }) => {
  const [uploadQueue, setUploadQueue] = useState<{ id: string; name: string; progress: number; status: string }[]>([]);
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logAction = (action: any, target: { id: string; name: string }) => {
    const newLog: any = {
      id: `log-${Date.now()}`,
      userId: 'U-001',
      userName: 'Ginny Xie',
      action,
      targetId: target.id,
      targetName: target.name,
      timestamp: new Date().toLocaleString(),
      ip: '10.12.34.112'
    };
    onUpdate({ logs: [newLog, ...state.logs] });
  };

  // 模拟深度文件内容提取
  const extractContentMock = (fileName: string, type: string) => {
    const nameNoExt = fileName.split('.')[0];
    return `【结构化解析报告 - 鲸·方案智造】
生成时间：${new Date().toLocaleString()}
解析引擎：Vision-Text-Extract V4.0
文档指纹：${Math.random().toString(36).substring(7).toUpperCase()}

[1. 核心业务范畴]
该文档《${fileName}》主要阐述了关于“${nameNoExt}”相关的技术规格、业务逻辑及行业标准。内容涵盖了该领域的顶层架构设计原则。

[2. 关键参数与知识点提取]
- 场景定义：明确了在${state.currentFolderId ? '特定目录' : '全局'}环境下的业务闭环路径。
- 核心指标：文档中强调了“高可用性”、“数据安全性”以及“标准兼容性”作为建设基石。
- 技术路线：倾向于采用分布式架构设计，强调解耦与集约化建设。

[3. 专家推理建议]
- AI 专家在引用此文档进行方案生成时，应优先考虑其在“${nameNoExt}”章节中的合规性描述。
- 建议将本文档中的实施路径与现有的政策库进行交叉校验，以确保方案的权威性。

[4. 原始摘要片段]
...通过对${nameNoExt}的深入研究，我们发现在当前数字化转型的大背景下，${type}格式的标准化交付能够显著提升跨部门协同效率。本方案建议在第三阶段引入自动化运维模块，实现${Math.floor(Math.random() * 20 + 80)}%的业务流程覆盖...`;
  };

  const simulateUpload = async (file: File) => {
    const id = `up-${Date.now()}`;
    setUploadQueue(prev => [...prev, { id, name: file.name, progress: 0, status: '等待上传' }]);

    // 1. 模拟物理上传
    for (let p = 0; p <= 60; p += 20) {
      await new Promise(r => setTimeout(r, 400));
      setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, progress: p, status: '正在同步至企业云存储...' } : item));
    }

    // 2. 模拟 AI 内容解析（关键逻辑）
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, status: '启动深度 OCR 与文本提取...' } : item));
    await new Promise(r => setTimeout(r, 800));
    
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, progress: 85, status: '正在生成文档向量特征...' } : item));
    await new Promise(r => setTimeout(r, 600));

    const extension = file.name.split('.').pop()?.toUpperCase() as any;
    const newItem: KnowledgeItem = {
      id,
      name: file.name,
      type: extension || 'TXT',
      domain: '智能解析',
      scenario: '结构化资产',
      version: 'V1.0',
      updateTime: new Date().toISOString().split('T')[0],
      securityLevel: '内部',
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      parentFolderId: state.currentFolderId || undefined,
      author: 'Ginny Xie',
      parseStatus: 'SUCCESS',
      content: extractContentMock(file.name, extension || 'TEXT')
    };

    onUpdate({ items: [newItem, ...state.items] });
    logAction('UPLOAD', newItem);
    
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, progress: 100, status: '解析完成，已注入向量库' } : item));
    setTimeout(() => {
      setUploadQueue(prev => prev.filter(item => item.id !== id));
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(simulateUpload);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const visibleItems = useMemo(() => {
    return state.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesFolder = item.parentFolderId === (state.currentFolderId || undefined);
      if (state.viewMode === 'recycle') return item.isDeleted && matchesSearch;
      if (state.viewMode === 'standard') return !item.isDeleted && matchesFolder && matchesSearch;
      return false;
    });
  }, [state]);

  const breadcrumbs = useMemo(() => {
    const path = [];
    let currentId = state.currentFolderId;
    while (currentId) {
      const folder = state.items.find(i => i.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentFolderId || null;
      } else break;
    }
    return path;
  }, [state.currentFolderId, state.items]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'FOLDER': return <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" />;
      case 'PDF': return <FileText className="w-5 h-5 text-rose-500" />;
      case 'DOCX': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'PPTX': return <FileArchive className="w-5 h-5 text-orange-500" />;
      case 'XLSX': return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'MP4': return <FileVideo className="w-5 h-5 text-indigo-500" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
      
      {/* 预览 Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-8">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col animate-in zoom-in-95">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[2.5rem]">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                     {getFileIcon(previewItem.type)}
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">{previewItem.name}</h3>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">结构化解析预览 · 推理就绪</p>
                   </div>
                </div>
                <button onClick={() => setPreviewItem(null)} className="p-3 hover:bg-white hover:shadow-sm rounded-2xl transition-all border border-transparent hover:border-slate-100 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-12 bg-white">
                <div className="max-w-3xl mx-auto">
                   <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl font-mono text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
                      {previewItem.content || '该文件尚未完成深度解析内容提取。'}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索结构化知识资产或解析内容..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={state.searchTerm}
            onChange={(e) => onUpdate({ searchTerm: e.target.value })}
          />
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
           {(['standard', 'policy', 'recycle', 'audit'] as const).map(m => (
             <button key={m} onClick={() => onUpdate({ viewMode: m })} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${state.viewMode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
               {m === 'standard' ? '知识库' : m === 'policy' ? '政策库' : m === 'recycle' ? '回收站' : '审计'}
             </button>
           ))}
        </div>
      </div>

      {uploadQueue.length > 0 && (
        <div className="fixed bottom-10 right-10 w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 z-[200] animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> AI 解析中
            </h4>
            <span className="text-[10px] font-black text-slate-400 px-2 py-0.5 bg-slate-100 rounded uppercase">Processing</span>
          </div>
          <div className="space-y-6">
            {uploadQueue.map(item => (
              <div key={item.id} className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="truncate max-w-[200px] text-slate-700">{item.name}</span>
                  <span className="text-blue-600">{item.status}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
        <div className="px-10 py-6 border-b flex justify-between items-center bg-slate-50/20">
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => onUpdate({ currentFolderId: null })} className={`font-black uppercase tracking-widest ${!state.currentFolderId ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>根目录</button>
            {breadcrumbs.map(b => (
              <React.Fragment key={b.id}>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <button onClick={() => onUpdate({ currentFolderId: b.id })} className="font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">{b.name}</button>
              </React.Fragment>
            ))}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl shadow-slate-200 flex items-center gap-2 hover:bg-black transition-all">
            <Upload className="w-4 h-4" /> 批量上传并解析
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {visibleItems.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <th className="px-6 py-4">资产名称 / 类型</th>
                  <th className="px-6 py-4">解析状态</th>
                  <th className="px-6 py-4 text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleItems.map(item => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => item.type === 'FOLDER' ? onUpdate({ currentFolderId: item.id }) : setPreviewItem(item)}>
                    <td className="px-6 py-6 flex items-center gap-5">
                       <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm group-hover:scale-110 transition-transform">{getFileIcon(item.type)}</div>
                       <div>
                         <p className="font-black text-slate-900 text-sm">{item.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.domain} · {item.size}</p>
                       </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            item.parseStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {item.parseStatus === 'SUCCESS' ? '解析完成' : '解析中'}
                          </span>
                          {item.parseStatus === 'SUCCESS' && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                              <ShieldCheck className="w-3 h-3" /> 模型推理可用
                            </div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }} className="p-2 text-blue-500 hover:bg-white rounded-lg border border-transparent hover:border-blue-100" title="预览解析文本"><FileSearch className="w-4 h-4" /></button>
                         <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-100"><Download className="w-4 h-4" /></button>
                         <button onClick={(e) => { e.stopPropagation(); onUpdate({ items: state.items.map(i => i.id === item.id ? {...i, isDeleted: true} : i) }); }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-32 grayscale select-none">
              <Folder className="w-24 h-24 mb-6" />
              <p className="font-black uppercase tracking-[0.4em] text-2xl">资产库为空</p>
              <p className="text-xs mt-4 font-bold tracking-widest opacity-60">请上传本地素材进行 AI 结构化解析</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 辅助图标
const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path></svg>
);

export default KnowledgeBase;
