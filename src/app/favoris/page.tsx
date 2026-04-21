import type { Metadata } from "next";
import { FavoritesPage } from "@/components/favorites/favorites-page";

export const metadata: Metadata = { title: "Mes favoris" };
export const dynamic = "force-dynamic";

export default function FavoritesRoute() {
  return <FavoritesPage />;
}
