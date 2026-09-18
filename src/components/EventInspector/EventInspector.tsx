import type { TaskQueueEntry } from '@/types/runtime';
import { X, Search } from 'lucide-react';

interface EventInspectorProps {
  task: TaskQueueEntry | null;
  onClose: () => void;
}

export function EventInspector({ task, onClose }: EventInspectorProps) {
  if (!task) return null;

  const rows = [
    { label: 'Type', value: task.type },
    { label: 'Source', value: task.label },
    { label: 'Created', value: `${task.createdAt}ms` },
    { label: 'Status', value: 'Queued' },
    { label: 'Destination', value: 'Call Stack' },
    { label: 'Related Code', value: task.sourceLine ? `Line ${task.sourceLine}` : 'N/A' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-panel max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-header">
          <span className="flex items-center gap-1.5">
            <Search size={11} className="text-accent-blue" />
            Event Inspector
          </span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-3 space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between text-xs border-b border-panel-border pb-1.5">
              <span className="text-gray-500">{row.label}:</span>
              <span className="text-gray-200 font-mono text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
