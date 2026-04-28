"use client";

import { motion } from "motion/react";
import type { SummaryPayload } from "@/lib/types";
import { formatSlot } from "@/lib/labels";

export function SummaryView({ data, loading }: { data: SummaryPayload | null; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-12 gap-8"
    >
      <div className="col-span-12 md:col-span-7">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--color-ink-mute)" }}>
          after the call
        </p>
        <h2
          className="font-[family-name:var(--font-display)] mt-2 text-[clamp(40px,5vw,64px)] leading-[0.95] tracking-tight"
          style={{ color: "var(--color-ink)" }}
        >
          A note from <span className="italic" style={{ color: "var(--color-sage-deep)" }}>Mira</span>.
        </h2>
        <div className="rule mt-6" />
        {loading || !data?.summary ? (
          <p
            className="mt-6 font-[family-name:var(--font-display)] italic text-[18px]"
            style={{ color: "var(--color-ink-mute)" }}
          >
            Composing<span className="caret">…</span>
          </p>
        ) : (
          <pre
            className="mt-6 whitespace-pre-wrap font-[family-name:var(--font-body)] text-[15px] leading-[1.7]"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {data.summary}
          </pre>
        )}
      </div>

      <aside className="col-span-12 md:col-span-5 md:pl-10 md:border-l border-[color:var(--color-line)]">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--color-ink-mute)" }}>
          appointments on file
        </p>
        {!data?.appointments?.length ? (
          <p
            className="mt-4 font-[family-name:var(--font-display)] italic text-[16px]"
            style={{ color: "var(--color-ink-mute)" }}
          >
            None yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.appointments.map((a) => (
              <li
                key={a.id}
                className="flex items-baseline justify-between border-b border-dashed pb-3"
                style={{ borderColor: "var(--color-line)" }}
              >
                <span
                  className="font-[family-name:var(--font-display)] italic text-[18px]"
                  style={{
                    color:
                      a.status === "confirmed" ? "var(--color-sage-deep)" : "var(--color-ink-mute)",
                    textDecoration: a.status === "cancelled" ? "line-through" : undefined,
                  }}
                >
                  {formatSlot(a.slot)}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--color-ink-mute)" }}
                >
                  № {a.id}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--color-ink-mute)" }}>
          stamped
        </p>
        <p
          className="mt-2 font-[family-name:var(--font-display)] text-[16px]"
          style={{ color: "var(--color-ink)" }}
        >
          {data?.ended_at ? new Date(data.ended_at).toLocaleString() : "—"}
        </p>
      </aside>
    </motion.div>
  );
}
