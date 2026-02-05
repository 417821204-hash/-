
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import KnowledgeBase from './components/KnowledgeBase';
import Workbench from './components/Workbench';
import Evaluation from './components/Evaluation';
import Settings from './components/Settings';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.WORKBENCH);

  const renderView = () => {
    switch (currentView) {
      case AppView.WORKBENCH:
        return <Workbench />;
      case AppView.KNOWLEDGE_BASE:
        return <KnowledgeBase />;
      case AppView.EVALUATION:
        return <Evaluation />;
      case AppView.SETTINGS:
        return <Settings />;
      default:
        return <Workbench />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                NODE: NC-01-PREMIUM
              </span>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                AI CLUSTER READY
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <img key={i} src={`https://picsum.photos/32/32?random=${i}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="team" />
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
