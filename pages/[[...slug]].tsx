import dynamic from 'next/dynamic';

const App = dynamic(
  () => import('../src/app/App').then((m) => m.default ?? m),
  { ssr: false },
);

export default function CatchAllPage() {
  return <App />;
}

