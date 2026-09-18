import type { EventLoopState } from '@/types/runtime';
import { RefreshCw } from 'lucide-react';

interface EventLoopProps {
  state: EventLoopState;
  callStackEmpty: boolean;
  microtaskCount: number;
  taskCount: number;
}

const stateColors: Record<EventLoopState, string> = {
  IDLE: 'text-gray-500',
  CHECKING: 'text-accent-cyan',
  MICROTASKS: 'text-accent-violet',
  SCHEDULING: 'text-accent-amber',
  EXECUTING: 'text-accent-green',
};

const stateLabels: Record<EventLoopState, string> = {
  IDLE: 'Idle',
  CHECKING: 'Checking Queues',
  MICROTASKS: 'Processing Microtasks',
  SCHEDULING: 'Scheduling Task',
  EXECUTING: 'Executing',
};

export function EventLoop({ state, callStackEmpty, microtaskCount, taskCount }: EventLoopProps) {
  const isActive = state !== 'IDLE';
  const spinClass = isActive ? 'animate-spin-fast' : '';
  const colorClass = stateColors[state];

  return (
    <div className="flex flex-col items-center justify-center h-full glass-panel overflow-hidden">
      <div className="panel-header w-full">
        <span>Event Loop</span>
        <span className={`text-[10px] normal-case tracking-normal font-semibold ${colorClass}`}>
          {stateLabels[state]}
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-3 gap-2">
        <div className={`relative w-16 h-16 flex items-center justify-center`}>
          {/* Outer rotating ring */}
          <svg className={`absolute inset-0 ${spinClass}`} viewBox="0 0 64 64">
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 8"
              className={colorClass}
              opacity="0.4"
            />
          </svg>
          {/* Inner circle */}
          <div
            className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${colorClass}`}
            style={{
              borderColor: 'currentColor',
              boxShadow: isActive ? `0 0 12px currentColor` : 'none',
              opacity: isActive ? 1 : 0.4,
            }}
          >
            <RefreshCw size={16} className={spinClass} />
          </div>
        </div>

        <div className="text-[10px] text-center space-y-0.5">
          <div className={`font-semibold ${colorClass}`}>
            {stateLabels[state]}
          </div>
          <div className="text-gray-600">
            Stack: {callStackEmpty ? 'empty' : 'busy'}
          </div>
          <div className="text-gray-600">
            μ: {microtaskCount} | T: {taskCount}
          </div>
        </div>
      </div>
    </div>
  );
}
