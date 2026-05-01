"use client";

import { useEffect, useRef } from "react";
import { useParticipantIds, useVideoTrack } from "@daily-co/daily-react";

export function Avatar({ live }: { live: boolean }) {
  const replicaIds = useParticipantIds({
    filter: (p) => p.user_id?.includes("tavus-replica") ?? false,
  });
  const replicaId = replicaIds[0];
  const videoState = useVideoTrack(replicaId ?? "");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (replicaId)
      console.log(
        "[avatar] replica",
        replicaId,
        "isOff:",
        videoState?.isOff,
        "state:",
        videoState?.state,
        "hasTrack:",
        !!videoState?.persistentTrack
      );
  }, [replicaId, videoState?.isOff, videoState?.state, videoState?.persistentTrack]);

  useEffect(() => {
    const el = videoRef.current;
    const track = videoState?.persistentTrack;
    if (!el || !track) return;
    el.srcObject = new MediaStream([track]);
    el.play().catch(() => {});
    return () => {
      el.srcObject = null;
    };
  }, [videoState?.persistentTrack]);

  const showVideo = replicaId && videoState?.persistentTrack && !videoState?.isOff;

  return (
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
        style={{ objectFit: "cover", display: showVideo ? "block" : "none" }}
      />

      {!showVideo && (
        <div
          className={`absolute inset-1/4 rounded-full ${live ? "breathe" : ""}`}
          style={{ background: live ? "var(--color-signal)" : "transparent" }}
        />
      )}
    </div>
  );
}
