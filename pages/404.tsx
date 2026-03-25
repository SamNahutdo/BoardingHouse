import dynamic from 'next/dynamic';

// GitHub Pages cannot rewrite all requests back to `/`.
// For unknown routes, GitHub Pages serves `404.html`, so we still mount
// the React Router app here (client-only) so deep links can work.
const App = dynamic(() => import('../src/app/App').then((m) => m.default ?? m), {
  ssr: false,
});

export default function NotFoundPage() {
  return <App />;
}

