// ===== Code Parser =====
// Parses supported JavaScript patterns into simulation steps.
// Does NOT use eval() or Function(). Instead, uses regex-based pattern
// recognition to build a controlled simulation model.

export interface ParsedStep {
  line: number;
  type:
    | 'console.log'
    | 'console.error'
    | 'console.warn'
    | 'setTimeout'
    | 'setInterval'
    | 'clearTimeout'
    | 'promise.then'
    | 'promise.resolve'
    | 'queueMicrotask'
    | 'function-decl'
    | 'function-call'
    | 'async-function-decl'
    | 'async-function-call'
    | 'await'
    | 'throw'
    | 'variable-decl'
    | 'expression'
    | 'comment'
    | 'blank'
    | 'return'
    | 'block-start'
    | 'block-end';
  arg?: string;
  delay?: number;
  fnName?: string;
  params?: string;
  bodyLines?: number[];
  isNested?: boolean;
  parentFn?: string;
}

export interface ParsedFunction {
  name: string;
  startLine: number;
  endLine: number;
  params: string;
  isAsync: boolean;
  body: ParsedStep[];
  hasAwait?: boolean;
  isClosure: boolean;
}

export interface ParseResult {
  steps: ParsedStep[];
  functions: Map<string, ParsedFunction>;
  lines: string[];
  supported: boolean;
  unsupportedLines: number[];
  error?: string;
}

