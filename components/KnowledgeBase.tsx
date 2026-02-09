
import React, { useState, useRef, useMemo } from 'react';
import { Search, FileText, Download, Trash2, X, Folder, ChevronRight, Upload, History, ClipboardList, Loader2, RotateCcw, FileVideo, FileImage, FileSpreadsheet, FileArchive, Globe, Trash } from 'lucide-react';
import { KBState, KnowledgeItem } from '../types';

interface KBProps {
  state: KBState;
  onUpdate: (patch: Partial<KBState>) => void;
}

const KnowledgeBase: React.FC<KBProps> = ({ state, onUpdate }) => {
  const [uploadQueue, setUploadQueue] = useState<{ id: string; name: string; progress: number; status: string }[]>([]);
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

  const simulateUpload = async (file: File) => {
    const id = `up-${Date.now()}`;
    setUploadQueue(prev => [...prev, { id, name: file.name, progress: 0, status: '等待上传' }]);

    for (let p = 10; p <= 100; p += 30) {
      await new Promise(r => setTimeout(r, 500));
      setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, progress: p, status: p < 100 ? '正在同步云端...' : '正在执行 AI 结构化解析...' } : item));
    }

    const extension = file.name.split('.').pop()?.toUpperCase() as any;
    const newItem: KnowledgeItem = {
      id,
      name: file.name,
      type: extension || 'TXT',
      domain: '智能解析',
      scenario: '待分类资产',
      version: 'V1.0',
      updateTime: new Date().toISOString().split('T')[0],
      securityLevel: '内部',
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      parentFolderId: state.currentFolderId || undefined,
      author: 'Ginny Xie',
      parseStatus: 'SUCCESS',
      content: `[AI 自动解析摘要] 该文档名为 ${file.name}，文件大小 ${file.size} 字节。系统已成功提取其核心参数与业务逻辑，并将其转化为结构化文本注入本地向量库，支持方案生成时的精准引用。`
    };

    onUpdate({ items: [newItem, ...state.items] });
    logAction('UPLOAD', newItem);
    
    setTimeout(() => {
      setUploadQueue(prev => prev.filter(item => item.id !== id));
    }, 1200);
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
      
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索结构化知识资产..."
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
        <div className="fixed bottom-10 right-10 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-[200] animate-in slide-in-from-bottom-5">
          <h4 className="font-black text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> 任务队列处理中
          </h4>
          <div className="space-y-4">
            {uploadQueue.map(item => (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="truncate max-w-[150px]">{item.name}</span>
                  <span className="text-blue-600">{item.status}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${item.progress}%` }} />
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
            <Upload className="w-4 h-4" /> 上传新素材
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {visibleItems.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <th className="px-6 py-4">资产名称</th>
                  <th className="px-6 py-4">解析状态</th>
                  <th className="px-6 py-4 text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleItems.map(item => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => item.type === 'FOLDER' && onUpdate({ currentFolderId: item.id })}>
                    <td className="px-6 py-6 flex items-center gap-5">
                       <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">{getFileIcon(item.type)}</div>
                       <div>
                         <p className="font-black text-slate-900 text-sm">{item.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.domain} · {item.scenario}</p>
                       </div>
                    </td>
                    <td className="px-6 py-6">
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                         item.parseStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                         {item.parseStatus === 'SUCCESS' ? '已完成结构化' : '待处理'}
                       </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-100"><Download className="w-4 h-4" /></button>
                         <button onClick={(e) => { e.stopPropagation(); onUpdate({ items: state.items.map(i => i.id === item.id ? {...i, isDeleted: true} : i) }); }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-32">
              <Folder className="w-24 h-24 mb-6" />
              <p className="font-black uppercase tracking-[0.4em] text-2xl">暂无数据资产</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
