
import React, { useState } from 'react';
import { Shield, Bell, LogOut, ChevronRight, UserCircle2 } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-slate-900">系统管理</h2>
        <p className="text-slate-500 text-sm mt-1">管理您的个人资料及系统偏好设置。</p>
      </header>

      <div className="flex gap-8">
        {/* Nav */}
        <div className="w-64 space-y-1">
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all bg-slate-900 text-white shadow-lg"
          >
            <UserCircle2 className="w-5 h-5" /> 个人中心
          </button>
          <div className="h-px bg-slate-200 my-4 mx-4"></div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-white transition-all">
            <Bell className="w-5 h-5" /> 通知偏好
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
            <LogOut className="w-5 h-5" /> 退出系统
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <img src="https://picsum.photos/100/100" className="w-24 h-24 rounded-3xl border-4 border-white shadow-xl" alt="avatar" />
                  <button className="absolute -bottom-2 -right-2 p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Ginny Xie</h3>
                  <p className="text-slate-500 font-bold text-sm">高级解决方案专家 · 数字化转型事业部</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-100">Pro License</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-widest border border-slate-200">ID: NC-8821</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">全名</span>
                    <input type="text" defaultValue="Ginny Xie" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">企业邮箱</span>
                    <input type="email" defaultValue="ginny.xie@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </label>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">主要领域</span>
                    <input type="text" defaultValue="智慧城市 / 金融科技" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">默认模型</span>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Gemini-3-Pro-Preview (推荐)</option>
                      <option>Gemini-3-Flash</option>
                    </select>
                  </label>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all">保存更改</button>
              </div>
            </div>

            <div className="bg-emerald-900 text-white rounded-3xl p-8 relative overflow-hidden">
              < Shield className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10" />
              <h4 className="text-xl font-black mb-2">安全合规状态</h4>
              <p className="text-emerald-100 text-sm mb-6 max-w-md">您的所有生成活动均通过企业级安全过滤（SafeSearch Enabled）。</p>
              <div className="flex gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">最后登录</p>
                  <p className="text-sm font-bold">今天 09:24 (Beijing)</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">IP 地址</p>
                  <p className="text-sm font-bold">10.12.34.112</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
