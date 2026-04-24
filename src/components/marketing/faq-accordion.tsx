"use client";

import { useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * Accordion FAQ homepage — Strate 1 (ton posé, pédagogue).
 * Question cliquable, réponse déroulée avec transition douce.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <ul className="divide-y divide-midnight/10 rounded-2xl border border-midnight/10 bg-cream">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-cream-2 md:px-6"
            >
              <span className="display-md text-base text-midnight md:text-lg">
                {item.question}
              </span>
              <span
                className={`mono shrink-0 text-[14px] text-midnight transition-transform ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                ▾
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground md:px-6 md:pb-6 md:text-base">
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
