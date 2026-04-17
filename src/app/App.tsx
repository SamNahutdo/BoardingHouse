import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { UserProvider } from './contexts/UserContext';
import { PropertyProvider } from './contexts/PropertyContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <UserProvider>
        <PropertyProvider>
          <RouterProvider router={router} />
        </PropertyProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
