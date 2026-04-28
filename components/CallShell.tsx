"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ConnectionState,
  RemoteAudioTrack,
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
} from "livekit-client";
import { Avatar } from "./Avatar";
import { ToolFeed } from "./ToolFeed";
import { Transcript } from "./Transcript";
import { SummaryView } from "./SummaryView";
import type { SummaryPayload, ToolEvent, ToolFeedItem, TranscriptTurn } from "@/lib/types";

type Phase = "idle" | "connecting" | "live" | "ended" | "summarizing" | "summary";

export function CallShell() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [tools, setTools] = useState<ToolFeedItem[]>([]);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [agentStream, setAgentStream] = useState<MediaStream | null>(null);
  const [agentSpeaking, setAgentSpeaking] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const roomNameRef = useRef<string | null>(null);

  // ---- Tool / transcript event handlers (room data channel) ----
  const onData = useCallback((payload: Uint8Array) => {
    let parsed: ToolEvent | { type: "transcript"; role: "user" | "assistant"; text: string };
    try {
      parsed = JSON.parse(new TextDecoder().decode(payload));
    } catch { return; }
    if (parsed.type === "tool") {
      setTools((prev) => {
        const ev = parsed as ToolEvent;
        if (ev.status === "running") {
          return [
            ...prev,
            { ...ev, id: `${ev.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ts: Date.now() },
          ];
        }
        const idx = [...prev].reverse().findIndex(
          (i) => i.name === ev.name && i.status === "running"
        );
        if (idx === -1) {
          return [
            ...prev,
            { ...ev, id: `${ev.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ts: Date.now() },
          ];
        }
        const realIdx = prev.length - 1 - idx;
        const next = [...prev];
        next[realIdx] = { ...next[realIdx], ...ev };
        return next;
      });
    }
  }, []);

  const connect = useCallback(async () => {
    setPhase("connecting");
    setTools([]); setTurns([]); setSummary(null);

    const r = await fetch("/api/token", { method: "POST", body: "{}" }).then((x) => x.json());
    if (!r.token || !r.url) {
      alert("Token endpoint failed. Check LIVEKIT env vars.");
      setPhase("idle");
      return;
    }
    roomNameRef.current = r.room;

    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;

    room.on(RoomEvent.DataReceived, onData);

    room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      if (track.kind === Track.Kind.Audio && participant.identity.startsWith("agent")) {
        const at = track as RemoteAudioTrack;
        const ms = new MediaStream([at.mediaStreamTrack]);
        setAgentStream(ms);
        at.attach(); // creates a hidden audio el; don't append; LiveKit plays via track auto-attach if we add a sink
      }
    });

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: RemoteParticipant[] | { identity: string }[]) => {
      setAgentSpeaking(
        (speakers as { identity: string }[]).some((p) => p.identity?.startsWith("agent"))
      );
    });

    room.on(RoomEvent.TranscriptionReceived, (segments) => {
      // LiveKit auto-emitted user transcription; assistant text comes via item events on agent side.
      for (const seg of segments) {
        if (!seg.final) continue;
        setTurns((prev) => [...prev, { role: "user", text: seg.text, ts: Date.now() }]);
      }
    });

    room.on(RoomEvent.ConnectionStateChanged, (s) => {
      if (s === ConnectionState.Disconnected) setPhase((p) => (p === "live" ? "ended" : p));
    });

    await room.connect(r.url, r.token);
    await room.localParticipant.setMicrophoneEnabled(true);
    setPhase("live");
  }, [onData]);

  const hangup = useCallback(async () => {
    setPhase("summarizing");
    const room = roomRef.current;
    const name = roomNameRef.current;
    try { await room?.disconnect(); } catch {}
    if (!name) { setPhase("idle"); return; }

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    try {
      const res = await fetch(`${backend}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: name }),
      });
      const data = (await res.json()) as SummaryPayload;
      setSummary(data);
      setPhase("summary");
    } catch (e) {
      console.error(e);
      setPhase("ended");
    }
  }, []);

  useEffect(() => () => { roomRef.current?.disconnect().catch(() => {}); }, []);

  const isLive = phase === "live" || phase === "connecting";

  // ---- Render ----
  if (phase === "summary" || phase === "summarizing") {
    return (
      <main className="mx-auto min-h-dvh max-w-[1200px] px-8 py-10">
        <Header phase={phase} onPrimary={() => { setPhase("idle"); setSummary(null); }} />
        <div className="rule mt-8" />
        <section className="mt-16">
          <SummaryView data={summary} loading={phase === "summarizing"} />
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[1200px] px-8 py-10">
      <Header phase={phase} onPrimary={isLive ? hangup : connect} />
      <div className="rule mt-8" />

      <section className="mt-10 grid grid-cols-12 gap-8">
        {/* Left: avatar + tool feed */}
        <div className="col-span-12 md:col-span-5">
          <div className="max-w-[360px]">
            <Avatar stream={agentStream} speaking={agentSpeaking} />
          </div>
          <div className="mt-8 max-w-[420px]">
            <ToolFeed items={tools} />
          </div>
        </div>

        {/* Right: transcript */}
        <div className="col-span-12 md:col-span-7 md:pl-10 md:border-l border-[color:var(--color-line)]">
          <div className="h-[640px]">
            <Transcript turns={turns} />
          </div>
        </div>
      </section>
    </main>
  );
}

function Header({ phase, onPrimary }: { phase: Phase; onPrimary: () => void }) {
  const live = phase === "live" || phase === "connecting";
  const summarizing = phase === "summarizing";
  const summary = phase === "summary";
  return (
    <header className="flex items-baseline justify-between gap-6">
      <div className="flex items-baseline gap-3">
        <span
          className="font-[family-name:var(--font-display)] text-[28px] leading-none tracking-tight"
          style={{ color: "var(--color-sage-deep)" }}
        >
          Mira
        </span>
        <span
          className="text-[11px] uppercase tracking-[0.22em]"
          style={{ color: "var(--color-ink-mute)" }}
        >
          {phase === "idle" && "ready when you are"}
          {phase === "connecting" && "connecting"}
          {phase === "live" && "in conversation"}
          {phase === "ended" && "call ended"}
          {phase === "summarizing" && "composing summary"}
          {phase === "summary" && "after the call"}
        </span>
      </div>

      <button
        onClick={onPrimary}
        disabled={summarizing}
        className="group inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-[13px] tracking-tight transition disabled:opacity-50"
        style={{
          background: live ? "transparent" : "var(--color-ink)",
          color: live ? "var(--color-ink)" : "var(--color-bone)",
          border: live ? "1px solid var(--color-ink)" : "none",
        }}
      >
        {live && (
          <span className="relative flex h-2 w-2 items-center justify-center" aria-hidden>
            <span className="absolute h-2 w-2 rounded-full" style={{ background: "var(--color-clay)" }} />
            <span className="absolute h-2 w-2 rounded-full live-ring" style={{ background: "var(--color-clay)" }} />
          </span>
        )}
        {summary ? "Begin again" : live ? "End call" : summarizing ? "Composing…" : "Begin a call"}
      </button>
    </header>
  );
}