export function parseCode(code: string): ParseResult {
  const lines = code.split('\n');
  const steps: ParsedStep[] = [];
  const functions = new Map<string, ParsedFunction>();
  const unsupportedLines: number[] = [];

  // First pass: identify function declarations
  const functionMap = new Map<string, { start: number; end: number; params: string; isAsync: boolean; isClosure: boolean }>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // function declaration: function name(params) {
    let m = line.match(/^(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
    if (m) {
      const isAsync = line.startsWith('async');
      functionMap.set(m[1], { start: lineNum, end: 0, params: m[2], isAsync, isClosure: false });
      continue;
    }

    // arrow function const name = (params) => {
    m = line.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{/);
    if (m) {
      const isAsync = line.includes('async');
      functionMap.set(m[1], { start: lineNum, end: 0, params: m[2], isAsync, isClosure: true });
      continue;
    }

    // arrow function const name = (params) => expression
    m = line.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*(.+)/);
    if (m) {
      const isAsync = line.includes('async');
      functionMap.set(m[1], { start: lineNum, end: lineNum, params: m[2], isAsync, isClosure: true });
      continue;
    }
  }

  // Find function end lines by tracking braces
  for (const [name, info] of functionMap) {
    let depth = 0;
    let foundOpen = false;
    for (let i = info.start - 1; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === '{') { depth++; foundOpen = true; }
        if (ch === '}') depth--;
      }
      if (foundOpen && depth === 0) {
        info.end = i + 1;
        break;
      }
    }
    if (info.end === 0) info.end = info.start;

    functions.set(name, {
      name,
      startLine: info.start,
      endLine: info.end,
      params: info.params,
      isAsync: info.isAsync,
      isClosure: info.isClosure,
      body: [],
      hasAwait: false,
    });
  }

  // Second pass: parse each line into steps
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    const lineNum = i + 1;

    if (line === '' || line.startsWith('//')) {
      steps.push({ line: lineNum, type: line.startsWith('//') ? 'comment' : 'blank' });
      continue;
    }

    // Check if this line is inside a function body
    let inFunction: string | null = null;
    for (const [fnName, fn] of functions) {
      if (lineNum > fn.startLine && lineNum <= fn.endLine) {
        inFunction = fnName;
        break;
      }
    }

    // console.log("...")
    let match = line.match(/console\.log\((.+)\);?$/);
    if (match) {
      steps.push({ line: lineNum, type: 'console.log', arg: match[1], parentFn: inFunction || undefined });
      continue;
    }

    // console.error("...")
    match = line.match(/console\.error\((.+)\);?$/);
    if (match) {
      steps.push({ line: lineNum, type: 'console.error', arg: match[1], parentFn: inFunction || undefined });
      continue;
    }

    // console.warn("...")
    match = line.match(/console\.warn\((.+)\);?$/);
    if (match) {
      steps.push({ line: lineNum, type: 'console.warn', arg: match[1], parentFn: inFunction || undefined });
      continue;
    }

    // setTimeout(() => { ... }, delay)
    match = line.match(/setTimeout\(\s*\(\)\s*=>\s*\{/);
    if (match) {
      // Find callback body lines
      let depth = 1;
      let bodyEnd = lineNum;
      for (let j = i + 1; j < lines.length && depth > 0; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        if (depth <= 0) { bodyEnd = j + 1; break; }
        if (depth === 0) { bodyEnd = j + 1; break; }
      }
      // Delay comes from this timer's own closing line (not a global
      // search — sibling timers have their own delays).
      const closeMatch = lines[bodyEnd - 1]?.match(/\},\s*(\d+)\)/);
      const delay = closeMatch ? parseInt(closeMatch[1]) : 0;
      steps.push({ line: lineNum, type: 'setTimeout', delay, bodyLines: [lineNum + 1, bodyEnd - 1] });
      continue;
    }

    // setTimeout(function() { ... }, delay)
    match = line.match(/setTimeout\(\s*function\s*\(\)\s*\{/);
    if (match) {
      let depth = 1;
      let bodyEnd = lineNum;
      for (let j = i + 1; j < lines.length && depth > 0; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        if (depth <= 0) { bodyEnd = j + 1; break; }
      }
      const closeMatch = lines[bodyEnd - 1]?.match(/\},\s*(\d+)\)/);
      const delay = closeMatch ? parseInt(closeMatch[1]) : 0;
      steps.push({ line: lineNum, type: 'setTimeout', delay, bodyLines: [lineNum + 1, bodyEnd - 1] });
      continue;
    }

    // setInterval(() => { ... }, delay)
    match = line.match(/setInterval\(\s*\(\)\s*=>\s*\{/);
    if (match) {
      let depth = 1;
      let bodyEnd = lineNum;
      for (let j = i + 1; j < lines.length && depth > 0; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        if (depth <= 0) { bodyEnd = j + 1; break; }
      }
      const closeMatch = lines[bodyEnd - 1]?.match(/\},\s*(\d+)\)/);
      const delay = closeMatch ? parseInt(closeMatch[1]) : 0;
      steps.push({ line: lineNum, type: 'setInterval', delay, bodyLines: [lineNum + 1, bodyEnd - 1] });
      continue;
    }

    // clearTimeout(id)
    match = line.match(/clearTimeout\((.+)\);?$/);
    if (match) {
      steps.push({ line: lineNum, type: 'clearTimeout', arg: match[1] });
      continue;
    }

    // Promise.resolve().then(() => { ... })
    match = line.match(/Promise\.resolve\(\)\.then\(\s*\(\)\s*=>\s*\{/);
    if (match) {
      let depth = 1;
      let bodyEnd = lineNum;
      for (let j = i + 1; j < lines.length && depth > 0; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        if (depth <= 0) { bodyEnd = j + 1; break; }
      }
      steps.push({ line: lineNum, type: 'promise.then', bodyLines: [lineNum + 1, bodyEnd - 1] });
      continue;
    }

    // Promise.resolve().then(() => expression)
    match = line.match(/Promise\.resolve\(\)\.then\(\s*\(\)\s*=>\s*(.+)\);?$/);
    if (match) {
      steps.push({ line: lineNum, type: 'promise.then', arg: match[1], bodyLines: [lineNum, lineNum] });
      continue;
    }

    // .then(() => { ... }) — chained
    match = line.match(/^\.then\(\s*\(\)\s*=>\s*\{/);
    if (match) {
      let depth = 1;
      let bodyEnd = lineNum;
      for (let j = i + 1; j < lines.length && depth > 0; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        if (depth <= 0) { bodyEnd = j + 1; break; }
      }
      steps.push({ line: lineNum, type: 'promise.then', bodyLines: [lineNum + 1, bodyEnd - 1], isNested: true });
      continue;
    }

    // queueMicrotask(() => { ... })
    match = line.match(/queueMicrotask\(\s*\(\)\s*=>\s*\{/);
    if (match) {
      let depth = 1;
      let bodyEnd = lineNum;
      for (let j = i + 1; j < lines.length && depth > 0; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') depth++;
          if (ch === '}') depth--;
        }
        if (depth <= 0) { bodyEnd = j + 1; break; }
      }
      steps.push({ line: lineNum, type: 'queueMicrotask', bodyLines: [lineNum + 1, bodyEnd - 1] });
      continue;
    }

    // queueMicrotask(() => expression)
    match = line.match(/queueMicrotask\(\s*\(\)\s*=>\s*(.+)\);?$/);
    if (match) {
      steps.push({ line: lineNum, type: 'queueMicrotask', arg: match[1], bodyLines: [lineNum, lineNum] });
      continue;
    }

    // await Promise.resolve() — must come before the standalone
    // Promise.resolve() check below (which would match the suffix).
    match = line.match(/await\s+Promise\.resolve\(\);?$/);
    if (match) {
      steps.push({ line: lineNum, type: 'await', parentFn: inFunction || undefined });
      // Mark function as having await
      if (inFunction && functions.has(inFunction)) {
        functions.get(inFunction)!.hasAwait = true;
      }
      continue;
    }

    // Promise.resolve() — standalone
    match = line.match(/Promise\.resolve\(\);?$/);
    if (match) {
      steps.push({ line: lineNum, type: 'promise.resolve' });
      continue;
    }

    // function declaration line
    match = line.match(/^(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
    if (match) {
      const fn = functions.get(match[1]);
      steps.push({
        line: lineNum,
        type: fn?.isAsync ? 'async-function-decl' : 'function-decl',
        fnName: match[1],
        params: match[2],
      });
      continue;
    }

    // arrow function const name = (params) => {
    match = line.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{/);
    if (match) {
      const fn = functions.get(match[1]);
      steps.push({
        line: lineNum,
        type: fn?.isAsync ? 'async-function-decl' : 'function-decl',
        fnName: match[1],
        params: match[2],
      });
      continue;
    }

    // arrow function const name = (params) => expression
    match = line.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*(.+)/);
    if (match) {
      const fn = functions.get(match[1]);
      if (fn) {
        steps.push({
          line: lineNum,
          type: fn.isAsync ? 'async-function-decl' : 'function-decl',
          fnName: match[1],
          params: match[2],
        });
      }
      continue;
    }

    // throw new Error("...")
    match = line.match(/throw\s+new\s+Error\((.+)\);?$/);
    if (match) {
      steps.push({ line: lineNum, type: 'throw', arg: match[1], parentFn: inFunction || undefined });
      continue;
    }

    // function call: name(args)
    match = line.match(/^(\w+)\((.*)\);?$/);
    if (match && functions.has(match[1])) {
      const fn = functions.get(match[1])!;
      steps.push({
        line: lineNum,
        type: fn.isAsync ? 'async-function-call' : 'function-call',
        fnName: match[1],
        params: match[2],
      });
      continue;
    }

    // variable declaration: const/let/var name = expression
    match = line.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(.+);?$/);
    if (match) {
      // Check if it's a function call (e.g., const fn = outer())
      const callMatch = match[2].match(/^(\w+)\((.*)\);?$/);
      if (callMatch && functions.has(callMatch[1])) {
        const fn = functions.get(callMatch[1])!;
        steps.push({
          line: lineNum,
          type: fn.isAsync ? 'async-function-call' : 'function-call',
          fnName: callMatch[1],
          params: callMatch[2],
          arg: match[1], // store var name
        });
        continue;
      }
      // Check if it's creating an array (for memory leak demo)
      if (match[2].includes('new Array') || match[2].includes('[]')) {
        steps.push({ line: lineNum, type: 'variable-decl', arg: match[1], fnName: 'Array' });
        continue;
      }
      steps.push({ line: lineNum, type: 'variable-decl', arg: match[1] });
      continue;
    }

    // return statement
    match = line.match(/^return\s+(.+);?$/);
    if (match) {
      // Check if returning a function (closure)
      if (match[1].startsWith('function') || match[1].match(/^\w+\s*\(/)) {
        steps.push({ line: lineNum, type: 'return', arg: match[1], parentFn: inFunction || undefined });
        continue;
      }
      steps.push({ line: lineNum, type: 'return', arg: match[1], parentFn: inFunction || undefined });
      continue;
    }

    // Closing brace
    if (line === '}' || line === '});' || line === '});' || line === '},') {
      steps.push({ line: lineNum, type: 'block-end' });
      continue;
    }

    // Opening brace
    if (line === '{') {
      steps.push({ line: lineNum, type: 'block-start' });
      continue;
    }

    // Generic expression / function call
    match = line.match(/^(\w+)\((.*)\);?$/);
    if (match) {
      // Could be a function call we don't know, or a method call
      // Check if it looks like a known pattern
      if (match[1] === 'counter' || match[1] === 'fn' || match[1] === 'test' || match[1] === 'handleClick') {
        // treat as function call if we have it
        if (functions.has(match[1])) {
          steps.push({ line: lineNum, type: 'function-call', fnName: match[1], params: match[2] });
          continue;
        }
        // Could be a closure call - treat as expression
        steps.push({ line: lineNum, type: 'expression', arg: line, parentFn: inFunction || undefined });
        continue;
      }
      // For simulateFetch and other custom function calls, treat as expression
      steps.push({ line: lineNum, type: 'expression', arg: line, parentFn: inFunction || undefined });
      continue;
    }

    // If we get here, it's potentially unsupported
    // But let's be lenient - treat as expression
    steps.push({ line: lineNum, type: 'expression', arg: line, parentFn: inFunction || undefined });
  }

  // Build function bodies: direct children only — steps owned by a nested
  // callback (setTimeout / .then bodies) run when that queue drains,
  // never inline with the function body.
  for (const [name, fn] of functions) {
    fn.body = steps.filter(s => {
      if (!(s.line > fn.startLine && s.line <= fn.endLine)) return false;
      if (s.type === 'function-decl' || s.type === 'async-function-decl' || s.type === 'block-start' || s.type === 'block-end') return false;
      for (const owner of steps) {
        if (!owner.bodyLines || owner === s) continue;
        const [os, oe] = owner.bodyLines;
        if (s.line >= os && s.line <= oe) return false;
      }
      return true;
    });
  }

  return {
    steps,
    functions,
    lines,
    supported: true,
    unsupportedLines,
  };
}

// Extract string literal content from argument
export function extractStringLiteral(arg: string): string {
  const m = arg.match(/^["'`]([^"'`]*)["'`]$/);
  if (m) return m[1];
  // Handle concatenation: "text" + variable
  const parts = arg.split('+').map(p => p.trim());
  const strings = parts.map(p => {
    const sm = p.match(/^["'`]([^"'`]*)["'`]$/);
    return sm ? sm[1] : null;
  });
  if (strings.every(s => s !== null)) {
    return strings.join('');
  }
  // Return raw arg if we can't parse
  return arg.replace(/["'`]/g, '');
}
