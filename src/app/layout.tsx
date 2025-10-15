import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/features/ui/components/Navigation';
import SessionProvider from '@/components/providers/SessionProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'PH PC Parts Aggregator',
  description: 'Compare PC part prices from Philippine retailers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <SessionProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Navigation />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <footer className="bg-white border-t border-blue-100 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600 text-sm">
                <p className="mb-2">© 2025 PH PC Parts Aggregator. Compare prices from top retailers.</p>
                <p className="text-xs text-gray-500">Datablitz • PCWorth • Bermor Techzone</p>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
