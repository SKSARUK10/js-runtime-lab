// ===== Runtime Engine =====
// Converts parsed code into a sequence of discrete simulation steps.
// Each step represents one logical runtime event that the UI can visualize.

import type {
  StackFrame,
  WebApiEntry,
  TaskQueueEntry,
  MicrotaskEntry,
  HeapObject,
  ConsoleEntry,
  TimelineEvent,
  AnimationEvent,
  ExplanationEntry,
  RuntimeSnapshot,
  RuntimeState,
  EventLoopState,
  ProfilerData,
} from '@/types/runtime';
import { parseCode, extractStringLiteral, type ParseResult, type ParsedStep } from './parser';

let idCounter = 0;
function uid(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

export interface SimStep {
  description: string;
  line: number | null;
  apply: (snap: RuntimeSnapshot) => void;
  category: 'sync' | 'webapi' | 'microtask' | 'task' | 'eventloop' | 'error' | 'memory';
  waitForTimer?: string; // webApiId to wait for
  waitDuration?: number; // simulated ms to wait
}

export function generateSimulation(code: string): { steps: SimStep[]; parseResult: ParseResult; supported: boolean } {
  idCounter = 0;
  const parseResult = parseCode(code);

  if (!parseResult.supported) {
    return { steps: [], parseResult, supported: false };
  }

  const steps: SimStep[] = [];
  const { functions } = parseResult;

  // Track what we've registered
  const registeredTimers: { id: string; line: number; delay: number; callbackId: string; label: string; isInterval: boolean }[] = [];
  const registeredIntervals: { id: string; line: number; delay: number; callbackId: string; label: string }[] = [];

  // Helper to parse callback body steps
  function getCallbackBodySteps(step: ParsedStep): ParsedStep[] {
    if (!step.bodyLines) return [];
    const [start, end] = step.bodyLines;
    return parseResult.steps.filter(s => s.line >= start && s.line <= end && s.type !== 'blank' && s.type !== 'comment' && s.type !== 'block-end');
  }

  // Generate steps for executing a function body
  function generateFunctionBodySteps(
    fnName: string,
    fnSteps: ParsedStep[],
    lineOffset: number,
    isAsync: boolean,
  pendingMicrotaskContinuation?: () => void,
  isClosureReturn?: boolean,
  closureVarName?: string,
  closureDetail?: string,
  closureLine?: number,
  closureId?: string,
  isAsyncContinuation?: boolean,
  asyncFnName?: string,
  asyncFnParams?: string,
    asyncFnLine?: number,
  asyncFnId?: string,
    asyncFnBodySteps?: ParsedStep[],
    asyncFnIsClosure?: boolean,
    asyncFnIsAsync?: boolean,
  asyncFnHasAwait?: boolean,
  asyncFnEndLine?: number,
  asyncFnStartLine?: number,
  closureHeapId?: string,
  closureHeapLabel?: string,
    closureHeapDetail?: string,
    closureHeapLine?: number,
    closureHeapType?: string,
    closureHeapRefCount?: number,
    closureHeapObj?: HeapObject,
    closureHeapObjId?: string,
    closureHeapObjType?: string,
    closureHeapObjLabel?: string,
    closureHeapObjDetail?: string,
    closureHeapObjLine?: number,
    closureHeapObjRefCount?: number,
    closureHeapObjRefId?: string,
    closureHeapObjRefType?: string,
    closureHeapObjRefLabel?: string,
    closureHeapObjRefDetail?: string,
    closureHeapObjRefLine?: number,
    closureHeapObjRefRefCount?: number,
  closureHeapObjRefId2?: string,
    closureHeapObjRefType2?: string,
    closureHeapObjRefLabel2?: string,
    closureHeapObjRefDetail2?: string,
    closureHeapObjRefLine2?: number,
    closureHeapObjRefRefCount2?: number,
    isAsyncFn?: boolean,
    asyncContinuationLine?: number,
    asyncContinuationFnName?: string,
    asyncContinuationParams?: string,
    asyncContinuationId?: string,
    asyncContinuationBodySteps?: ParsedStep[],
    asyncContinuationIsClosure?: boolean,
    asyncContinuationIsAsync?: boolean,
    asyncContinuationHasAwait?: boolean,
    asyncContinuationEndLine?: number,
    asyncContinuationStartLine?: number,
    closureReturnVarName?: string,
    closureReturnDetail?: string,
    closureReturnLine?: number,
    closureReturnId?: string,
    closureReturnHeapId?: string,
    closureReturnHeapLabel?: string,
    closureReturnHeapDetail?: string,
    closureReturnHeapLine?: number,
    closureReturnHeapType?: string,
    closureReturnHeapRefCount?: number,
    closureReturnHeapObj?: HeapObject,
    closureReturnHeapObjId?: string,
    closureReturnHeapObjType?: string,
    closureReturnHeapObjLabel?: string,
    closureReturnHeapObjDetail?: string,
    closureReturnHeapObjLine?: number,
    closureReturnHeapObjRefCount?: number,
    closureReturnHeapObjRefId?: string,
    closureReturnHeapObjRefType?: string,
    closureReturnHeapObjRefLabel?: string,
    closureReturnHeapObjRefDetail?: string,
    closureReturnHeapObjRefLine?: number,
    closureReturnHeapObjRefRefCount?: number,
    closureReturnHeapObjRefId2?: string,
    closureReturnHeapObjRefType2?: string,
    closureReturnHeapObjRefLabel2?: string,
    closureReturnHeapObjRefDetail2?: string,
    closureReturnHeapObjRefLine2?: number,
    closureReturnHeapObjRefRefCount2?: number,
    isAsyncFnContinuation?: boolean,
    asyncContinuationLine2?: number,
    asyncContinuationFnName2?: string,
    asyncContinuationParams2?: string,
    asyncContinuationId2?: string,
    asyncContinuationBodySteps2?: ParsedStep[],
    asyncContinuationIsClosure2?: boolean,
    asyncContinuationIsAsync2?: boolean,
    asyncContinuationHasAwait2?: boolean,
    asyncContinuationEndLine2?: number,
    asyncContinuationStartLine2?: number,
  ): void {
    void fnSteps;
    void lineOffset;
    void isAsync;
    void pendingMicrotaskContinuation;
    void isClosureReturn;
    void closureVarName;
    void closureDetail;
    void closureLine;
    void closureId;
    void isAsyncContinuation;
    void asyncFnName;
    void asyncFnParams;
    void asyncFnLine;
    void asyncFnId;
    void asyncFnBodySteps;
    void asyncFnIsClosure;
    void asyncFnIsAsync;
    void asyncFnHasAwait;
    void asyncFnEndLine;
    void asyncFnStartLine;
    void closureHeapId;
    void closureHeapLabel;
    void closureHeapDetail;
    void closureHeapLine;
    void closureHeapType;
    void closureHeapRefCount;
    void closureHeapObj;
    void closureHeapObjId;
    void closureHeapObjType;
    void closureHeapObjLabel;
    void closureHeapObjDetail;
    void closureHeapObjLine;
    void closureHeapObjRefCount;
    void closureHeapObjRefId;
    void closureHeapObjRefType;
    void closureHeapObjRefLabel;
    void closureHeapObjRefDetail;
    void closureHeapObjRefLine;
    void closureHeapObjRefRefCount;
    void closureHeapObjRefId2;
    void closureHeapObjRefType2;
    void closureHeapObjRefLabel2;
    void closureHeapObjRefDetail2;
    void closureHeapObjRefLine2;
    void closureHeapObjRefRefCount2;
    void isAsyncFn;
    void asyncContinuationLine;
    void asyncContinuationFnName;
    void asyncContinuationParams;
    void asyncContinuationId;
    void asyncContinuationBodySteps;
    void asyncContinuationIsClosure;
    void asyncContinuationIsAsync;
    void asyncContinuationHasAwait;
    void asyncContinuationEndLine;
    void asyncContinuationStartLine;
    void closureReturnVarName;
    void closureReturnDetail;
    void closureReturnLine;
    void closureReturnId;
    void closureReturnHeapId;
    void closureReturnHeapLabel;
    void closureReturnHeapDetail;
    void closureReturnHeapLine;
    void closureReturnHeapType;
    void closureReturnHeapRefCount;
    void closureReturnHeapObj;
    void closureReturnHeapObjId;
    void closureReturnHeapObjType;
    void closureReturnHeapObjLabel;
    void closureReturnHeapObjDetail;
    void closureReturnHeapObjLine;
    void closureReturnHeapObjRefCount;
    void closureReturnHeapObjRefId;
    void closureHeapObjRefType;
    void closureHeapObjRefLabel;
    void closureHeapObjRefDetail;
    void closureHeapObjRefLine;
    void closureHeapObjRefRefCount;
    void closureReturnHeapObjRefId2;
    void closureReturnHeapObjRefType2;
    void closureReturnHeapObjRefLabel2;
    void closureReturnHeapObjRefDetail2;
    void closureReturnHeapObjRefLine2;
    void closureReturnHeapObjRefRefCount2;
    void isAsyncFnContinuation;
    void asyncContinuationLine2;
    void asyncContinuationFnName2;
    void asyncContinuationParams2;
    void asyncContinuationId2;
    void asyncContinuationBodySteps2;
    void asyncContinuationIsClosure2;
    void asyncContinuationIsAsync2;
    void asyncContinuationHasAwait2;
    void asyncContinuationEndLine2;
    void asyncContinuationStartLine2;
  }

  // Generate steps for executing a list of parsed steps (synchronous or callback body)
  function generateExecutionSteps(
    parsedSteps: ParsedStep[],
    contextFn: string | null,
    isCallback: boolean = false,
  callbackLabel?: string,
  callbackLine?: number,
  isMicrotaskCallback: boolean = false,
  isTaskCallback: boolean = false,
    isAsyncContinuation: boolean = false,
    asyncFnName?: string,
    asyncContinuationLine?: number,
    closureVarName?: string,
    closureDetail?: string,
    closureLine?: number,
    closureId?: string,
    isClosureReturn?: boolean,
    closureHeapId?: string,
    closureHeapLabel?: string,
    closureHeapDetail?: string,
    closureHeapLine?: number,
    closureHeapType?: string,
    closureHeapRefCount?: number,
    closureHeapObj?: HeapObject,
    closureHeapObjId?: string,
    closureHeapObjType?: string,
    closureHeapObjLabel?: string,
    closureHeapObjDetail?: string,
    closureHeapObjLine?: number,
    closureHeapObjRefCount?: number,
    closureHeapObjRefId?: string,
    closureHeapObjRefType?: string,
    closureHeapObjRefLabel?: string,
    closureHeapObjRefDetail?: string,
    closureHeapObjRefLine?: number,
    closureHeapObjRefRefCount?: number,
    closureHeapObjRefId2?: string,
    closureHeapObjRefType2?: string,
    closureHeapObjRefLabel2?: string,
    closureHeapObjRefDetail2?: string,
    closureHeapObjRefLine2?: number,
    closureHeapObjRefRefCount2?: number,
    closureReturnVarName?: string,
    closureReturnDetail?: string,
    closureReturnLine?: number,
    closureReturnId?: string,
    closureReturnHeapId?: string,
    closureReturnHeapLabel?: string,
    closureReturnHeapDetail?: string,
    closureReturnHeapLine?: number,
    closureReturnHeapType?: string,
    closureReturnHeapRefCount?: number,
    closureReturnHeapObj?: HeapObject,
    closureReturnHeapObjId?: string,
    closureReturnHeapObjType?: string,
    closureReturnHeapObjLabel?: string,
    closureReturnHeapObjDetail?: string,
    closureReturnHeapObjLine?: number,
    closureReturnHeapObjRefCount?: number,
    closureReturnHeapObjRefId?: string,
    voidFn?: boolean,
  ): void {
    void contextFn;
    void isCallback;
    void callbackLabel;
    void callbackLine;
    void isMicrotaskCallback;
    void isTaskCallback;
    void isAsyncContinuation;
    void asyncFnName;
    void asyncContinuationLine;
    void closureVarName;
    void voidFn;
    void closureDetail;
    void closureLine;
    void closureId;
    void isClosureReturn;
    void closureHeapId;
    void closureHeapLabel;
    void closureHeapDetail;
    void closureHeapLine;
    void closureHeapType;
    void closureHeapRefCount;
    void closureHeapObj;
    void closureHeapObjId;
    void closureHeapObjType;
    void closureHeapObjLabel;
    void closureHeapObjDetail;
    void closureHeapObjLine;
    void closureHeapObjRefCount;
    void closureHeapObjRefId;
    void closureHeapObjRefType;
    void closureHeapObjRefLabel;
    void closureHeapObjRefDetail;
    void closureHeapObjRefLine;
    void closureHeapObjRefRefCount;
    void closureHeapObjRefId2;
    void closureHeapObjRefType2;
    void closureHeapObjRefLabel2;
    void closureHeapObjRefDetail2;
    void closureHeapObjRefLine2;
    void closureHeapObjRefRefCount2;
    void closureReturnVarName;
    void closureReturnDetail;
    void closureReturnLine;
    void closureReturnId;
    void closureReturnHeapId;
    void closureReturnHeapLabel;
    void closureReturnHeapDetail;
    void closureReturnHeapLine;
    void closureReturnHeapType;
    void closureReturnHeapRefCount;
    void closureReturnHeapObj;
    void closureReturnHeapObjId;
    void closureReturnHeapObjType;
    void closureReturnHeapObjLabel;
    void closureReturnHeapObjDetail;
    void closureReturnHeapObjLine;
    void closureReturnHeapObjRefCount;
    void closureReturnHeapObjRefId;
  }

  // ===== MAIN STEP GENERATION =====
  // We iterate through the top-level parsed steps and generate simulation steps

  const topLevelSteps = parseResult.steps.filter(s => {
    // Only top-level (not inside function bodies)
    for (const [, fn] of functions) {
      if (s.line > fn.startLine && s.line <= fn.endLine) return false;
    }
    return true;
  });

  // Push global frame
  steps.push({
    description: 'Execute global code',
    line: 1,
    category: 'sync',
    apply: (snap) => {
      snap.callStack = [{
        id: uid('frame'),
        name: 'global()',
        line: 1,
        type: 'global',
      }];
      snap.state = 'EXECUTING_SYNC';
      snap.explanations.push({
        id: uid('exp'),
        text: 'JavaScript begins executing global script code. The global execution context is pushed onto the Call Stack.',
        timestamp: snap.executionTime,
      });
      snap.timeline.push({
        id: uid('tl'),
        time: snap.executionTime,
        label: 'Global execution context created',
        category: 'sync',
      });
    },
  });

  // Track pending async continuations
  const pendingAsyncContinuations: { fnName: string; line: number; bodySteps: ParsedStep[]; params: string }[] = [];

  for (const step of topLevelSteps) {
    switch (step.type) {
      case 'blank':
      case 'comment':
        break;

      case 'console.log': {
        const msg = extractStringLiteral(step.arg || '');
        steps.push({
          description: `console.log("${msg}")`,
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.currentLine = step.line;
            snap.callStack = [...snap.callStack, {
              id: uid('frame'),
              name: 'console.log()',
              line: step.line,
              type: 'builtin',
              params: `"${msg}"`,
            }];
            snap.animations.push({
              id: uid('anim'),
              from: 'code',
              to: 'callstack',
              label: 'console.log()',
              category: 'push',
              timestamp: snap.executionTime,
            });
            snap.cpuUsage = Math.min(100, snap.cpuUsage + 15);
            snap.explanations.push({
              id: uid('exp'),
              text: `console.log("${msg}") is called. This is synchronous — it executes immediately on the Call Stack.`,
              line: step.line,
              timestamp: snap.executionTime,
            });
          },
        });

        steps.push({
          description: `Output: ${msg}`,
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.consoleOutput = [...snap.consoleOutput, {
              id: uid('console'),
              text: msg,
              timestamp: snap.executionTime,
              type: 'log',
            }];
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: `console.log("${msg}")`,
              category: 'sync',
              line: step.line,
            });
          },
        });

        steps.push({
          description: 'console.log() returns',
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.callStack = snap.callStack.slice(0, -1);
            snap.animations.push({
              id: uid('anim'),
              from: 'callstack',
              to: 'code',
              label: 'console.log() returns',
              category: 'pop',
              timestamp: snap.executionTime,
            });
            snap.cpuUsage = Math.max(5, snap.cpuUsage - 10);
          },
        });
        break;
      }

      case 'console.error': {
        const msg = extractStringLiteral(step.arg || '');
        steps.push({
          description: `console.error("${msg}")`,
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.currentLine = step.line;
            snap.callStack = [...snap.callStack, {
              id: uid('frame'),
              name: 'console.error()',
              line: step.line,
              type: 'builtin',
              params: `"${msg}"`,
            }];
            snap.cpuUsage = Math.min(100, snap.cpuUsage + 15);
          },
        });

        steps.push({
          description: `Error output: ${msg}`,
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.consoleOutput = [...snap.consoleOutput, {
              id: uid('console'),
              text: msg,
              timestamp: snap.executionTime,
              type: 'error',
            }];
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: `console.error("${msg}")`,
              category: 'sync',
              line: step.line,
            });
          },
        });

        steps.push({
          description: 'console.error() returns',
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.callStack = snap.callStack.slice(0, -1);
            snap.cpuUsage = Math.max(5, snap.cpuUsage - 10);
          },
        });
        break;
      }

      case 'setTimeout': {
        const delay = step.delay || 0;
        const callbackId = uid('cb');
        const webApiId = uid('webapi');
        const callbackLabel = 'setTimeout callback';

        steps.push({
          description: `Register setTimeout(callback, ${delay}ms)`,
          line: step.line,
          category: 'webapi',
          apply: (snap) => {
            snap.currentLine = step.line;
            const webApi: WebApiEntry = {
              id: webApiId,
              type: 'TIMER',
              label: `setTimeout()`,
              delay,
              remaining: delay,
              callbackLabel,
              sourceLine: step.line,
              taskType: 'setTimeout',
              callbackId,
            };
            snap.webApis = [...snap.webApis, webApi];
            snap.animations.push({
              id: uid('anim'),
              from: 'callstack',
              to: 'webapi',
              label: 'setTimeout registered',
              category: 'webapi-register',
              timestamp: snap.executionTime,
            });
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: `setTimeout registered (${delay}ms)`,
              category: 'webapi',
              line: step.line,
              relatedId: webApiId,
            });
            snap.explanations.push({
              id: uid('exp'),
              text: `setTimeout does not pause JavaScript. The timer is handled by Web APIs outside the Call Stack. The callback cannot execute until the timer completes AND the Call Stack is empty.`,
              line: step.line,
              timestamp: snap.executionTime,
            });
            registeredTimers.push({ id: webApiId, line: step.line, delay, callbackId, label: callbackLabel, isInterval: false });
          },
        });

        // Wait for timer to complete
        if (delay > 0) {
          steps.push({
            description: `Timer running... (${delay}ms)`,
            line: step.line,
            category: 'webapi',
            waitDuration: delay,
            apply: (snap) => {
              snap.state = 'WAITING_WEB_API';
              snap.isWaitingForTimer = true;
              snap.pendingTimerId = webApiId;
              snap.explanations.push({
                id: uid('exp'),
                text: `The timer is counting down in the Web API layer. Meanwhile, JavaScript continues executing synchronous code.`,
                line: step.line,
                timestamp: snap.executionTime,
              });
            },
          });
        }

        // Timer completes -> push to task queue
        steps.push({
          description: 'Timer complete — callback enters Task Queue',
          line: step.line,
          category: 'webapi',
          apply: (snap) => {
            snap.webApis = snap.webApis.filter(w => w.id !== webApiId);
            snap.isWaitingForTimer = false;
            snap.pendingTimerId = null;
            const task: TaskQueueEntry = {
              id: uid('task'),
              type: 'setTimeout',
              label: callbackLabel,
              sourceLine: step.line,
              callbackId,
              createdAt: snap.executionTime,
              webApiId,
            };
            snap.taskQueue = [...snap.taskQueue, task];
            snap.animations.push({
              id: uid('anim'),
              from: 'webapi',
              to: 'taskqueue',
              label: 'Callback → Task Queue',
              category: 'task-queue',
              timestamp: snap.executionTime,
            });
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: 'Timer complete — callback queued',
              category: 'webapi',
              line: step.line,
              relatedId: task.id,
            });
            snap.explanations.push({
              id: uid('exp'),
              text: `The timer has completed and its callback is now eligible for the Task Queue. The Event Loop will pick it up when the Call Stack is empty.`,
              line: step.line,
              timestamp: snap.executionTime,
            });
          },
        });
        break;
      }

      case 'setInterval': {
        const delay = step.delay || 0;
        const callbackId = uid('cb');
        const webApiId = uid('webapi');
        const intervalId = registeredIntervals.length + 1;
        const callbackLabel = 'setInterval callback';

        steps.push({
          description: `Register setInterval(callback, ${delay}ms)`,
          line: step.line,
          category: 'webapi',
          apply: (snap) => {
            snap.currentLine = step.line;
            const webApi: WebApiEntry = {
              id: webApiId,
              type: 'INTERVAL',
              label: `setInterval()`,
              delay,
              remaining: delay,
              callbackLabel,
              sourceLine: step.line,
              taskType: 'setInterval',
              callbackId,
              intervalId,
            };
            snap.webApis = [...snap.webApis, webApi];
            snap.animations.push({
              id: uid('anim'),
              from: 'callstack',
              to: 'webapi',
              label: 'setInterval registered',
              category: 'webapi-register',
              timestamp: snap.executionTime,
            });
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: `setInterval registered (${delay}ms)`,
              category: 'webapi',
              line: step.line,
              relatedId: webApiId,
            });
            snap.explanations.push({
              id: uid('exp'),
              text: `setInterval registers a repeating timer in the Web API layer. Each interval completion pushes a new callback to the Task Queue.`,
              line: step.line,
              timestamp: snap.executionTime,
            });
            registeredIntervals.push({ id: webApiId, line: step.line, delay, callbackId, label: callbackLabel });

            // Add heap object for interval (memory leak demo)
            snap.heap = [...snap.heap, {
              id: uid('heap'),
              type: 'Timer',
              label: `setInterval #${intervalId}`,
              detail: `delay: ${delay}ms`,
              sourceLine: step.line,
              refCount: 1,
            }];
          },
        });

        // First interval tick
        steps.push({
          description: `Interval tick — callback enters Task Queue`,
          line: step.line,
          category: 'webapi',
          waitDuration: delay,
          apply: (snap) => {
            snap.state = 'WAITING_WEB_API';
            snap.isWaitingForTimer = true;
            snap.pendingTimerId = webApiId;
          },
        });

        steps.push({
          description: 'Interval callback queued',
          line: step.line,
          category: 'webapi',
          apply: (snap) => {
            snap.isWaitingForTimer = false;
            snap.pendingTimerId = null;
            const task: TaskQueueEntry = {
              id: uid('task'),
              type: 'setInterval',
              label: callbackLabel,
              sourceLine: step.line,
              callbackId,
              createdAt: snap.executionTime,
              webApiId,
            };
            snap.taskQueue = [...snap.taskQueue, task];
            snap.animations.push({
              id: uid('anim'),
              from: 'webapi',
              to: 'taskqueue',
              label: 'Interval → Task Queue',
              category: 'task-queue',
              timestamp: snap.executionTime,
            });
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: 'Interval tick — callback queued',
              category: 'webapi',
              line: step.line,
              relatedId: task.id,
            });
          },
        });
        break;
      }

      case 'promise.then': {
        const callbackId = uid('cb');
        const callbackSteps = getCallbackBodySteps(step);
        const isChained = step.isNested;
        const microtaskId = uid('mt');

        steps.push({
          description: `Promise.resolve().then() — schedule microtask`,
          line: step.line,
          category: 'microtask',
          apply: (snap) => {
            snap.currentLine = step.line;
            // Add promise to heap
            snap.heap = [...snap.heap, {
              id: uid('heap'),
              type: 'Promise',
              label: 'Promise',
              detail: 'state: fulfilled',
              sourceLine: step.line,
              refCount: 1,
            }];
            const mt: MicrotaskEntry = {
              id: microtaskId,
              type: 'Promise.then',
              label: 'Promise.then()',
              sourceLine: step.line,
              callbackId,
              createdAt: snap.executionTime,
            };
            snap.microtaskQueue = [...snap.microtaskQueue, mt];
            snap.animations.push({
              id: uid('anim'),
              from: 'callstack',
              to: 'microtask',
              label: 'Promise.then → Microtask Queue',
              category: 'microtask-queue',
              timestamp: snap.executionTime,
            });
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: isChained ? 'Chained .then() microtask queued' : 'Promise.then() microtask queued',
              category: 'microtask',
              line: step.line,
              relatedId: microtaskId,
            });
            snap.explanations.push({
              id: uid('exp'),
              text: `Promise callbacks are microtasks. They are scheduled immediately but execute AFTER all synchronous code completes, BEFORE the next Task.`,
              line: step.line,
              timestamp: snap.executionTime,
            });
          },
        });

        // Store callback steps for later execution during microtask drain
        (steps as any)._pendingMicrotaskCallbacks = (steps as any)._pendingMicrotaskCallbacks || [];
        (steps as any)._pendingMicrotaskCallbacks.push({ callbackId, callbackSteps, line: step.line, microtaskId });
        break;
      }

      case 'queueMicrotask': {
        const callbackId = uid('cb');
        const callbackSteps = getCallbackBodySteps(step);
        const microtaskId = uid('mt');

        steps.push({
          description: `queueMicrotask() — schedule microtask`,
          line: step.line,
          category: 'microtask',
          apply: (snap) => {
            snap.currentLine = step.line;
            const mt: MicrotaskEntry = {
              id: microtaskId,
              type: 'queueMicrotask',
              label: 'queueMicrotask()',
              sourceLine: step.line,
              callbackId,
              createdAt: snap.executionTime,
            };
            snap.microtaskQueue = [...snap.microtaskQueue, mt];
            snap.animations.push({
              id: uid('anim'),
              from: 'callstack',
              to: 'microtask',
              label: 'queueMicrotask → Microtask Queue',
              category: 'microtask-queue',
              timestamp: snap.executionTime,
            });
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: 'queueMicrotask() queued',
              category: 'microtask',
              line: step.line,
              relatedId: microtaskId,
            });
            snap.explanations.push({
              id: uid('exp'),
              text: `queueMicrotask schedules a microtask directly. Like Promise.then, it runs after all sync code but before any Task.`,
              line: step.line,
              timestamp: snap.executionTime,
            });
          },
        });

        (steps as any)._pendingMicrotaskCallbacks = (steps as any)._pendingMicrotaskCallbacks || [];
        (steps as any)._pendingMicrotaskCallbacks.push({ callbackId, callbackSteps, line: step.line, microtaskId });
        break;
      }

      case 'function-decl':
      case 'async-function-decl': {
        const fn = functions.get(step.fnName!);
        if (!fn) break;
        steps.push({
          description: `Declare ${fn.isAsync ? 'async ' : ''}function ${step.fnName}()`,
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.currentLine = step.line;
            snap.heap = [...snap.heap, {
              id: uid('heap'),
              type: 'Function',
              label: fn.isAsync ? `async ${step.fnName}()` : `${step.fnName}()`,
              detail: fn.params ? `params: ${fn.params}` : 'no params',
              sourceLine: step.line,
              refCount: 1,
            }];
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: `Function ${step.fnName}() declared`,
              category: 'sync',
              line: step.line,
            });
          },
        });
        break;
      }

      case 'function-call': {
        const fn = functions.get(step.fnName!);
        if (!fn) break;
        generateFunctionCallSteps(steps, fn, step, false);
        break;
      }

      case 'async-function-call': {
        const fn = functions.get(step.fnName!);
        if (!fn) break;
        generateAsyncFunctionCallSteps(steps, fn, step);
        break;
      }

      case 'throw': {
        const msg = extractStringLiteral(step.arg || '');
        steps.push({
          description: `throw new Error("${msg}")`,
          line: step.line,
          category: 'error',
          apply: (snap) => {
            snap.currentLine = step.line;
            snap.state = 'COMPLETED';
            snap.callStack = [];
            snap.consoleOutput = [...snap.consoleOutput, {
              id: uid('console'),
              text: `Uncaught Error: ${msg}`,
              timestamp: snap.executionTime,
              type: 'error',
            }];
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: `Error thrown: ${msg}`,
              category: 'error',
              line: step.line,
            });
            snap.explanations.push({
              id: uid('exp'),
              text: `An error is thrown! The Call Stack unwinds. Code after the throw statement does not execute.`,
              line: step.line,
              timestamp: snap.executionTime,
            });
            snap.profiler.errors++;
            snap.cpuUsage = Math.min(100, snap.cpuUsage + 30);
          },
        });
        break;
      }

      case 'variable-decl': {
        steps.push({
          description: `Declare variable ${step.arg}`,
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.currentLine = step.line;
            if (step.fnName === 'Array') {
              snap.heap = [...snap.heap, {
                id: uid('heap'),
                type: 'Array',
                label: step.arg || 'array',
                detail: '[]',
                sourceLine: step.line,
                refCount: 1,
              }];
            }
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: `Variable ${step.arg} declared`,
              category: 'sync',
              line: step.line,
            });
          },
        });
        break;
      }

      case 'expression': {
        steps.push({
          description: step.arg || 'Execute expression',
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.currentLine = step.line;
            snap.cpuUsage = Math.min(100, snap.cpuUsage + 10);
            // Handle function call expressions
            const expr = step.arg || '';
            const callMatch = expr.match(/^(\w+)\((.*)\);?$/);
            if (callMatch && functions.has(callMatch[1])) {
              const fn = functions.get(callMatch[1])!;
              // Inline function call
              snap.callStack = [...snap.callStack, {
                id: uid('frame'),
                name: `${fn.name}()`,
                line: step.line,
                type: fn.isClosure ? 'function' : 'function',
                params: callMatch[2],
              }];
              snap.animations.push({
                id: uid('anim'),
                from: 'code',
                to: 'callstack',
                label: `${fn.name}() called`,
                category: 'push',
                timestamp: snap.executionTime,
              });
              snap.timeline.push({
                id: uid('tl'),
                time: snap.executionTime,
                label: `${fn.name}() called`,
                category: 'sync',
                line: step.line,
              });
            }
          },
        });

        // If it's a function call, execute the body
        const expr = step.arg || '';
        const callMatch = expr.match(/^(\w+)\((.*)\);?$/);
        if (callMatch && functions.has(callMatch[1])) {
          const fn = functions.get(callMatch[1])!;
          // Execute function body
          for (const bodyStep of fn.body) {
            generateBodyStepSteps(steps, bodyStep, fn);
          }
          // Pop function frame
          steps.push({
            description: `${fn.name}() returns`,
            line: fn.endLine,
            category: 'sync',
            apply: (snap) => {
              snap.callStack = snap.callStack.slice(0, -1);
              snap.animations.push({
                id: uid('anim'),
                from: 'callstack',
                to: 'code',
                label: `${fn.name}() returns`,
                category: 'pop',
                timestamp: snap.executionTime,
              });
              snap.cpuUsage = Math.max(5, snap.cpuUsage - 10);
            },
          });
        }
        break;
      }

      case 'block-start':
      case 'block-end':
        break;

      case 'promise.resolve':
        steps.push({
          description: 'Promise.resolve() — create resolved promise',
          line: step.line,
          category: 'sync',
          apply: (snap) => {
            snap.currentLine = step.line;
            snap.heap = [...snap.heap, {
              id: uid('heap'),
              type: 'Promise',
              label: 'Promise',
              detail: 'state: fulfilled',
              sourceLine: step.line,
              refCount: 1,
            }];
          },
        });
        break;

      case 'return':
        // Skip - handled in function body
        break;

      default:
        break;
    }
  }

  // After all sync code: pop global frame
  steps.push({
    description: 'Global code complete — Call Stack empty',
    line: null,
    category: 'eventloop',
    apply: (snap) => {
      snap.callStack = [];
      snap.currentLine = null;
      snap.state = 'PAUSED';
      snap.eventLoopState = 'CHECKING';
      snap.explanations.push({
        id: uid('exp'),
        text: 'All synchronous code has executed. The Call Stack is now empty. The Event Loop will now check the Microtask Queue first.',
        timestamp: snap.executionTime,
      });
      snap.timeline.push({
        id: uid('tl'),
        time: snap.executionTime,
        label: 'Call Stack empty — Event Loop activates',
        category: 'eventloop',
      });
    },
  });

  // ===== EVENT LOOP: Drain microtasks =====
  const pendingCallbacks = (steps as any)._pendingMicrotaskCallbacks || [];

  if (pendingCallbacks.length > 0) {
    steps.push({
      description: 'Event Loop: checking Microtask Queue',
      line: null,
      category: 'eventloop',
      apply: (snap) => {
        snap.eventLoopState = 'MICROTASKS';
        snap.state = 'MICROTASK_PROCESSING';
        snap.explanations.push({
          id: uid('exp'),
          text: 'The Event Loop sees the Call Stack is empty. It checks the Microtask Queue first — microtasks have priority over Tasks.',
          timestamp: snap.executionTime,
        });
        snap.timeline.push({
          id: uid('tl'),
          time: snap.executionTime,
          label: 'Event Loop → Microtask Queue',
          category: 'eventloop',
        });
      },
    });

    for (const cb of pendingCallbacks) {
      // Execute microtask callback
      generateMicrotaskExecutionSteps(steps, cb.callbackSteps, cb.line, cb.microtaskId, cb.callbackId);
    }

    steps.push({
      description: 'Microtask Queue drained',
      line: null,
      category: 'eventloop',
      apply: (snap) => {
        snap.microtaskQueue = [];
        snap.eventLoopState = 'CHECKING';
        snap.explanations.push({
          id: uid('exp'),
          text: 'All microtasks have been drained. The Microtask Queue is empty. Now the Event Loop checks the Task Queue.',
          timestamp: snap.executionTime,
        });
        snap.timeline.push({
          id: uid('tl'),
          time: snap.executionTime,
          label: 'Microtask Queue drained',
          category: 'eventloop',
        });
      },
    });
  }

  // ===== EVENT LOOP: Process task queue =====
  // We need to process tasks that were queued during sync execution
  // For tasks queued during microtask execution or timer completion, we handle them too

  // Collect all task-generating registrations
  const allTaskCallbacks: { callbackId: string; callbackSteps: ParsedStep[]; line: number; taskId: string; label: string }[] = [];

  // For setTimeout callbacks, we need to get the callback body steps
  for (const step of topLevelSteps) {
    if (step.type === 'setTimeout' || step.type === 'setInterval') {
      const callbackSteps = getCallbackBodySteps(step);
      allTaskCallbacks.push({
        callbackId: `task-${step.line}`,
        callbackSteps,
        line: step.line,
        taskId: `task-${step.line}`,
        label: step.type === 'setTimeout' ? 'setTimeout callback' : 'setInterval callback',
      });
    }
  }

  // Process tasks
  for (const task of allTaskCallbacks) {
    steps.push({
      description: 'Event Loop: checking Task Queue',
      line: null,
      category: 'eventloop',
      apply: (snap) => {
        snap.eventLoopState = 'SCHEDULING';
        if (snap.taskQueue.length > 0) {
          snap.explanations.push({
            id: uid('exp'),
            text: 'The Event Loop sees a Task in the Task Queue. It moves the callback to the Call Stack for execution.',
            timestamp: snap.executionTime,
          });
        }
        snap.timeline.push({
          id: uid('tl'),
          time: snap.executionTime,
          label: 'Event Loop → Task Queue',
          category: 'eventloop',
        });
      },
    });

    steps.push({
      description: 'Task callback enters Call Stack',
      line: task.line,
      category: 'task',
      apply: (snap) => {
        snap.state = 'TASK_PROCESSING';
        snap.eventLoopState = 'EXECUTING';
        // Remove from task queue
        snap.taskQueue = snap.taskQueue.slice(0, 1).length > 0 ? snap.taskQueue.slice(1) : snap.taskQueue;
        snap.callStack = [...snap.callStack, {
          id: uid('frame'),
          name: task.label,
          line: task.line,
          type: 'anonymous',
        }];
        snap.animations.push({
          id: uid('anim'),
          from: 'taskqueue',
          to: 'callstack',
          label: 'Task → Call Stack',
          category: 'eventloop-transfer',
          timestamp: snap.executionTime,
        });
        snap.timeline.push({
          id: uid('tl'),
          time: snap.executionTime,
          label: 'Task callback executing',
          category: 'task',
          line: task.line,
        });
        snap.explanations.push({
          id: uid('exp'),
          text: 'The callback from the Task Queue is now executing on the Call Stack. It runs as synchronous JavaScript.',
          line: task.line,
          timestamp: snap.executionTime,
        });
        snap.profiler.tasksExecuted++;
        snap.cpuUsage = Math.min(100, snap.cpuUsage + 20);
      },
    });

    // Execute callback body
    for (const bodyStep of task.callbackSteps) {
      generateBodyStepSteps(steps, bodyStep, null, true);
    }

    // Pop callback frame
    steps.push({
      description: 'Task callback complete',
      line: task.line,
      category: 'task',
      apply: (snap) => {
        snap.callStack = snap.callStack.slice(0, -1);
        snap.animations.push({
          id: uid('anim'),
          from: 'callstack',
          to: 'code',
          label: 'Callback returns',
          category: 'pop',
          timestamp: snap.executionTime,
        });
        snap.cpuUsage = Math.max(5, snap.cpuUsage - 15);
        snap.eventLoopState = 'CHECKING';
      },
    });

    // After task: drain microtasks again
    // (For chained promises inside callbacks, we'd add them here)
    const microtasksInCallback = task.callbackSteps.filter(s => s.type === 'promise.then' || s.type === 'queueMicrotask');
    if (microtasksInCallback.length > 0) {
      steps.push({
        description: 'Event Loop: drain microtasks after task',
        line: null,
        category: 'eventloop',
        apply: (snap) => {
          snap.eventLoopState = 'MICROTASKS';
          snap.state = 'MICROTASK_PROCESSING';
          snap.explanations.push({
            id: uid('exp'),
            text: 'After each Task, the Event Loop drains the Microtask Queue again before moving to the next Task.',
            timestamp: snap.executionTime,
          });
        },
      });

      for (const mt of microtasksInCallback) {
        const cbSteps = getCallbackBodySteps(mt);
        generateMicrotaskExecutionSteps(steps, cbSteps, mt.line, uid('mt'), uid('cb'));
      }

      steps.push({
        description: 'Microtasks drained after task',
        line: null,
        category: 'eventloop',
        apply: (snap) => {
          snap.microtaskQueue = [];
          snap.eventLoopState = 'CHECKING';
        },
      });
    }
  }

  // ===== COMPLETION =====
  steps.push({
    description: 'Execution complete',
    line: null,
    category: 'eventloop',
    apply: (snap) => {
      snap.state = 'COMPLETED';
      snap.eventLoopState = 'IDLE';
      snap.currentLine = null;
      snap.cpuUsage = 0;
      snap.explanations.push({
        id: uid('exp'),
        text: 'All tasks and microtasks have been processed. The runtime is idle. No more work to do.',
        timestamp: snap.executionTime,
      });
      snap.timeline.push({
        id: uid('tl'),
        time: snap.executionTime,
        label: 'Execution complete',
        category: 'eventloop',
      });
    },
  });

  return { steps, parseResult, supported: true };
}

