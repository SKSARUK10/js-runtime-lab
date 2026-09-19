// ===== Interview questions (content-driven /interview route) =====
// 18 curated "predict the output" event-loop questions. Each entry renders
// as static, crawlable HTML (<details>/<summary> + <pre> + launch link)
// and feeds the FAQPage JSON-LD, so on-page content and structured data
// can never drift apart.
//
// IMPORTANT: every expectedOutput below was executed against the real
// visualizer engine (see engine-verify harness) and matches what the
// "Open in visualizer" deep link (/?q=<id>) prints. Only erasable
// TypeScript here: tooling may import this file directly in Node.

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface InterviewQuestion {
  id: string;
  title: string;
  difficulty: QuestionDifficulty;
  code: string;
  expectedOutput: string[];
  explanation: string;
  /** Further reading on the concept this question tests. */
  relatedLearnSlug?: string;
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'sync-vs-timeout-zero',
    title: 'Synchronous code vs a zero-millisecond timer',
    difficulty: 'Easy',
    code: `console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

console.log("C");`,
    expectedOutput: ['A', 'C', 'B'],
    explanation:
      'setTimeout never pauses the script: the timer is registered with a Web API and the script continues, so C prints before the callback. The callback runs only after the call stack empties, printing B last.',
    relatedLearnSlug: 'web-apis-explained',
  },
  {
    id: 'promise-vs-timeout-zero',
    title: 'Promise callback vs zero-millisecond timer',
    difficulty: 'Easy',
    code: `console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");`,
    expectedOutput: ['A', 'D', 'C', 'B'],
    explanation:
      'A and D are synchronous and print first. The promise callback is a microtask and the timer callback is a macrotask; the event loop drains all microtasks before the first macrotask, so C prints before B.',
    relatedLearnSlug: 'settimeout-vs-promise-execution-order',
  },
  {
    id: 'microtask-fifo',
    title: 'Two promises: which .then runs first?',
    difficulty: 'Easy',
    code: `Promise.resolve().then(() => {
  console.log("first");
});

Promise.resolve().then(() => {
  console.log("second");
});

console.log("sync");`,
    expectedOutput: ['sync', 'first', 'second'],
    explanation:
      'Both callbacks enter the same microtask queue in registration order, and the queue is first-in, first-out. Synchronous code still goes first, then the microtasks drain in order.',
    relatedLearnSlug: 'microtask-vs-macrotask-queue',
  },
  {
    id: 'queuemicrotask-vs-promise-order',
    title: 'queueMicrotask vs Promise.then ordering',
    difficulty: 'Easy',
    code: `queueMicrotask(() => {
  console.log("microtask");
});

Promise.resolve().then(() => {
  console.log("promise");
});

console.log("sync");`,
    expectedOutput: ['sync', 'microtask', 'promise'],
    explanation:
      'queueMicrotask and Promise.then feed the same FIFO microtask queue, so they run in the order they were queued — after all synchronous code.',
    relatedLearnSlug: 'microtask-vs-macrotask-queue',
  },
  {
    id: 'nested-timeout',
    title: 'A timer inside a timer callback',
    difficulty: 'Medium',
    code: `console.log("Start");

setTimeout(() => {
  console.log("First");
  setTimeout(() => {
    console.log("Second");
  }, 1000);
}, 1000);

console.log("End");`,
    expectedOutput: ['Start', 'End', 'First', 'Second'],
    explanation:
      'Start and End are synchronous. The outer timer fires after one second and prints First; only then is the inner timer registered, so Second needs another second on top. Nested timers add up sequentially.',
    relatedLearnSlug: 'web-apis-explained',
  },
  {
    id: 'microtask-inside-task',
    title: 'A promise queued inside a timer callback',
    difficulty: 'Medium',
    code: `setTimeout(() => {
  console.log("timeout");
  Promise.resolve().then(() => {
    console.log("promise");
  });
}, 0);

console.log("sync");`,
    expectedOutput: ['sync', 'timeout', 'promise'],
    explanation:
      'The synchronous log prints first. When the timer callback runs, it prints "timeout" and queues a microtask. Microtasks queued during a task run before the next task, so "promise" prints immediately after.',
    relatedLearnSlug: 'microtask-vs-macrotask-queue',
  },
  {
    id: 'task-inside-microtask',
    title: 'A timer queued inside a promise callback',
    difficulty: 'Medium',
    code: `Promise.resolve().then(() => {
  console.log("promise");
  setTimeout(() => {
    console.log("timeout");
  }, 0);
});

console.log("sync");`,
    expectedOutput: ['sync', 'promise', 'timeout'],
    explanation:
      'Sync first, then the microtask prints "promise". The timer it registers must go through a Web API and the task queue, so "timeout" can only run after the microtask phase is fully done.',
    relatedLearnSlug: 'microtask-vs-macrotask-queue',
  },
  {
    id: 'async-await-basic',
    title: 'Basic async/await output order',
    difficulty: 'Easy',
    code: `async function test() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}

test();

console.log("C");`,
    expectedOutput: ['A', 'C', 'B'],
    explanation:
      'The async function runs synchronously until await: it prints A, then suspends and schedules everything after await as a microtask. The main script prints C, and only then does the continuation print B.',
    relatedLearnSlug: 'async-await-explained-visually',
  },
  {
    id: 'async-await-with-timer',
    title: 'Timer registered after an await',
    difficulty: 'Hard',
    code: `async function fetchData() {
  console.log("fetching");
  await Promise.resolve();
  console.log("received");
  setTimeout(() => {
    console.log("rendered");
  }, 0);
}

fetchData();

console.log("done");`,
    expectedOutput: ['fetching', 'done', 'received', 'rendered'],
    explanation:
      'The function prints "fetching", suspends at await, and the script prints "done". The continuation then runs as a microtask: it prints "received" and registers a timer, which must wait for a Web API plus the task queue — so "rendered" comes last.',
    relatedLearnSlug: 'async-await-explained-visually',
  },
  {
    id: 'same-delay-fifo-timers',
    title: 'Two timers with the same delay',
    difficulty: 'Easy',
    code: `setTimeout(() => {
  console.log("first timer");
}, 0);

setTimeout(() => {
  console.log("second timer");
}, 0);

console.log("sync");`,
    expectedOutput: ['sync', 'first timer', 'second timer'],
    explanation:
      'Timers that become ready at the same moment run in registration order — the task queue is FIFO. Synchronous code still prints before either of them.',
    relatedLearnSlug: 'web-apis-explained',
  },
  {
    id: 'delay-ordering',
    title: 'Three timers with different delays',
    difficulty: 'Easy',
    code: `console.log("Begin");

setTimeout(() => {
  console.log("100ms");
}, 100);

setTimeout(() => {
  console.log("50ms");
}, 50);

setTimeout(() => {
  console.log("200ms");
}, 200);

console.log("Done");`,
    expectedOutput: ['Begin', 'Done', '50ms', '100ms', '200ms'],
    explanation:
      'Timers fire in delay order, not registration order: the 50ms timer finishes first even though it was registered second. Synchronous logs always print before any timer callback.',
    relatedLearnSlug: 'web-apis-explained',
  },
  {
    id: 'function-call-order',
    title: 'Function call pushes a stack frame',
    difficulty: 'Easy',
    code: `function greet() {
  console.log("hello");
}

console.log("before");
greet();
console.log("after");`,
    expectedOutput: ['before', 'hello', 'after'],
    explanation:
      'Calling greet pushes a frame onto the call stack, its body runs ("hello"), and the frame pops before the script continues with "after". Nothing asynchronous happens here.',
    relatedLearnSlug: 'what-is-the-call-stack',
  },
  {
    id: 'nested-function-calls',
    title: 'Nested calls: who prints last?',
    difficulty: 'Medium',
    code: `function outer() {
  console.log("outer start");
  inner();
  console.log("outer end");
}

function inner() {
  console.log("inner");
}

outer();`,
    expectedOutput: ['outer start', 'inner', 'outer end'],
    explanation:
      'outer starts and calls inner, whose frame sits on top of the stack and prints "inner". Only after inner returns and pops can outer resume — so "outer end" always prints last.',
    relatedLearnSlug: 'what-is-the-call-stack',
  },
  {
    id: 'promise-chain-order',
    title: 'Chained .then calls',
    difficulty: 'Medium',
    code: `Promise.resolve()
  .then(() => {
    console.log("Step 1");
  })
  .then(() => {
    console.log("Step 2");
  })
  .then(() => {
    console.log("Step 3");
  });

console.log("Sync done");`,
    expectedOutput: ['Sync done', 'Step 1', 'Step 2', 'Step 3'],
    explanation:
      'Each .then schedules a separate microtask that runs after the synchronous code. The chain resolves in order, so the steps print sequentially after "Sync done".',
    relatedLearnSlug: 'settimeout-vs-promise-execution-order',
  },
  {
    id: 'slow-vs-fast-timer',
    title: 'Registered first, runs last: delay beats order',
    difficulty: 'Medium',
    code: `setTimeout(() => {
  console.log("slow");
}, 1000);

setTimeout(() => {
  console.log("fast");
}, 100);

console.log("sync");`,
    expectedOutput: ['sync', 'fast', 'slow'],
    explanation:
      'Registration order does not decide execution order for timers — readiness does. The 100ms timer finishes long before the 1000ms one, so "fast" prints first despite being registered second.',
    relatedLearnSlug: 'web-apis-explained',
  },
  {
    id: 'error-stops-execution',
    title: 'What happens after throw?',
    difficulty: 'Easy',
    code: `console.log("Before error");

function test() {
  throw new Error("Something went wrong");
}

test();

console.log("After error");`,
    expectedOutput: ['Before error', 'Uncaught Error: Something went wrong'],
    explanation:
      'The throw unwinds the call stack and lands in the console as an uncaught error. The run stops there: "After error" never executes because real JavaScript never runs past an uncaught throw.',
    relatedLearnSlug: 'what-is-the-call-stack',
  },
  {
    id: 'all-queues-combined',
    title: 'Sync, timer, promise, and microtask combined',
    difficulty: 'Hard',
    code: `console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

Promise.resolve().then(() => {
  console.log("3");
});

queueMicrotask(() => {
  console.log("4");
});

console.log("5");`,
    expectedOutput: ['1', '5', '3', '4', '2'],
    explanation:
      'The synchronous logs 1 and 5 print first. Then the microtask queue drains FIFO: the promise callback (3) was queued before queueMicrotask (4). The timer callback (2) waits in the task queue until every microtask is done.',
    relatedLearnSlug: 'microtask-vs-macrotask-queue',
  },
  {
    id: 'event-callback-flow',
    title: 'Event-style callback calling a function',
    difficulty: 'Medium',
    code: `console.log("Page loaded");

function handleClick() {
  console.log("Button clicked");
}

setTimeout(() => {
  console.log("Event fired");
  handleClick();
}, 1000);

console.log("Listener attached");`,
    expectedOutput: ['Page loaded', 'Listener attached', 'Event fired', 'Button clicked'],
    explanation:
      'Synchronous setup prints first. When the timer fires, its callback runs as a task: it prints "Event fired" and calls handleClick, which pushes a fresh frame and prints "Button clicked". DOM events flow through the same task queue.',
    relatedLearnSlug: 'web-apis-explained',
  },
];

export function getInterviewQuestion(id: string): InterviewQuestion | undefined {
  return INTERVIEW_QUESTIONS.find((q) => q.id === id);
}
