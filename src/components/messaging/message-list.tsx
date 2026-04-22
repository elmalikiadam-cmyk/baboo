"use client";

import { useEffect, useRef } from "react";

interface Msg {
  id: string;
  body: string;
  createdAt: string;
  isMine: boolean;
}

const TIME_FR = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});
const DATE_LONG_FR = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function MessageList({ messages }: { messages: Msg[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted">
          Aucun message encore. Écrivez le premier.
        </p>
      </div>
    );
  }

  let lastDay = "";
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <ul className="space-y-3">
        {messages.map((m) => {
          const d = new Date(m.createdAt);
          const day = DATE_LONG_FR.format(d);
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <li key={m.id}>
              {showDay && (
                <div className="my-4 text-center">
                  <span className="mono rounded-full bg-cream-2 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                    {day}
                  </span>
                </div>
              )}
              <div className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-md px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.isMine
                      ? "bg-midnight text-cream"
                      : "bg-cream text-midnight border border-midnight/10"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={`mono mt-1 text-[9px] uppercase tracking-[0.1em] ${
                      m.isMine ? "text-cream/60" : "text-muted"
                    }`}
                  >
                    {TIME_FR.format(d)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div ref={bottomRef} />
    </div>
  );
}
