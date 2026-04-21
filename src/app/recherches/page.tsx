import type { Metadata } from "next";
import { SavedSearchesPage } from "@/components/search/saved-searches-page";

export const metadata: Metadata = { title: "Mes alertes" };
export const dynamic = "force-dynamic";

export default function SavedSearchesRoute() {
  return <SavedSearchesPage />;
}
