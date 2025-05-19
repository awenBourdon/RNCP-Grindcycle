import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Footer from "./homeComponents/Footer";
import Navbar from "./homeComponents/Navbar";
import localFont from "next/font/local";
import { CartProvider } from "@/contexts/CartContext";

const splineSans = localFont({
  src: "../../public/fonts/SplineSans.ttf",
  weight: "100 900",
  variable: "--font-splineSans",
});

export const metadata: Metadata = {
  title: "Grindcycle",
  description: "Grindcycle, la plateforme d'e-commerce de vente de skate recyclés",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${splineSans.className} antialiased`}>
        <CartProvider>
        <Navbar />
        {children}
        <Toaster position="top-center" richColors/>
        <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