// ===== Helper: Generate function call steps =====
function generateFunctionCallSteps(
  steps: SimStep[],
  fn: { name: string; startLine: number; endLine: number; params: string; isAsync: boolean; isClosure: boolean; body: ParsedStep[]; hasAwait?: boolean },
  step: ParsedStep,
  isAsync: boolean,
): void {
  void isAsync;
  const frameId = uid('frame');

  steps.push({
    description: `Call ${fn.name}(${step.params || ''})`,
    line: step.line,
    category: 'sync',
    apply: (snap) => {
      snap.currentLine = step.line;
      snap.callStack = [...snap.callStack, {
        id: frameId,
        name: `${fn.name}()`,
        line: fn.startLine,
        type: 'function',
        params: step.params,
      }];
      snap.animations.push({
        id: uid('anim'),
        from: 'code',
        to: 'callstack',
        label: `${fn.name}() called`,
        category: 'push',
        timestamp: snap.executionTime,
      });
      snap.timeline.push({
        id: uid('tl'),
        time: snap.executionTime,
        label: `${fn.name}() pushed to Call Stack`,
        category: 'sync',
        line: step.line,
      });
      snap.cpuUsage = Math.min(100, snap.cpuUsage + 15);
      if (fn.isClosure) {
        snap.explanations.push({
          id: uid('exp'),
          text: `${fn.name} is a closure — it captures variables from its outer scope. The captured variables persist in memory even after the outer function returns.`,
          line: step.line,
          timestamp: snap.executionTime,
        });
      }
    },
  });

  // Execute function body
  for (const bodyStep of fn.body) {
    generateBodyStepSteps(steps, bodyStep, fn);
  }

  // Pop function frame
  steps.push({
    description: `${fn.name}() returns`,
    line: fn.endLine,
    category: 'sync',
    apply: (snap) => {
      snap.callStack = snap.callStack.slice(0, -1);
      snap.animations.push({
        id: uid('anim'),
        from: 'callstack',
        to: 'code',
        label: `${fn.name}() returns`,
        category: 'pop',
        timestamp: snap.executionTime,
      });
      snap.cpuUsage = Math.max(5, snap.cpuUsage - 10);
      if (fn.isClosure) {
        snap.explanations.push({
          id: uid('exp'),
          text: `${fn.name}() returns, but the closure it created still holds a reference to its captured variables in the Heap.`,
          line: fn.endLine,
          timestamp: snap.executionTime,
        });
      }
    },
  });
}

