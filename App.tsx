
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.tsx';
import KnowledgeBase from './components/KnowledgeBase.tsx';
import Workbench from './components/Workbench.tsx';
import Evaluation from './components/Evaluation.tsx';
import Settings from './components/Settings.tsx';
import { AppView, AppPersistenceState, KnowledgeItem, AuditLog } from './types.ts';
import { MOCK_KNOWLEDGE, DEFAULT_TEMPLATES } from './constants.tsx';
import { CloudCheck, CloudSync, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'WHALE_SOLUTION_V1_STATE';

const INITIAL_STATE: AppPersistenceState = {
  lastUpdated: Date.now(),
  currentView: AppView.WORKBENCH,
  workbench: {
    demand: '',
    result: null,
    proposalTitle: '未命名方案',
    selectedFiles: [],
    selectedTemplateId: DEFAULT_TEMPLATES[0].id,
    templates: DEFAULT_TEMPLATES
  },
  kb: {
    viewMode: 'standard',
    searchTerm: '',
    currentFolderId: null,
    items: [
      { id: 'f-1', name: '2026年度投标素材', type: 'FOLDER', domain: '通用', scenario: '管理', version: '-', updateTime: '2026-02-01', securityLevel: '内部', size: '-', author: '系统' },
      ...MOCK_KNOWLEDGE
    ],
    logs: []
  },
  evaluation: {
    content: '',
    standard: '',
    result: null
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppPersistenceState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  const updateWorkbench = (patch: Partial<AppPersistenceState['workbench']>) => {
    setState(prev => ({ ...prev, workbench: { ...prev.workbench, ...patch } }));
  };

  const updateKB = (patch: Partial<AppPersistenceState['kb']>) => {
    setState(prev => ({ ...prev, kb: { ...prev.kb, ...patch } }));
  };

  const updateEvaluation = (patch: Partial<AppPersistenceState['evaluation']>) => {
    setState(prev => ({ ...prev, evaluation: { ...prev.evaluation, ...patch } }));
  };

  const renderView = () => {
    switch (state.currentView) {
      case AppView.WORKBENCH:
        return <Workbench state={state.workbench} onUpdate={updateWorkbench} onUpdateKB={updateKB} kbItems={state.kb.items} />;
      case AppView.KNOWLEDGE_BASE:
        return <KnowledgeBase state={state.kb} onUpdate={updateKB} />;
      case AppView.EVALUATION:
        return <Evaluation state={state.evaluation} onUpdate={updateEvaluation} />;
      case AppView.SETTINGS:
        return <Settings />;
      default:
        return <Workbench state={state.workbench} onUpdate={updateWorkbench} onUpdateKB={updateKB} kbItems={state.kb.items} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar 
        currentView={state.currentView} 
        onViewChange={(view) => setState(prev => ({ ...prev, currentView: view }))} 
      />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  状态: {isSaving ? '同步中...' : '已加密同步'}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                AI 引擎已就绪
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <img key={i} src={`https://picsum.photos/32/32?random=${i}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="用户" />
                ))}
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">+12</div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 relative">
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              </button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-1 duration-500">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
