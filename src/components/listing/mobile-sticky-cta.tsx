import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { PhoneIcon, MessageCircleIcon } from "@/components/ui/icons";

interface Props {
  phone?: string | null;
  /** Si la messagerie existe pour cette annonce, on pointe le bouton primary
   *  vers un scroll / lien /messages. Sinon sur #contact-form. */
  href?: string;
}

/**
 * Sticky CTA fiche détail mobile. Positionné AU-DESSUS de la bottom nav
 * (bottom = 84px). Caché sur md:+.
 */
export function MobileStickyCta({ phone, href = "#contact-form" }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-[84px] z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-2">
        {phone ? (
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            aria-label="Appeler"
            className="shrink-0"
          >
            <IconButton variant="soft" size="lg" aria-label="Appeler">
              <PhoneIcon className="h-4 w-4" />
            </IconButton>
          </a>
        ) : null}
        <a href={href} className="flex-1">
          <Button size="lg" className="w-full">
            <MessageCircleIcon className="h-4 w-4" aria-hidden />
            Contacter
          </Button>
        </a>
      </div>
    </div>
  );
}
