import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { IPhoneFrame } from '@/components/layout/iPhoneFrame';

export const metadata: Metadata = {
  title: 'ShareBite — Rescue food. Feed your community.',
  description: 'Connect with local food providers offering surplus food at incredible prices. Save money, reduce waste.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
