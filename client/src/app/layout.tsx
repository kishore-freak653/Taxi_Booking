import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import ConditionalNavbar from '@/components/ConditionalNavbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Taxi Booking - Book Your Ride',
  description: 'Professional taxi booking platform built with PERN stack',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalNavbar />
        <main>{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
