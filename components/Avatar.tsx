"use client";

import { useEffect, useRef } from "react";
import {
  DailyVideo,
  useParticipantIds,
  useVideoTrack,
} from "@daily-co/daily-react";

export function Avatar({ live }: { live: boolean }) {
  const replicaIds = useParticipantIds({
    filter: (p) => p.user_id?.includes("tavus-replica") ?? false,
  });
  const replicaId = replicaIds[0];
  const videoState = useVideoTrack(replicaId ?? "");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!replicaId) return;
    console.log(
      "[avatar] id=",
      replicaId,
      "state=",
      videoState?.state,
      "isOff=",
      videoState?.isOff,
      "track=",
      !!videoState?.track,
      "persistentTrack=",
      !!videoState?.persistentTrack
    );
  }, [
    replicaId,
    videoState?.state,
    videoState?.isOff,
    videoState?.track,
    videoState?.persistentTrack,
  ]);

  useEffect(() => {
    const el = videoRef.current;
    const track = videoState?.persistentTrack ?? videoState?.track;
    if (!el || !track) return;
    el.srcObject = new MediaStream([track]);
    el.play().catch((e) => console.warn("[avatar] play() rejected:", e?.message ?? e));
    return () => {
      el.srcObject = null;
    };
  }, [videoState?.persistentTrack, videoState?.track]);

  return (
    <div className="relative">
      <div
        className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-full"
        style={{
          background: "var(--color-ink)",
          border: live ? "1px solid var(--color-signal)" : "1px solid var(--color-hairline)",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: "cover" }}
        />

        {!replicaId && (
          <div
            className={`absolute inset-1/4 rounded-full ${live ? "breathe" : ""}`}
            style={{ background: live ? "var(--color-signal)" : "transparent" }}
          />
        )}
      </div>

      {replicaId ? (
        <div className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 overflow-hidden rounded-md border border-[color:var(--color-hairline)] bg-[color:var(--color-ink)]">
          <DailyVideo
            sessionId={replicaId}
            type="video"
            automirror={false}
            fit="cover"
            className="h-full w-full"
          />
        </div>
      ) : null}
    </div>
  );
}
