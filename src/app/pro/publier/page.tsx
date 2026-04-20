import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import { CITIES } from "@/data/cities";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL, AMENITIES } from "@/data/taxonomy";

export const metadata: Metadata = { title: "Déposer une annonce" };

const STEPS = [
  { n: "01", label: "Transaction" },
  { n: "02", label: "Bien" },
  { n: "03", label: "Photos" },
  { n: "04", label: "Contact" },
  { n: "05", label: "Publier" },
];

export default function PublishPage() {
  return (
    <div className="container py-10 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-4 mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        <span className="mx-2">·</span>
        <span>Publier une annonce</span>
      </nav>

      <div className="border-b border-foreground/15 pb-6">
        <p className="eyebrow">Étape 2 sur 5</p>
        <h1 className="display-xl mt-2 text-4xl md:text-6xl">Décrivez votre bien.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Plus vos informations sont précises, plus votre annonce convertit.
          Vous pouvez sauvegarder un brouillon à tout moment.
        </p>
      </div>

      {/* Stepper */}
      <ol className="mt-8 grid grid-cols-5 gap-2">
        {STEPS.map((s, i) => {
          const state = i < 1 ? "done" : i === 1 ? "current" : "upcoming";
          return (
            <li
              key={s.n}
              className={`rounded-2xl border p-3 text-center ${
                state === "current"
                  ? "border-foreground bg-foreground text-background"
                  : state === "done"
                    ? "border-foreground/20 bg-surface"
                    : "border-foreground/10 bg-paper-2/40 text-muted-foreground"
              }`}
            >
              <span className="mono block text-[9px] uppercase tracking-[0.14em] opacity-70">/{s.n}</span>
              <span className="mt-1 block text-xs font-medium md:text-sm">{s.label}</span>
            </li>
          );
        })}
      </ol>

      {/* Form */}
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <form className="space-y-10">
          {/* Category */}
          <section>
            <header className="border-b border-foreground/10 pb-3">
              <p className="eyebrow">Catégorie</p>
              <h2 className="display-lg mt-1 text-xl">Type de bien</h2>
            </header>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {PROPERTY_TYPES.map((t, i) => {
                const selected = i === 0;
                return (
                  <label
                    key={t}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/15 hover:border-foreground/40"
                    }`}
                  >
                    <input type="radio" name="type" className="sr-only" defaultChecked={selected} />
                    <span>{PROPERTY_TYPE_LABEL[t]}</span>
                    {selected && <CheckIcon className="h-4 w-4" />}
                  </label>
                );
              })}
            </div>
          </section>

          {/* Location */}
          <section>
            <header className="border-b border-foreground/10 pb-3">
              <p className="eyebrow">Emplacement</p>
              <h2 className="display-lg mt-1 text-xl">Où se situe le bien ?</h2>
            </header>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="city">Ville</Label>
                <Select id="city" defaultValue="casablanca">
                  {CITIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="neighborhood">Quartier</Label>
                <Select id="neighborhood" defaultValue="anfa">
                  {(CITIES.find((c) => c.slug === "casablanca")?.neighborhoods ?? []).map((n) => (
                    <option key={n.slug} value={n.slug}>{n.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address">Adresse (non publique)</Label>
                <Input id="address" placeholder="Ex : 12 rue du Beauséjour, Anfa Supérieur" />
                <p className="mono text-[10px] text-muted-foreground">
                  ○ VISIBLE UNIQUEMENT AU MOMENT DE LA VISITE
                </p>
              </div>
            </div>
          </section>

          {/* Specs */}
          <section>
            <header className="border-b border-foreground/10 pb-3">
              <p className="eyebrow">Caractéristiques</p>
              <h2 className="display-lg mt-1 text-xl">Le bien en chiffres</h2>
            </header>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Prix (MAD)</Label>
                <Input type="number" defaultValue="2850000" />
              </div>
              <div className="space-y-1.5">
                <Label>Surface (m²)</Label>
                <Input type="number" defaultValue="120" />
              </div>
              <div className="space-y-1.5">
                <Label>Chambres</Label>
                <Input type="number" defaultValue="3" />
              </div>
              <div className="space-y-1.5">
                <Label>Salles de bain</Label>
                <Input type="number" defaultValue="2" />
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section>
            <header className="border-b border-foreground/10 pb-3">
              <p className="eyebrow">Commodités</p>
              <h2 className="display-lg mt-1 text-xl">Cochez ce qui est inclus</h2>
            </header>
            <div className="mt-5 flex flex-wrap gap-2">
              {AMENITIES.map((a, i) => {
                const checked = [0, 1, 3, 9].includes(i);
                return (
                  <label
                    key={a.key}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                      checked
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/20 text-foreground hover:border-foreground"
                    }`}
                  >
                    <input type="checkbox" defaultChecked={checked} className="sr-only" />
                    {checked && <CheckIcon className="h-3 w-3" />}
                    {a.label}
                  </label>
                );
              })}
            </div>
          </section>

          {/* Description */}
          <section>
            <header className="border-b border-foreground/10 pb-3">
              <p className="eyebrow">Description</p>
              <h2 className="display-lg mt-1 text-xl">Racontez le bien</h2>
            </header>
            <div className="mt-5 space-y-1.5">
              <Label htmlFor="desc">Titre de l'annonce</Label>
              <Input id="desc" defaultValue="Appartement lumineux avec terrasse, Anfa" />
            </div>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="long">Description complète</Label>
              <textarea
                id="long"
                rows={5}
                defaultValue="Magnifique appartement traversant de 120 m² au 4e étage d'une résidence sécurisée d'Anfa. Salon double exposition, 3 chambres dont une suite parentale, cuisine équipée, terrasse de 18 m²."
                className="w-full rounded-2xl border border-foreground/15 bg-background p-4 text-sm focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10"
              />
            </div>
          </section>

          {/* Photos — placeholder uploader */}
          <section>
            <header className="border-b border-foreground/10 pb-3">
              <p className="eyebrow">Photos</p>
              <h2 className="display-lg mt-1 text-xl">Ajoutez au moins 5 photos</h2>
            </header>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] rounded-2xl bg-paper-3/60"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, hsl(var(--paper-2)) 0 10px, hsl(var(--paper-3)) 10px 20px)",
                  }}
                >
                  <span className="absolute bottom-2 left-2 mono rounded-sm bg-background px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]">
                    PHOTO {i + 1}
                  </span>
                </div>
              ))}
              <button
                type="button"
                className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-foreground/25 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                <PlusIcon className="h-6 w-6" />
                <span className="mono text-[10px] uppercase tracking-[0.12em]">Ajouter</span>
              </button>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 border-t border-foreground/15 pt-6">
            <Button>Continuer</Button>
            <Button variant="outline">← Retour</Button>
            <Button variant="ghost">Sauvegarder le brouillon</Button>
          </div>
        </form>

        {/* Live preview */}
        <aside className="sticky top-24 h-fit rounded-3xl border border-foreground/15 bg-surface p-5">
          <p className="eyebrow">Aperçu</p>
          <h3 className="display-lg mt-1 text-lg">Votre annonce</h3>
          <div className="mt-4 overflow-hidden rounded-2xl">
            <div
              className="aspect-[4/3]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, hsl(var(--paper-2)) 0 10px, hsl(var(--paper-3)) 10px 20px)",
              }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="eyebrow">VENTE · PRO</span>
            <span className="mono text-[10px] text-muted-foreground">BB-NEW</span>
          </div>
          <p className="display-xl mt-1 text-3xl leading-none">2 850 000 <span className="mono text-xs text-muted-foreground">MAD</span></p>
          <p className="display-lg mt-3 text-lg">Appartement lumineux avec terrasse, Anfa</p>
          <p className="mono mt-1 text-[11px] text-muted-foreground">ANFA · CASABLANCA</p>
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-foreground/10 pt-4">
            <Chip>120 M²</Chip>
            <Chip>3 CH</Chip>
            <Chip>2 SDB</Chip>
            <Chip>TERRASSE</Chip>
            <Chip>PARKING</Chip>
          </div>

          <div className="mt-5 rounded-2xl bg-paper-2/60 p-4">
            <p className="mono text-[10px] uppercase tracking-[0.12em] text-foreground">Qualité de l'annonce</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full w-[72%] rounded-full bg-foreground" />
            </div>
            <p className="mono mt-2 text-[10px] text-muted-foreground">72% · AJOUTEZ 2 PHOTOS DE PLUS</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono rounded-sm border border-foreground/15 px-1.5 py-0.5 text-[9px] font-medium">
      {children}
    </span>
  );
}
