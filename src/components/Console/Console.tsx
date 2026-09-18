import { useRef, useEffect } from 'react';
import type { ConsoleEntry } from '@/types/runtime';
import { Terminal, Trash2 } from 'lucide-react';

interface ConsoleProps {
  entries: ConsoleEntry[];
  onClear?: () => void;
}

function formatTimestamp(ms: number): string {
  const totalSec = ms / 1000;
  const min = Math.floor(totalSec / 60);
  const sec = Math.floor(totalSec % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export function Console({ entries, onClear }: ConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="panel-header">
        <span className="flex items-center gap-1.5">
          <Terminal size={11} className="text-accent-green" />
          Console
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 normal-case tracking-normal">
            {entries.length} entries
          </span>
          {onClear && (
            <button
              onClick={onClear}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="Clear console"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto p-2 font-mono text-[12px] space-y-0.5">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-xs">
            Console output will appear here
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-start gap-2 px-2 py-0.5 rounded transition-all duration-300 ${
                entry.type === 'error'
                  ? 'text-accent-red'
                  : entry.type === 'warn'
                  ? 'text-accent-amber'
                  : 'text-gray-300'
              }`}
              style={{ animation: 'slideIn 0.2s ease-out' }}
            >
              <span className="text-[10px] text-gray-600 flex-shrink-0 mt-0.5">
                {formatTimestamp(entry.timestamp)}
              </span>
              <span className="text-gray-600 flex-shrink-0">
                {entry.type === 'error' ? '✗' : '>'}
              </span>
              <span className={entry.type === 'error' ? 'text-accent-red' : 'text-gray-200'}>
                {entry.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
