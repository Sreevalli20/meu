import React, { useState } from 'react';
import { Eye, MapPin, FileText, Scale, Target, CheckCircle2, Loader2, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { AgentStep } from '../types/trace';

interface AgentTelemetryProps {
  steps: AgentStep[];
  isTracing: boolean;
}

export const AgentTelemetry: React.FC<AgentTelemetryProps> = ({ steps, isTracing }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getAgentIcon = (agentName: string) => {
    switch (agentName) {
      case 'Vision Agent':
        return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'Discovery Agent':
      case 'Place Discovery Agent':
        return <MapPin className="w-4 h-4 text-emerald-400" />;
      case 'Menu Agent':
      case 'Menu Verification Agent':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'Evidence Agent':
        return <Scale className="w-4 h-4 text-violet-400" />;
      case 'Ranking Agent':
        return <Target className="w-4 h-4 text-rose-400" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 py-4 flex items-center justify-between border-b border-slate-800 cursor-pointer hover:bg-slate-800/40 transition select-none"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-sm text-white">
                Multi-Agent Execution Pipeline
              </span>
              {isTracing ? (
                <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Agents Active</span>
                </span>
              ) : steps.length > 0 ? (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Audit Complete</span>
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-400">
              Transparent multi-agent chain: Vision → Discovery → Verification → Evidence → Ranking
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white p-1">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Step Timeline */}
      {isExpanded && (
        <div className="p-6 divide-y divide-slate-800/60">
          {steps.map((step, idx) => {
            const isDone = step.status === 'completed';
            const isCurrent = step.status === 'running';

            return (
              <div key={step.id || idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start space-x-4">
                {/* Agent Icon badge */}
                <div
                  className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition ${
                    isDone
                      ? 'bg-slate-800/90 border-slate-700'
                      : isCurrent
                      ? 'bg-amber-500/20 border-amber-500 animate-pulse'
                      : 'bg-slate-900 border-slate-800 opacity-50'
                  }`}
                >
                  {isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    getAgentIcon(step.agent)
                  )}
                </div>

                {/* Agent Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {step.agent}
                      </span>
                      <span className="text-slate-600 font-mono text-xs">•</span>
                      <span className="text-xs font-medium text-slate-200">
                        {step.title}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {isDone ? 'COMPLETED' : isCurrent ? 'EXECUTING...' : 'QUEUED'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {step.details}
                  </p>

                  {step.outputSummary && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-emerald-300 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="truncate">{step.outputSummary}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
