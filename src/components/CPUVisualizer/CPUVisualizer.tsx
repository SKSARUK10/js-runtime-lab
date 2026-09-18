import { Cpu } from 'lucide-react';

interface CPUVisualizerProps {
  cpuUsage: number;
  currentOperation: string;
  stackFrames: number;
  queueLength: number;
  executionStatus: string;
}

export function CPUVisualizer({ cpuUsage, currentOperation, stackFrames, queueLength, executionStatus }: CPUVisualizerProps) {
  const bars = 16;
  const activeBars = Math.round((cpuUsage / 100) * bars);

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-1.5">
          <Cpu size={11} className="text-accent-green" />
          CPU
        </span>
        <span className="text-[10px] text-gray-500 normal-case tracking-normal">
          {Math.round(cpuUsage)}%
        </span>
      </div>
      <div className="flex-1 p-2.5 space-y-2 text-[11px]">
        {/* CPU Activity bars */}
        <div className="flex items-end gap-0.5 h-10">
          {Array.from({ length: bars }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-300 ${
                i < activeBars
                  ? cpuUsage > 80
                    ? 'bg-accent-red'
                    : cpuUsage > 50
                    ? 'bg-accent-amber'
                    : 'bg-accent-green'
                  : 'bg-panel-border'
              }`}
              style={{ height: `${Math.max(10, (i < activeBars ? (i / bars) * 100 : 5))}%` }}
            />
          ))}
        </div>

        {/* Core 1 indicator */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400">CORE 1</span>
            <span className="text-gray-300 font-mono">{Math.round(cpuUsage)}%</span>
          </div>
          <div className="h-1.5 bg-panel-border rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                cpuUsage > 80 ? 'bg-accent-red' : cpuUsage > 50 ? 'bg-accent-amber' : 'bg-accent-green'
              }`}
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        {/* Info rows */}
        <div className="space-y-1 pt-1 border-t border-panel-border">
          <div className="flex justify-between">
            <span className="text-gray-500">Operation:</span>
            <span className="text-gray-300 font-mono truncate ml-2 max-w-[140px]">{currentOperation || 'idle'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Execution:</span>
            <span className={`font-mono ${executionStatus === 'Running' ? 'text-accent-green' : 'text-gray-400'}`}>
              {executionStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Stack Frames:</span>
            <span className="text-gray-300 font-mono">{stackFrames}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Queue Length:</span>
            <span className="text-gray-300 font-mono">{queueLength}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
