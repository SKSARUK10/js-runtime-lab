import { Link } from 'react-router-dom';
import { Terminal, ArrowLeft } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

/** Breadcrumb trail for content pages: Home › … › current. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-gray-500">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-gray-700">
                /
              </span>
            )}
            {item.to ? (
              <Link to={item.to} className="hover:text-gray-200 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-gray-300">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Shared header for content routes (Learn, Interview, Concept). */
export function ContentHeader({ backTo = '/', backLabel = 'Back to visualizer' }: { backTo?: string; backLabel?: string }) {
  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b border-[#1e2433] bg-[#0d0f14]">
      <Link to="/" className="flex items-center gap-2" aria-label="JS Runtime Lab home">
        <Terminal size={18} className="text-accent-green" />
        <span className="font-bold text-sm text-gray-100">JS Runtime Lab</span>
      </Link>
      <nav aria-label="Sections" className="flex items-center gap-1 ml-2 text-[12px]">
        <Link to="/learn" className="px-2 py-0.5 rounded text-gray-400 hover:text-gray-200 hover:bg-panel-hover transition-all">
          Learn
        </Link>
        <Link to="/interview" className="px-2 py-0.5 rounded text-gray-400 hover:text-gray-200 hover:bg-panel-hover transition-all">
          Interview
        </Link>
      </nav>
      <Link
        to={backTo}
        className="ml-auto px-2 py-0.5 text-[11px] rounded text-gray-400 hover:text-gray-200 hover:bg-panel-hover flex items-center gap-1 transition-all"
      >
        <ArrowLeft size={12} /> {backLabel}
      </Link>
    </header>
  );
}
