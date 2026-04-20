import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Barlow Condensed is the open-source fallback for Bahnschrift SemiBold Condensed.
// Windows users with Bahnschrift installed see the real font (declared first in CSS),
// everyone else sees Barlow Condensed 600 which is visually near-identical.
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://baboo.ma"),
  title: {
    default: "Baboo — Annonces immobilières au Maroc",
    template: "%s · Baboo",
  },
  description:
    "Annonces immobilières de particuliers et professionnels. Achat, location, partout au Maroc.",
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
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${barlow.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
