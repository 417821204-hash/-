
import React, { useState, useEffect } from 'react';
import { Sparkles, Layout, Check, Loader2, Database, X, FileText, Globe, Search, Settings2, Plus, Edit3, Save, Upload } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { DEFAULT_TEMPLATES, MOCK_KNOWLEDGE } from '../constants';
import { KnowledgeItem, Template } from '../types';

const Workbench: React.FC = () => {
  const [demand, setDemand] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  // Workflow States
  const [isKBModalOpen, setIsKBModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<KnowledgeItem[]>([]);
  const [kbSearchTerm, setKbSearchTerm] = useState('');

  // Template States
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingStructure, setEditingStructure] = useState<string[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleGenerate = async () => {
    if (!demand) return;
    setIsGenerating(true);
    
    const context = selectedFiles.map(f => `[参考源: ${f.name}]`).join(', ');
    const structureStr = currentTemplate.structure.join('\n');
    const finalPrompt = `要求使用模版 "${currentTemplate.name}"，其章节结构如下：\n${structureStr}\n\n业务需求：${demand}`;
    
    try {
      const output = await geminiService.generateSolution(finalPrompt, context);
      setResult(output || '');
    } catch (e) {
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFileSelection = (item: KnowledgeItem) => {
    setSelectedFiles(prev => 
      prev.find(f => f.id === item.id) 
        ? prev.filter(f => f.id !== item.id) 
        : [...prev, item]
    );
  };

  const handleEditTemplate = () => {
    setEditingStructure([...currentTemplate.structure]);
    setIsEditingTemplate(true);
  };

  const handleSaveTemplate = () => {
    const updatedTemplates = templates.map(t => 
      t.id === selectedTemplateId ? { ...t, structure: editingStructure } : t
    );
    setTemplates(updatedTemplates);
    setIsEditingTemplate(false);
  };

  const handleAddCustomTemplate = () => {
    const newId = `custom-${Date.now()}`;
    const newT: Template = {
      id: newId,
      name: newTemplateName || '自定义模版',
      description: '用户自定义业务模版',
      structure: ["1. 第一章节"],
      isCustom: true
    };
    setTemplates([...templates, newT]);
    setSelectedTemplateId(newId);
    setNewTemplateName('');
    setEditingStructure(newT.structure);
    setIsEditingTemplate(true);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* KB Selection Modal */}
      {isKBModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">选择参考资料</h3>
                <p className="text-sm text-slate-500">第一步：选择用于方案生成的背景依据</p>
              </div>
              <button onClick={() => setIsKBModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="搜索知识库内容..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={kbSearchTerm}
                  onChange={(e) => setKbSearchTerm(e.target.value)}
                />
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" /> 本地上传
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {MOCK_KNOWLEDGE.filter(item => item.name.toLowerCase().includes(kbSearchTerm.toLowerCase())).map(item => {
                const isSelected = selectedFiles.some(f => f.id === item.id);
                return (
                  <button key={item.id} onClick={() => toggleFileSelection(item)} className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-transparent'} border`}>
                    <div className={`p-2 rounded-lg ${item.type === 'PDF' ? 'bg-red-50 text-red-500' : item.type === 'URL' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'}`}>
                      {item.type === 'URL' ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.domain} · {item.version}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'}`}>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-sm text-slate-500 font-medium">已选择 {selectedFiles.length} 项</span>
              <button onClick={() => setIsKBModalOpen(false)} className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-black transition-all">
                确认并继续
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Redesigned Linear Workflow */}
      <div className="w-80 flex flex-col gap-5 overflow-y-auto pr-1">
        
        {/* Step 1: Resource Selection */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">1</div>
              <h3 className="font-black text-slate-900 text-xs">选择参考资源</h3>
            </div>
            <button onClick={() => setIsKBModalOpen(true)} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-all">
              浏览库
            </button>
          </div>
          <div className="space-y-2">
            {selectedFiles.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center cursor-pointer hover:bg-slate-100 transition-all" onClick={() => setIsKBModalOpen(true)}>
                <Database className="w-5 h-5 text-slate-300 mx-auto mb-2" />
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">点击从资源库选择文件或网页</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 text-[10px] font-bold group">
                    <span className="truncate max-w-[100px]">{file.name}</span>
                    <button onClick={() => toggleFileSelection(file)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Template Selection */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">2</div>
              <h3 className="font-black text-slate-900 text-xs">选择/编辑模版</h3>
            </div>
            <button className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-all flex items-center gap-1">
              <Plus className="w-3 h-3" /> 自定义
            </button>
          </div>
          <div className="space-y-2">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">结构预览</span>
                <button onClick={handleEditTemplate} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[10px] font-black uppercase">
                  <Edit3 className="w-3 h-3" /> 编辑结构
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {currentTemplate.structure.map((s, i) => (
                  <div key={i} className="text-[10px] text-slate-600 font-medium flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Requirements */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">3</div>
            <h3 className="font-black text-slate-900 text-xs">具体业务需求</h3>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <textarea 
              className="flex-1 w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
              placeholder="请在此描述本次方案的改写重点，如：重点突出在政务大厅场景下的语义识别准确率..."
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={!demand || isGenerating}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xl shadow-blue-200"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? 'AI 正在深度创作' : '一键生成标准化方案'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        {/* Template Editor Overlay */}
        {isEditingTemplate && (
          <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-12 flex flex-col animate-in fade-in duration-300">
            <div className="max-w-xl mx-auto w-full space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">编辑模版结构：{currentTemplate.name}</h3>
                <button onClick={() => setIsEditingTemplate(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3">
                {editingStructure.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text" 
                      value={s} 
                      onChange={(e) => {
                        const next = [...editingStructure];
                        next[i] = e.target.value;
                        setEditingStructure(next);
                      }}
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                      onClick={() => setEditingStructure(editingStructure.filter((_, idx) => idx !== i))}
                      className="p-3 text-red-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditingStructure([...editingStructure, "新章节名称"])}
                  className="w-full p-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> 添加新章节
                </button>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSaveTemplate}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-200"
                >
                  <Save className="w-5 h-5" /> 保存并应用到本次生成
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Editor Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <input type="text" defaultValue="未命名方案" className="bg-transparent font-black text-slate-900 outline-none border-b-2 border-transparent focus:border-blue-500 px-1 text-sm" />
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">模版: {currentTemplate.name} · 参考: {selectedFiles.length} 项</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-6 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all shadow-lg flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> 导出 Word
            </button>
          </div>
        </div>

        {/* Dynamic Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {!result && !isGenerating ? (
            <div className="max-w-xl mx-auto mt-20 flex flex-col items-center text-center space-y-8 animate-in slide-in-from-top-4 duration-700">
              <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
                <Sparkles className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">准备好开始了吗？</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  请按左侧步骤配置资源与模版，AI 将为您生成<br/>
                  逻辑严密、表达专业且符合{currentTemplate.name}规范的高质量方案。
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${selectedFiles.length > 0 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <span className="text-[10px] font-bold text-slate-400">参考资料</span>
                </div>
                <div className="w-8 h-px bg-slate-200 mt-1.5" />
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400">选择模版</span>
                </div>
                <div className="w-8 h-px bg-slate-200 mt-1.5" />
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${demand.length > 10 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <span className="text-[10px] font-bold text-slate-400">业务需求</span>
                </div>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-24 space-y-10 animate-pulse">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-[6px] border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 m-auto w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">AI Engine Processing</h4>
                <div className="flex flex-col items-center gap-2">
                   <p className="text-slate-500 font-medium text-sm">正在按照《{currentTemplate.name}》结构进行深度重组...</p>
                   <div className="h-1 w-48 bg-slate-100 rounded-full overflow-hidden mt-2">
                     <div className="h-full bg-blue-600 animate-[progress_2s_ease-in-out_infinite]" style={{width: '60%'}}></div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <article className="max-w-4xl mx-auto bg-white p-16 shadow-2xl rounded-sm min-h-[1100px] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="whitespace-pre-wrap leading-[2.2] text-slate-800 font-serif text-lg selection:bg-blue-100">
                {result}
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workbench;
