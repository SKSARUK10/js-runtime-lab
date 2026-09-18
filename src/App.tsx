import { useState, useEffect, useCallback } from 'react';
import { useRuntimeState } from '@/hooks/useRuntime';
import { examples } from '@/data/examples';
import type { TaskQueueEntry } from '@/types/runtime';

import { CodeEditor } from '@/components/CodeEditor/CodeEditor';
import { CallStack } from '@/components/CallStack/CallStack';
import { WebAPIs } from '@/components/WebAPIs/WebAPIs';
import { EventLoop } from '@/components/EventLoop/EventLoop';
import { Queues } from '@/components/Queues/Queues';
import { Console } from '@/components/Console/Console';
import { CPUVisualizer } from '@/components/CPUVisualizer/CPUVisualizer';
import { MemoryVisualizer } from '@/components/MemoryVisualizer/MemoryVisualizer';
import { Timeline } from '@/components/Timeline/Timeline';
import { RuntimeStatus } from '@/components/RuntimeStatus/RuntimeStatus';
import { ControlBar } from '@/components/ControlBar/ControlBar';
import { ExplanationPanel } from '@/components/ExplanationPanel/ExplanationPanel';
import { Profiler } from '@/components/Profiler/Profiler';
import { EventInspector } from '@/components/EventInspector/EventInspector';
import { InterviewMode } from '@/components/InterviewMode/InterviewMode';
import { WelcomeModal } from '@/components/WelcomeModal/WelcomeModal';

import {
  Terminal,
  Code2,
  GitBranch,
  Repeat,
  Brain,
  Eye,
  EyeOff,
  ChevronDown,
  Settings,
} from 'lucide-react';

