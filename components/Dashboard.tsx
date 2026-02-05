
import React from 'react';
import { FileText, Database, CheckCircle, Clock, ArrowUpRight } from 'lucide-react';
import { MOCK_PROJECTS } from '../constants';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">数字化工作台</h2>
        <p className="text-slate-500">欢迎回来，今日已有 12 个新方案通过您的模板库生成。</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '累计生成方案', value: '1,284', icon: <FileText className="text-blue-600" />, trend: '+12.5%' },
          { label: '知识库资产', value: '45.2 GB', icon: <Database className="text-indigo-600" />, trend: '+2.4%' },
          { label: '审核通过率', value: '94.2%', icon: <CheckCircle className="text-emerald-600" />, trend: '+0.8%' },
          { label: '平均响应时间', value: '8.4s', icon: <Clock className="text-amber-600" />, trend: '-15%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">最近生成记录</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">查看全部</button>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_PROJECTS.map((project) => (
              <div key={project.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${
                    project.status === '已完成' ? 'bg-emerald-500' : project.status === '进行中' ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-slate-900">{project.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {project.author} · 最后更新: {project.lastModified}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{project.progress}%</p>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-200 rounded-lg">
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KB Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-6">知识库健康度</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">向量化进度</span>
                <span className="font-medium">98%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '98%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">元数据完整性</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: '92%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">时效性指数</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: '85%' }} />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-xs text-slate-500 leading-relaxed">
              系统建议：检测到 14 个过期的金融领域资料包，建议于本周末前完成版本更新，以维持 RAG 生成的准确性。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