// ===== Helper: Generate async function call steps =====
function generateAsyncFunctionCallSteps(
  steps: SimStep[],
  fn: { name: string; startLine: number; endLine: number; params: string; isAsync: boolean; isClosure: boolean; body: ParsedStep[]; hasAwait?: boolean },
  step: ParsedStep,
): void {
  const frameId = uid('frame');

  steps.push({
    description: `Call async ${fn.name}(${step.params || ''})`,
    line: step.line,
    category: 'sync',
    apply: (snap) => {
      snap.currentLine = step.line;
      snap.callStack = [...snap.callStack, {
        id: frameId,
        name: `${fn.name}()`,
        line: fn.startLine,
        type: 'function',
        params: step.params,
      }];
      snap.animations.push({
        id: uid('anim'),
        from: 'code',
        to: 'callstack',
        label: `async ${fn.name}() called`,
        category: 'push',
        timestamp: snap.executionTime,
      });
      snap.timeline.push({
        id: uid('tl'),
        time: snap.executionTime,
        label: `async ${fn.name}() pushed to Call Stack`,
        category: 'sync',
        line: step.line,
      });
      snap.cpuUsage = Math.min(100, snap.cpuUsage + 15);
      snap.explanations.push({
        id: uid('exp'),
        text: `async function ${fn.name}() is called. It starts executing synchronously until it hits an await expression.`,
        line: step.line,
        timestamp: snap.executionTime,
      });
    },
  });

  // Execute body until await
  let hitAwait = false;
  for (const bodyStep of fn.body) {
    if (bodyStep.type === 'await') {
      hitAwait = true;
      // Handle await
      steps.push({
        description: 'await Promise.resolve() — suspend function',
        line: bodyStep.line,
        category: 'microtask',
        apply: (snap) => {
          snap.currentLine = bodyStep.line;
          snap.explanations.push({
            id: uid('exp'),
            text: 'await suspends the async function. The function returns to its caller, and the continuation after await is scheduled as a microtask.',
            line: bodyStep.line,
            timestamp: snap.executionTime,
          });
          snap.timeline.push({
            id: uid('tl'),
            time: snap.executionTime,
            label: 'await — function suspended',
            category: 'microtask',
            line: bodyStep.line,
          });
        },
      });

      // Pop the async function frame (it's suspended)
      steps.push({
        description: `${fn.name}() suspended — frame popped`,
        line: bodyStep.line,
        category: 'sync',
        apply: (snap) => {
          snap.callStack = snap.callStack.slice(0, -1);
          snap.animations.push({
            id: uid('anim'),
            from: 'callstack',
            to: 'code',
            label: `${fn.name}() suspended`,
            category: 'pop',
            timestamp: snap.executionTime,
          });
          // Schedule continuation as microtask
          const microtaskId = uid('mt');
          snap.microtaskQueue = [...snap.microtaskQueue, {
            id: microtaskId,
            type: 'Promise.then',
            label: `${fn.name}() continuation`,
            sourceLine: bodyStep.line,
            callbackId: uid('cb'),
            createdAt: snap.executionTime,
          }];
          snap.animations.push({
            id: uid('anim'),
            from: 'callstack',
            to: 'microtask',
            label: 'Continuation → Microtask Queue',
            category: 'microtask-queue',
            timestamp: snap.executionTime,
          });
          snap.explanations.push({
            id: uid('exp'),
            text: 'The continuation of the async function (code after await) is scheduled as a microtask. It will run when the Event Loop drains the Microtask Queue.',
            line: bodyStep.line,
            timestamp: snap.executionTime,
          });
        },
      });

      // Store continuation steps for microtask drain
      const continuationSteps = fn.body.filter(s => s.line > bodyStep.line && s.type !== 'block-end');
      (steps as any)._pendingMicrotaskCallbacks = (steps as any)._pendingMicrotaskCallbacks || [];
      (steps as any)._pendingMicrotaskCallbacks.push({
        callbackId: uid('cb'),
        callbackSteps: continuationSteps,
        line: bodyStep.line,
        microtaskId: uid('mt'),
        isAsyncContinuation: true,
        fnName: fn.name,
      });
      break;
    }
    generateBodyStepSteps(steps, bodyStep, fn);
  }

  if (!hitAwait) {
    // No await — just pop
    steps.push({
      description: `${fn.name}() returns`,
      line: fn.endLine,
      category: 'sync',
      apply: (snap) => {
        snap.callStack = snap.callStack.slice(0, -1);
        snap.animations.push({
          id: uid('anim'),
          from: 'callstack',
          to: 'code',
          label: `${fn.name}() returns`,
          category: 'pop',
          timestamp: snap.executionTime,
        });
        snap.cpuUsage = Math.max(5, snap.cpuUsage - 10);
      },
    });
  }
}