function App() {
  const rt = useRuntimeState();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showInterview, setShowInterview] = useState(false);
  const [inspectorTask, setInspectorTask] = useState<TaskQueueEntry | null>(null);
  const [showPanelToggles, setShowPanelToggles] = useState(false);

  const { snapshot } = rt;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showWelcome || showInterview) return;
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          rt.isRunning ? rt.pause() : rt.run();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          rt.step();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          rt.reset();
          break;
        case '1':
          rt.setSpeed(0.25);
          break;
        case '2':
          rt.setSpeed(0.5);
          break;
        case '3':
          rt.setSpeed(1);
          break;
        case '4':
          rt.setSpeed(2);
          break;
        case '5':
          rt.setSpeed(5);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rt, showWelcome, showInterview]);

  const handleClearConsole = useCallback(() => {
    // We can't directly mutate the snapshot, but we can trigger a reset of just console
    // For now, console is part of the simulation state
  }, []);

  const runtimeReady = snapshot.state !== 'COMPLETED';
  const statusColor = snapshot.state === 'COMPLETED' ? 'bg-gray-500' :
    snapshot.state === 'WAITING_WEB_API' ? 'bg-accent-amber' :
    rt.isRunning ? 'bg-accent-green' : 'bg-accent-blue';

  return (
    <div className={`h-screen flex flex-col bg-[#0a0c10] text-gray-300 overflow-hidden ${rt.reducedMotion ? 'reduce-motion' : ''}`}>
      {showWelcome && <WelcomeModal onStart={() => setShowWelcome(false)} />}
      {showInterview && <InterviewMode onExit={() => setShowInterview(false)} />}
      {inspectorTask && <EventInspector task={inspectorTask} onClose={() => setInspectorTask(null)} />}

      {/* ===== TOP BAR ===== */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#1e2433] bg-[#0d0f14] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-accent-green" />
            <span className="font-bold text-sm text-gray-100">JS Runtime Lab</span>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <span className="px-2 py-0.5 text-[10px] rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/30 flex items-center gap-1">
              <Code2 size={9} /> JavaScript
            </span>
            <span className="px-2 py-0.5 text-[10px] rounded bg-accent-violet/10 text-accent-violet border border-accent-violet/30 flex items-center gap-1">
              <GitBranch size={9} /> Runtime
            </span>
            <span className="px-2 py-0.5 text-[10px] rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 flex items-center gap-1">
              <Repeat size={9} /> Event Loop
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Runtime ready indicator */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className={`status-dot ${statusColor} ${rt.isRunning ? 'animate-pulse' : ''}`} />
            <span>{snapshot.state === 'COMPLETED' ? 'Completed' : 'Runtime Ready'}</span>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-0.5">
            <button
              onClick={() => rt.setMode('developer')}
              className={`px-2 py-0.5 text-[10px] rounded transition-all ${
                rt.mode === 'developer' ? 'bg-accent-blue/20 text-accent-blue' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Dev
            </button>
            <button
              onClick={() => rt.setMode('learning')}
              className={`px-2 py-0.5 text-[10px] rounded transition-all ${
                rt.mode === 'learning' ? 'bg-accent-blue/20 text-accent-blue' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Learn
            </button>
            <button
              onClick={() => setShowInterview(true)}
              className="px-2 py-0.5 text-[10px] rounded text-accent-violet hover:bg-accent-violet/20 flex items-center gap-1 transition-all"
            >
              <Brain size={9} /> Interview
            </button>
          </div>

          {/* Panel visibility toggles */}
          <div className="relative">
            <button
              onClick={() => setShowPanelToggles(!showPanelToggles)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="Panel settings"
            >
              <Settings size={14} />
            </button>
            {showPanelToggles && (
              <div className="absolute right-0 top-full mt-1 glass-panel p-2 z-50 w-48">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 px-1">Show Panels</div>
                {([
                  { key: 'stack', label: 'Stack Frames' },
                  { key: 'webapis', label: 'Web APIs' },
                  { key: 'microtasks', label: 'Microtasks' },
                  { key: 'cpu', label: 'CPU' },
                  { key: 'memory', label: 'Memory' },
                  { key: 'explanations', label: 'Explanations' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 px-1 py-1 text-[11px] text-gray-300 cursor-pointer hover:bg-panel-hover rounded">
                    <input
                      type="checkbox"
                      checked={rt.showPanels[key]}
                      onChange={() => rt.togglePanel(key)}
                      className="accent-blue-500"
                    />
                    {label}
                  </label>
                ))}
                <div className="border-t border-panel-border mt-1.5 pt-1.5">
                  <label className="flex items-center gap-2 px-1 py-1 text-[11px] text-gray-300 cursor-pointer hover:bg-panel-hover rounded">
                    <input
                      type="checkbox"
                      checked={rt.reducedMotion}
                      onChange={(e) => rt.setReducedMotion(e.target.checked)}
                      className="accent-blue-500"
                    />
                    Reduced Motion
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== CONTROL BAR ===== */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1e2433] bg-[#0d0f14] flex-shrink-0">
        <ControlBar
          state={snapshot.state}
          isRunning={rt.isRunning}
          speed={rt.speed}
          executionTime={snapshot.executionTime}
          stepCount={rt.stepCount}
          totalSteps={rt.totalSteps}
          onRun={rt.run}
          onPause={rt.pause}
          onStep={rt.step}
          onReset={rt.reset}
          onSpeedChange={rt.setSpeed}
        />

        {/* Example selector */}
        <div className="relative ml-auto">
          <select
            value={rt.selectedExampleId}
            onChange={(e) => rt.selectExample(e.target.value)}
            className="appearance-none bg-[#141821] border border-[#1e2433] text-[11px] text-gray-300 rounded px-2 py-1.5 pr-7 outline-none hover:border-gray-600 cursor-pointer"
          >
            {examples.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex overflow-hidden gap-1 p-1">
        {/* LEFT: Code Editor + Status */}
        <div className="w-[320px] flex flex-col gap-1 flex-shrink-0">
          <div className="flex-1 min-h-0">
            <CodeEditor
              code={rt.code}
              currentLine={snapshot.currentLine}
              onCodeChange={rt.setCode}
            />
          </div>
          <div className="h-[200px] flex-shrink-0">
            <RuntimeStatus snapshot={snapshot} />
          </div>
        </div>

        {/* CENTER: Runtime Visualizer */}
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          {/* Top row: Call Stack + Web APIs + Event Loop */}
          <div className="flex gap-1 flex-1 min-h-0">
            {rt.showPanels.stack && (
              <div className="flex-1 min-w-0">
                <CallStack
                  stack={snapshot.callStack}
                  maxDepth={snapshot.profiler.maxStackDepth}
                />
              </div>
            )}
            {rt.showPanels.webapis && (
              <div className="flex-1 min-w-0">
                <WebAPIs
                  webApis={snapshot.webApis}
                  isWaiting={snapshot.isWaitingForTimer}
                  pendingTimerId={snapshot.pendingTimerId}
                />
              </div>
            )}
            <div className="w-[140px] flex-shrink-0">
              <EventLoop
                state={snapshot.eventLoopState}
                callStackEmpty={snapshot.callStack.length === 0}
                microtaskCount={snapshot.microtaskQueue.length}
                taskCount={snapshot.taskQueue.length}
              />
            </div>
          </div>

          {/* Middle row: Queues + CPU + Memory */}
          <div className="flex gap-1 h-[200px] flex-shrink-0">
            {rt.showPanels.microtasks && (
              <div className="flex-1 min-w-0">
                <Queues
                  microtasks={snapshot.microtaskQueue}
                  tasks={snapshot.taskQueue}
                  onSelectTask={setInspectorTask}
                />
              </div>
            )}
            {rt.showPanels.cpu && (
              <div className="w-[200px] flex-shrink-0">
                <CPUVisualizer
                  cpuUsage={snapshot.cpuUsage}
                  currentOperation={snapshot.stepDescription}
                  stackFrames={snapshot.callStack.length}
                  queueLength={snapshot.microtaskQueue.length + snapshot.taskQueue.length}
                  executionStatus={rt.isRunning ? 'Running' : snapshot.state === 'COMPLETED' ? 'Done' : 'Idle'}
                />
              </div>
            )}
            {rt.showPanels.memory && (
              <div className="w-[200px] flex-shrink-0">
                <MemoryVisualizer heap={snapshot.heap} />
              </div>
            )}
            <div className="w-[180px] flex-shrink-0">
              <Profiler profiler={snapshot.profiler} />
            </div>
          </div>

          {/* Explanation panel */}
          {rt.showPanels.explanations && rt.mode !== 'developer' && (
            <div className="flex-shrink-0">
              <ExplanationPanel
                explanations={snapshot.explanations}
                mode={rt.mode}
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== BOTTOM: Console + Timeline ===== */}
      <div className="flex gap-1 p-1 h-[160px] flex-shrink-0 border-t border-[#1e2433]">
        <div className="flex-1 min-w-0">
          <Console entries={snapshot.consoleOutput} onClear={handleClearConsole} />
        </div>
        <div className="flex-1 min-w-0">
          <Timeline events={snapshot.timeline} />
        </div>
      </div>
    </div>
  );
}

export default App;
