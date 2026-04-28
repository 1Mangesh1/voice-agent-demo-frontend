import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1200px] flex-col px-8 py-10">
      {/* Top bar */}
      <header className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span
            className="font-[family-name:var(--font-display)] text-[28px] leading-none tracking-tight"
            style={{ color: "var(--color-sage-deep)" }}
          >
            Mira
          </span>
          <span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
            front desk · clinic
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
          est. 2026 — calls answered, records kept.
        </span>
      </header>

      <div className="rule mt-8" />

      {/* Hero */}
      <section className="mt-20 grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-8">
          <p className="font-[family-name:var(--font-display)] italic text-[color:var(--color-clay)] text-[20px] leading-tight">
            Pick up the phone, the rest is taken care of.
          </p>
          <h1
            className="font-[family-name:var(--font-display)] mt-3 text-[clamp(54px,8vw,108px)] leading-[0.95] tracking-tight"
            style={{ color: "var(--color-ink)" }}
          >
            A voice that
            <br />
            <span className="italic" style={{ color: "var(--color-sage-deep)" }}>
              listens, books, remembers.
            </span>
          </h1>
          <p className="mt-8 max-w-[52ch] text-[15px] leading-[1.7] text-[color:var(--color-ink-soft)]">
            Mira is the receptionist who never forgets a name. Speak naturally — she will identify you,
            read out tomorrow&rsquo;s slots, hold your booking, and send you on your way.
          </p>

          <div className="mt-12 flex items-center gap-6">
            <Link
              href="/call"
              className="group inline-flex items-center gap-3 rounded-full px-6 py-3 text-[14px] tracking-tight transition"
              style={{
                background: "var(--color-ink)",
                color: "var(--color-bone)",
              }}
            >
              <span
                className="relative flex h-2 w-2 items-center justify-center"
                aria-hidden
              >
                <span
                  className="absolute h-2 w-2 rounded-full"
                  style={{ background: "var(--color-clay)" }}
                />
                <span
                  className="absolute h-2 w-2 rounded-full live-ring"
                  style={{ background: "var(--color-clay)" }}
                />
              </span>
              Begin a call
              <span className="font-[family-name:var(--font-display)] italic transition group-hover:translate-x-1">
                →
              </span>
            </Link>
            <span className="text-[12px] tracking-[0.18em] uppercase text-[color:var(--color-ink-mute)]">
              microphone · headphones recommended
            </span>
          </div>
        </div>

        <aside className="col-span-12 md:col-span-4 md:pl-10 md:border-l border-[color:var(--color-line)]">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
            What she can do
          </p>
          <ul className="mt-5 space-y-4 text-[14px] leading-[1.6] text-[color:var(--color-ink-soft)]">
            {[
              ["i.", "Identify you by phone."],
              ["ii.", "Read out available slots."],
              ["iii.", "Book, modify, or cancel."],
              ["iv.", "Recall every visit."],
              ["v.", "Hand back a tidy summary."],
            ].map(([n, t]) => (
              <li key={n} className="flex gap-4">
                <span
                  className="font-[family-name:var(--font-display)] italic text-[15px] shrink-0 w-6"
                  style={{ color: "var(--color-clay)" }}
                >
                  {n}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* Footer marks */}
      <footer className="mt-auto flex items-end justify-between pt-24 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-mute)]">
        <span>livekit · deepgram · cartesia · gemini</span>
        <span className="font-[family-name:var(--font-display)] not-italic text-[13px] tracking-normal">
          № 001
        </span>
      </footer>
    </main>
  );
}
