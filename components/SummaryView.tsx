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

      <section className="mt-12 grid grid-cols-3 gap-6 text-[11px] text-[color:var(--color-mute)]">
        <div>
          <p className="uppercase tracking-[0.2em]">duration</p>
          <p className="mt-1 text-[14px] tabular-nums text-[color:var(--color-ink)]">
            {fmtDuration(data?.duration_seconds)}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-[0.2em]">cost</p>
          <p className="mt-1 text-[14px] tabular-nums text-[color:var(--color-ink)]">
            {data?.cost_usd != null ? `$${data.cost_usd.toFixed(3)}` : "—"}
          </p>
          <p className="text-[11px] tabular-nums text-[color:var(--color-mute)]">
            {data?.cost_inr != null ? `₹${data.cost_inr.toFixed(2)}` : ""}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-[0.2em]">stamped</p>
          <p className="mt-1 text-[14px] tabular-nums text-[color:var(--color-ink)]">
            {data?.ended_at ? new Date(data.ended_at).toLocaleTimeString() : "—"}
          </p>
        </div>
      </section>
    </div>
  );
}

function fmtDuration(s: number | null | undefined): string {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
