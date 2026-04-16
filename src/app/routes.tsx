import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { MapPage } from './pages/MapPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotFoundPage } from './pages/NotFoundPage';

const basename = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const router = createBrowserRouter(
  [
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'search', Component: SearchPage },
      { path: 'property/:id', Component: PropertyDetailPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'dashboard', Component: DashboardPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'map', Component: MapPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
  ],
  { basename }
);
