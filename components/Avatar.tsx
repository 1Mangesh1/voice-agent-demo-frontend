"use client";

import { DailyVideo, useParticipantIds } from "@daily-co/daily-react";

export function Avatar() {
  const replicaIds = useParticipantIds({
    filter: (p) => p.user_id?.includes("tavus-replica") ?? false,
  });
  const replicaId = replicaIds[0];

  if (!replicaId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-[color:var(--color-ink)] text-[12px] text-[color:var(--color-mute)]">
        waiting for Mira…
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[color:var(--color-ink)]">
      <DailyVideo
        sessionId={replicaId}
        type="video"
        automirror={false}
        fit="cover"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
