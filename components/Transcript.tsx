"use client";

import { useEffect, useRef } from "react";
import type { TranscriptTurn } from "@/lib/types";

export function Transcript({ turns }: { turns: TranscriptTurn[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [turns.length]);

  return (
    <div ref={ref} className="h-full overflow-y-auto pr-1">
      {turns.length === 0 ? (
        <p className="text-center text-[14px] text-[color:var(--color-mute)]">
          Say hello.
        </p>
      ) : (
        <ol className="space-y-3">
          {turns.map((t, i) => (
            <li
              key={i}
              className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <p
                className="max-w-[85%] text-[15px] leading-[1.5]"
                style={{
                  color:
                    t.role === "user"
                      ? "var(--color-signal)"
                      : "var(--color-ink)",
                }}
              >
                {t.text}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
