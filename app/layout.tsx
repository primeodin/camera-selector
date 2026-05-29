import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrimeOdin NVR Planner',
  description: 'Plan a Frigate-based DIY security camera system with PoE, storage, topology, BOM, and starter config.',
  openGraph: {
    title: 'PrimeOdin NVR Planner',
    description: 'Your camera system, planned in minutes.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
