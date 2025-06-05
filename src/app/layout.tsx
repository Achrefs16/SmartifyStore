import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Layout from "@/components/layout/Layout";
import SessionProvider from "@/components/providers/SessionProvider";
import { CartProvider } from '@/context/CartContext';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smartify Store - Accessoires Intelligents",
  description: "Votre destination pour des accessoires de qualité. Des produits soigneusement sélectionnés pour répondre à tous vos besoins.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProvider>
          <CartProvider>
            <Layout>{children}</Layout>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
