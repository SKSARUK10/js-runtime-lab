import type { ExplanationEntry } from '@/types/runtime';
import { Info } from 'lucide-react';

interface ExplanationPanelProps {
  explanations: ExplanationEntry[];
  mode: 'developer' | 'learning' | 'interview';
}

export function ExplanationPanel({ explanations, mode }: ExplanationPanelProps) {
  if (mode === 'developer') return null;

  const visible = explanations.slice(-3);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-1.5">
          <Info size={11} className="text-accent-blue" />
          Explanation
        </span>
      </div>
      <div className="p-2.5 space-y-1.5">
        {visible.length === 0 ? (
          <div className="text-xs text-gray-600 py-1">
            Explanations will appear here during execution.
          </div>
        ) : (
          visible.map((exp) => (
            <div
              key={exp.id}
              className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-300 px-2 py-1.5 rounded bg-panel-surface border border-panel-border"
              style={{ animation: 'slideIn 0.3s ease-out' }}
            >
              <Info size={11} className="text-accent-blue flex-shrink-0 mt-0.5" />
              <span>{exp.text}</span>
              {exp.line && (
                <span className="text-[9px] text-gray-600 flex-shrink-0 mt-0.5">
                  L{exp.line}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
