"use client";

import { useEffect, useRef } from "react";

type Props = {
  stream?: MediaStream | null;
  speaking: boolean;
  live: boolean;
};

export function Avatar({ stream, speaking, live }: Props) {
  const orbRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!stream) return;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.65;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    let smoothed = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const target = Math.min(1, rms * 5);
      smoothed += (target - smoothed) * 0.25;

      const orb = orbRef.current;
      const ring = ringRef.current;
      if (orb) {
        const scale = 1 + smoothed * 0.18;
        orb.style.transform = `scale(${scale})`;
      }
      if (ring) {
        const ringScale = 1 + smoothed * 0.5;
        ring.style.transform = `scale(${ringScale})`;
        ring.style.opacity = String(0.15 + smoothed * 0.4);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      try {
        src.disconnect();
        analyser.disconnect();
        ctx.close();
      } catch {}
    };
  }, [stream]);

  return (
    <div className="relative flex aspect-square w-full max-w-[320px] items-center justify-center">
      <div
        ref={ringRef}
        className="pointer-events-none absolute h-[280px] w-[280px] rounded-full transition-opacity"
        style={{
          border: `1px solid var(--color-signal)`,
          opacity: live ? 0.2 : 0,
        }}
        aria-hidden
      />

      <div
        ref={orbRef}
        className={`relative h-[200px] w-[200px] rounded-full transition-colors duration-500 ${
          live && !speaking ? "breathe" : ""
        }`}
        style={{
          background: live
            ? speaking
              ? "var(--color-signal)"
              : "var(--color-ink)"
            : "transparent",
          border: live ? "none" : "1px solid var(--color-hairline)",
        }}
      />
    </div>
  );
}
