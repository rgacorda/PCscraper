import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/features/ui/components/Navigation';

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
        <Navigation />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <footer className="bg-white border-t border-blue-100 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600 text-sm">
              <p className="mb-2">© 2025 PH PC Parts Aggregator. Compare prices from top retailers.</p>
              <p className="text-xs text-gray-500">Datablitz • PCWorx • Bermor Techzone</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
