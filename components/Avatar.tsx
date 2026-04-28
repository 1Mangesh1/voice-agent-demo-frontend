"use client";

import { useEffect, useRef } from "react";

/**
 * Avatar — stylized portrait with audio-driven mouth animation.
 *
 * Lip "sync" is amplitude-driven: a Web Audio AnalyserNode reads RMS from the
 * agent's audio track and maps it to a mouth aperture (height + opening curve).
 * Visemes are not phoneme-perfect but the motion follows speech naturally and
 * reads as "talking" without 3D, models, or paid services.
 *
 * Idle: gentle breathing scale + slow blink.
 * Speaking: mouth opens with audio energy, eyebrows lift subtly on peaks.
 */

type Props = {
  /** MediaStream of the agent's voice (subscribe to remote audio track). */
  stream?: MediaStream | null;
  speaking: boolean;
};

export function Avatar({ stream, speaking }: Props) {
  const mouthRef = useRef<SVGEllipseElement | null>(null);
  const browLRef = useRef<SVGPathElement | null>(null);
  const browRRef = useRef<SVGPathElement | null>(null);
  const eyeLRef = useRef<SVGEllipseElement | null>(null);
  const eyeRRef = useRef<SVGEllipseElement | null>(null);

  // Amplitude analyser
  useEffect(() => {
    if (!stream) return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length); // 0..~0.5
      const amp = Math.min(1, rms * 4); // boost into 0..1

      const mouth = mouthRef.current;
      if (mouth) {
        const ry = 2 + amp * 10;
        const rx = 12 + amp * 2;
        mouth.setAttribute("ry", ry.toFixed(2));
        mouth.setAttribute("rx", rx.toFixed(2));
      }
      const lift = amp * 1.5;
      browLRef.current?.setAttribute("transform", `translate(0 ${-lift})`);
      browRRef.current?.setAttribute("transform", `translate(0 ${-lift})`);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      try { src.disconnect(); analyser.disconnect(); ctx.close(); } catch {}
    };
  }, [stream]);

  // Blink loop
  useEffect(() => {
    let mounted = true;
    const blink = () => {
      if (!mounted) return;
      const l = eyeLRef.current; const r = eyeRRef.current;
      if (l && r) {
        l.setAttribute("ry", "0.4");
        r.setAttribute("ry", "0.4");
        setTimeout(() => {
          l.setAttribute("ry", "3.6");
          r.setAttribute("ry", "3.6");
        }, 110);
      }
      const next = 2200 + Math.random() * 3500;
      setTimeout(blink, next);
    };
    const t = setTimeout(blink, 1400);
    return () => { mounted = false; clearTimeout(t); };
  }, []);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[6px]" style={{ background: "var(--color-paper)" }}>
      {/* Engraved frame */}
      <div className="pointer-events-none absolute inset-2 rounded-[3px] border" style={{ borderColor: "var(--color-line)" }} />
      <div className="pointer-events-none absolute inset-3 rounded-[2px] border" style={{ borderColor: "var(--color-line)", opacity: 0.6 }} />

      <svg viewBox="0 0 200 250" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="skin" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="oklch(0.93 0.04 60)" />
            <stop offset="100%" stopColor="oklch(0.82 0.05 50)" />
          </radialGradient>
          <linearGradient id="hair" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.28 0.04 40)" />
            <stop offset="100%" stopColor="oklch(0.18 0.03 40)" />
          </linearGradient>
          <linearGradient id="coat" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.96 0.005 90)" />
            <stop offset="100%" stopColor="oklch(0.90 0.008 90)" />
          </linearGradient>
        </defs>

        {/* Coat / shoulders */}
        <path d="M0 250 C 30 200, 70 188, 100 188 C 130 188, 170 200, 200 250 Z" fill="url(#coat)" />
        <line x1="100" y1="190" x2="100" y2="250" stroke="oklch(0.85 0.01 90)" strokeWidth="1" />
        {/* Stethoscope hint */}
        <path d="M78 198 Q 100 225, 122 198" fill="none" stroke="var(--color-sage-deep)" strokeWidth="1.5" opacity="0.7" />
        <circle cx="76" cy="200" r="2.4" fill="var(--color-sage-deep)" opacity="0.7" />
        <circle cx="124" cy="200" r="2.4" fill="var(--color-sage-deep)" opacity="0.7" />

        {/* Neck */}
        <rect x="88" y="155" width="24" height="40" rx="6" fill="url(#skin)" />

        {/* Hair back */}
        <path d="M50 95 Q 50 35, 100 35 Q 150 35, 150 95 L 150 150 Q 130 130, 100 130 Q 70 130, 50 150 Z" fill="url(#hair)" />

        {/* Face */}
        <ellipse cx="100" cy="105" rx="42" ry="52" fill="url(#skin)" />

        {/* Hair front sweep */}
        <path d="M58 92 Q 70 60, 100 58 Q 130 56, 142 90 Q 132 75, 110 75 Q 85 75, 70 92 Z" fill="url(#hair)" />

        {/* Brows */}
        <path ref={browLRef} d="M75 92 Q 85 88, 92 92" stroke="oklch(0.22 0.03 40)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path ref={browRRef} d="M108 92 Q 115 88, 125 92" stroke="oklch(0.22 0.03 40)" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Eyes */}
        <ellipse ref={eyeLRef} cx="84" cy="106" rx="2.4" ry="3.6" fill="oklch(0.22 0.04 245)" />
        <ellipse ref={eyeRRef} cx="116" cy="106" rx="2.4" ry="3.6" fill="oklch(0.22 0.04 245)" />

        {/* Nose */}
        <path d="M100 110 Q 96 122, 100 130 Q 104 132, 105 128" stroke="oklch(0.62 0.04 50)" strokeWidth="1.3" fill="none" strokeLinecap="round" />

        {/* Mouth — animated */}
        <ellipse
          ref={mouthRef}
          cx="100"
          cy="142"
          rx="12"
          ry="2"
          fill="oklch(0.45 0.09 25)"
        />
        {/* Upper-lip highlight */}
        <path d="M88 138 Q 100 134, 112 138" stroke="oklch(0.55 0.07 25)" strokeWidth="1" fill="none" />

        {/* Cheek blush */}
        <ellipse cx="74" cy="124" rx="6" ry="4" fill="var(--color-clay)" opacity="0.18" />
        <ellipse cx="126" cy="124" rx="6" ry="4" fill="var(--color-clay)" opacity="0.18" />
      </svg>

      {/* Bottom plate */}
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--color-ink-mute)" }}>
        <span>Mira · attending</span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full transition-colors"
            style={{ background: speaking ? "var(--color-clay)" : "var(--color-sage)" }}
          />
          {speaking ? "speaking" : "listening"}
        </span>
      </div>
    </div>
  );
}
