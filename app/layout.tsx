import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Farm to FeNO — Ohio Rural Airway Equity Map',
  description:
    'Interactive Ohio-focused web application that visualizes underserved pulmonary regions, asthma burden, rural access gaps, and referral opportunity for advanced asthma/COPD care.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col antialiased bg-slate-50 text-slate-900">
        <Navigation />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
