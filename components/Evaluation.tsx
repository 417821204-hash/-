
import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
// Added Loader2 to the list of icons imported from lucide-react
import { ShieldCheck, AlertCircle, FileSearch, CheckCircle2, RefreshCw, BookOpen, FileUp, ArrowRight, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';

const Evaluation: React.FC = () => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [content, setContent] = useState('');
  const [standard, setStandard] = useState('');

  const handleEvaluate = async () => {
    if (!content) return;
    setIsEvaluating(true);
    try {
      const evalResult = await geminiService.evaluateSolution(content, standard);
      setResult(evalResult);
    } catch (e) {
      alert('评估失败');
    } finally {
      setIsEvaluating(false);
    }
  };

  const chartData = result ? [
    { subject: '标准匹配', A: result.scores.policy, fullMark: 100 },
    { subject: '需求契合', A: result.scores.requirement, fullMark: 100 },
    { subject: '产品适配', A: result.scores.product, fullMark: 100 },
    { subject: '逻辑完整', A: result.scores.logic, fullMark: 100 },
    { subject: '商务价值', A: result.scores.business, fullMark: 100 },
  ] : [];

  const averageScore = result ? 
    Math.round((result.scores.policy + result.scores.requirement + result.scores.product + result.scores.logic + result.scores.business) / 5) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">智能质量评估中心</h2>
          <p className="text-slate-500 text-sm mt-1">支持基于行业编制标准的精准对标审计。</p>
        </div>
        {result && (
          <button 
            onClick={() => {setResult(null); setContent(''); setStandard('');}}
            className="text-xs font-black text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-blue-100"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 开始新评审
          </button>
        )}
      </header>

      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
          {/* Standard Input */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><BookOpen className="w-4 h-4" /></div>
                <h3 className="font-bold text-slate-900 text-sm">比对基准 / 编制标准</h3>
              </div>
              <button className="text-[10px] font-black text-slate-500 hover:text-slate-900 flex items-center gap-1 border border-slate-200 px-2 py-1 rounded bg-white">
                <FileUp className="w-3 h-3" /> 上传规范 PDF
              </button>
            </div>
            <textarea
              className="flex-1 p-6 text-sm font-medium outline-none resize-none leading-relaxed placeholder:text-slate-300"
              placeholder="请粘贴本项目的编制标准、评审规范或招投标文件要求... (可选，若不输入则进行通用 AI 评审)"
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
            />
          </div>

          {/* Solution Input */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileSearch className="w-4 h-4" /></div>
                <h3 className="font-bold text-slate-900 text-sm">待评审方案内容</h3>
              </div>
            </div>
            <textarea
              className="flex-1 p-6 text-sm font-medium outline-none resize-none leading-relaxed placeholder:text-slate-300"
              placeholder="请在此粘贴需要评估的方案全文..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {/* Action Bar Floating */}
            <div className="absolute bottom-6 right-6">
              <button
                onClick={handleEvaluate}
                disabled={!content || isEvaluating}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-2xl hover:bg-black disabled:opacity-50 flex items-center gap-3 transition-all"
              >
                {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isEvaluating ? '对标审计中...' : '启动智能评估'}
                {!isEvaluating && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Scoring Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">综合对标得分</p>
              <div className="text-8xl font-black text-slate-900 mb-4 tabular-nums tracking-tighter">{averageScore}</div>
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" /> 
                {averageScore > 80 ? '高标准符合' : averageScore > 60 ? '基本符合标准' : '不建议作为终稿'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Score" dataKey="A" stroke="#0f172a" fill="#3b82f6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Details & Advice */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
                  穿透式审计建议报告
                </h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase">Audit Mode: Standard-Guided</span>
              </div>
              
              <div className="space-y-5 overflow-y-auto pr-2">
                {result.suggestions.map((s: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded text-blue-600 uppercase tracking-widest">
                        {s.dimension}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-3 leading-relaxed">{s.advice}</p>
                    {s.basis && (
                      <div className="p-4 bg-white/60 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed italic relative">
                        <span className="absolute -left-1 top-2 w-0.5 h-4 bg-amber-400 rounded-full"></span>
                        审计依据：{s.basis}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl">
                  下载完整审计报告
                </button>
                <button className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all">
                  回到工作台优化
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluation;
