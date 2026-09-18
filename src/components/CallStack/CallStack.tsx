import type { StackFrame } from '@/types/runtime';
import { Layers } from 'lucide-react';

interface CallStackProps {
  stack: StackFrame[];
  maxDepth: number;
}

export function CallStack({ stack, maxDepth }: CallStackProps) {
  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-1.5">
          <Layers size={11} className="text-accent-blue" />
          Call Stack
        </span>
        <span className="text-[10px] text-gray-500 normal-case tracking-normal">
          Depth: {stack.length} | Max: {maxDepth}
        </span>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {stack.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-xs">
            Stack is empty
          </div>
        ) : (
          stack.map((frame, idx) => {
            const isTop = idx === stack.length - 1;
            return (
              <div
                key={frame.id}
                className={`
                  px-3 py-2 rounded border text-xs font-mono transition-all duration-300
                  ${isTop
                    ? 'bg-accent-blue/15 border-accent-blue/50 text-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.2)]'
                    : 'bg-panel-surface border-panel-border text-gray-300'
                  }
                `}
                style={{
                  animation: isTop ? 'slideIn 0.3s ease-out' : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{frame.name}</span>
                  {isTop && (
                    <span className="text-[9px] uppercase tracking-wider text-accent-blue/70">
                      {frame.type === 'builtin' ? 'builtin' : frame.type}
                    </span>
                  )}
                </div>
                {frame.params && (
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    args: {frame.params}
                  </div>
                )}
                {frame.line && (
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    line {frame.line}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
