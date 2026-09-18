# JS Runtime Lab — Event Loop Visualizer

Watch JavaScript execute one operation at a time. An interactive visualizer for the JS runtime:
call stack, Web APIs, event loop, microtask/task queues, heap, console, and timeline.

![stack](https://img.shields.io/badge/runtime-visualizer-blue) ![react](https://img.shields.io/badge/react-18-blue) ![vite](https://img.shields.io/badge/vite-5-purple) ![typescript](https://img.shields.io/badge/typescript-5-blue) ![tailwind](https://img.shields.io/badge/tailwind-3-cyan)

## Features

- **Step-by-step simulation** — run, pause, single-step, and reset execution at your own pace
- **Call stack + Event loop** — see frames pushed/popped and the loop checking microtasks before tasks
- **Web APIs panel** — `setTimeout` / `setInterval` timers with live countdowns
- **Microtask vs Task queues** — `Promise.then`, `queueMicrotask`, `async/await` vs timer callbacks
- **Console + Timeline** — ordered output and a chronological event log of everything that happened
- **CPU & Memory visualizers** — simulated CPU load, heap objects (functions, promises, timers, closures)
- **Profiler** — total runtime, tasks/microtasks executed, max stack depth, longest task, error count
- **Explanations** — beginner-friendly narration of each step (Learning mode) or minimal UI (Dev mode)
- **Interview mode** — quiz yourself on classic output-order questions
- **13 curated examples** — `setTimeout` basics, Promise vs `setTimeout`, promise chains, `async/await`, closures, fetch simulation, DOM events, error handling, memory-leak demo, and more
- **Custom code** — paste your own supported JS and visualize it instantly
- **Keyboard shortcuts** — `Space` run/pause, `S` step, `R` reset, `1–5` playback speed

## Supported syntax

The engine uses a safe regex-based parser (no `eval`). Supported patterns:

| Pattern | Example |
|---|---|
| Logging | `console.log("hi")`, `console.error(...)` |
| Timers | `setTimeout(() => { ... }, 1000)` |
| Intervals | `setInterval(() => { ... }, 1000)` |
| Microtasks | `Promise.resolve().then(() => { ... })`, `queueMicrotask(() => { ... })` |
| Functions | `function foo() { ... }`, `const foo = () => { ... }`, calls |
| Async | `async function`, `await Promise.resolve()` |
| Errors | `throw new Error("...")` |
| Variables | `const/let/var x = ...`, arrays |

## Getting started

**Prerequisites:** Node.js 18+ and npm.

```bash
# install
npm install

# dev server (http://localhost:5173)
npm run dev

# production build
npm run build

# preview the build
npm run preview
```

Other scripts:

```bash
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

## How to use

1. Pick an example from the dropdown (e.g. **Promise vs setTimeout**) or paste your own code in the editor.
2. Press **Run** (or `Space`) to play the simulation, or **Step** (or `S`) to advance one event at a time.
3. Follow the highlighted line, the call stack, and the queues — microtasks always drain before the next task.
4. Check the **Console** for program output and the **Timeline** for the full event history.
5. Adjust speed (`0.25x–5x`, keys `1–5`), toggle panels via the ⚙️ settings menu, or switch **Dev / Learn** mode.
6. Try **Interview** mode to test your prediction skills.

## Project structure

```
src/
├── App.tsx                  # layout, shortcuts, panel toggles
├── main.tsx                 # entry
├── components/
│   ├── CodeEditor/          # code input + current-line highlight
│   ├── CallStack/           # stack frames
│   ├── WebAPIs/             # active timers
│   ├── EventLoop/           # loop state (idle/checking/microtasks/…)
│   ├── Queues/              # microtask + task queues
│   ├── Console/             # program output
│   ├── Timeline/            # event history
│   ├── CPUVisualizer/       # simulated CPU load
│   ├── MemoryVisualizer/    # heap objects
│   ├── Profiler/            # run stats
│   ├── ExplanationPanel/    # step narration
│   ├── ControlBar/          # run/pause/step/reset/speed
│   ├── EventInspector/      # task detail popup
│   ├── InterviewMode/       # quiz mode
│   ├── RuntimeStatus/       # state snapshot
│   └── WelcomeModal/        # intro modal
├── engine/
│   ├── parser.ts            # regex parser → discrete steps
│   └── runtimeEngine.ts     # simulation: steps → snapshots
├── hooks/useRuntime.ts      # playback state machine
├── data/examples.ts         # 13 curated examples
├── types/runtime.ts         # snapshot / queue / heap types
└── utils/syntax.ts          # highlighting helpers
```

## How it works

1. `parser.ts` turns source lines into typed steps (`console.log`, `setTimeout`, `promise.then`, …) and records function bodies.
2. `runtimeEngine.ts` (`generateSimulation`) expands those into an ordered `SimStep[]`: sync execution → global-frame pop → microtask drain → task queue processing → completion.
3. `useRuntime.ts` applies one step at a time to an immutable `RuntimeSnapshot`, advancing simulated time (real timer delays are compressed for visualization).

## Roadmap ideas

- [ ] `fetch` / DOM-event Web API entries
- [ ] `clearTimeout` / `clearInterval` cancellation
- [ ] Loop/conditional highlighting (`for`, `while`, `if`)
- [ ] Shareable links (code encoded in URL)
- [ ] Export timeline as Markdown

## License

MIT — icon: Lucide `terminal` (ISC), styled for this project.
