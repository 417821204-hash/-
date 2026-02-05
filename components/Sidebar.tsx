
import React from 'react';
import { NAVIGATION_ITEMS } from '../constants';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">A</div>
          <h1 className="text-lg font-bold tracking-tight">AI方案智造</h1>
        </div>
        <p className="text-xs text-slate-400 mt-2">企业级方案生成平台 V1.0</p>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl">
          <img src="https://picsum.photos/40/40" className="w-10 h-10 rounded-full border border-slate-700" alt="Avatar" />
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">Ginny Xie</p>
            <p className="text-xs text-slate-400 truncate">高级解决方案专家</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
