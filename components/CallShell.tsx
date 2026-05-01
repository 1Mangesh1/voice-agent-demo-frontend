"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import {
  DailyAudio,
  DailyProvider,
  useDaily,
  useDailyEvent,
  useParticipantIds,
} from "@daily-co/daily-react";
import { Avatar } from "./Avatar";
import { Transcript } from "./Transcript";
import { SummaryView } from "./SummaryView";
import { toolLabel } from "@/lib/labels";
import type { SummaryPayload, ToolEvent, TranscriptTurn } from "@/lib/types";

type Phase = "idle" | "connecting" | "live" | "ended" | "summarizing" | "summary";
type ToolStatus = "running" | "done" | "failed";
type ToolTick = { name: ToolEvent["name"]; status: ToolStatus; ts: number };

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const TOOL_PREFIX = "[tool_result]";

export function CallShell() {
  const [call, setCall] = useState<DailyCall | null>(null);

  useEffect(() => {
    const c = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: false,
      subscribeToTracksAutomatically: true,
    });
    setCall(c);
    return () => {
      c.destroy();
    };
  }, []);

  if (!call) return null;

  return (
    <DailyProvider callObject={call}>
      <Inner />
    </DailyProvider>
  );
}

function Inner() {
  const daily = useDaily();
  const [phase, setPhase] = useState<Phase>("idle");
  const [tool, setTool] = useState<ToolTick | null>(null);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const toolTimerRef = useRef<number | null>(null);

  const sendRespond = useCallback(
    (text: string) => {
      daily?.sendAppMessage(
        { message_type: "conversation", event_type: "conversation.respond", properties: { text } },
        "*"
      );
    },
    [daily]
  );

  const runTool = useCallback(
    async (name: string, args: Record<string, unknown>) => {
      const conv = conversationIdRef.current;
      try {
        const r = await fetch(`${BACKEND}/tools/${name}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ args, conversation_id: conv }),
        });
        const data = await r.json();
        return data.result ?? { ok: false, error: "no_result" };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    },
    []
  );

  useDailyEvent(
    "app-message",
    useCallback(
      async (ev: { data?: { event_type?: string; message_type?: string; properties?: Record<string, unknown> } }) => {
        const d = ev.data ?? {};
        const type = d.event_type || d.message_type || "";
        const props = (d.properties ?? {}) as Record<string, unknown>;

        if (type === "conversation.tool_call") {
          const name = String(props.name || "");
          let args: Record<string, unknown> = {};
          const raw = props.arguments;
          if (typeof raw === "string") {
            try {
              args = JSON.parse(raw);
            } catch {
              args = {};
            }
          } else if (raw && typeof raw === "object") {
            args = raw as Record<string, unknown>;
          }

          setTool({ name: name as ToolEvent["name"], status: "running", ts: Date.now() });
          if (toolTimerRef.current) window.clearTimeout(toolTimerRef.current);

          const result = await runTool(name, args);
          sendRespond(`${TOOL_PREFIX} ${name} ${JSON.stringify(result)}`);

          const ok = result?.ok === true;
          setTool({
            name: name as ToolEvent["name"],
            status: ok ? "done" : "failed",
            ts: Date.now(),
          });
          toolTimerRef.current = window.setTimeout(() => setTool(null), 3500);
          return;
        }

        if (type === "conversation.utterance" || type.endsWith("utterance")) {
          const role = String(props.role || props.speaker || "user");
          const text = String(props.speech || props.text || "");
          if (!text.trim()) return;
          if (text.includes(TOOL_PREFIX)) return;
          const isReplica = role.startsWith("repl") || role === "replica" || role === "assistant";
          const turn: TranscriptTurn = {
            role: isReplica ? "assistant" : "user",
            text,
            ts: Date.now(),
          };
          setTurns((p) => [...p, turn]);
          if (conversationIdRef.current) {
            fetch(`${BACKEND}/transcript`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                conversation_id: conversationIdRef.current,
                role: turn.role,
                text: turn.text,
              }),
            }).catch(() => {});
          }
        }
      },
      [runTool, sendRespond]
    )
  );

  useDailyEvent(
    "joined-meeting",
    useCallback(() => {
      console.log("[daily] joined-meeting");
      setPhase("live");
    }, [])
  );

  useDailyEvent(
    "participant-joined",
    useCallback((ev) => console.log("[daily] participant-joined", ev?.participant?.user_name, ev?.participant?.session_id), [])
  );

  useDailyEvent(
    "track-started",
    useCallback((ev) => console.log("[daily] track-started", ev?.participant?.user_name, ev?.track?.kind), [])
  );

  useDailyEvent(
    "error",
    useCallback((ev) => console.error("[daily] error", ev), [])
  );

  useDailyEvent(
    "left-meeting",
    useCallback(() => setPhase((p) => (p === "live" ? "ended" : p)), [])
  );

  const connect = useCallback(async () => {
    setPhase("connecting");
    setTool(null);
    setTurns([]);
    setSummary(null);

    let conv: { conversation_id: string; conversation_url: string; meeting_token?: string };
    try {
      conv = await fetch(`${BACKEND}/tavus/start`, { method: "POST" }).then((r) => r.json());
    } catch (e) {
      alert("Failed to start call");
      setPhase("idle");
      return;
    }
    conversationIdRef.current = conv.conversation_id;

    const joinArgs: Parameters<NonNullable<typeof daily>["join"]>[0] = {
      url: conv.conversation_url,
      startAudioOff: false,
      startVideoOff: true,
    };
    if (conv.meeting_token) joinArgs.token = conv.meeting_token;

    try {
      await daily?.join(joinArgs);
    } catch (e) {
      console.error(e);
      setPhase("idle");
    }
  }, [daily]);

  const hangup = useCallback(async () => {
    setPhase("summarizing");
    try {
      await daily?.leave();
    } catch {}
    const room = conversationIdRef.current;
    if (!room) {
      setPhase("idle");
      return;
    }
    try {
      const data = (await fetch(`${BACKEND}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room }),
      }).then((r) => r.json())) as SummaryPayload;
      setSummary(data);
      setPhase("summary");
    } catch (e) {
      console.error(e);
      setPhase("ended");
    }
  }, [daily]);

  const live = phase === "live" || phase === "connecting";
  const summarizing = phase === "summarizing";
  const remoteIds = useParticipantIds({ filter: "remote" });

  if (phase === "summary" || phase === "summarizing") {
    return (
      <main className="mx-auto min-h-dvh max-w-[680px] px-6 py-8">
        <Header
          phase={phase}
          onPrimary={() => {
            setPhase("idle");
            setSummary(null);
            setTurns([]);
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
              {tool.status === "running" && `${toolLabel(tool.name)}…`}
              {tool.status === "done" && `✓ ${toolLabel(tool.name)} done`}
              {tool.status === "failed" && `✗ ${toolLabel(tool.name)} failed`}
            </span>
          ) : null}
        </div>

        <div className="mt-6">
          <Avatar live={live} />
        </div>

        <p className="mt-6 text-[12px] text-[color:var(--color-mute)]">
          {phase === "idle" && "Ready"}
          {phase === "connecting" && "Connecting"}
          {phase === "live" && (remoteIds.length > 0 ? "Live" : "Waiting for Mira…")}
          {phase === "ended" && "Call ended"}
        </p>
        {live && (
          <p className="mt-1 text-[10px] text-[color:var(--color-mute)] tabular-nums">
            participants: {remoteIds.length}
          </p>
        )}
      </section>

      <section className="mt-10 flex-1 min-h-[240px]">
        <Transcript turns={turns} />
      </section>

      <DailyAudio />
    </main>
  );
}

function Header({ phase, onPrimary }: { phase: Phase; onPrimary: () => void }) {
  const live = phase === "live" || phase === "connecting";
  const summarizing = phase === "summarizing";
  const done = phase === "summary";
  const label = done ? "New call" : live ? "End" : summarizing ? "…" : "Start call";

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
