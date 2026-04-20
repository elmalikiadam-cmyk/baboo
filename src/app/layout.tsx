import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://baboo.ma"),
  title: {
    default: "Baboo — L'immobilier au Maroc, sélectionné avec soin.",
    template: "%s · Baboo",
  },
  description:
    "Baboo est la plateforme premium d'achat et de location immobilière au Maroc. Appartements, villas, riads et projets neufs à Casablanca, Rabat, Marrakech, Tanger, Agadir et plus.",
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: "https://baboo.ma",
    siteName: "Baboo",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0B3D2E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
