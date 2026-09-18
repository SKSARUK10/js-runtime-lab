import { useRef, useEffect } from 'react';
import type { TimelineEvent } from '@/types/runtime';
import { Clock } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
  onSelectEvent?: (event: TimelineEvent) => void;
}

const categoryColors: Record<string, string> = {
  sync: 'bg-accent-blue',
  webapi: 'bg-accent-amber',
  microtask: 'bg-accent-violet',
  task: 'bg-accent-green',
  eventloop: 'bg-accent-cyan',
  error: 'bg-accent-red',
  memory: 'bg-gray-500',
};

const categoryDotColors: Record<string, string> = {
  sync: 'text-accent-blue',
  webapi: 'text-accent-amber',
  microtask: 'text-accent-violet',
  task: 'text-accent-green',
  eventloop: 'text-accent-cyan',
  error: 'text-accent-red',
  memory: 'text-gray-500',
};

export function Timeline({ events, onSelectEvent }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [events]);

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-1.5">
          <Clock size={11} className="text-accent-cyan" />
          Timeline
        </span>
        <span className="text-[10px] text-gray-500 normal-case tracking-normal">
          {events.length} events
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden p-2">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-xs">
            Events will appear here as execution progresses
          </div>
        ) : (
          <div className="flex items-start gap-1 min-w-max pb-2">
            {/* Time axis */}
            {events.map((event, idx) => (
              <div key={event.id} className="flex items-start gap-1">
                {idx > 0 && (
                  <div className="flex items-center h-6 mt-3">
                    <div className="w-3 h-px bg-panel-border" />
                    <div className={`w-0 h-0 border-l-4 border-l-panel-border border-y-2 border-y-transparent`} />
                  </div>
                )}
                <div
                  onClick={() => onSelectEvent?.(event)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  {/* Time label */}
                  <span className="text-[8px] text-gray-600 font-mono mb-1">
                    {event.time}ms
                  </span>
                  {/* Dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${categoryColors[event.category] || 'bg-gray-500'} group-hover:scale-150 transition-transform`}
                    style={{ animation: 'slideIn 0.2s ease-out' }}
                  />
                  {/* Label */}
                  <div className="mt-1 max-w-[120px] text-center">
                    <span className={`text-[9px] ${categoryDotColors[event.category] || 'text-gray-500'} leading-tight block`}>
                      {event.label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
