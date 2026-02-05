
import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, Plus, FileText, Download, Trash2, ShieldCheck, 
  X, FolderPlus, Folder, ChevronRight, Upload, MoreHorizontal,
  FileBox, ExternalLink, Loader2, BookMarked, Sparkles, AlignLeft,
  RotateCcw, History, ClipboardList, Info, ArrowLeftRight, Trash,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { MOCK_KNOWLEDGE, MOCK_POLICIES } from '../constants';
import { KnowledgeItem, AuditLog } from '../types';
import { geminiService } from '../services/geminiService';

const KnowledgeBase: React.FC = () => {
  // 核心视图切换：标准库 | 政策库 | 回收站 | 审计日志
  const [viewMode, setViewMode] = useState<'standard' | 'policy' | 'recycle' | 'audit'>('standard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 数据仓库
  const [items, setItems] = useState<KnowledgeItem[]>(() => {
    const folder1: KnowledgeItem = {
      id: 'f-1', name: '2026年度投标素材', type: 'FOLDER', domain: '通用',
      scenario: '管理', version: '-', updateTime: '2026-02-01', securityLevel: '内部', size: '-', author: 'System'
    };
    return [folder1, ...MOCK_KNOWLEDGE];
  });

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<KnowledgeItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // 移动文件状态
  const [movingItem, setMovingItem] = useState<KnowledgeItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 辅助函数：记录审计日志 (KA-21)
  const logAction = (action: AuditLog['action'], target: KnowledgeItem, before?: string, after?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: 'U-001',
      userName: 'Ginny Xie',
      action,
      targetId: target.id,
      targetName: target.name,
      timestamp: new Date().toLocaleString(),
      beforeState: before,
      afterState: after,
      ip: '10.12.34.112'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // 逻辑计算：过滤当前视图的文件
  const visibleItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFolder = item.parentFolderId === (currentFolderId || undefined);
      
      if (viewMode === 'recycle') return item.isDeleted && matchesSearch;
      if (viewMode === 'standard') return !item.isDeleted && matchesFolder && matchesSearch;
      return false;
    });
  }, [items, searchTerm, currentFolderId, viewMode]);

  const breadcrumbs = useMemo(() => {
    const path = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = items.find(i => i.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentFolderId || null;
      } else {
        break;
      }
    }
    return path;
  }, [currentFolderId, items]);

  // 操作处理：上传 (KA-16)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadProgress(10);
    
    for (const file of Array.from(files)) {
      const newItem: KnowledgeItem = {
        id: `up-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: (file.name.split('.').pop()?.toUpperCase() as any) || 'DOCX',
        domain: '待分类',
        scenario: '新上传',
        version: 'V1.0',
        updateTime: new Date().toISOString().split('T')[0],
        securityLevel: '内部',
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        author: 'Ginny Xie',
        parentFolderId: currentFolderId || undefined,
        content: `[文件原文内容解析完毕]`
      };
      setItems(prev => [newItem, ...prev]);
      logAction('UPLOAD', newItem);
    }
    setUploadProgress(100);
    setTimeout(() => setUploadProgress(null), 500);
  };

  // 操作处理：逻辑删除 (KA-25)
  const handleSoftDelete = (item: KnowledgeItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { 
      ...i, 
      isDeleted: true, 
      deletedAt: new Date().toLocaleString(),
      originalParentId: i.parentFolderId 
    } : i));
    logAction('DELETE', item, 'Active', 'Recycle Bin');
  };

  // 操作处理：恢复文件 (KA-27)
  const handleRestore = (item: KnowledgeItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { 
      ...i, 
      isDeleted: false, 
      parentFolderId: i.originalParentId 
    } : i));
    logAction('RESTORE', item, 'Recycle Bin', 'Active');
  };

  // 操作处理：永久删除 (KA-28)
  const handlePermanentDelete = (item: KnowledgeItem) => {
    if (!confirm(`确定永久删除 ${item.name} 吗？此操作不可恢复。`)) return;
    setItems(prev => prev.filter(i => i.id !== item.id));
    logAction('PERMANENT_DELETE', item);
  };

  // 操作处理：移动文件 (KA-31)
  const handleMoveTo = (targetFolderId: string | null) => {
    if (!movingItem) return;
    const oldParent = items.find(i => i.id === movingItem.parentFolderId)?.name || '根目录';
    const newParent = items.find(i => i.id === targetFolderId)?.name || '根目录';

    setItems(prev => prev.map(i => i.id === movingItem.id ? { ...i, parentFolderId: targetFolderId || undefined } : i));
    logAction('MOVE', movingItem, oldParent, newParent);
    setMovingItem(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FOLDER': return <Folder className="w-6 h-6 text-blue-500 fill-blue-500/20" />;
      case 'PDF': return <FileText className="w-6 h-6 text-red-500" />;
      case 'DOCX': return <FileText className="w-6 h-6 text-blue-600" />;
      case 'POLICY': return <BookMarked className="w-6 h-6 text-indigo-600" />;
      default: return <FileText className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />

      {/* 顶部导航与搜索 (KA-4.2) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索资产文件名或审计关键字..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button 
             onClick={() => setViewMode('standard')}
             className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'standard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
           >
             资产库
           </button>
           <button 
             onClick={() => setViewMode('policy')}
             className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'policy' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
           >
             政策库
           </button>
           <button 
             onClick={() => setViewMode('recycle')}
             className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'recycle' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}`}
           >
             回收站
           </button>
           <button 
             onClick={() => setViewMode('audit')}
             className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
           >
             操作日志
           </button>
        </div>
      </div>

      {/* 视图内容区 */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {viewMode === 'audit' ? (
          /* 审计日志视图 (KA-21 to KA-24) */
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                 <History className="w-5 h-5 text-blue-600" /> 操作审计报告
               </h3>
               <button className="text-xs font-black text-blue-600 flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                 <Download className="w-4 h-4" /> 导出审计报表 (PDF)
               </button>
            </div>
            <div className="space-y-4">
              {logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-6 hover:bg-white hover:shadow-md transition-all">
                   <div className={`p-3 rounded-xl ${log.action === 'DELETE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      <ClipboardList className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{log.timestamp}</span>
                        <span className="text-[10px] font-bold text-slate-400 italic">IP: {log.ip}</span>
                      </div>
                      <p className="font-bold text-slate-800">
                        <span className="text-blue-600">@{log.userName}</span> 
                        {log.action === 'UPLOAD' && ' 上传了文件 '}
                        {log.action === 'DELETE' && ' 将文件移入了回收站 '}
                        {log.action === 'RESTORE' && ' 从回收站恢复了文件 '}
                        {log.action === 'MOVE' && ' 移动了文件层级 '}
                        {log.action === 'PERMANENT_DELETE' && ' 永久删除了 '}
                        <span className="underline font-black decoration-slate-200">“{log.targetName}”</span>
                      </p>
                      {(log.beforeState || log.afterState) && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                           <span className="bg-slate-200 px-2 py-0.5 rounded">{log.beforeState}</span>
                           <ChevronRight className="w-3 h-3" />
                           <span className="bg-blue-600 text-white px-2 py-0.5 rounded">{log.afterState}</span>
                        </div>
                      )}
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center text-slate-300">
                   <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p className="font-black uppercase tracking-widest">No Logs Found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 文件/资产视图 */
          <>
            <div className="px-8 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
              <div className="flex items-center text-sm font-bold">
                 <button onClick={() => setCurrentFolderId(null)} className="hover:text-blue-600 text-slate-400">根目录</button>
                 {breadcrumbs.map(f => (
                   <React.Fragment key={f.id}>
                     <ChevronRight className="w-4 h-4 text-slate-200 mx-1" />
                     <button onClick={() => setCurrentFolderId(f.id)} className="text-slate-900">{f.name}</button>
                   </React.Fragment>
                 ))}
              </div>
              <div className="flex gap-3">
                 {viewMode === 'standard' && (
                   <>
                    <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-100">
                      <Upload className="w-4 h-4" /> 上传资产
                    </button>
                    <button onClick={() => {/* 新建文件夹逻辑 */}} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-black flex items-center gap-2">
                      <FolderPlus className="w-4 h-4 text-blue-600" /> 新建目录
                    </button>
                   </>
                 )}
                 {viewMode === 'recycle' && (
                   <button onClick={() => {/* 清空逻辑 */}} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-black flex items-center gap-2">
                     <Trash className="w-4 h-4" /> 清空回收站
                   </button>
                 )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">
                  <tr>
                    <th className="px-8 py-5">名称</th>
                    <th className="px-4 py-5">{viewMode === 'recycle' ? '删除时间' : '更新时间'}</th>
                    <th className="px-4 py-5">大小</th>
                    <th className="px-8 py-5 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visibleItems.map(item => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 cursor-pointer transition-colors" onClick={() => item.type === 'FOLDER' ? setCurrentFolderId(item.id) : setPreviewItem(item)}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          {getIcon(item.type)}
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-0.5">{item.domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-xs text-slate-400">{viewMode === 'recycle' ? item.deletedAt : item.updateTime}</td>
                      <td className="px-4 py-5 text-xs text-slate-400">{item.size}</td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {viewMode === 'standard' && (
                              <>
                                <button onClick={(e) => {e.stopPropagation(); setMovingItem(item);}} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="移动"><ArrowLeftRight className="w-4 h-4" /></button>
                                <button onClick={(e) => {e.stopPropagation(); handleSoftDelete(item);}} className="p-2 hover:bg-red-50 text-red-500 rounded-lg" title="删除"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                            {viewMode === 'recycle' && (
                              <>
                                <button onClick={(e) => {e.stopPropagation(); handleRestore(item);}} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg" title="恢复"><RotateCcw className="w-4 h-4" /></button>
                                <button onClick={(e) => {e.stopPropagation(); handlePermanentDelete(item);}} className="p-2 hover:bg-red-50 text-red-500 rounded-lg" title="永久删除"><Trash className="w-4 h-4" /></button>
                              </>
                            )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visibleItems.length === 0 && (
                <div className="py-32 flex flex-col items-center opacity-20">
                   <AlertCircle className="w-16 h-16 mb-4" />
                   <p className="font-black uppercase tracking-widest">Directory Empty</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 移动文件弹窗 (KA-31) */}
      {movingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h4 className="font-black text-slate-900">移动资产至...</h4>
                 <button onClick={() => setMovingItem(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="p-6 space-y-2 max-h-80 overflow-y-auto">
                 <button onClick={() => handleMoveTo(null)} className="w-full text-left p-4 rounded-xl border border-dashed border-slate-200 hover:bg-slate-50 font-bold text-sm">根目录</button>
                 {items.filter(i => i.type === 'FOLDER' && i.id !== movingItem.id).map(folder => (
                   <button key={folder.id} onClick={() => handleMoveTo(folder.id)} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:bg-blue-50 flex items-center gap-3 transition-all">
                      <Folder className="w-5 h-5 text-blue-500" />
                      <span className="font-bold text-slate-700">{folder.name}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* 上传通知 */}
      {uploadProgress !== null && (
        <div className="fixed bottom-8 right-8 z-[120] bg-slate-900 text-white p-6 rounded-2xl shadow-2xl w-80 animate-in slide-in-from-right">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest">Uploading Asset</span>
              <Loader2 className="w-4 h-4 animate-spin" />
           </div>
           <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }} />
           </div>
           <p className="text-[10px] font-bold text-slate-400">正在分析文档结构并生成唯一索引...</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
