"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ToolFeedItem } from "@/lib/types";
import { toolLabel } from "@/lib/labels";

export function ToolFeed({ items }: { items: ToolFeedItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--color-ink-mute)" }}>
          actions taken
        </span>
        <span className="font-[family-name:var(--font-display)] italic text-[12px]" style={{ color: "var(--color-clay)" }}>
          live
        </span>
      </div>
      <div className="rule" />

      <ol className="relative mt-2 flex flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {items.length === 0 && (
            <motion.li
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[13px] italic font-[family-name:var(--font-display)]"
              style={{ color: "var(--color-ink-mute)" }}
            >
              The ledger is empty — for now.
            </motion.li>
          )}
          {items.map((item) => {
            const ok = item.status === "done" && item.result?.ok === true;
            const failed = item.status === "done" && item.result?.ok === false;
            return (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-baseline gap-3"
              >
                {/* Status mark */}
                <span className="relative inline-flex h-3 w-3 shrink-0 items-center justify-center">
                  {item.status === "running" && (
                    <span
                      className="absolute h-2 w-2 rounded-full live-ring"
                      style={{ background: "var(--color-clay)" }}
                    />
                  )}
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: ok
                        ? "var(--color-sage)"
                        : failed
                        ? "var(--color-clay)"
                        : "var(--color-clay)",
                    }}
                  />
                </span>

                {/* Label */}
                <span
                  className="font-[family-name:var(--font-display)] italic text-[15px] leading-tight"
                  style={{ color: ok ? "var(--color-sage-deep)" : "var(--color-ink)" }}
                >
                  {toolLabel(item)}
                  {item.status === "running" && <span className="caret">…</span>}
                </span>

                <ToolDetail item={item} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}

function ToolDetail({ item }: { item: ToolFeedItem }) {
  if (item.status !== "done" || !item.result?.ok) return null;
  const r = item.result as Record<string, unknown>;

  if (item.name === "fetch_slots" && Array.isArray(r.slots)) {
    return (
      <span className="text-[12px] tracking-tight" style={{ color: "var(--color-ink-soft)" }}>
        {(r.slots as string[]).length} open
      </span>
    );
  }
  if (item.name === "book_appointment" && typeof r.slot === "string") {
    return (
      <span className="text-[12px] tracking-tight" style={{ color: "var(--color-ink-soft)" }}>
        — {r.slot}
      </span>
    );
  }
  if (item.name === "identify_user" && typeof r.phone === "string") {
    return (
      <span className="text-[12px] tracking-tight" style={{ color: "var(--color-ink-soft)" }}>
        — {r.phone as string}
      </span>
    );
  }
  return null;
}
