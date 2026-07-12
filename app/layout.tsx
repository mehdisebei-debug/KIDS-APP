import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Kids Activity — Sorties et activités pour enfants",
  description:
    "Trouve les meilleures activités et sorties pour les 0-6 ans en Île-de-France : parcs, spectacles, ateliers, aires de jeux et plus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900 antialiased`}
      >
        <Navbar />
        {/* pb-20 : laisse la place à la BottomNav sur mobile */}
        <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 md:pb-10">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
