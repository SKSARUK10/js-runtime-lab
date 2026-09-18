import type { MicrotaskEntry, TaskQueueEntry } from '@/types/runtime';
import { Zap, ListChecks } from 'lucide-react';

interface QueuesProps {
  microtasks: MicrotaskEntry[];
  tasks: TaskQueueEntry[];
  onSelectTask?: (task: TaskQueueEntry) => void;
}

export function Queues({ microtasks, tasks, onSelectTask }: QueuesProps) {
  return (
    <div className="flex flex-col h-full gap-2">
      {/* Microtask Queue */}
      <div className="flex-1 glass-panel overflow-hidden flex flex-col">
        <div className="panel-header">
          <span className="flex items-center gap-1.5">
            <Zap size={11} className="text-accent-violet" />
            Microtask Queue
          </span>
          <span className="text-[10px] text-gray-500 normal-case tracking-normal">
            FIFO · {microtasks.length}
          </span>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {microtasks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-xs">
              Empty
            </div>
          ) : (
            microtasks.map((mt, idx) => (
              <div
                key={mt.id}
                className={`
                  px-2.5 py-1.5 rounded border text-[11px] font-mono transition-all duration-300
                  ${idx === 0
                    ? 'bg-accent-violet/15 border-accent-violet/50 text-accent-violet'
                    : 'bg-panel-surface border-panel-border text-gray-300'
                  }
                `}
                style={{ animation: 'slideIn 0.3s ease-out' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{mt.label}</span>
                  <span className="text-[9px] text-gray-500 uppercase">{mt.type}</span>
                </div>
                {mt.sourceLine && (
                  <div className="text-[9px] text-gray-600">line {mt.sourceLine}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task Queue */}
      <div className="flex-1 glass-panel overflow-hidden flex flex-col">
        <div className="panel-header">
          <span className="flex items-center gap-1.5">
            <ListChecks size={11} className="text-accent-amber" />
            Task Queue
          </span>
          <span className="text-[10px] text-gray-500 normal-case tracking-normal">
            FIFO · {tasks.length}
          </span>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-xs">
              Empty
            </div>
          ) : (
            tasks.map((task, idx) => (
              <div
                key={task.id}
                onClick={() => onSelectTask?.(task)}
                className={`
                  px-2.5 py-1.5 rounded border text-[11px] font-mono cursor-pointer transition-all duration-300
                  hover:border-accent-amber/50
                  ${idx === 0
                    ? 'bg-accent-amber/15 border-accent-amber/50 text-accent-amber'
                    : 'bg-panel-surface border-panel-border text-gray-300'
                  }
                `}
                style={{ animation: 'slideIn 0.3s ease-out' }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{task.label}</span>
                  <span className="text-[9px] text-gray-500 uppercase">{task.type}</span>
                </div>
                {task.sourceLine && (
                  <div className="text-[9px] text-gray-600">line {task.sourceLine}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
