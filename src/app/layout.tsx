import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { IPhoneFrame } from '@/components/layout/iPhoneFrame';

export const metadata: Metadata = {
  title: 'NibbleNet — Fantastic Fantosa Corporations',
  description: 'A network for sharing extra food. Connect with local food providers offering surplus food at incredible prices. Save money, reduce waste.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <DataProvider>
            <IPhoneFrame>
              {children}
            </IPhoneFrame>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
