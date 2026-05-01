"use client";

import {
  DailyVideo,
  useParticipantIds,
  useVideoTrack,
} from "@daily-co/daily-react";

export function Avatar({ live }: { live: boolean }) {
  const remotes = useParticipantIds({ filter: "remote" });
  const replicaId = remotes[0];
  const videoTrack = useVideoTrack(replicaId ?? "");
  const hasVideo = !!videoTrack?.persistentTrack;

  return (
    <div
      className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-full"
      style={{
        background: "var(--color-ink)",
        border: live ? "1px solid var(--color-signal)" : "1px solid var(--color-hairline)",
      }}
    >
      {replicaId && hasVideo ? (
        <DailyVideo
          sessionId={replicaId}
          type="video"
          automirror={false}
          fit="cover"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <div
          className={`absolute inset-1/4 rounded-full ${live ? "breathe" : ""}`}
          style={{ background: live ? "var(--color-signal)" : "transparent" }}
        />
      )}
    </div>
  );
}
