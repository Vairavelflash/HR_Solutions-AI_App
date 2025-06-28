import { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import ThemeImage from './ThemeImage';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
       <ThemeImage />

    </div>
  );
}