import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#0a0c10] text-gray-300">
      <SEO title="Page not found" description="This page does not exist." canonical="/" noindex />
      <h1 className="text-2xl font-bold text-gray-100">404 — not found</h1>
      <p className="text-sm text-gray-500">This page doesn&apos;t exist in the lab.</p>
      <Link to="/" className="btn-primary">
        Back to the visualizer
      </Link>
    </div>
  );
}
