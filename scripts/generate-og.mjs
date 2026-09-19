// Generates distinct OG cards (1200x630 SVG) for every content route.
// Runs on `prebuild` so images always match content titles; outputs are
// committed under public/og/ so dev and offline builds work too.
// No dependencies: pure Node + string templates.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEARN_PAGES } from '../src/content/learnPages.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'og');
mkdirSync(outDir, { recursive: true });

const W = 1200;
const H = 630;

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Greedy word wrap tuned for bold ~72px sans (≈40px/char average).
function wrap(title, maxChars = 26, maxLines = 3) {
  const words = title.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    return [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1]}…`];
  }
  return lines;
}

function card({ kicker, title, subtitle, accent }) {
  const lines = wrap(title);
  const titleSize = lines.length > 2 ? 64 : 76;
  const titleY = 250;
  const titleSvg = lines
    .map((l, i) => `    <text x="90" y="${titleY + i * (titleSize + 14)}" font-size="${titleSize}">${escapeXml(l)}</text>`)
    .join('\n');
  const footerY = titleY + (lines.length - 1) * (titleSize + 14) + 92;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0a0c10"/>
  <circle cx="1050" cy="80" r="260" fill="${accent}" opacity="0.10"/>
  <circle cx="120" cy="600" r="180" fill="${accent}" opacity="0.07"/>
  <rect x="0" y="0" width="14" height="${H}" fill="${accent}"/>
  <g font-family="Inter, system-ui, -apple-system, 'Segoe UI', sans-serif">
    <text x="90" y="120" font-size="32" letter-spacing="6" fill="#9ca3af">${escapeXml(kicker)}</text>
${titleSvg}
    <text x="90" y="${footerY}" font-family="ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace" font-size="44" font-weight="bold" fill="${accent}">&gt;_</text>
    <text x="200" y="${footerY}" font-size="30" fill="#6b7280">${escapeXml(subtitle)}</text>
  </g>
</svg>
`;
}

const pages = [
  {
    file: 'home.svg',
    kicker: 'JS RUNTIME LAB',
    title: 'Watch JavaScript execute, one operation at a time',
    subtitle: 'Interactive event-loop visualizer',
    accent: '#4ade80',
  },
  {
    file: 'learn-index.svg',
    kicker: 'JS RUNTIME LAB · LEARN',
    title: 'Learn the event loop, visually',
    subtitle: 'Guides with live demos',
    accent: '#4ade80',
  },
  {
    file: 'interview.svg',
    kicker: 'JS RUNTIME LAB · INTERVIEW',
    title: '18 event loop interview questions',
    subtitle: 'Predict the output, then verify live',
    accent: '#c084fc',
  },
  ...LEARN_PAGES.map((p) => ({
    file: `learn-${p.slug}.svg`,
    kicker: 'JS RUNTIME LAB · LEARN',
    title: p.h1,
    subtitle: 'Interactive guide with live demo',
    accent: p.ogAccent,
  })),
];

for (const p of pages) {
  writeFileSync(join(outDir, p.file), card(p));
  console.log(`og: public/og/${p.file}`);
}
console.log(`Done: ${pages.length} OG cards.`);
