"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/ui/icons";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL } from "@/data/taxonomy";

type Mode = "ACHETER" | "LOUER" | "VENDRE";

/**
 * V3 « Éditorial chaleureux » — bloc recherche hero home.
 * Card blanche rounded-2xl, tabs Acheter/Louer/Vendre en haut, puis
 * 3 champs (Où / Type / Budget) séparés par des dividers + CTA terracotta.
 */
export function HeroSearchBlock() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>("ACHETER");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (mode === "VENDRE") {
      startTransition(() => router.push("/pro/publier"));
      return;
    }
    const params = new URLSearchParams();
    if (mode === "LOUER") params.set("t", "rent");
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (budget) params.set("pmax", budget);
    startTransition(() => router.push(`/recherche?${params.toString()}`));
  }

  return (
    <form
      onSubmit={onSearch}
      className="overflow-hidden rounded-2xl border border-midnight/10 bg-white shadow-sm"
    >
      {/* Tabs — gap-2 pour éviter que les 3 labels se touchent visuellement */}
      <div className="flex gap-2 border-b border-midnight/10 p-2">
        {(["ACHETER", "LOUER", "VENDRE"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold tracking-wide transition-colors ${
                active
                  ? "bg-midnight text-cream"
                  : "text-midnight hover:bg-cream-2"
              }`}
            >
              {m}
            </button>
          );
        })}
      </div>

      {/* Champs */}
      <div className="grid grid-cols-1 divide-y divide-midnight/10 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:divide-x sm:divide-y-0">
        <Field label="Où">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-transparent text-base font-semibold text-midnight outline-none"
          >
            <option value="">Toutes villes</option>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-transparent text-base font-semibold text-midnight outline-none"
          >
            <option value="">Indifférent</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROPERTY_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Budget max">
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="Indifférent"
            className="w-full bg-transparent text-base font-semibold text-midnight outline-none placeholder:text-muted-foreground"
          />
        </Field>

        <div className="p-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex h-full w-full items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-3 font-semibold text-cream transition-colors hover:bg-terracotta-2 disabled:opacity-50 sm:w-auto"
          >
            <SearchIcon className="h-4 w-4" aria-hidden />
            Rechercher
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-3">
      <label className="eyebrow mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
