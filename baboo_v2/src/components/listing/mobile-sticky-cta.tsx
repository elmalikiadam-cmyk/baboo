import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "@/components/ui/icons";

interface Props {
  phone?: string | null;
}

/**
 * Sticky CTA fiche détail mobile. Positionné AU-DESSUS de la bottom nav
 * (bottom = 84px = hauteur de la bottom nav).
 * Caché sur md:+.
 */
export function MobileStickyCta({ phone }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-[84px] z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-2">
        <a
          href={phone ? `tel:${phone.replace(/\s+/g, "")}` : undefined}
          aria-label="Appeler"
          aria-disabled={!phone}
          className="aria-disabled:opacity-50 aria-disabled:pointer-events-none"
        >
          <IconButton variant="soft" size="lg">
            <Phone size={18} strokeWidth={1.8} />
          </IconButton>
        </a>
        <Button size="lg" className="flex-1">
          <MessageCircle size={16} strokeWidth={2} aria-hidden />
          Contacter
        </Button>
      </div>
    </div>
  );
}
