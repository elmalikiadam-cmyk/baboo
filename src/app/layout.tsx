import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";
import { FavoritesProvider } from "@/components/favorites/favorites-provider";
import { auth } from "@/auth";
import { getFavoriteSlugs } from "@/actions/favorites";
import { countUnreadConversations } from "@/lib/messaging";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Barlow Condensed is the open-source fallback for Bahnschrift SemiBold Condensed.
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
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
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const [initialFavorites, unread] = await Promise.all([
    userId ? getFavoriteSlugs(userId) : Promise.resolve(null),
    userId ? countUnreadConversations(userId) : Promise.resolve(null),
  ]);

  return (
    <html lang="fr" className={`${inter.variable} ${barlow.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col pb-16 md:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background focus:outline-none"
        >
          Aller au contenu principal
        </a>
        <FavoritesProvider initial={initialFavorites}>
          <SiteHeader />
          <main id="main" className="flex-1">{children}</main>
          <SiteFooter />
          <MobileBottomBar unreadMessages={unread} />
        </FavoritesProvider>
      </body>
    </html>
  );
}
