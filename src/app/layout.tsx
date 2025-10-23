import localFont from 'next/font/local';
import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { CartProvider } from '@/contexts/CartContext';

const splineSans = localFont({
  src: '../../public/fonts/SplineSans.ttf',
  weight: '100 900',
  variable: '--font-splineSans',
});

export const metadata: Metadata = {
  description:
    "Grindcycle, la plateforme d'e-commerce de vente de skate recyclés",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${splineSans.className} antialiased min-h-screen`}>
        <CartProvider>
          {children}
          <Toaster position="top-center" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
