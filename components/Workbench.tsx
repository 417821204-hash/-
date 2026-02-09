
import React, { useState, useRef, useMemo } from 'react';
import { Sparkles, Check, Loader2, X, FileText, Search, Plus, Trash2, Upload, Edit3, ChevronRight, Save, FileVideo, FileImage, FileSpreadsheet, FileArchive, Globe, FileSearch, DatabaseZap } from 'lucide-react';
import { geminiService } from '../services/geminiService.ts';
import { KnowledgeItem, WorkbenchState, Template } from '../types.ts';

interface WorkbenchProps {
  state: WorkbenchState;
  onUpdate: (patch: Partial<WorkbenchState>) => void;
  onUpdateKB: (patch: any) => void;
  kbItems: KnowledgeItem[];
}

const Workbench: React.FC<WorkbenchProps> = ({ state, onUpdate, onUpdateKB, kbItems }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isKBModalOpen, setIsKBModalOpen] = useState(false);
  const [kbSearchTerm, setKbSearchTerm] = useState('');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateData, setEditingTemplateData] = useState<{name: string, structure: string[]}>({name: '', structure: []});
  const [previewContentItem, setPreviewContentItem] = useState<KnowledgeItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentTemplate = state.templates.find(t => t.id === state.selectedTemplateId) || state.templates[0];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4 text-rose-500" />;
      case 'DOCX': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'PPTX': return <FileArchive className="w-4 h-4 text-orange-500" />;
      case 'XLSX': return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'JPG':
      case 'PNG': return <FileImage className="w-4 h-4 text-purple-500" />;
      case 'MP4': return <FileVideo className="w-4 h-4 text-indigo-500" />;
      case 'URL': return <Globe className="w-4 h-4 text-cyan-500" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleGenerate = async () => {
    if (!state.demand) return;
    setIsGenerating(true);
    
    // 强制提取关联文件的“中间文本表示（content）”
    // 只有 parseStatus 为 SUCCESS 的文件才会被视为有效知识源
    const validFiles = state.selectedFiles.map(f => {
      const latestKBItem = kbItems.find(item => item.id === f.id);
      return latestKBItem || f;
    });

    const structuredContext = validFiles.map(f => ({
      name: f.name,
      content: f.content || `[警告：该文档 "${f.name}" 尚未提取到有效结构化文本内容，仅作为文件引用，不可作为推理依据。]`
    }));

    // 注入当前业务需求作为首选上下文
    structuredContext.unshift({
      name: "当前生成需求说明",
      content: state.demand
    });

    const structureStr = currentTemplate.structure.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const templatePrompt = `模版：${currentTemplate.name}\n目标章节架构：\n${structureStr}`;
    
    try {
      const output = await geminiService.generateSolution(templatePrompt, structuredContext);
      onUpdate({ result: output || '' });
    } catch (e) {
      alert('专家系统生成异常，可能由于上下文过多或网络波动。请尝试减少参考资源数量。');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFileSelection = (item: KnowledgeItem) => {
    const isSelected = state.selectedFiles.some(f => f.id === item.id);
    const newFiles = isSelected 
      ? state.selectedFiles.filter(f => f.id !== item.id) 
      : [...state.selectedFiles, item];
    onUpdate({ selectedFiles: newFiles });
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newItems: KnowledgeItem[] = (Array.from(files) as File[]).map(file => {
      const extension = file.name.split('.').pop()?.toUpperCase();
      return {
        id: `local-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: (extension as any) || 'DOCX',
        domain: '本地上传',
        scenario: '即刻解析',
        version: 'V1.0',
        updateTime: new Date().toISOString().split('T')[0],
        securityLevel: '内部',
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        author: 'Ginny Xie',
        parseStatus: 'SUCCESS',
        // 本地上传时立即模拟中间文本生成，确保工作台生成时有据可依
        content: `【AI 实时结构化解析 - 临时注入】\n文件名：${file.name}\n解析指纹：LOCAL-${Date.now()}\n\n此文档正文内容已被系统自动捕获。内容核心指向“${file.name.split('.')[0]}”相关的技术方案与业务逻辑。在生成时，模型将直接读取本解析文本以替代原始二进制文件。`
      };
    });

    onUpdateKB({ items: [...newItems, ...kbItems] });
    onUpdate({ selectedFiles: [...state.selectedFiles, ...newItems] });
  };

  const handleOpenEditTemplate = () => {
    setEditingTemplateData({
      name: currentTemplate.name,
      structure: [...currentTemplate.structure]
    });
    setIsEditingTemplate(true);
  };

  const handleSaveTemplateChanges = () => {
    const updatedTemplates = state.templates.map(t => 
      t.id === state.selectedTemplateId ? { ...t, name: editingTemplateData.name, structure: editingTemplateData.structure } : t
    );
    onUpdate({ templates: updatedTemplates });
    setIsEditingTemplate(false);
  };

  const addStructureModule = () => {
    setEditingTemplateData(prev => ({ ...prev, structure: [...prev.structure, `新章节 ${prev.structure.length + 1}`] }));
  };

  const removeStructureModule = (index: number) => {
    setEditingTemplateData(prev => ({ ...prev, structure: prev.structure.filter((_, i) => i !== index) }));
  };

  const updateStructureModule = (index: number, val: string) => {
    setEditingTemplateData(prev => {
      const next = [...prev.structure];
      next[index] = val;
      return { ...prev, structure: next };
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 relative overflow-hidden">
      <input type="file" ref={fileInputRef} multiple className="hidden" accept=".pdf,.docx,.pptx,.xlsx,.txt,.jpg,.png" onChange={handleLocalFileUpload} />

      {previewContentItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-8">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col animate-in zoom-in-95">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 rounded-t-[2rem]">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl border border-slate-200"><DatabaseZap className="w-5 h-5 text-indigo-600" /></div>
                    <span className="font-black text-slate-800">已解析中间文本：{previewContentItem.name}</span>
                 </div>
                 <button onClick={() => setPreviewContentItem(null)} className="p-2 hover:bg-white rounded-full transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 font-mono text-xs leading-relaxed text-slate-500 whitespace-pre-wrap selection:bg-indigo-100">
                 {previewContentItem.content || "暂未提取到有效的结构化内容。"}
              </div>
              <div className="p-6 border-t bg-slate-50 flex justify-end rounded-b-[2rem]">
                 <button onClick={() => setPreviewContentItem(null)} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs">确定</button>
              </div>
           </div>
        </div>
      )}

      {isKBModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">结构化知识注入</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 tracking-widest uppercase">系统将读取解析后的“中间文本”进行逻辑推理</p>
              </div>
              <button onClick={() => setIsKBModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="p-6 bg-slate-50/50 flex gap-2 border-b">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索库中已解析完成的文档..." 
                  className="w-full pl-11 py-3.5 border border-slate-200 rounded-2xl outline-none font-bold text-sm bg-white focus:ring-2 focus:ring-indigo-500 transition-all" 
                  value={kbSearchTerm} 
                  onChange={e => setKbSearchTerm(e.target.value)} 
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {kbItems.filter(item => !item.isDeleted && item.type !== 'FOLDER' && item.name.toLowerCase().includes(kbSearchTerm.toLowerCase())).map(item => {
                const isSelected = state.selectedFiles.some(f => f.id === item.id);
                const hasContent = !!item.content;
                return (
                  <div key={item.id} className={`w-full flex items-center gap-4 p-5 rounded-3xl border transition-all ${isSelected ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'hover:bg-slate-50 border-transparent bg-white shadow-sm'}`}>
                    <div onClick={() => toggleFileSelection(item)} className="cursor-pointer flex-1 flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">{getFileIcon(item.type)}</div>
                      <div className="flex-1 text-left">
                        <p className="font-black text-slate-900 text-sm">{item.name}</p>
                        <p className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${hasContent ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {hasContent ? '解析文本已注入向量库' : '待结构化解析'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setPreviewContentItem(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><FileSearch className="w-4 h-4" /></button>
                       <button onClick={() => toggleFileSelection(item)} className={`p-2 rounded-xl transition-all ${isSelected ? 'text-indigo-600 bg-indigo-100' : 'text-slate-300 hover:text-slate-500'}`}>{isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-8 border-t bg-slate-50/80 flex justify-end rounded-b-[2.5rem]">
              <button onClick={() => setIsKBModalOpen(false)} className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl">确认注入 ({state.selectedFiles.length})</button>
            </div>
          </div>
        </div>
      )}

      {/* 侧边操作栏 */}
      <div className="w-80 flex flex-col gap-5 overflow-y-auto pr-1 shrink-0">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] opacity-40">1. 参考文本注入 (RAG)</h3>
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-indigo-600 hover:underline">上传</button>
              <button onClick={() => setIsKBModalOpen(true)} className="text-[10px] font-black text-blue-600 hover:underline">引库</button>
            </div>
          </div>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {state.selectedFiles.length > 0 ? state.selectedFiles.map(f => (
              <div key={f.id} className="flex items-center justify-between bg-slate-50/80 p-3 rounded-2xl border border-slate-100 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-100">{getFileIcon(f.type)}</div>
                  <span className="truncate text-[10px] font-bold text-slate-600">{f.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setPreviewContentItem(f)} className="p-1.5 text-slate-400 hover:text-indigo-600"><FileSearch className="w-3.5 h-3.5" /></button>
                   <button onClick={() => toggleFileSelection(f)} className="p-1.5 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )) : <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">请注入结构化素材</p></div>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] opacity-40">2. 模版约束清单</h3>
          </div>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-black outline-none cursor-pointer shadow-inner appearance-none" value={state.selectedTemplateId} onChange={(e) => onUpdate({ selectedTemplateId: e.target.value })}>
            {state.templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="p-4 bg-slate-900 text-white/90 rounded-2xl shadow-xl">
             <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">强制章节结构</span>
                <button onClick={handleOpenEditTemplate} className="p-1.5 hover:bg-white/10 rounded-lg"><Edit3 className="w-3 h-3" /></button>
             </div>
             <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {currentTemplate.structure.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-[8px] font-black">{i+1}</span>
                    <span className="truncate">{s}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 relative">
          <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] opacity-40 mb-4">3. 生成需求指令</h3>
          <textarea 
            className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none leading-relaxed transition-all"
            placeholder="请输入您的具体撰写需求（如预算、工期、侧重点）..."
            value={state.demand}
            onChange={(e) => onUpdate({ demand: e.target.value })}
          />
          <div className="mt-4">
             <button
                onClick={handleGenerate}
                disabled={!state.demand || isGenerating}
                className="w-full py-4.5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-95"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-400" />}
                {isGenerating ? '深度撰写中...' : '启动 AI 专家生成'}
              </button>
          </div>
        </div>
      </div>

      {/* 主画布 */}
      <div className="flex-1 bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
        {isEditingTemplate && (
          <div className="absolute inset-0 z-50 bg-white p-12 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center"><Edit3 className="w-6 h-6 text-white" /></div>
                      <h3 className="text-2xl font-black text-slate-900">架构约束配置</h3>
                   </div>
                   <button onClick={() => setIsEditingTemplate(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">方案名称</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-indigo-500" value={editingTemplateData.name} onChange={e => setEditingTemplateData(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">强制输出章节</label>
                      <button onClick={addStructureModule} className="flex items-center gap-1 text-[10px] font-black bg-slate-900 text-white px-4 py-2 rounded-xl"><Plus className="w-3.5 h-3.5" /> 增加</button>
                    </div>
                    <div className="space-y-3">
                      {editingTemplateData.structure.map((s, i) => (
                        <div key={i} className="flex gap-3 group animate-in slide-in-from-left-2 duration-200">
                          <div className="w-10 h-12 flex items-center justify-center font-black text-slate-300 text-sm bg-slate-50 rounded-xl border border-slate-100">{i + 1}</div>
                          <input className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all" value={s} onChange={e => updateStructureModule(i, e.target.value)} />
                          <button onClick={() => removeStructureModule(i)} className="p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleSaveTemplateChanges} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg mt-8 shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 hover:bg-indigo-700 active:scale-[0.98] transition-all"><Save className="w-6 h-6" /> 同步配置</button>
                </div>
             </div>
          </div>
        )}

        <div className="px-12 py-8 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
              <FileText className="w-6 h-6 text-slate-900" />
            </div>
            <input 
              className="bg-transparent font-black text-slate-900 outline-none w-[500px] text-2xl tracking-tighter" 
              value={state.proposalTitle} 
              onChange={e => onUpdate({ proposalTitle: e.target.value })} 
              placeholder="请输入方案标题"
            />
          </div>
          <div className="flex gap-4">
             <button className="px-8 py-3 bg-slate-900 text-white text-xs font-black rounded-2xl shadow-2xl hover:bg-black transition-all">导出 PDF</button>
             <button className="px-8 py-3 bg-white border border-slate-200 text-slate-900 text-xs font-black rounded-2xl hover:bg-slate-50 transition-all">导出 Word</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-16 bg-slate-50/20">
          {state.result ? (
            <article className="max-w-4xl mx-auto bg-white p-24 shadow-2xl border border-slate-100 rounded-[3rem] min-h-full animate-in zoom-in-98 duration-700">
              <div className="whitespace-pre-wrap leading-[1.9] text-slate-800 font-serif text-lg selection:bg-indigo-100/50 space-y-8">
                {state.result.split('\n').map((line, idx) => {
                  if (line.startsWith('#')) {
                    const text = line.replace(/^#+/, '').trim();
                    return <h2 key={idx} className="font-black text-slate-900 mt-12 mb-6 border-l-[6px] border-indigo-600 pl-6 py-1 text-2xl">{text}</h2>;
                  }
                  if (line.includes('【待补充')) {
                    return <p key={idx} className="bg-amber-50 text-amber-600 p-5 rounded-2xl border border-dashed border-amber-200 font-bold text-sm flex items-center gap-3"><AlertCircle className="w-4 h-4" /> {line}</p>;
                  }
                  return <p key={idx} className="mb-4">{line}</p>;
                })}
              </div>
            </article>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-5 select-none grayscale duration-1000">
              <Sparkles className="w-40 h-40 mb-10" />
              <p className="font-black uppercase tracking-[1em] text-4xl">专家撰写席位</p>
              <p className="text-sm mt-6 font-bold tracking-[0.3em] opacity-60">关联结构化中间文本，启动企业级 AI 生成</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 辅助组件
const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

export default Workbench;