// ===== Helper: Generate body step steps (for function bodies and callbacks) =====
function generateBodyStepSteps(
  steps: SimStep[],
  bodyStep: ParsedStep,
  fn: { name: string; startLine: number; endLine: number; isClosure: boolean } | null,
  isCallback: boolean = false,
): void {
  void fn;
  void isCallback;

  switch (bodyStep.type) {
    case 'console.log': {
      const msg = extractStringLiteral(bodyStep.arg || '');
      steps.push({
        description: `console.log("${msg}")`,
        line: bodyStep.line,
        category: 'sync',
        apply: (snap) => {
          snap.currentLine = bodyStep.line;
          snap.callStack = [...snap.callStack, {
            id: uid('frame'),
            name: 'console.log()',
            line: bodyStep.line,
            type: 'builtin',
            params: `"${msg}"`,
          }];
          snap.animations.push({
            id: uid('anim'),
            from: 'code',
            to: 'callstack',
            label: 'console.log()',
            category: 'push',
            timestamp: snap.executionTime,
          });
          snap.cpuUsage = Math.min(100, snap.cpuUsage + 15);
        },
      });

      steps.push({
        description: `Output: ${msg}`,
        line: bodyStep.line,
        category: 'sync',
        apply: (snap) => {
          snap.consoleOutput = [...snap.consoleOutput, {
            id: uid('console'),
            text: msg,
            timestamp: snap.executionTime,
            type: 'log',
          }];
          snap.timeline.push({
            id: uid('tl'),
            time: snap.executionTime,
            label: `console.log("${msg}")`,
            category: 'sync',
            line: bodyStep.line,
          });
        },
      });

      steps.push({
        description: 'console.log() returns',
        line: bodyStep.line,
        category: 'sync',
        apply: (snap) => {
          snap.callStack = snap.callStack.slice(0, -1);
          snap.cpuUsage = Math.max(5, snap.cpuUsage - 10);
        },
      });
      break;
    }

    case 'console.error': {
      const msg = extractStringLiteral(bodyStep.arg || '');
      steps.push({
        description: `console.error("${msg}")`,
        line: bodyStep.line,
        category: 'sync',
        apply: (snap) => {
          snap.currentLine = bodyStep.line;
          snap.consoleOutput = [...snap.consoleOutput, {
            id: uid('console'),
            text: msg,
            timestamp: snap.executionTime,
            type: 'error',
          }];
          snap.timeline.push({
            id: uid('tl'),
            time: snap.executionTime,
            label: `console.error("${msg}")`,
            category: 'sync',
            line: bodyStep.line,
          });
        },
      });
      break;
    }

    case 'variable-decl': {
      steps.push({
        description: `Declare ${bodyStep.arg}`,
        line: bodyStep.line,
        category: 'sync',
        apply: (snap) => {
          snap.currentLine = bodyStep.line;
          if (bodyStep.fnName === 'Array') {
            snap.heap = [...snap.heap, {
              id: uid('heap'),
              type: 'Array',
              label: bodyStep.arg || 'array',
              detail: 'new Array(1000)',
              sourceLine: bodyStep.line,
              refCount: 1,
            }];
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: `Array allocated on Heap`,
              category: 'memory',
              line: bodyStep.line,
            });
          }
        },
      });
      break;
    }

    case 'expression': {
      const expr = bodyStep.arg || '';
      // Check for counter() / fn() calls (closure invocations)
      const callMatch = expr.match(/^(\w+)\((.*)\);?$/);
      if (callMatch) {
        steps.push({
          description: `${callMatch[1]}() called`,
          line: bodyStep.line,
          category: 'sync',
          apply: (snap) => {
            snap.currentLine = bodyStep.line;
            snap.callStack = [...snap.callStack, {
              id: uid('frame'),
              name: `${callMatch[1]}()`,
              line: bodyStep.line,
              type: 'function',
            }];
            snap.animations.push({
              id: uid('anim'),
              from: 'code',
              to: 'callstack',
              label: `${callMatch[1]}() called`,
              category: 'push',
              timestamp: snap.executionTime,
            });
            snap.cpuUsage = Math.min(100, snap.cpuUsage + 10);
            snap.explanations.push({
              id: uid('exp'),
              text: `${callMatch[1]}() is called. This is a closure — it accesses captured variables from the Heap.`,
              line: bodyStep.line,
              timestamp: snap.executionTime,
            });
          },
        });

        // If it's counter(), it increments and logs
        if (callMatch[1] === 'counter' || callMatch[1] === 'fn') {
          steps.push({
            description: 'Closure accesses captured variable',
            line: bodyStep.line,
            category: 'sync',
            apply: (snap) => {
              snap.currentLine = bodyStep.line;
              // Update heap closure object
              const closureHeap = snap.heap.find(h => h.type === 'Closure');
              if (closureHeap) {
                snap.heap = snap.heap.map(h =>
                  h.id === closureHeap.id
                    ? { ...h, detail: `count → ${parseInt(h.detail.match(/\d+/)?.[0] || '0') + 1}` }
                    : h
                );
              }
              snap.explanations.push({
                id: uid('exp'),
                text: 'The closure accesses the captured variable from the Heap. The variable persists because the closure holds a reference to it.',
                line: bodyStep.line,
                timestamp: snap.executionTime,
              });
            },
          });
        }

        // Pop
        steps.push({
          description: `${callMatch[1]}() returns`,
          line: bodyStep.line,
          category: 'sync',
          apply: (snap) => {
            snap.callStack = snap.callStack.slice(0, -1);
            snap.cpuUsage = Math.max(5, snap.cpuUsage - 10);
          },
        });
      } else {
        steps.push({
          description: expr,
          line: bodyStep.line,
          category: 'sync',
          apply: (snap) => {
            snap.currentLine = bodyStep.line;
            snap.cpuUsage = Math.min(100, snap.cpuUsage + 5);
          },
        });
      }
      break;
    }

    case 'throw': {
      const msg = extractStringLiteral(bodyStep.arg || '');
      steps.push({
        description: `throw new Error("${msg}")`,
        line: bodyStep.line,
        category: 'error',
        apply: (snap) => {
          snap.currentLine = bodyStep.line;
          snap.callStack = [];
          snap.consoleOutput = [...snap.consoleOutput, {
            id: uid('console'),
            text: `Uncaught Error: ${msg}`,
            timestamp: snap.executionTime,
            type: 'error',
          }];
          snap.timeline.push({
            id: uid('tl'),
            time: snap.executionTime,
            label: `Error thrown: ${msg}`,
            category: 'error',
            line: bodyStep.line,
          });
          snap.explanations.push({
            id: uid('exp'),
            text: `An error is thrown! The Call Stack unwinds. The error propagates up until it's caught or reaches the global scope as "Uncaught".`,
            line: bodyStep.line,
            timestamp: snap.executionTime,
          });
          snap.profiler.errors++;
          snap.state = 'COMPLETED';
        },
      });
      break;
    }

    case 'setTimeout': {
      const delay = bodyStep.delay || 0;
      const callbackId = uid('cb');
      const webApiId = uid('webapi');

      steps.push({
        description: `Register setTimeout(callback, ${delay}ms)`,
        line: bodyStep.line,
        category: 'webapi',
        apply: (snap) => {
          snap.currentLine = bodyStep.line;
          snap.webApis = [...snap.webApis, {
            id: webApiId,
            type: 'TIMER',
            label: 'setTimeout()',
            delay,
            remaining: delay,
            callbackLabel: 'setTimeout callback',
            sourceLine: bodyStep.line,
            taskType: 'setTimeout',
            callbackId,
          }];
          snap.animations.push({
            id: uid('anim'),
            from: 'callstack',
            to: 'webapi',
            label: 'setTimeout registered',
            category: 'webapi-register',
            timestamp: snap.executionTime,
          });
          snap.timeline.push({
            id: uid('tl'),
            time: snap.executionTime,
            label: `setTimeout registered (${delay}ms)`,
            category: 'webapi',
            line: bodyStep.line,
          });
          snap.explanations.push({
            id: uid('exp'),
            text: `setTimeout registered inside a callback. The timer runs in the Web API layer.`,
            line: bodyStep.line,
            timestamp: snap.executionTime,
          });
        },
      });

      if (delay > 0) {
        steps.push({
          description: `Timer running... (${delay}ms)`,
          line: bodyStep.line,
          category: 'webapi',
          waitDuration: delay,
          apply: (snap) => {
            snap.state = 'WAITING_WEB_API';
            snap.isWaitingForTimer = true;
            snap.pendingTimerId = webApiId;
          },
        });
      }

      steps.push({
        description: 'Timer complete — callback enters Task Queue',
        line: bodyStep.line,
        category: 'webapi',
        apply: (snap) => {
          snap.webApis = snap.webApis.filter(w => w.id !== webApiId);
          snap.isWaitingForTimer = false;
          snap.pendingTimerId = null;
          snap.taskQueue = [...snap.taskQueue, {
            id: uid('task'),
            type: 'setTimeout',
            label: 'setTimeout callback',
            sourceLine: bodyStep.line,
            callbackId,
            createdAt: snap.executionTime,
            webApiId,
          }];
          snap.animations.push({
            id: uid('anim'),
            from: 'webapi',
            to: 'taskqueue',
            label: 'Callback → Task Queue',
            category: 'task-queue',
            timestamp: snap.executionTime,
          });
          snap.timeline.push({
            id: uid('tl'),
            time: snap.executionTime,
            label: 'Nested timer complete — callback queued',
            category: 'webapi',
            line: bodyStep.line,
          });
        },
      });
      break;
    }

    case 'promise.then': {
      const callbackId = uid('cb');
      const microtaskId = uid('mt');

      steps.push({
        description: `Promise.then() — schedule microtask`,
        line: bodyStep.line,
        category: 'microtask',
        apply: (snap) => {
          snap.currentLine = bodyStep.line;
          snap.microtaskQueue = [...snap.microtaskQueue, {
            id: microtaskId,
            type: 'Promise.then',
            label: 'Promise.then()',
            sourceLine: bodyStep.line,
            callbackId,
            createdAt: snap.executionTime,
          }];
          snap.animations.push({
            id: uid('anim'),
            from: 'callstack',
            to: 'microtask',
            label: 'Promise.then → Microtask Queue',
            category: 'microtask-queue',
            timestamp: snap.executionTime,
          });
          snap.timeline.push({
            id: uid('tl'),
            time: snap.executionTime,
            label: 'Promise.then() microtask queued',
            category: 'microtask',
            line: bodyStep.line,
          });
        },
      });

      (steps as any)._pendingMicrotaskCallbacks = (steps as any)._pendingMicrotaskCallbacks || [];
      (steps as any)._pendingMicrotaskCallbacks.push({
        callbackId,
        callbackSteps: bodyStep.bodyLines ? [] : [],
        line: bodyStep.line,
        microtaskId,
      });
      break;
    }

    case 'return': {
      steps.push({
        description: `return ${bodyStep.arg || ''}`,
        line: bodyStep.line,
        category: 'sync',
        apply: (snap) => {
          snap.currentLine = bodyStep.line;
          // Check if returning a closure
          if (bodyStep.arg && (bodyStep.arg.startsWith('function') || bodyStep.arg.match(/^\w+\s*\(/))) {
            snap.heap = [...snap.heap, {
              id: uid('heap'),
              type: 'Closure',
              label: 'Closure',
              detail: 'count → 0',
              sourceLine: bodyStep.line,
              refCount: 1,
            }];
            snap.explanations.push({
              id: uid('exp'),
              text: 'A closure is returned. The inner function captures the outer variable. The variable stays in memory as long as the closure is reachable.',
              line: bodyStep.line,
              timestamp: snap.executionTime,
            });
            snap.timeline.push({
              id: uid('tl'),
              time: snap.executionTime,
              label: 'Closure created on Heap',
              category: 'memory',
              line: bodyStep.line,
            });
          }
        },
      });
      break;
    }

    case 'function-call':
    case 'async-function-call':
    case 'function-decl':
    case 'async-function-decl':
    case 'queueMicrotask':
    case 'await':
    case 'block-start':
    case 'block-end':
    case 'blank':
    case 'comment':
    case 'setInterval':
    case 'clearTimeout':
    case 'promise.resolve':
    case 'console.warn':
      break;
  }
}

