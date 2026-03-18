import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { UserProvider } from './contexts/UserContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </ThemeProvider>
  );
}
