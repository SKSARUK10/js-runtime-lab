import type { RuntimeSnapshot } from '@/types/runtime';
import { Activity } from 'lucide-react';

interface RuntimeStatusProps {
  snapshot: RuntimeSnapshot;
}

function formatTime(ms: number): string {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export function RuntimeStatus({ snapshot }: RuntimeStatusProps) {
  const jsStatus = snapshot.state === 'COMPLETED' ? 'Completed' :
    snapshot.state === 'RUNNING' || snapshot.state === 'EXECUTING_SYNC' ? 'Running' :
    snapshot.state === 'WAITING_WEB_API' ? 'Waiting (Web API)' :
    snapshot.state === 'MICROTASK_PROCESSING' ? 'Processing Microtasks' :
    snapshot.state === 'TASK_PROCESSING' ? 'Processing Task' :
    snapshot.state === 'PAUSED' ? 'Paused' : 'Initialized';

  const eventLoopStatus = snapshot.eventLoopState === 'IDLE' ? 'Idle' :
    snapshot.eventLoopState === 'CHECKING' ? 'Checking' :
    snapshot.eventLoopState === 'MICROTASKS' ? 'Microtasks' :
    snapshot.eventLoopState === 'SCHEDULING' ? 'Scheduling' : 'Executing';

  const rows = [
    { label: 'JavaScript', value: jsStatus, color: snapshot.state === 'COMPLETED' ? 'text-gray-400' : 'text-accent-green' },
    { label: 'Call Stack', value: snapshot.callStack.length === 0 ? 'Empty' : `${snapshot.callStack.length} frame(s)`, color: 'text-gray-300' },
    { label: 'Microtasks', value: String(snapshot.microtaskQueue.length), color: 'text-accent-violet' },
    { label: 'Tasks', value: String(snapshot.taskQueue.length), color: 'text-accent-amber' },
    { label: 'Web APIs', value: String(snapshot.webApis.length), color: 'text-accent-cyan' },
    { label: 'Event Loop', value: eventLoopStatus, color: 'text-accent-blue' },
    { label: 'CPU', value: `${Math.round(snapshot.cpuUsage)}%`, color: snapshot.cpuUsage > 80 ? 'text-accent-red' : 'text-accent-green' },
    { label: 'Heap', value: `${(snapshot.heap.length * 0.3 + 0.1).toFixed(1)} MB*`, color: 'text-gray-300' },
  ];

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-1.5">
          <Activity size={11} className="text-accent-green" />
          Runtime Status
        </span>
        <span className="text-[10px] text-gray-500 normal-case tracking-normal font-mono">
          {formatTime(snapshot.executionTime)}
        </span>
      </div>
      <div className="flex-1 p-2 space-y-1 text-[11px]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-1 py-0.5 rounded hover:bg-panel-hover transition-colors">
            <span className="text-gray-500">{row.label}:</span>
            <span className={`font-mono font-semibold ${row.color}`}>{row.value}</span>
          </div>
        ))}
        <div className="pt-1 mt-1 border-t border-panel-border text-[9px] text-gray-600 text-center">
          *Simulated educational value
        </div>
      </div>
    </div>
  );
}