// ===== Helper: Generate microtask execution steps =====
function generateMicrotaskExecutionSteps(
  steps: SimStep[],
  callbackSteps: ParsedStep[],
  line: number,
  microtaskId: string,
  callbackId: string,
): void {
  void callbackId;

  steps.push({
    description: 'Microtask callback enters Call Stack',
    line,
    category: 'microtask',
    apply: (snap) => {
      snap.state = 'MICROTASK_PROCESSING';
      snap.eventLoopState = 'EXECUTING';
      snap.microtaskQueue = snap.microtaskQueue.filter(m => m.id !== microtaskId);
      snap.callStack = [...snap.callStack, {
        id: uid('frame'),
        name: 'microtask callback',
        line,
        type: 'anonymous',
      }];
      snap.animations.push({
        id: uid('anim'),
        from: 'microtask',
        to: 'callstack',
        label: 'Microtask → Call Stack',
        category: 'eventloop-transfer',
        timestamp: snap.executionTime,
      });
      snap.timeline.push({
        id: uid('tl'),
        time: snap.executionTime,
        label: 'Microtask executing',
        category: 'microtask',
        line,
      });
      snap.explanations.push({
        id: uid('exp'),
        text: 'A microtask is now executing on the Call Stack. Microtasks always run before the next Task.',
        line,
        timestamp: snap.executionTime,
      });
      snap.profiler.microtasksExecuted++;
      snap.cpuUsage = Math.min(100, snap.cpuUsage + 15);
    },
  });

  // Execute callback body steps
  for (const bodyStep of callbackSteps) {
    generateBodyStepSteps(steps, bodyStep, null, true);
  }

  // Pop microtask callback
  steps.push({
    description: 'Microtask callback complete',
    line,
    category: 'microtask',
    apply: (snap) => {
      snap.callStack = snap.callStack.slice(0, -1);
      snap.animations.push({
        id: uid('anim'),
        from: 'callstack',
        to: 'code',
        label: 'Microtask returns',
        category: 'pop',
        timestamp: snap.executionTime,
      });
      snap.cpuUsage = Math.max(5, snap.cpuUsage - 10);
      snap.eventLoopState = 'CHECKING';
    },
  });
}

