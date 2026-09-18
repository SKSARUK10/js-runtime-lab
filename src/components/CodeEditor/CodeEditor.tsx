import { useMemo } from 'react';
import { highlightLine } from '@/utils/syntax';
import { Play } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  currentLine: number | null;
  onCodeChange: (code: string) => void;
}

export function CodeEditor({ code, currentLine, onCodeChange }: CodeEditorProps) {
  const lines = useMemo(() => code.split('\n'), [code]);

  return (
    <div className="flex flex-col h-full glass-panel overflow-hidden">
      <div className="panel-header">
        <span>editor.js</span>
        <span className="text-[10px] text-gray-500 normal-case tracking-normal">
          {lines.length} lines
        </span>
      </div>
      <div className="flex flex-1 overflow-auto font-mono text-[13px] leading-[1.6]">
        {/* Line numbers + code */}
        <div className="flex-1 relative">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isActive = lineNum === currentLine;
            const tokens = highlightLine(line);
            return (
              <div
                key={idx}
                className={`flex min-h-[21px] ${isActive ? 'bg-accent-blue/10 border-l-2 border-accent-blue' : 'border-l-2 border-transparent'}`}
              >
                <span className="select-none text-right pr-3 pl-3 text-gray-600 w-12 flex-shrink-0 border-r border-panel-border">
                  {lineNum.toString().padStart(2, '0')}
                </span>
                <div className="pl-3 pr-3 flex-1 whitespace-pre">
                  {isActive && (
                    <span className="inline-block text-accent-blue mr-1 -ml-4 animate-pulse-glow">
                      <Play size={10} className="inline fill-accent-blue" />
                    </span>
                  )}
                  {tokens.length === 0 ? (
                    <span>&nbsp;</span>
                  ) : (
                    tokens.map((tok, ti) => (
                      <span key={ti} className={tok.className}>{tok.text}</span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
          {/* Editable textarea overlay */}
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            spellCheck={false}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-gray-300 resize-none outline-none pl-12 pr-3 pt-0 font-mono text-[13px] leading-[1.6] whitespace-pre"
            style={{ caretColor: '#c9d1d9' }}
          />
        </div>
      </div>
    </div>
  );
}
