
import React, { useState } from 'react';
import { Search, Plus, Filter, FileText, Download, Trash2, Tag, ShieldCheck, Link as LinkIcon, Globe, Loader2, CheckCircle2, BookMarked, Sparkles, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { MOCK_KNOWLEDGE, MOCK_POLICIES } from '../constants';
import { PolicyItem } from '../types';
import { geminiService } from '../services/geminiService';

const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'standard' | 'policy'>('standard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStep, setImportStep] = useState(0);

  // Crawler Simulation for Policy Library
  const [isCrawling, setIsCrawling] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);
  const [policyAnalysis, setPolicyAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUrlImport = () => {
    if (!urlInput) return;
    setImporting(true);
    setImportStep(1);
    setTimeout(() => setImportStep(2), 1500);
    setTimeout(() => setImportStep(3), 3000);
    setTimeout(() => {
      setImporting(false);
      setIsUrlModalOpen(false);
      setUrlInput('');
      setImportStep(0);
      alert('网页知识已成功接入向量数据库');
    }, 4500);
  };

  const handleCrawlerSync = () => {
    setIsCrawling(true);
    setTimeout(() => {
      setIsCrawling(false);
      alert('已完成 12 家部委官方网站的政策文件检索，更新 3 项匹配当前业务领域的政策。');
    }, 3000);
  };

  const handleAnalyzePolicy = async (policy: PolicyItem) => {
    setSelectedPolicy(policy);
    setPolicyAnalysis(null);
    setIsAnalyzing(true);
    try {
      const result = await geminiService.analyzePolicy(policy.name);
      setPolicyAnalysis(result || null);
    } catch (e) {
      setPolicyAnalysis("解析失败。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Policy Analysis Modal Overlay */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100">
                  <BookMarked className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedPolicy.name}</h3>
                  <div className="flex gap-3 mt-2">
                    <span className="text-[10px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded text-red-600 uppercase tracking-widest">{selectedPolicy.authority}</span>
                    <span className="text-[10px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest">{selectedPolicy.version}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPolicy(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-slate-500 font-bold animate-pulse">AI 政策分析专家正在深度研读并拆解条款...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-sm">
                  {policyAnalysis}
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black">
                <Download className="w-4 h-4" /> 下载政策原文
              </button>
              <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-100">
                引用到工作台
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">知识资产库</h2>
          <div className="flex gap-6 mt-4 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('standard')}
              className={`pb-3 text-sm font-black transition-all relative ${activeTab === 'standard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              企业资料库
              {activeTab === 'standard' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('policy')}
              className={`pb-3 text-sm font-black transition-all relative flex items-center gap-2 ${activeTab === 'policy' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              国家政策库
              <span className="bg-red-50 text-red-500 text-[10px] px-1.5 py-0.5 rounded-full animate-pulse border border-red-100">实时同步</span>
              {activeTab === 'policy' && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-t-full" />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 pb-2">
          {activeTab === 'standard' ? (
            <>
              <button 
                onClick={() => setIsUrlModalOpen(true)}
                className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm uppercase"
              >
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                导入 URL
              </button>
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase">
                <Plus className="w-4 h-4" />
                上传资料
              </button>
            </>
          ) : (
            <button 
              onClick={handleCrawlerSync}
              disabled={isCrawling}
              className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-200 uppercase"
            >
              {isCrawling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isCrawling ? '全网同步中...' : '同步部委最新政策'}
            </button>
          )}
        </div>
      </header>

      {/* URL Import Modal (Standard KB only) */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              {importing ? (
                <div className="py-12 space-y-6">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                  <p className="text-lg font-black">{importStep === 1 ? '抓取正文中...' : importStep === 2 ? '语义分割中...' : '向量入库中...'}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-black">导入 Web 知识</h3>
                  <input 
                    type="url" 
                    placeholder="粘贴产品介绍 URL..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <button onClick={handleUrlImport} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">立即导入</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommended for you (Policy Library only) */}
      {activeTab === 'policy' && (
        <section className="animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">智能为您推荐</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MOCK_POLICIES.filter(p => p.recommendReason).map(p => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex gap-4 hover:border-red-400 transition-all cursor-pointer group" onClick={() => handleAnalyzePolicy(p)}>
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white transition-all">
                  <BookMarked className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</h4>
                  <p className="text-[10px] text-amber-600 font-black mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 推荐理由：{p.recommendReason}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 self-center" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main List */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'standard' ? "搜索企业资料、规范、PPT..." : "搜索国家政策、行业标准、部委发文..."}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            分类筛选
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(activeTab === 'standard' ? MOCK_KNOWLEDGE : MOCK_POLICIES).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-slate-900 hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl ${
                    item.type === 'POLICY' ? 'bg-red-50 text-red-600' :
                    item.type === 'PDF' ? 'bg-amber-50 text-amber-600' : 
                    item.type === 'URL' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {item.type === 'POLICY' ? <BookMarked className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600"><Download className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem] leading-tight">
                    {item.name}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-0.5 rounded-full">{item.domain}</span>
                    {item.type === 'POLICY' && <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{(item as PolicyItem).authority}</span>}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex flex-col">
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">更新时间</span>
                   <span className="text-[11px] font-black text-slate-900 tabular-nums">{item.updateTime}</span>
                </div>
                <button 
                  onClick={() => item.type === 'POLICY' ? handleAnalyzePolicy(item as PolicyItem) : null}
                  className={`text-xs font-black flex items-center gap-1 ${item.type === 'POLICY' ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  {item.type === 'POLICY' ? <Sparkles className="w-3.5 h-3.5" /> : null}
                  {item.type === 'POLICY' ? 'AI 深度解析' : '内容预览'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;

// Re-importing X as it was missed in the initial component block
const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);
