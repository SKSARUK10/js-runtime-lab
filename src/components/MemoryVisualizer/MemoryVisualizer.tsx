import type { HeapObject } from '@/types/runtime';
import { Database } from 'lucide-react';

interface MemoryVisualizerProps {
  heap: HeapObject[];
}

const typeColors: Record<string, string> = {
  Object: 'text-accent-blue border-accent-blue/30',
  Closure: 'text-accent-violet border-accent-violet/30',
  Timer: 'text-accent-amber border-accent-amber/30',
  Promise: 'text-accent-green border-accent-green/30',
  Array: 'text-accent-cyan border-accent-cyan/30',
  Function: 'text-gray-300 border-panel-border',
};

export function MemoryVisualizer({ heap }: MemoryVisualizerProps) {
  const totalSize = (heap.length * 0.3 + 0.1).toFixed(1);

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-1.5">
          <Database size={11} className="text-accent-cyan" />
          Heap
        </span>
        <span className="text-[10px] text-gray-500 normal-case tracking-normal">
          {totalSize} MB*
        </span>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {heap.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-xs">
            Heap is empty
          </div>
        ) : (
          heap.map((obj) => (
            <div
              key={obj.id}
              className={`px-2.5 py-1.5 rounded border text-[11px] font-mono bg-panel-surface transition-all duration-300 ${typeColors[obj.type] || 'text-gray-300 border-panel-border'}`}
              style={{ animation: 'slideIn 0.3s ease-out' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{obj.type}</span>
                <span className="text-[9px] text-gray-500">refs: {obj.refCount}</span>
              </div>
              <div className="text-gray-300 mt-0.5">{obj.label}</div>
              <div className="text-gray-500 text-[10px]">{obj.detail}</div>
              {obj.sourceLine && (
                <div className="text-gray-600 text-[9px]">line {obj.sourceLine}</div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="px-2 py-1 border-t border-panel-border text-[9px] text-gray-600 text-center">
        Educational memory model — not actual V8 heap
      </div>
    </div>
  );
}
