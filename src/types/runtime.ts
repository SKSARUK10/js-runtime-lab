// ===== Core Runtime Types =====

export type RuntimeState =
  | 'INITIALIZED'
  | 'RUNNING'
  | 'PAUSED'
  | 'EXECUTING_SYNC'
  | 'WAITING_WEB_API'
  | 'MICROTASK_PROCESSING'
  | 'TASK_PROCESSING'
  | 'COMPLETED';

export type EventLoopState =
  | 'IDLE'
  | 'CHECKING'
  | 'MICROTASKS'
  | 'SCHEDULING'
  | 'EXECUTING';

export type WebApiType = 'TIMER' | 'FETCH' | 'DOM_EVENT' | 'INTERVAL';

export type TaskType =
  | 'setTimeout'
  | 'setInterval'
  | 'domEvent'
  | 'messageEvent'
  | 'fetchCallback';

export type MicrotaskType =
  | 'Promise.then'
  | 'queueMicrotask'
  | 'MutationObserver';

export type HeapObjectType =
  | 'Object'
  | 'Closure'
  | 'Timer'
  | 'Promise'
  | 'Array'
  | 'Function';

export interface StackFrame {
  id: string;
  name: string;
  line: number;
  type: 'function' | 'global' | 'anonymous' | 'builtin';
  params?: string;
}

export interface WebApiEntry {
  id: string;
  type: WebApiType;
  label: string;
  delay: number; // total delay in ms
  remaining: number; // remaining ms
  callbackLabel: string;
  sourceLine: number;
  taskType: TaskType;
  intervalId?: number;
  callbackId: string;
}

export interface TaskQueueEntry {
  id: string;
  type: TaskType;
  label: string;
  sourceLine: number;
  callbackId: string;
  createdAt: number; // simulated time
  webApiId?: string;
}

export interface MicrotaskEntry {
  id: string;
  type: MicrotaskType;
  label: string;
  sourceLine: number;
  callbackId: string;
  createdAt: number;
}

export interface HeapObject {
  id: string;
  type: HeapObjectType;
  label: string;
  detail: string;
  sourceLine?: number;
  refCount: number;
}

export interface ConsoleEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'log' | 'error' | 'warn' | 'info';
}

export interface TimelineEvent {
  id: string;
  time: number;
  label: string;
  category: 'sync' | 'webapi' | 'microtask' | 'task' | 'eventloop' | 'error' | 'memory';
  line?: number;
  relatedId?: string;
}

export interface AnimationEvent {
  id: string;
  from: string;
  to: string;
  label: string;
  category: 'push' | 'pop' | 'webapi-register' | 'webapi-complete' | 'task-queue' | 'microtask-queue' | 'eventloop-transfer' | 'error';
  timestamp: number;
}

export interface ProfilerData {
  totalRuntime: number;
  microtasksExecuted: number;
  tasksExecuted: number;
  maxStackDepth: number;
  longestTaskDuration: number;
  longestTaskLabel: string;
  errors: number;
}

export interface ExplanationEntry {
  id: string;
  text: string;
  line?: number;
  timestamp: number;
}

export interface RuntimeSnapshot {
  state: RuntimeState;
  eventLoopState: EventLoopState;
  callStack: StackFrame[];
  microtaskQueue: MicrotaskEntry[];
  taskQueue: TaskQueueEntry[];
  webApis: WebApiEntry[];
  heap: HeapObject[];
  consoleOutput: ConsoleEntry[];
  timeline: TimelineEvent[];
  animations: AnimationEvent[];
  explanations: ExplanationEntry[];
  currentLine: number | null;
  cpuUsage: number;
  executionTime: number;
  profiler: ProfilerData;
  stepCount: number;
  stepDescription: string;
  isWaitingForTimer: boolean;
  pendingTimerId: string | null;
}

export type Speed = 0.25 | 0.5 | 1 | 2 | 5;

export type AppMode = 'developer' | 'learning' | 'interview';

export interface Example {
  id: string;
  name: string;
  code: string;
  description: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  expectedOutput?: string[];
  explanation?: string;
}
