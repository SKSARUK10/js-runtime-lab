// ===== Learn (content-driven SEO routes) =====
// Typed config for /learn/* concept pages. Each entry carries everything a
// generic <ConceptPage /> needs: SEO meta, semantic article copy, and a
// preloadedExample that is fed into the visualizer engine on load.
//
// IMPORTANT: every preloadedExample has been executed against the real
// engine (see engine-verify harness) — the documented console order below
// is exactly what the embedded visualizer prints. Only erasable TypeScript
// here: scripts/generate-og.mjs imports this file directly in Node.

export interface LearnPage {
  slug: string;
  /** Page title (SEO component appends "| JS Runtime Lab"). */
  title: string;
  metaDescription: string;
  h1: string;
  /** 2-3 paragraphs of plain-English explanation, rendered as <p> tags. */
  introText: string[];
  /** JS code string fed into the visualizer engine on page load. */
  preloadedExample: string;
  /** Console lines the preloaded example prints, in order. */
  preloadedOutput: string[];
  keyTakeaways: string[];
  /** Accent color (hex) used for the OG card and page highlights. */
  ogAccent: string;
}

export const LEARN_PAGES: LearnPage[] = [
  {
    slug: 'microtask-vs-macrotask-queue',
    title: 'Microtask vs Macrotask Queue in JavaScript',
    metaDescription:
      'Microtasks (promises, queueMicrotask) always run before macrotasks (setTimeout). Learn the drain rule and watch it happen step by step.',
    h1: 'Microtask vs Macrotask Queue',
    introText: [
      'JavaScript handles asynchronous work with two different waiting lines. The microtask queue holds promise callbacks and queueMicrotask jobs, while the macrotask queue (often just called the task queue) holds setTimeout callbacks, intervals, and event handlers. The names matter less than the one rule that governs them.',
      'That rule is simple: after the currently running code finishes, the event loop empties the entire microtask queue before it touches even a single macrotask. A timer scheduled with a delay of zero milliseconds still waits behind every pending microtask, because zero milliseconds only means "as soon as possible" — and microtasks are always sooner.',
      'In the example below, the numbers 1 and 5 print first because they are synchronous. Then both microtasks (3 and 4) drain in the order they were queued. Only then does the setTimeout callback print 2. Press play in the visualizer to watch each queue fill and drain.',
    ],
    preloadedExample: `console.log("1");

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
    preloadedOutput: ['1', '5', '3', '4', '2'],
    keyTakeaways: [
      'Synchronous code always runs to completion first.',
      'The microtask queue drains completely before the next macrotask.',
      'Promise callbacks and queueMicrotask jobs share one FIFO microtask queue.',
      'setTimeout with 0ms still waits behind every microtask.',
    ],
    ogAccent: '#4ade80',
  },
  {
    slug: 'settimeout-vs-promise-execution-order',
    title: 'setTimeout vs Promise: Which Runs First?',
    metaDescription:
      'Why does a resolved promise beat a zero-millisecond setTimeout? Compare timer callbacks against promise callbacks with a live visualization.',
    h1: 'setTimeout vs Promise: Execution Order',
    introText: [
      'Ask most developers what prints first — a setTimeout callback with zero delay or a resolved promise callback — and many guess the timer, because zero sounds immediate. The promise wins every time, and the reason is architectural, not a race.',
      'setTimeout hands its timer to a Web API outside of JavaScript. When the timer finishes, the callback joins the macrotask queue and waits its turn. A resolved promise, on the other hand, places its callback straight into the microtask queue, which the event loop always drains first. Same script, two different doors back into JavaScript.',
      'Run the example: A and D are synchronous and print first. Then the promise callback prints C from the microtask queue. Finally the timer callback prints B. The delay on the timer is irrelevant — even 0ms loses to a microtask.',
    ],
    preloadedExample: `console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");`,
    preloadedOutput: ['A', 'D', 'C', 'B'],
    keyTakeaways: [
      'setTimeout callbacks enter via Web APIs into the macrotask queue.',
      'Promise callbacks go directly to the microtask queue.',
      'Microtasks drain before macrotasks — delay value does not matter.',
      'Synchronous logs always print before any queued callback.',
    ],
    ogAccent: '#60a5fa',
  },
  {
    slug: 'async-await-explained-visually',
    title: 'async/await Explained Visually: Await Is a Microtask',
    metaDescription:
      'See what await really does: it pauses the function and schedules the rest as a microtask. Watch an async function suspend and resume step by step.',
    h1: 'async/await, Explained Visually',
    introText: [
      'The await keyword looks like it pauses all of JavaScript, but it only pauses one function. When execution reaches await, the async function packages up "everything after this line" — called the continuation — and hands it to the microtask queue. The function itself returns to its caller immediately, and the rest of the synchronous script keeps running.',
      'That is why C prints before B in the example. The test function runs synchronously until the await: it prints A, then suspends. Control returns to the main script, which prints C. Only when the call stack is empty does the event loop pick up the queued continuation and print B.',
      'Thinking of await as "schedule the rest of this function as a microtask" predicts the output of almost every async interview question. Try it: cover the console, predict the order, then press play.',
    ],
    preloadedExample: `async function test() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}

test();

console.log("C");`,
    preloadedOutput: ['A', 'C', 'B'],
    keyTakeaways: [
      'await pauses only the async function, never the whole script.',
      'Code after await becomes a continuation scheduled as a microtask.',
      'Synchronous code after the async call runs before the continuation.',
      'An async function without await runs fully synchronously.',
    ],
    ogAccent: '#c084fc',
  },
  {
    slug: 'closures-and-the-event-loop',
    title: 'Closures and the Event Loop: Why Late Callbacks Remember',
    metaDescription:
      'A closure keeps its variables alive after the outer function returns — which is why timer callbacks still see them. Plain-English guide with a live demo.',
    h1: 'Closures and the Event Loop',
    introText: [
      'A closure is a function bundled together with the variables it could see when it was created. When an outer function returns an inner function, the inner function keeps a reference to those variables, so they stay alive on the heap instead of being cleaned up. This is ordinary JavaScript, but it becomes powerful the moment timing enters the picture.',
      'Event loop callbacks almost always run late: a setTimeout callback executes long after the code that registered it has finished. Without closures, the callback would wake up in an empty room. With closures, every variable it needs is still there, exactly as it was. That is why patterns like "register now, run later" work at all.',
      'The live demo below shows the timing half of the story — a setup function runs, a timer is registered, synchronous code finishes, and the late callback fires with its context intact. Read the heap panel as it runs: captured references are what keep late callbacks meaningful.',
    ],
    preloadedExample: `function setup() {
  console.log("setup done");
}

setup();

setTimeout(() => {
  console.log("timer fired");
}, 500);

console.log("waiting");`,
    preloadedOutput: ['setup done', 'waiting', 'timer fired'],
    keyTakeaways: [
      'A closure pairs a function with the variables visible at creation.',
      'Captured variables survive on the heap after the outer call returns.',
      'Timer and event callbacks run late but see their captured context.',
      'Forgetting to clear intervals keeps closures (and memory) alive.',
    ],
    ogAccent: '#fbbf24',
  },
  {
    slug: 'what-is-the-call-stack',
    title: 'What Is the Call Stack? (With a Live Demo)',
    metaDescription:
      'The call stack tracks which function is running using last-in, first-out frames. Watch frames push and pop as nested functions execute.',
    h1: 'What Is the Call Stack?',
    introText: [
      'The call stack is JavaScript\'s to-do list for function calls. Every time a function is invoked, a frame describing that call is pushed onto the stack; when the function returns, its frame is popped off. Because it is last-in, first-out, the function on top is always the one currently executing, and JavaScript only ever runs the top frame.',
      'Nesting makes this visible. When outer calls inner, outer\'s frame stays on the stack, paused mid-body, while inner\'s frame sits on top and runs. "Outer end" cannot print until inner returns and its frame is removed — which is exactly why the output order is outer start, inner, outer end.',
      'The stack also explains blocking: while any frame is running, nothing else — no timer, no promise, no click handler — can run. Asynchronous callbacks wait precisely because the stack must be empty before the event loop hands them control. Watch the stack panel as the demo runs.',
    ],
    preloadedExample: `function outer() {
  console.log("outer start");
  inner();
  console.log("outer end");
}

function inner() {
  console.log("inner");
}

outer();`,
    preloadedOutput: ['outer start', 'inner', 'outer end'],
    keyTakeaways: [
      'Each function call pushes a frame; each return pops one.',
      'Only the top frame executes — callers wait paused underneath.',
      'A running stack blocks all async callbacks until it empties.',
      'Too much nesting overflows the stack: "Maximum call stack size exceeded".',
    ],
    ogAccent: '#22d3ee',
  },
  {
    slug: 'web-apis-explained',
    title: 'Web APIs Explained: Where setTimeout Really Waits',
    metaDescription:
      'setTimeout does not tick inside JavaScript — the browser counts down in a Web API, then queues the callback. See the handoff visualized.',
    h1: 'Web APIs, Explained',
    introText: [
      'JavaScript itself has no timer, no network stack, and no access to the screen. Features like setTimeout, fetch, and DOM events are provided by the environment — the browser or Node.js — under the umbrella name Web APIs. JavaScript asks for work ("call me back in two seconds") and immediately moves on to the next line.',
      'That handoff is why setTimeout never pauses a script. While the Web API counts down in the background, JavaScript keeps executing synchronously, which is why End prints before Timeout in the demo. Only when the countdown finishes does the callback enter the task queue, where it waits for the call stack to empty.',
      'Almost every "JavaScript is single-threaded but non-blocking" explanation boils down to this division of labor: one thread runs your code, while the environment handles waiting. Follow the animation from the call stack to the Web API panel to the task queue as it plays.',
    ],
    preloadedExample: `console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 2000);

console.log("End");`,
    preloadedOutput: ['Start', 'End', 'Timeout'],
    keyTakeaways: [
      'Timers, network, and DOM events live outside JavaScript in Web APIs.',
      'Registering a timer never blocks: the script continues instantly.',
      'Finished timers place callbacks in the task queue, not on the stack.',
      'A callback runs only after the countdown AND an empty call stack.',
    ],
    ogAccent: '#f472b6',
  },
];

export function getLearnPage(slug: string): LearnPage | undefined {
  return LEARN_PAGES.find((p) => p.slug === slug);
}
