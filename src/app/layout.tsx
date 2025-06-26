import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Layout from "@/components/layout/Layout";
import SessionProvider from "@/components/providers/SessionProvider";
import { CartProvider } from '@/context/CartContext';
import "./globals.css";
import Head from 'next/head';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smartify Store - Accessoires Intelligents",
  description: "Votre destination pour des accessoires de qualité. Des produits soigneusement sélectionnés pour répondre à tous vos besoins.",
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" prefix="og: http://ogp.me/ns#">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="Smartify Store, électronique Tunisie, parfum original Tunisie, soins personnels Tunisie, accessoires intelligents, boutique en ligne Tunisie, tech Tunisie, beauté Tunisie, fragrance Tunisie, self-care Tunisie" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_TN" />
        <meta property="og:site_name" content="Smartify Store" />
        <meta property="og:title" content="Smartify Store - Accessoires Intelligents en Tunisie" />
        <meta property="og:description" content="Votre destination en Tunisie pour l'électronique, les parfums originaux et les produits de soins personnels. Livraison rapide et produits de qualité." />
        <meta property="og:image" content="/images/logo.png" />
        <meta property="og:url" content="https://smartify-store.vercel.app/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Smartify Store - Accessoires Intelligents en Tunisie" />
        <meta name="twitter:description" content="Votre destination en Tunisie pour l'électronique, les parfums originaux et les produits de soins personnels." />
        <meta name="twitter:image" content="/images/logo.png" />
        <link rel="canonical" href="https://smartify-store.vercel.app/" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Smartify Store',
          url: 'https://smartify-store.vercel.app/',
          logo: '/images/logo.png',
          sameAs: [
            'https://www.facebook.com/profile.php?id=61576986052660',
            'https://www.instagram.com/smartifystore1/'
          ]
        }) }} />
      </Head>
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
