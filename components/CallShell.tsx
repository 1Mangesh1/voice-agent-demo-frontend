"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConnectionState,
  RemoteAudioTrack,
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
} from "livekit-client";
import { Avatar } from "./Avatar";
import { Transcript } from "./Transcript";
import { SummaryView } from "./SummaryView";
import { toolLabel } from "@/lib/labels";
import type { SummaryPayload, ToolEvent, TranscriptTurn } from "@/lib/types";

type Phase = "idle" | "connecting" | "live" | "ended" | "summarizing" | "summary";
type ToolTick = { name: ToolEvent["name"]; status: ToolEvent["status"]; ts: number };

export function CallShell() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [tool, setTool] = useState<ToolTick | null>(null);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [agentStream, setAgentStream] = useState<MediaStream | null>(null);
  const [agentSpeaking, setAgentSpeaking] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const roomNameRef = useRef<string | null>(null);
  const toolTimerRef = useRef<number | null>(null);

  const onData = useCallback((payload: Uint8Array) => {
    let parsed: ToolEvent | { type: string };
    try {
      parsed = JSON.parse(new TextDecoder().decode(payload));
    } catch {
      return;
    }
    if (parsed.type === "tool") {
      const ev = parsed as ToolEvent;
      setTool({ name: ev.name, status: ev.status, ts: Date.now() });
      if (toolTimerRef.current) window.clearTimeout(toolTimerRef.current);
      if (ev.status === "done") {
        toolTimerRef.current = window.setTimeout(() => setTool(null), 3500);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setPhase("connecting");
    setTool(null);
    setTurns([]);
    setSummary(null);

    const r = await fetch("/api/token", { method: "POST", body: "{}" }).then((x) =>
      x.json()
    );
    if (!r.token || !r.url) {
      alert("Token endpoint failed.");
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
        at.attach();
      }
    });

    room.on(
      RoomEvent.ActiveSpeakersChanged,
      (speakers: RemoteParticipant[] | { identity: string }[]) => {
        setAgentSpeaking(
          (speakers as { identity: string }[]).some((p) =>
            p.identity?.startsWith("agent")
          )
        );
      }
    );

    room.on(RoomEvent.TranscriptionReceived, (segments) => {
      for (const seg of segments) {
        if (!seg.final) continue;
        setTurns((prev) => [...prev, { role: "user", text: seg.text, ts: Date.now() }]);
      }
    });

    room.on(RoomEvent.ConnectionStateChanged, (s) => {
      if (s === ConnectionState.Disconnected)
        setPhase((p) => (p === "live" ? "ended" : p));
    });

    await room.connect(r.url, r.token);
    await room.localParticipant.setMicrophoneEnabled(true);
    setPhase("live");
  }, [onData]);

  const hangup = useCallback(async () => {
    setPhase("summarizing");
    const room = roomRef.current;
    const name = roomNameRef.current;
    try {
      await room?.disconnect();
    } catch {}
    if (!name) {
      setPhase("idle");
      return;
    }

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

  useEffect(
    () => () => {
      roomRef.current?.disconnect().catch(() => {});
    },
    []
  );

  const live = phase === "live" || phase === "connecting";
  const summarizing = phase === "summarizing";

  if (phase === "summary" || phase === "summarizing") {
    return (
      <main className="mx-auto min-h-dvh max-w-[680px] px-6 py-8">
        <Header
          phase={phase}
          onPrimary={() => {
            setPhase("idle");
            setSummary(null);
          }}
        />
        <section className="mt-16">
          <SummaryView data={summary} loading={summarizing} />
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[680px] flex-col px-6 py-8">
      <Header phase={phase} onPrimary={live ? hangup : connect} />

      <section className="mt-12 flex flex-col items-center">
        <div className="h-5 text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-signal)]">
          {tool ? (
            <span className="tool-in">
              {toolLabel(tool.name)}
              {tool.status === "running" ? "…" : ""}
            </span>
          ) : null}
        </div>

        <div className="mt-6">
          <Avatar stream={agentStream} speaking={agentSpeaking} live={live} />
        </div>

        <p className="mt-6 text-[12px] text-[color:var(--color-mute)]">
          {phase === "idle" && "Ready"}
          {phase === "connecting" && "Connecting"}
          {phase === "live" && (agentSpeaking ? "Mira speaking" : "Listening")}
          {phase === "ended" && "Call ended"}
        </p>
      </section>

      <section className="mt-10 flex-1 min-h-[240px]">
        <Transcript turns={turns} />
      </section>
    </main>
  );
}

function Header({ phase, onPrimary }: { phase: Phase; onPrimary: () => void }) {
  const live = phase === "live" || phase === "connecting";
  const summarizing = phase === "summarizing";
  const done = phase === "summary";
  const label = done
    ? "New call"
    : live
    ? "End"
    : summarizing
    ? "…"
    : "Start call";

  return (
    <header className="flex items-center justify-between text-[12px]">
      <div className="flex items-center gap-3">
        <span className="font-medium tracking-tight">Mira</span>
        {live && (
          <span className="flex items-center gap-1.5 text-[color:var(--color-signal)]">
            <span className="signal-pulse h-1.5 w-1.5 rounded-full bg-[color:var(--color-signal)]" />
            live
          </span>
        )}
      </div>

      <button
        onClick={onPrimary}
        disabled={summarizing}
        className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition disabled:opacity-40"
        style={{
          background: live ? "transparent" : "var(--color-ink)",
          color: live ? "var(--color-ink)" : "var(--color-paper)",
          border: live ? "1px solid var(--color-ink)" : "none",
        }}
      >
        {label}
      </button>
    </header>
  );
}
