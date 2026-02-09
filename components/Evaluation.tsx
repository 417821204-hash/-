
import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ShieldCheck, AlertCircle, FileSearch, CheckCircle2, RefreshCw, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { EvaluationState } from '../types';

interface EvaluationProps {
  state: EvaluationState;
  onUpdate: (patch: Partial<EvaluationState>) => void;
}

const Evaluation: React.FC<EvaluationProps> = ({ state, onUpdate }) => {
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluate = async () => {
    if (!state.content) return;
    setIsEvaluating(true);
    try {
      const evalResult = await geminiService.evaluateSolution(state.content, state.standard);
      onUpdate({ result: evalResult });
    } catch (e) {
      alert('评估失败');
    } finally {
      setIsEvaluating(false);
    }
  };

  const chartData = state.result ? [
    { subject: '标准匹配', A: state.result.scores.policy, fullMark: 100 },
    { subject: '需求契合', A: state.result.scores.requirement, fullMark: 100 },
    { subject: '产品适配', A: state.result.scores.product, fullMark: 100 },
    { subject: '逻辑完整', A: state.result.scores.logic, fullMark: 100 },
    { subject: '商务价值', A: state.result.scores.business, fullMark: 100 },
  ] : [];

  const averageScore = state.result ? 
    Math.round((state.result.scores.policy + state.result.scores.requirement + state.result.scores.product + state.result.scores.logic + state.result.scores.business) / 5) : 0;

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">智能质量评估中心</h2>
          <p className="text-slate-500 text-sm">状态已跨模块实时保存，您可以随时离开并返回继续编辑。</p>
        </div>
        {state.result && (
          <button 
            onClick={() => onUpdate({ result: null, content: '', standard: '' })}
            className="text-xs font-black text-blue-600 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 开始新评审
          </button>
        )}
      </header>

      {!state.result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
          <div className="bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-5 border-b bg-slate-50/50 font-bold text-sm">比对基准 (PRD/招标书)</div>
            <textarea
              className="flex-1 p-6 text-sm font-medium outline-none resize-none"
              placeholder="粘贴基准要求..."
              value={state.standard}
              onChange={(e) => onUpdate({ standard: e.target.value })}
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden relative">
            <div className="p-5 border-b bg-slate-50/50 font-bold text-sm">待评审方案全文</div>
            <textarea
              className="flex-1 p-6 text-sm font-medium outline-none resize-none"
              placeholder="粘贴方案内容..."
              value={state.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
            />
            <div className="absolute bottom-6 right-6">
              <button
                onClick={handleEvaluate}
                disabled={!state.content || isEvaluating}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-2xl"
              >
                {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isEvaluating ? '评估中...' : '启动智能评估'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-3xl border text-center shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">综合得分</p>
              <div className="text-8xl font-black text-slate-900 mb-4">{averageScore}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border h-[360px] flex items-center justify-center">
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
          <div className="lg:col-span-8 space-y-4 overflow-y-auto max-h-[600px] pr-2">
            {state.result.suggestions.map((s: any, i: number) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase mb-2 inline-block">{s.dimension}</span>
                <p className="text-sm font-bold text-slate-800 mb-2">{s.advice}</p>
                <p className="text-xs text-slate-400 italic">依据: {s.basis}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Evaluation;
