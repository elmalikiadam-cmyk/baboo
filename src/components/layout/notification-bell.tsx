"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  markNotificationReadAction,
  markAllReadAction,
} from "@/actions/notifications";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell({
  unread,
  recent,
}: {
  unread: number;
  recent: Notif[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onItemClick(n: Notif) {
    if (!n.readAt) {
      startTransition(() => {
        void markNotificationReadAction(n.id);
      });
    }
    setOpen(false);
    if (n.linkUrl) {
      if (n.linkUrl.startsWith("http")) {
        window.open(n.linkUrl, "_blank");
      } else {
        router.push(n.linkUrl);
      }
    }
  }

  function markAllRead() {
    startTransition(async () => {
      await markAllReadAction();
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications (${unread} non lues)`}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-midnight/20 bg-white text-midnight transition-colors hover:border-midnight"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-terracotta px-1 text-[9px] font-semibold text-cream"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-40 mt-2 w-[360px] max-w-[92vw] rounded-2xl border border-midnight/10 bg-cream shadow-lg">
            <div className="flex items-center justify-between gap-2 border-b border-midnight/10 p-3">
              <p className="display-md text-[15px]">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={isPending}
                  className="mono text-[10px] uppercase tracking-[0.12em] text-terracotta hover:text-terracotta-2"
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            {recent.length === 0 ? (
              <div className="p-8 text-center">
                <p className="display-md text-sm">Aucune notification</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vous serez alerté ici des activités sur votre compte.
                </p>
              </div>
            ) : (
              <ul className="max-h-[60vh] overflow-y-auto">
                {recent.map((n) => (
                  <li
                    key={n.id}
                    className={`border-b border-midnight/5 ${n.readAt ? "" : "bg-terracotta/5"}`}
                  >
                    <button
                      type="button"
                      onClick={() => onItemClick(n)}
                      className="block w-full px-3 py-3 text-left hover:bg-cream-2"
                    >
                      <div className="flex items-start gap-2">
                        {!n.readAt && (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-terracotta"
                            aria-hidden
                          />
                        )}
                        <div className={n.readAt ? "flex-1 pl-4" : "flex-1"}>
                          <p className="text-sm font-medium text-midnight line-clamp-2">
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                              {n.body}
                            </p>
                          )}
                          <p className="mono mt-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                            {relativeTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-midnight/10 p-2">
              <Link
                href="/compte/notifications"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-center text-xs font-medium text-midnight hover:bg-cream-2"
              >
                Voir toutes les notifications →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}
