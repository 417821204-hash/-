
import React, { useState, useRef } from 'react';
import { Sparkles, Check, Loader2, X, FileText, Search, Plus, Trash2, Upload, Edit3, ChevronRight, Save, FileVideo, FileImage, FileSpreadsheet, FileArchive, Globe } from 'lucide-react';
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
    
    // 模拟文件内容解析：将选中的文件转化为“结构化内容”
    // 在真实应用中，这些内容会在上传时通过后端 OCR 或文本提取完成并存储在 item.content 中
    const structuredContext = state.selectedFiles.map(f => ({
      name: f.name,
      content: f.content || `[文档概要]：关于${f.domain}在${f.scenario}场景下的技术规范与实施指南，包含版本${f.version}的核心参数。`
    }));

    // 注入业务需求描述作为核心 context 之一
    structuredContext.push({
      name: "用户实时业务需求",
      content: state.demand
    });

    const structureStr = currentTemplate.structure.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const templatePrompt = `模版名称：${currentTemplate.name}\n目标章节结构：\n${structureStr}`;
    
    try {
      const output = await geminiService.generateSolution(templatePrompt, structuredContext);
      onUpdate({ result: output || '' });
    } catch (e) {
      alert('生成失败，请检查网络或 API 配置');
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
    
    // Fix type errors by explicitly casting the Array.from result to File[]
    const newItems: KnowledgeItem[] = (Array.from(files) as File[]).map(file => ({
      id: `local-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: (file.name.split('.').pop()?.toUpperCase() as any) || 'DOCX',
      domain: '本地上传',
      scenario: '实时创作素材',
      version: 'V1.0',
      updateTime: new Date().toISOString().split('T')[0],
      securityLevel: '内部',
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      author: 'Ginny Xie',
      parseStatus: 'SUCCESS',
      content: `[该本地文件已于 ${new Date().toLocaleString()} 完成解析注入] 用户上传的 ${file.name} 包含关键业务信息，已标记为待推理状态。`
    }));

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

  const handleAddNewTemplate = () => {
    const newId = `custom-${Date.now()}`;
    const newTemplate: Template = {
      id: newId,
      name: '自定义新模版',
      description: '用户自定义生成的模版',
      structure: ['一、建设背景', '二、现状与问题分析', '三、建设内容与目标'],
      isCustom: true
    };
    onUpdate({ 
      templates: [...state.templates, newTemplate],
      selectedTemplateId: newId 
    });
    setEditingTemplateData({
      name: newTemplate.name,
      structure: [...newTemplate.structure]
    });
    setIsEditingTemplate(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (state.templates.length <= 1) {
      alert('至少需要保留一个模版');
      return;
    }
    if (!confirm('确定删除该模版吗？')) return;
    const newTemplates = state.templates.filter(t => t.id !== id);
    onUpdate({ 
      templates: newTemplates,
      selectedTemplateId: newTemplates[0].id
    });
  };

  const handleSaveTemplateChanges = () => {
    const updatedTemplates = state.templates.map(t => 
      t.id === state.selectedTemplateId ? { ...t, name: editingTemplateData.name, structure: editingTemplateData.structure } : t
    );
    onUpdate({ templates: updatedTemplates });
    setIsEditingTemplate(false);
  };

  const addStructureModule = () => {
    setEditingTemplateData(prev => ({
      ...prev,
      structure: [...prev.structure, `新章节 ${prev.structure.length + 1}`]
    }));
  };

  const removeStructureModule = (index: number) => {
    setEditingTemplateData(prev => ({
      ...prev,
      structure: prev.structure.filter((_, i) => i !== index)
    }));
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
      <input 
        type="file" 
        ref={fileInputRef} 
        multiple 
        className="hidden" 
        accept=".pdf,.docx,.pptx,.xlsx,.txt,.jpg,.png,.mp4" 
        onChange={handleLocalFileUpload}
      />

      {isKBModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">关联知识资产</h3>
              <button onClick={() => setIsKBModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-4 bg-slate-50 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索已解析的文档..." 
                  className="w-full pl-10 py-2 border border-slate-200 rounded-xl outline-none" 
                  value={kbSearchTerm} 
                  onChange={e => setKbSearchTerm(e.target.value)} 
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {kbItems.filter(item => !item.isDeleted && item.type !== 'FOLDER' && item.name.toLowerCase().includes(kbSearchTerm.toLowerCase())).map(item => {
                const isSelected = state.selectedFiles.some(f => f.id === item.id);
                return (
                  <button key={item.id} onClick={() => toggleFileSelection(item)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-transparent'}`}>
                    <div className="p-2 bg-slate-100 rounded-lg">{getFileIcon(item.type)}</div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{item.domain} · 已结构化</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end">
              <button onClick={() => setIsKBModalOpen(false)} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold">注入上下文</button>
            </div>
          </div>
        </div>
      )}

      {/* 侧边操作栏 */}
      <div className="w-80 flex flex-col gap-5 overflow-y-auto pr-1 shrink-0">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] opacity-50">1. 参考素材 (结构化注入)</h3>
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                <Upload className="w-3 h-3" /> 上传
              </button>
              <button onClick={() => setIsKBModalOpen(true)} className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                <Search className="w-3 h-3" /> 库引用({state.selectedFiles.length})
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {state.selectedFiles.length > 0 ? state.selectedFiles.map(f => (
              <div key={f.id} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1.5 rounded-lg border border-blue-100 text-[10px] font-bold max-w-full group">
                {getFileIcon(f.type)}
                <span className="truncate max-w-[120px]">{f.name}</span>
                <button onClick={() => toggleFileSelection(f)} className="opacity-40 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
              </div>
            )) : <p className="text-[10px] text-slate-400 italic">尚未关联任何背景素材，生成将基于行业常识</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] opacity-50">2. 方案模版 (严控结构)</h3>
            <button onClick={handleAddNewTemplate} className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
              <Plus className="w-3 h-3" /> 新建
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-black outline-none cursor-pointer"
              value={state.selectedTemplateId}
              onChange={(e) => onUpdate({ selectedTemplateId: e.target.value })}
            >
              {state.templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button onClick={() => handleDeleteTemplate(state.selectedTemplateId)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">章节强制约束</span>
                <button onClick={handleOpenEditTemplate} className="text-blue-600 text-[10px] font-black uppercase flex items-center gap-1">
                  <Edit3 className="w-3 h-3" /> 修改
                </button>
             </div>
             <div className="space-y-1 text-[10px] text-slate-600 font-medium">
                {currentTemplate.structure.slice(0, 5).map((s, i) => <div key={i} className="flex items-center gap-2"><span className="text-slate-300 font-black">{i+1}</span> {s}</div>)}
                {currentTemplate.structure.length > 5 && <div className="text-slate-400 italic pl-4">... 等共 {currentTemplate.structure.length} 个章节</div>}
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0 relative">
          <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] opacity-50 mb-4">3. 项目背景与具体需求</h3>
          <textarea 
            className="flex-1 w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none leading-relaxed transition-all"
            placeholder="请在此输入您的具体建设内容、项目周期、预算规模等信息，AI 将以此为核心导向..."
            value={state.demand}
            onChange={(e) => onUpdate({ demand: e.target.value })}
          />
          <div className="mt-4 space-y-3">
             <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">专家级创作模式已激活</span>
             </div>
             <button
                onClick={handleGenerate}
                disabled={!state.demand || isGenerating}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-95"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? '深度撰写中...' : '启动 AI 专家创作'}
              </button>
          </div>
        </div>
      </div>

      {/* 主画布 */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
        {isEditingTemplate && (
          <div className="absolute inset-0 z-50 bg-white p-12 overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                        <Edit3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black">模板架构专家</h3>
                        <p className="text-xs text-slate-400 font-bold mt-1">AI 将严格按照以下定义的章节产出，不得偏离。</p>
                      </div>
                   </div>
                   <button onClick={() => setIsEditingTemplate(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">方案模板全称</label>
                    <input 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                      value={editingTemplateData.name} 
                      onChange={e => setEditingTemplateData(prev => ({ ...prev, name: e.target.value }))} 
                      placeholder="例如：智慧校园顶层设计建议书"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">标准化章节清单 (强制顺序)</label>
                      <button onClick={addStructureModule} className="flex items-center gap-1 text-[10px] font-black bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-colors">
                        <Plus className="w-3.5 h-3.5" /> 插入章节
                      </button>
                    </div>
                    <div className="space-y-3">
                      {editingTemplateData.structure.map((s, i) => (
                        <div key={i} className="flex gap-3 group animate-in slide-in-from-left-2 duration-200">
                          <div className="w-10 flex items-center justify-center font-black text-slate-300 text-sm bg-slate-50 rounded-xl border border-slate-100">{i + 1}</div>
                          <input 
                            className="flex-1 p-4 bg-slate-50/50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" 
                            value={s} 
                            onChange={e => updateStructureModule(i, e.target.value)} 
                          />
                          <button onClick={() => removeStructureModule(i)} className="p-4 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveTemplateChanges} 
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black mt-10 shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-[0.98] transition-all"
                  >
                    <Save className="w-5 h-5" /> 完成配置并应用于创作区
                  </button>
                </div>
             </div>
          </div>
        )}

        <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-900" />
            </div>
            <input 
              className="bg-transparent font-black text-slate-900 outline-none w-[500px] text-xl tracking-tight" 
              value={state.proposalTitle} 
              onChange={e => onUpdate({ proposalTitle: e.target.value })} 
              placeholder="请输入方案标题"
            />
          </div>
          <div className="flex gap-4">
             <button className="px-7 py-3 bg-slate-900 text-white text-xs font-black rounded-xl shadow-xl shadow-slate-200 hover:bg-black transition-all">导出 PDF</button>
             <button className="px-7 py-3 bg-white border border-slate-200 text-slate-900 text-xs font-black rounded-xl hover:bg-slate-50 transition-all">导出 Word</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30">
          {state.result ? (
            <article className="max-w-4xl mx-auto bg-white p-24 shadow-2xl border border-slate-100 rounded-2xl min-h-full animate-in zoom-in-98 duration-500">
              <div className="whitespace-pre-wrap leading-[1.8] text-slate-800 font-serif text-lg selection:bg-blue-100 space-y-6">
                {state.result.split('\n').map((line, idx) => (
                  <p key={idx} className={line.startsWith('#') ? 'font-black text-slate-900 border-l-4 border-blue-600 pl-4 py-2 mt-8 mb-4' : ''}>
                    {line.replace(/^#+/, '').trim()}
                  </p>
                ))}
              </div>
            </article>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10 select-none grayscale">
              <Sparkles className="w-32 h-32 mb-8" />
              <p className="font-black uppercase tracking-[0.5em] text-3xl">专家创作画布</p>
              <p className="text-sm mt-4 font-bold tracking-widest">请关联背景素材并启动深度撰写引擎</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workbench;
