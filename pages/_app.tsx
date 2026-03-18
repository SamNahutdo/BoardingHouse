import type { AppProps } from 'next/app';
import '../src/styles/index.css';
import 'leaflet/dist/leaflet.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

