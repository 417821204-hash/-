
import React from 'react';
import { NAVIGATION_ITEMS } from '../constants';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-[100]">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-900/40">鲸</div>
          <h1 className="text-lg font-bold tracking-tight">鲸·方案智造</h1>
        </div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">PRO SOLUTION HUB V1.0</p>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <img src="https://picsum.photos/40/40" className="w-10 h-10 rounded-full border border-slate-700" alt="头像" />
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">Ginny Xie</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">高级专家</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
