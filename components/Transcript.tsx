"use client";

import { useEffect, useRef } from "react";
import type { TranscriptTurn } from "@/lib/types";

export function Transcript({ turns }: { turns: TranscriptTurn[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [turns.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--color-ink-mute)" }}>
          transcript
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--color-ink-mute)" }}>
          {turns.length} turns
        </span>
      </div>
      <div className="rule mt-2" />

      <div ref={ref} className="mt-4 flex-1 overflow-y-auto pr-2">
        {turns.length === 0 ? (
          <p className="font-[family-name:var(--font-display)] italic text-[15px]" style={{ color: "var(--color-ink-mute)" }}>
            Say hello when you&rsquo;re ready.
          </p>
        ) : (
          <ol className="space-y-4">
            {turns.map((t, i) => (
              <li key={i} className="grid grid-cols-[64px_1fr] gap-4">
                <span
                  className="font-[family-name:var(--font-display)] italic text-[13px] pt-0.5"
                  style={{ color: t.role === "user" ? "var(--color-clay)" : "var(--color-sage-deep)" }}
                >
                  {t.role === "user" ? "you" : "Mira"}
                </span>
                <p
                  className="text-[15px] leading-[1.55]"
                  style={{ color: "var(--color-ink)" }}
                >
                  {t.text}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
