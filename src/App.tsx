import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LabPage from '@/pages/LabPage';
import NotFound from '@/pages/NotFound';
import { Analytics, RoutePageviewTracker } from '@/components/Analytics/Analytics';

// Content routes are code-split: their JS only loads when visited.
const InterviewPage = lazy(() => import('@/pages/InterviewPage'));
const LearnIndex = lazy(() => import('@/pages/LearnIndex'));
const ConceptPage = lazy(() => import('@/pages/ConceptPage'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] text-gray-500 text-sm">
      Loading…
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Analytics />
      <RoutePageviewTracker />
      <Routes>
        <Route path="/" element={<LabPage />} />
        <Route path="/learn" element={
          <Suspense fallback={<RouteFallback />}>
            <LearnIndex />
          </Suspense>
        } />
        <Route path="/learn/:slug" element={
          <Suspense fallback={<RouteFallback />}>
            <ConceptPage />
          </Suspense>
        } />
        <Route
          path="/interview"
          element={
            <Suspense fallback={<RouteFallback />}>
              <InterviewPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
