import dynamic from 'next/dynamic';

// Mount your existing React app on the root route.
// We disable SSR because it uses `react-router` + browser APIs.
const App = dynamic(() => import('../src/app/App').then((m) => m.default ?? m), {
  ssr: false,
});

export default function IndexPage() {
  return <App />;
}

