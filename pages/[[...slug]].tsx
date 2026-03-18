import dynamic from 'next/dynamic';

// Catch-all route:
// - Allows refresh / deep-links on Vercel to still render your SPA.
// - Uses `ssr: false` because your app uses `react-router` + browser APIs.
const App = dynamic(() => import('../src/app/App').then((m) => m.default ?? m), {
  ssr: false,
});

export default function CatchAllPage() {
  return <App />;
}

