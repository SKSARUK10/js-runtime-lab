import type { ProfilerData } from '@/types/runtime';
import { BarChart3 } from 'lucide-react';

interface ProfilerProps {
  profiler: ProfilerData;
}

export function Profiler({ profiler }: ProfilerProps) {
  const rows = [
    { label: 'Total Runtime', value: `${profiler.totalRuntime}ms` },
    { label: 'Microtasks', value: String(profiler.microtasksExecuted) },
    { label: 'Tasks', value: String(profiler.tasksExecuted) },
    { label: 'Max Stack Depth', value: String(profiler.maxStackDepth) },
    { label: 'Errors', value: String(profiler.errors) },
  ];

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-1.5">
          <BarChart3 size={11} className="text-accent-amber" />
          Profiler
        </span>
      </div>
      <div className="flex-1 p-2 space-y-1 text-[11px]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-1 py-0.5">
            <span className="text-gray-500">{row.label}</span>
            <span className="font-mono text-gray-300">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
