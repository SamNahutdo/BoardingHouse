import dynamic from 'next/dynamic';

// Explicit homepage for static hosting.
// GitHub Pages cannot rewrite all routes to a catch-all the way Vercel does,
// so we need `out/index.html` to exist at the publish root.
const App = dynamic(() => import('../src/app/App').then((m) => m.default ?? m), {
  ssr: false,
});

export default function IndexPage() {
  return <App />;
}

