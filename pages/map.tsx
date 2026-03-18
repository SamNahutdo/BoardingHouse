import dynamic from 'next/dynamic';

const MapPage = dynamic(
  () => import('../src/app/pages/MapPage').then((m) => m.MapPage),
  { ssr: false }
);

export default function MapRoute() {
  return <MapPage />;
}

