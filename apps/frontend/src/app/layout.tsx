import './globals.css';
import type { Metadata } from 'next';
import { Fraunces, Alegreya_Sans } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
});

const alegreyaSans = Alegreya_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'CareCircle Journal',
  description: 'AI-assisted shared journal for caregivers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${alegreyaSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
