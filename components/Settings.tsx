
import React, { useState } from 'react';
import { Shield, Bell, LogOut, ChevronRight, UserCircle2, Save, CreditCard, Lock } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">系统管理</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">管理您的个人资料、系统偏好设置以及安全选项。</p>
      </header>

      <div className="flex gap-8">
        {/* Nav */}
        <div className="w-64 space-y-1">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-black transition-all bg-slate-900 text-white shadow-xl shadow-slate-200">
            <div className="flex items-center gap-3">
              <UserCircle2 className="w-5 h-5" /> 个人中心
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 my-4 mx-4"></div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-900 transition-all">
            <Bell className="w-5 h-5" /> 通知偏好
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-900 transition-all">
            <Lock className="w-5 h-5" /> 隐私安全
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
            <LogOut className="w-5 h-5" /> 退出登录
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-8 mb-10">
                <div className="relative group">
                  <img src="https://picsum.photos/100/100" className="w-24 h-24 rounded-3xl border-4 border-white shadow-2xl transition-transform group-hover:scale-105" alt="头像" />
                  <button className="absolute -bottom-2 -right-2 p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-black transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">Ginny Xie</h3>
                  <p className="text-slate-500 font-bold text-sm mt-1">高级解决方案专家 · 数字化转型事业部</p>
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> 专业版许可
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">ID: NC-8821</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-5">
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">姓名全称</span>
                    <input type="text" defaultValue="Ginny Xie" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">企业邮箱地址</span>
                    <input type="email" defaultValue="ginny.xie@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </label>
                </div>
                <div className="space-y-5">
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">核心关注领域</span>
                    <input type="text" defaultValue="智慧城市 / 金融科技 / 数据要素" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">默认 AI 模型引擎</span>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                      <option>Gemini-3-Pro-Preview (企业级首选)</option>
                      <option>Gemini-3-Flash (极速响应)</option>
                    </select>
                  </label>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t border-slate-100">
                <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center gap-2">
                  保存所有更改
                </button>
              </div>
            </div>

            <div className="bg-emerald-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-xl">
              <Shield className="absolute right-[-40px] bottom-[-40px] w-64 h-64 opacity-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <Shield className="w-6 h-6 text-emerald-300" />
                  </div>
                  <h4 className="text-2xl font-black">企业级安全合规状态</h4>
                </div>
                <p className="text-emerald-100/70 text-sm mb-8 max-w-lg font-medium leading-relaxed">
                  您的所有 AI 生成活动均受到企业级内容过滤器保护。系统通过了端到端加密验证，确保商业秘密不离开工作空间。
                </p>
                <div className="flex gap-6">
                  <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">本次登录时间</p>
                    <p className="text-sm font-bold text-emerald-50">今天 09:24 (北京时间)</p>
                  </div>
                  <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">访问 IP 地址</p>
                    <p className="text-sm font-bold text-emerald-50">10.12.34.112</p>
                  </div>
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