// ===== Initial snapshot =====
export function createInitialSnapshot(): RuntimeSnapshot {
  return {
    state: 'INITIALIZED',
    eventLoopState: 'IDLE',
    callStack: [],
    microtaskQueue: [],
    taskQueue: [],
    webApis: [],
    heap: [],
    consoleOutput: [],
    timeline: [],
    animations: [],
    explanations: [],
    currentLine: null,
    cpuUsage: 0,
    executionTime: 0,
    profiler: {
      totalRuntime: 0,
      microtasksExecuted: 0,
      tasksExecuted: 0,
      maxStackDepth: 0,
      longestTaskDuration: 0,
      longestTaskLabel: '',
      errors: 0,
    },
    stepCount: 0,
    stepDescription: '',
    isWaitingForTimer: false,
    pendingTimerId: null,
  };
}

// ===== Apply a step to a snapshot =====
export function applyStep(snap: RuntimeSnapshot, step: SimStep): RuntimeSnapshot {
  const newSnap: RuntimeSnapshot = {
    ...snap,
    callStack: [...snap.callStack],
    microtaskQueue: [...snap.microtaskQueue],
    taskQueue: [...snap.taskQueue],
    webApis: [...snap.webApis],
    heap: [...snap.heap],
    consoleOutput: [...snap.consoleOutput],
    timeline: [...snap.timeline],
    animations: [...snap.animations],
    explanations: [...snap.explanations],
    profiler: { ...snap.profiler },
  };

  step.apply(newSnap);

  // Update profiler
  if (newSnap.callStack.length > newSnap.profiler.maxStackDepth) {
    newSnap.profiler.maxStackDepth = newSnap.callStack.length;
  }

  newSnap.stepCount++;
  newSnap.stepDescription = step.description;
  newSnap.profiler.totalRuntime = newSnap.executionTime;

  // Clear old animations (keep last 10)
  if (newSnap.animations.length > 20) {
    newSnap.animations = newSnap.animations.slice(-10);
  }

  // Clear old explanations (keep last 5)
  if (newSnap.explanations.length > 15) {
    newSnap.explanations = newSnap.explanations.slice(-8);
  }

  return newSnap;
}
