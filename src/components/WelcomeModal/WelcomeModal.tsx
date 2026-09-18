import { useState } from 'react';
import { Terminal, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  onStart: () => void;
}

export function WelcomeModal({ onStart }: WelcomeModalProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleStart = () => {
    setVisible(false);
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-panel-bg/90 backdrop-blur-sm">
      <div className="glass-panel max-w-lg mx-4 overflow-hidden">
        <div className="panel-header">
          <span className="flex items-center gap-1.5">
            <Terminal size={12} className="text-accent-green" />
            JS Runtime Lab
          </span>
        </div>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Welcome to JS Runtime Lab
          </h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Watch JavaScript execute one operation at a time. Visualize the Call Stack,
            Web APIs, Microtask Queue, Task Queue, and the Event Loop in action.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-6 text-left">
            <div className="px-3 py-2 rounded bg-panel-surface border border-panel-border">
              <div className="text-[10px] uppercase tracking-wider text-accent-blue mb-0.5">Step Mode</div>
              <div className="text-[11px] text-gray-400">Press Step to advance one event at a time</div>
            </div>
            <div className="px-3 py-2 rounded bg-panel-surface border border-panel-border">
              <div className="text-[10px] uppercase tracking-wider text-accent-green mb-0.5">Run Mode</div>
              <div className="text-[11px] text-gray-400">Auto-advance through the simulation</div>
            </div>
            <div className="px-3 py-2 rounded bg-panel-surface border border-panel-border">
              <div className="text-[10px] uppercase tracking-wider text-accent-violet mb-0.5">10 Examples</div>
              <div className="text-[11px] text-gray-400">From basic setTimeout to async/await</div>
            </div>
            <div className="px-3 py-2 rounded bg-panel-surface border border-panel-border">
              <div className="text-[10px] uppercase tracking-wider text-accent-amber mb-0.5">Interview Mode</div>
              <div className="text-[11px] text-gray-400">Test your event loop knowledge</div>
            </div>
          </div>

          <div className="text-[10px] text-gray-600 mb-4">
            Shortcuts: Space = Run/Pause · S = Step · R = Reset · 1-5 = Speed
          </div>

          <button
            onClick={handleStart}
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2"
          >
            <span>Start Simulator</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
