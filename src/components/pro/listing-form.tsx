"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Transaction, PropertyType, Condition } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPE_LABEL, PROPERTY_TYPES, AMENITIES, CONDITION_LABEL } from "@/data/taxonomy";
import { createListing, updateListing, type CrudResult } from "@/actions/pro-listings";
import { ListingPhotosManager } from "@/components/pro/listing-photos-manager";

export interface ListingFormInitial {
  id?: string;
  title?: string;
  description?: string;
  transaction?: Transaction;
  propertyType?: PropertyType;
  price?: number;
  surface?: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  citySlug?: string;
  neighborhoodSlug?: string | null;
  coverImage?: string;
  additionalImages?: string;
  condition?: Condition | null;
  parking?: boolean;
  elevator?: boolean;
  furnished?: boolean;
  terrace?: boolean;
  balcony?: boolean;
  garden?: boolean;
  pool?: boolean;
  seaView?: boolean;
  airConditioning?: boolean;
}

interface Props {
  initial?: ListingFormInitial;
  /** Si défini, on édite (pas de create). */
  editId?: string;
}

export function ListingForm({ initial = {}, editId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [citySlug, setCitySlug] = useState(initial.citySlug ?? "casablanca");
  const [coverImage, setCoverImage] = useState(initial.coverImage ?? "");
  const [extraImages, setExtraImages] = useState<string[]>(
    (initial.additionalImages ?? "")
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const city = useMemo(() => CITIES.find((c) => c.slug === citySlug), [citySlug]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // Les photos sont gérées en state React (ListingPhotosManager) ;
    // on les réinjecte ici pour qu'elles arrivent au schéma Zod côté
    // serveur. Sans cette étape, coverImage est vide et la validation
    // échoue silencieusement avec « URL de photo invalide. »
    form.set("coverImage", coverImage);
    form.set("additionalImages", extraImages.join("\n"));
    setError(null);
    setFieldErrors({});
    if (!coverImage) {
      setError(
        "Ajoutez au moins une photo du bien — la première sert de photo de couverture.",
      );
      setFieldErrors({ coverImage: "Photo de couverture requise." });
      return;
    }
    startTransition(async () => {
      let res: CrudResult;
      if (editId) {
        res = await updateListing(editId, form);
      } else {
        res = await createListing(form);
      }
      if (res.ok) {
        router.push(`/pro/listings?created=${res.slug}`);
        router.refresh();
      } else {
        setError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10" noValidate>
      {/* Catégorie */}
      <Section n="01" title="Catégorie">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Type de bien" error={fieldErrors.propertyType}>
            <Select name="propertyType" defaultValue={initial.propertyType ?? PropertyType.APARTMENT} required>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_TYPE_LABEL[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Transaction" error={fieldErrors.transaction}>
            <Select name="transaction" defaultValue={initial.transaction ?? Transaction.SALE} required>
              <option value={Transaction.SALE}>Vente</option>
              <option value={Transaction.RENT}>Location</option>
            </Select>
          </Field>
        </div>
      </Section>

      {/* Emplacement */}
      <Section n="02" title="Emplacement">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ville" error={fieldErrors.citySlug}>
            <Select
              name="citySlug"
              value={citySlug}
              onChange={(e) => setCitySlug(e.target.value)}
              required
            >
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Quartier (optionnel)" error={fieldErrors.neighborhoodSlug}>
            <Select name="neighborhoodSlug" defaultValue={initial.neighborhoodSlug ?? ""}>
              <option value="">— Non précisé —</option>
              {(city?.neighborhoods ?? []).map((n) => (
                <option key={n.slug} value={n.slug}>
                  {n.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      {/* Caractéristiques */}
      <Section n="03" title="Caractéristiques">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Prix (MAD)" error={fieldErrors.price}>
            <Input name="price" type="number" min={1} required defaultValue={initial.price ?? ""} />
          </Field>
          <Field label="Surface (m²)" error={fieldErrors.surface}>
            <Input name="surface" type="number" min={1} required defaultValue={initial.surface ?? ""} />
          </Field>
          <Field label="Chambres" error={fieldErrors.bedrooms}>
            <Input
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={initial.bedrooms ?? ""}
              placeholder="0"
            />
          </Field>
          <Field label="Salles de bain" error={fieldErrors.bathrooms}>
            <Input
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={initial.bathrooms ?? ""}
              placeholder="0"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="État" error={fieldErrors.condition}>
            <Select name="condition" defaultValue={initial.condition ?? ""}>
              <option value="">— Non précisé —</option>
              {Object.entries(CONDITION_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      {/* Commodités */}
      <Section n="04" title="Commodités">
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const checked = Boolean(initial[a.key as keyof ListingFormInitial]);
            return (
              <label
                key={a.key}
                className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-midnight has-[:checked]:border-midnight has-[:checked]:bg-midnight has-[:checked]:text-cream"
              >
                <input
                  type="checkbox"
                  name={a.key}
                  defaultChecked={checked}
                  className="sr-only"
                />
                {a.label}
              </label>
            );
          })}
        </div>
      </Section>

      {/* Description */}
      <Section n="05" title="Titre et description">
        <Field label="Titre" error={fieldErrors.title}>
          <Input name="title" required defaultValue={initial.title ?? ""} placeholder="Appartement lumineux avec terrasse, Anfa" />
        </Field>
        <div className="mt-4">
          <Field label="Description complète" error={fieldErrors.description}>
            <textarea
              name="description"
              rows={6}
              required
              defaultValue={initial.description ?? ""}
              placeholder="Caractéristiques, atouts, environnement, conditions de visite…"
              className="w-full rounded-md border border-border bg-cream p-4 text-sm focus-visible:border-midnight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-midnight/10"
            />
          </Field>
        </div>
      </Section>

      {/* Photos — gestionnaire multi-photos drag & drop */}
      <Section n="06" title="Photos">
        <Field
          label="Photos du bien"
          error={fieldErrors.coverImage ?? fieldErrors.additionalImages}
          hint="Glissez vos photos ou cliquez. La 1ère photo est la couverture. Glissez pour réordonner."
        >
          <ListingPhotosManager
            initial={[
              ...(coverImage ? [coverImage] : []),
              ...extraImages,
            ]}
            onChange={(urls) => {
              setCoverImage(urls[0] ?? "");
              setExtraImages(urls.slice(1));
            }}
            maxPhotos={15}
          />
        </Field>
      </Section>

      {error && (
        <p className="rounded-full bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Enregistrement…" : editId ? "Enregistrer les modifications" : "Publier l'annonce"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="border-b border-midnight/10 pb-3">
        <p className="eyebrow">/{n}</p>
        <h2 className="display-lg mt-1 text-xl">{title}</h2>
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="mono text-[10px] uppercase tracking-[0.12em] text-muted">{hint}</p>}
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}

function ExtraUrlInput({
  onAdd,
  disabled,
}: {
  onAdd: (url: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  function tryAdd() {
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      return;
    }
    onAdd(trimmed);
    setValue("");
  }
  return (
    <div className="flex gap-2">
      <Input
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            tryAdd();
          }
        }}
        placeholder="…ou collez une URL d'image"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={tryAdd}
        disabled={disabled || !value.trim()}
        className="mono shrink-0 rounded-md border border-border px-3 text-[10px] uppercase tracking-[0.12em] hover:border-midnight disabled:opacity-40"
      >
        Ajouter
      </button>
    </div>
  );
}
