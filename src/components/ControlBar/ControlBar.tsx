import { Play, Pause, SkipForward, RotateCcw, Gauge } from 'lucide-react';
import type { Speed, RuntimeState } from '@/types/runtime';

interface ControlBarProps {
  state: RuntimeState;
  isRunning: boolean;
  speed: Speed;
  executionTime: number;
  stepCount: number;
  totalSteps: number;
  onRun: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (s: Speed) => void;
}

function formatExecTime(ms: number): string {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

const speeds: Speed[] = [0.25, 0.5, 1, 2, 5];

export function ControlBar({
  state,
  isRunning,
  speed,
  executionTime,
  stepCount,
  totalSteps,
  onRun,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
}: ControlBarProps) {
  const isComplete = state === 'COMPLETED';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 glass-panel">
      {/* Run/Pause */}
      {isRunning ? (
        <button onClick={onPause} className="btn-primary flex items-center gap-1" title="Pause (Space)">
          <Pause size={12} />
          <span>Pause</span>
        </button>
      ) : (
        <button
          onClick={onRun}
          disabled={isComplete}
          className="btn-primary flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Run (Space)"
        >
          <Play size={12} className="fill-current" />
          <span>Run</span>
        </button>
      )}

      {/* Step */}
      <button
        onClick={onStep}
        disabled={isComplete}
        className="btn-default flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
        title="Step (S)"
      >
        <SkipForward size={12} />
        <span>Step</span>
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="btn-default flex items-center gap-1"
        title="Reset (R)"
      >
        <RotateCcw size={12} />
        <span>Reset</span>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-panel-border" />

      {/* Speed */}
      <div className="flex items-center gap-1">
        <Gauge size={12} className="text-gray-500" />
        <div className="flex gap-0.5">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-1.5 py-0.5 text-[10px] rounded font-mono transition-all ${
                speed === s
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/50'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-panel-border" />

      {/* Execution time */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="text-gray-500">Time:</span>
        <span className="font-mono text-gray-300">{formatExecTime(executionTime)}</span>
      </div>

      {/* Step counter */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="text-gray-500">Step:</span>
        <span className="font-mono text-gray-300">{stepCount}/{totalSteps}</span>
      </div>
    </div>
  );
}
