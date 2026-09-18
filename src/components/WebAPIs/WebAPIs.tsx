import type { WebApiEntry } from '@/types/runtime';
import { Clock, Wifi, MousePointer, Repeat } from 'lucide-react';

interface WebAPIsProps {
  webApis: WebApiEntry[];
  isWaiting: boolean;
  pendingTimerId: string | null;
}

export function WebAPIs({ webApis, isWaiting, pendingTimerId }: WebAPIsProps) {
  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="panel-header">
        <span>Web APIs</span>
        <span className="text-[10px] text-gray-500 normal-case tracking-normal">
          {webApis.length} active
        </span>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {webApis.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-xs">
            No active Web APIs
          </div>
        ) : (
          webApis.map((api) => {
            const progress = api.delay > 0 ? ((api.delay - api.remaining) / api.delay) * 100 : 100;
            const isActive = isWaiting && pendingTimerId === api.id;
            const Icon = api.type === 'TIMER' ? Clock : api.type === 'FETCH' ? Wifi : api.type === 'DOM_EVENT' ? MousePointer : Repeat;
            return (
              <div
                key={api.id}
                className={`
                  p-2.5 rounded border transition-all duration-300
                  ${isActive
                    ? 'bg-accent-amber/10 border-accent-amber/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                    : 'bg-panel-surface border-panel-border'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-200">
                    <Icon size={11} className={isActive ? 'text-accent-amber' : 'text-gray-400'} />
                    {api.label}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500">
                    {api.type}
                  </span>
                </div>

                {/* Circular progress */}
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="13" fill="none" stroke="#1e2433" strokeWidth="3" />
                      <circle
                        cx="16" cy="16" r="13" fill="none"
                        stroke={isActive ? '#f59e0b' : '#3b82f6'}
                        strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 13}`}
                        strokeDashoffset={`${2 * Math.PI * 13 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400 font-mono">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="flex-1 text-[10px] text-gray-500 font-mono">
                    {isActive ? (
                      <span>Remaining: {(api.remaining / 1000).toFixed(2)}s</span>
                    ) : api.delay > 0 ? (
                      <span>Delay: {api.delay}ms</span>
                    ) : (
                      <span>Ready</span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-gray-600 mt-1.5">
                  callback: {api.callbackLabel}
                </div>
                {api.sourceLine && (
                  <div className="text-[9px] text-gray-700">
                    line {api.sourceLine}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
