"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendMessageAction } from "@/actions/messaging";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = value.trim();
    if (!body) return;
    setError(null);
    startTransition(async () => {
      const res = await sendMessageAction({ conversationId, body });
      if (res.ok) {
        setValue("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-foreground/10 p-3">
      {error && (
        <p className="mb-2 rounded-full bg-danger/10 px-3 py-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          maxLength={4000}
          placeholder="Écrivez votre message… (⌘/Ctrl+Entrée pour envoyer)"
          className="flex-1 resize-none rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/10"
        />
        <button
          type="submit"
          disabled={isPending || !value.trim()}
          className="inline-flex h-10 shrink-0 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? "Envoi…" : "Envoyer"}
        </button>
      </div>
    </form>
  );
}
