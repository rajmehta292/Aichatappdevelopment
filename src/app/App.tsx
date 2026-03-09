import { RouterProvider } from 'react-router';
import { FullChatProvider } from './context/FullChatContext';
import { ThemeProvider } from 'next-themes';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <FullChatProvider>
        <RouterProvider router={router} />
        <Toaster />
      </FullChatProvider>
    </ThemeProvider>
  );
}