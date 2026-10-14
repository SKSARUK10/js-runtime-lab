# Plan: Surface microtask examples + full fetch (networking Web API) support

## Goal
1. Make Promise/microtask examples discoverable in the editor's example dropdown (they exist but are buried in a flat list).
2. Add real `fetch()` support to the simulation engine: a `FETCH` entry in the Web APIs panel with simulated network latency, resolving into a **microtask** (not a task), plus new networking examples.

## Current state (verified)
- `src/pages/LabPage.tsx:281-294` — flat `<select>`, no `<optgroup>`, no categories; 13 examples from `src/data/examples.ts`, default = `basic-setTimeout`.
- `Example` type (`src/types/runtime.ts:159-167`) has **no `category` field**.
- Microtasks already fully work: `promise.then`, `queueMicrotask`, `await Promise.resolve()` (`parser.ts`, `runtimeEngine.ts:818-927, 1165-1215, 1480-1631`).
- fetch: `WebApiType 'FETCH'` (`types/runtime.ts:20`) and `TaskType 'fetchCallback'` (L27) declared; `WebAPIs.tsx:28` already renders a `Wifi` icon for `FETCH` — but **parser has no fetch pattern and engine never creates a FETCH entry**. `fetch(...)` currently falls into the generic `expression` fallback (`parser.ts:424-445`).
- `waitDuration` steps only advance the simulated clock / playback pace (`useRuntime.ts:77-81, 143-145`) — they don't structurally block later steps.
- README roadmap (L112) lists `fetch / DOM-event Web API entries` as TODO.

## Changes

### 1. `src/types/runtime.ts`
- `Example`: add `category?: 'macro' | 'micro' | 'network' | 'advanced'`.
- `WebApiEntry`: add optional `url?: string`.

### 2. `src/engine/parser.ts`
- Add `'fetch'` to `ParsedStep.type` union; add `isAwaited?: boolean` field (reuse `arg` for URL, `bodyLines` for `.then` callback body, `params` for callback params).
- New patterns — **placed before the generic `^(\w+)\(` fallbacks** (L362/L424):
  - `fetch("url").then((res) => {` … `});` block form → `{ type:'fetch', arg:url, bodyLines }`
  - `fetch("url").then((res) => expr);` expression form → `{ type:'fetch', arg:url, bodyLines:[line,line] }`
  - `await fetch("url")` (and `const x = await fetch("url")`) → `{ type:'fetch', isAwaited:true }`, set `functions.get(inFunction).hasAwait = true`
  - `fetch("url")` bare → `{ type:'fetch' }` (no handler; still shows Web API + promise resolution)
- Broaden callback param support: new fetch regexes accept `(res)` params; also generalize the existing chained `.then(` regex (L256) from `\(\s*\)` → `\(\s*([^)]*)\s*\)` so `.then(res => {` chains work (safe: still requires line to start with `.then(`).

### 3. `src/engine/runtimeEngine.ts`
Add `case 'fetch'` in **two** dispatch points, modeled on `setTimeout` (L588-703 top-level, L1880-2036 nested), but resolving to a **microtask** instead of a task:

Top-level (`generateExecutionSteps`):
1. **Register** — `WebApiEntry { type:'FETCH', label:'fetch()', url, delay: FETCH_LATENCY (const 1500), callbackLabel:'.then callback', taskType:'fetchCallback' }`; animation `callstack→webapi`; timeline; explanation ("fetch() returns a Promise immediately; the request runs in the Web API layer").
2. **Wait** — `waitDuration: FETCH_LATENCY`, sets `state='WAITING_WEB_API'`, `isWaitingForTimer=true`, `pendingTimerId=webApiId` (drives the panel's active highlight, same as timers).
3. **Response received** — remove WebApiEntry; add heap `Promise { state:'fulfilled' }`; if `.then` body exists: push `MicrotaskEntry { type:'Promise.then', label:'fetch().then()' }` + register into `(steps as any)._pendingMicrotaskCallbacks` (picked up by the existing drain at L1166-1215); animation `webapi→microtask`; timeline; explanation ("the response Promise resolves — .then callback is a microtask, not a task").

Nested (`generateBodyStepSteps`): same 3-step pattern for fetch inside callbacks; add `'fetch'` to the post-task microtask filter at **L1335** so fetch `.then` callbacks inside tasks still drain.

`await fetch` (`generateAsyncFunctionCallSteps` L1527-1607): when `bodyStep.type === 'fetch' && bodyStep.isAwaited`, emit fetch register/wait/response steps first, then reuse the existing suspend + continuation logic (L1531-1605) so code after `await fetch(...)` runs as a microtask.

### 4. `src/data/examples.ts` (+ type from step 1)
Add `category` to all 13 existing examples and append new ones:

| Group | Examples |
|---|---|
| `macro` | basic-setTimeout, nested-setTimeout, multiple-timers, dom-event |
| `micro` | promise-vs-setTimeout, promise-chain, async-await, setTimeout-promise-microtask |
| `network` | fetch-simulation, **fetch-then (new)**, **fetch-await (new)** |
| `advanced` | closure-setTimeout, error-simulation, memory-leak, interview-challenge |

New examples (with `expectedOutput` + `explanation`):

```js
// fetch-then
console.log("Start");

fetch("/api/users").then(() => {
  console.log("Response received");
});

console.log("End");
// expected: Start, End, Response received
```

```js
// fetch-await
async function loadUser() {
  console.log("Fetching user...");
  await fetch("/api/user");
  console.log("User loaded");
}

loadUser();
console.log("Script done");
// expected: Fetching user..., Script done, User loaded
```

### 5. `src/pages/LabPage.tsx` — grouped dropdown
Replace the flat `examples.map(...)` options with `<optgroup>` blocks in fixed order: **Macro Tasks → Micro Tasks → Networking (Web APIs) → Advanced**, filtering by `category` (built at render time; do NOT reorder the array — `examples[0]` stays the default). Keep the `Linked code` option behavior.

### 6. `src/components/WebAPIs/WebAPIs.tsx` — show URL
If `api.url` present, render it under the entry (e.g. `GET /api/users`).

### 7. Small consistency fixes
- `src/components/WelcomeModal/WelcomeModal.tsx:46` — "10 Examples" → actual count (15).
- `README.md:112` — tick the fetch part of the roadmap checkbox.

## Out of scope
Real network calls, `res.json()`, DOM_EVENT Web APIs, `clearTimeout` roadmap, loop/conditional parsing.

## Verification
1. `npm run typecheck`, `npm run lint`, `npm run build` (no test script exists).
2. `npm run dev` manual checks:
   - Dropdown shows 4 grouped sections; promise examples visible under "Micro Tasks".
   - `fetch-then`: Web APIs panel shows `FETCH` entry with countdown → entry removed → microtask queue shows `fetch().then()` → console order `Start, End, Response received`.
   - `fetch-await`: continuation after `await fetch` runs as microtask; console order `Fetching user..., Script done, User loaded`.
   - Regression: `basic-setTimeout` and `promise-vs-setTimeout` still produce correct output/order.

## Risks
- Regex ordering: fetch patterns must sit before the generic `^(\w+)\(` fallback or they'll parse as plain `expression`.
- Timing model: like timers, the network wait sits inline in the step sequence (existing simplification); output order stays correct because the microtask drain runs after sync code.
