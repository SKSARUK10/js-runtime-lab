// Simple syntax highlighter for JavaScript code display
// Returns array of {text, className} tokens per line

export interface SyntaxToken {
  text: string;
  className: string;
}

const keywords = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'new', 'typeof', 'instanceof',
  'in', 'of', 'class', 'extends', 'super', 'this', 'import', 'export', 'from',
  'default', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'delete',
  'void', 'yield', 'static', 'get', 'set',
]);

const builtins = new Set([
  'console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'Promise', 'fetch', 'queueMicrotask', 'MutationObserver', 'document',
  'window', 'globalThis', 'Array', 'Object', 'JSON', 'Math', 'Date',
  'Error', 'TypeError', 'RangeError', 'Map', 'Set', 'WeakMap', 'WeakSet',
]);

export function highlightLine(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    const ch = line[i];

    // Whitespace
    if (ch === ' ' || ch === '\t') {
      let j = i;
      while (j < len && (line[j] === ' ' || line[j] === '\t')) j++;
      tokens.push({ text: line.slice(i, j), className: 'syn-plain' });
      i = j;
      continue;
    }

    // Comments
    if (ch === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), className: 'syn-comment' });
      i = len;
      continue;
    }

    // Strings (single, double, backtick)
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < len && line[j] !== quote) {
        if (line[j] === '\\') j++;
        j++;
      }
      j = Math.min(j + 1, len);
      tokens.push({ text: line.slice(i, j), className: 'syn-string' });
      i = j;
      continue;
    }

    // Numbers
    if (ch >= '0' && ch <= '9') {
      let j = i;
      while (j < len && ((line[j] >= '0' && line[j] <= '9') || line[j] === '.')) j++;
      tokens.push({ text: line.slice(i, j), className: 'syn-number' });
      i = j;
      continue;
    }

    // Identifiers / keywords
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === '$') {
      let j = i;
      while (j < len && ((line[j] >= 'a' && line[j] <= 'z') || (line[j] >= 'A' && line[j] <= 'Z') || (line[j] >= '0' && line[j] <= '9') || line[j] === '_' || line[j] === '$')) j++;
      const word = line.slice(i, j);

      // Check if followed by ( for function call
      let k = j;
      while (k < len && line[k] === ' ') k++;

      if (keywords.has(word)) {
        tokens.push({ text: word, className: 'syn-keyword' });
      } else if (builtins.has(word)) {
        tokens.push({ text: word, className: 'syn-builtin' });
      } else if (line[k] === '(') {
        tokens.push({ text: word, className: 'syn-fn' });
      } else {
        tokens.push({ text: word, className: 'syn-plain' });
      }
      i = j;
      continue;
    }

    // Brackets
    if (ch === '{' || ch === '}' || ch === '[' || ch === ']' || ch === '(' || ch === ')') {
      tokens.push({ text: ch, className: 'syn-bracket' });
      i++;
      continue;
    }

    // Default
    tokens.push({ text: ch, className: 'syn-plain' });
    i++;
  }

  return tokens;
}
