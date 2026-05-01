import Link from "next/link";
import { Warmup } from "@/components/Warmup";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[680px] flex-col px-6 py-8">
      <Warmup />
      <header className="flex items-center justify-between text-[12px]">
        <span className="font-medium tracking-tight">Mira</span>
        <span className="text-[color:var(--color-mute)] tabular-nums">00 / 01</span>
      </header>

      <section className="enter mt-[18vh]">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-mute)]">
          voice front desk
        </p>

        <h1 className="mt-6 text-[clamp(56px,11vw,128px)] font-medium leading-[0.92] tracking-[-0.04em]">
          Talk to
          <br />
          the clinic.
        </h1>

        <p className="mt-10 max-w-[40ch] text-[16px] leading-[1.55] text-[color:var(--color-ink-2)]">
          One voice handles identity, scheduling, and recall.
          Speak as you would on a phone call.
        </p>

        <div className="mt-12 flex items-center gap-5">
          <Link
            href="/call"
            className="group inline-flex items-center gap-2.5 bg-[color:var(--color-ink)] px-5 py-3 text-[14px] font-medium text-[color:var(--color-paper)] transition hover:opacity-90"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-signal)]"
            />
            Start call
            <span className="transition group-hover:translate-x-0.5">→</span>
          </Link>
          <span className="text-[12px] text-[color:var(--color-mute)]">
            mic + headphones
          </span>
        </div>
      </section>

      <footer className="mt-auto pt-24 text-[11px] text-[color:var(--color-mute)]">
        <div className="hr mb-4" />
        <div className="flex justify-between tabular-nums">
          <span>tavus · daily · gemini · supabase</span>
          <span>2026</span>
        </div>
      </footer>
    </main>
  );
}
