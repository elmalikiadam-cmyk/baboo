import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";
import { FavoritesProvider } from "@/components/favorites/favorites-provider";
import { auth } from "@/auth";
import { getFavoriteSlugs } from "@/actions/favorites";
import { countUnreadConversations } from "@/lib/messaging";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://baboo.ma"),
  title: {
    default: "Baboo — Annonces immobilières au Maroc",
    template: "%s · Baboo",
  },
  description:
    "Annonces immobilières au Maroc. Achat et location, particuliers et professionnels, 12 villes.",
  openGraph: {
    type: "website",
    locale: "fr_MA",
    siteName: "Baboo",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F0",
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
    <html
      lang="fr"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col pb-[84px] md:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ink-foreground focus:outline-none"
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
