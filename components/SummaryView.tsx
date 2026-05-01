"use client";

import type { SummaryPayload } from "@/lib/types";
import { formatSlot } from "@/lib/labels";

export function SummaryView({
  data,
  loading,
}: {
  data: SummaryPayload | null;
  loading: boolean;
}) {
  const confirmed = data?.appointments?.filter((a) => a.status === "confirmed") ?? [];

  return (
    <div className="enter">
      <p className="text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-mute)]">
        after the call
      </p>

      <div className="mt-6 flex items-baseline gap-4">
        <span className="text-[clamp(64px,12vw,128px)] font-medium leading-none tracking-[-0.04em] tabular-nums">
          {confirmed.length}
        </span>
        <span className="text-[14px] text-[color:var(--color-ink-2)]">
          {confirmed.length === 1 ? "appointment booked" : "appointments booked"}
        </span>
      </div>

      <div className="hr mt-12" />

      <section className="mt-10">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-mute)]">
          summary
        </p>
        {loading || !data?.summary ? (
          <p className="mt-4 text-[15px] text-[color:var(--color-mute)]">
            Composing<span className="caret">…</span>
          </p>
        ) : (
          <pre className="mt-4 whitespace-pre-wrap font-[family-name:var(--font-sans)] text-[15px] leading-[1.65] text-[color:var(--color-ink-2)]">
            {data.summary}
          </pre>
        )}
      </section>

      {data?.appointments?.length ? (
        <section className="mt-12">
          <p className="text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-mute)]">
            on file
          </p>
          <ul className="mt-4 divide-y divide-[color:var(--color-hairline)]">
            {data.appointments.map((a) => (
              <li
                key={a.id}
                className="flex items-baseline justify-between py-3"
              >
                <span
                  className="text-[15px] tabular-nums"
                  style={{
                    color:
                      a.status === "confirmed"
                        ? "var(--color-ink)"
                        : "var(--color-mute)",
                    textDecoration:
                      a.status === "cancelled" ? "line-through" : undefined,
                  }}
                >
                  {formatSlot(a.slot)}
                </span>
                <span className="text-[11px] text-[color:var(--color-mute)] tabular-nums">
                  #{a.id}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-12 text-[11px] text-[color:var(--color-mute)] tabular-nums">
        {data?.ended_at ? new Date(data.ended_at).toLocaleString() : "—"}
      </p>
    </div>
  );
}
