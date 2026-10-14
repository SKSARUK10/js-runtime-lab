import type { Example } from '@/types/runtime';

export const examples: Example[] = [
  {
    id: 'basic-setTimeout',
    category: 'macro',
    name: 'Basic setTimeout',
    code: `console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 2000);

console.log("End");`,
    description: 'Basic setTimeout: synchronous code runs first, timer callback runs later.',
    expectedOutput: ['Start', 'End', 'Timeout'],
    explanation: 'setTimeout does not pause JavaScript. The timer is handled by Web APIs outside the Call Stack. The callback enters the Task Queue only after the timer completes.',
  },
  {
    id: 'promise-vs-setTimeout',
    category: 'micro',
    name: 'Promise vs setTimeout',
    code: `console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");`,
    description: 'Promise callbacks are microtasks. Microtasks are processed before the next Task.',
    expectedOutput: ['A', 'D', 'C', 'B'],
    explanation: 'Promise callbacks are microtasks. Microtasks are processed before the next Task, even if setTimeout has delay 0.',
  },
  {
    id: 'nested-setTimeout',
    category: 'macro',
    name: 'Nested setTimeout',
    code: `console.log("Start");

setTimeout(() => {
  console.log("First");
  setTimeout(() => {
    console.log("Second");
  }, 1000);
}, 1000);

console.log("End");`,
    description: 'Nested setTimeout creates sequential async operations.',
    expectedOutput: ['Start', 'End', 'First', 'Second'],
  },
  {
    id: 'multiple-timers',
    category: 'macro',
    name: 'Multiple timers',
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
    description: 'Multiple timers with different delays. Shorter delays complete first.',
    expectedOutput: ['Begin', 'Done', '50ms', '100ms', '200ms'],
  },
  {
    id: 'promise-chain',
    category: 'micro',
    name: 'Promise chain',
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
    description: 'Each .then() creates a new microtask. The chain executes sequentially.',
    expectedOutput: ['Sync done', 'Step 1', 'Step 2', 'Step 3'],
    explanation: 'Each .then() schedules a separate microtask. They execute in order, one after another, after all synchronous code completes.',
  },
  {
    id: 'fetch-simulation',
    category: 'network',
    name: 'fetch simulation',
    code: `console.log("Request start");

function simulateFetch(url, callback) {
  setTimeout(() => {
    callback("Response from " + url);
  }, 1500);
}

simulateFetch("https://api.example.com", (data) => {
  console.log(data);
});

console.log("Request sent");`,
    description: 'Simulated fetch: Web API handles the request, callback enters Task Queue.',
    expectedOutput: ['Request start', 'Request sent', 'Response from https://api.example.com'],
  },
  {
    id: 'dom-event',
    category: 'macro',
    name: 'DOM event',
    code: `console.log("Page loaded");

function handleClick() {
  console.log("Button clicked");
}

// Simulate: event listener registered
setTimeout(() => {
  console.log("Event fired");
  handleClick();
}, 1000);

console.log("Listener attached");`,
    description: 'DOM events use the Task Queue, just like setTimeout callbacks.',
    expectedOutput: ['Page loaded', 'Listener attached', 'Event fired', 'Button clicked'],
  },
  {
    id: 'closure-setTimeout',
    category: 'advanced',
    name: 'Closure + setTimeout',
    code: `function createCounter() {
  let count = 0;
  return function() {
    count++;
    console.log("Count: " + count);
  };
}

const counter = createCounter();

setTimeout(() => {
  counter();
  counter();
  counter();
}, 500);

console.log("Counter created");`,
    description: 'A closure captures variables. The inner function accesses them even after the outer function returns.',
    expectedOutput: ['Counter created', 'Count: 1', 'Count: 2', 'Count: 3'],
    explanation: 'The closure preserves access to count. Each call increments the same captured variable.',
  },
  {
    id: 'async-await',
    category: 'micro',
    name: 'async/await',
    code: `async function test() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}

test();

console.log("C");`,
    description: 'await suspends the function. The continuation runs as a microtask.',
    expectedOutput: ['A', 'C', 'B'],
    explanation: 'await pauses the async function and schedules the continuation as a microtask. Synchronous code (console.log("C")) runs first.',
  },
  {
    id: 'setTimeout-promise-microtask',
    category: 'micro',
    name: 'setTimeout + Promise + queueMicrotask',
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
    description: 'Microtasks (Promise + queueMicrotask) all drain before the next Task (setTimeout).',
    expectedOutput: ['1', '5', '3', '4', '2'],
    difficulty: 'Medium',
    explanation: 'Both Promise.then and queueMicrotask create microtasks. All microtasks drain before the first task (setTimeout) executes.',
  },
  {
    id: 'error-simulation',
    category: 'advanced',
    name: 'Error simulation',
    code: `console.log("Before error");

function test() {
  throw new Error("Something went wrong");
}

test();

console.log("After error");`,
    description: 'Errors unwind the call stack. Code after the error does not execute.',
    expectedOutput: ['Before error', 'Uncaught Error: Something went wrong'],
    explanation: 'When an error is thrown, the call stack unwinds and the error lands in the console as "Uncaught Error". "After error" never executes because the run stops at the throw.',
  },
  {
    id: 'memory-leak',
    category: 'advanced',
    name: 'Memory leak demo',
    code: `let leakedData = [];

setInterval(() => {
  leakedData.push(new Array(1000));
  console.log("Leak size: " + leakedData.length);
}, 1000);

console.log("Interval started");`,
    description: 'A setInterval callback referencing a closure can cause a memory leak.',
    expectedOutput: ['Interval started', 'Leak size: 1', 'Leak size: 2', 'Leak size: 3'],
    explanation: 'The interval callback holds a reference to leakedData via closure. The array grows indefinitely — a classic memory leak pattern.',
  },
  {
    id: 'interview-challenge',
    category: 'advanced',
    name: 'Interview Challenge',
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
    description: 'Classic interview question: what is the output order?',
    expectedOutput: ['1', '5', '3', '4', '2'],
    difficulty: 'Medium',
    explanation: 'Sync logs first (1, 5). Then all microtasks drain (3, 4). Then the first task runs (2).',
  },
  {
    id: 'fetch-then',
    name: 'fetch + .then (Web API)',
    category: 'network',
    code: `console.log("Start");

fetch("/api/users").then(() => {
  console.log("Response received");
});

console.log("End");`,
    description: 'fetch() is a networking Web API. The response Promise resolves into a microtask, not a task.',
    expectedOutput: ['Start', 'End', 'Response received'],
    explanation: 'fetch() sends the request in the Web API layer and immediately returns a Promise, so synchronous code (Start, End) runs first. When the response arrives, the Promise fulfills and the .then() callback drains as a microtask.',
  },
  {
    id: 'fetch-await',
    name: 'await fetch (Web API)',
    category: 'network',
    code: `async function loadUser() {
  console.log("Fetching user...");
  await fetch("/api/user");
  console.log("User loaded");
}

loadUser();
console.log("Script done");`,
    description: 'await fetch() suspends the async function. The continuation runs as a microtask after the response.',
    expectedOutput: ['Fetching user...', 'Script done', 'User loaded'],
    explanation: 'loadUser() runs synchronously until await fetch(), where it suspends. The network request runs in the Web API layer. Once the response arrives, the continuation (console.log("User loaded")) is queued as a microtask — after the synchronous "Script done".',
  },
];

export const defaultExample = examples[0];
