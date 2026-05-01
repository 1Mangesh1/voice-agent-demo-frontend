# voice-agent-demo-frontend

Next.js 16 App Router · LiveKit React · Tailwind v4 · Motion · animated SVG avatar.

## Layout

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Landing — "A voice that listens, books, remembers." |
| `app/call/page.tsx` | The call interface (client-only). |
| `app/api/token/route.ts` | Mints LiveKit JWTs (server). |
| `components/Avatar.tsx` | Stylized SVG portrait. Audio-amplitude-driven mouth + brow. Idle blink. |
| `components/CallShell.tsx` | Joins room, listens for tool/transcript events, manages phases. |
| `components/ToolFeed.tsx` | Live ledger of tool calls — running pulse → confirmed mark. |
| `components/Transcript.tsx` | Live two-column transcript. |
| `components/SummaryView.tsx` | Post-call summary + appointment list. |

## Local run

```bash
pnpm install   # or: npm install
cp .env.example .env.local   # fill in keys
pnpm dev       # http://localhost:3000
```

Backend (separate repo) must be running on `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8000`) for `/summary` to work.

## Avatar lip-sync

Free, no signup. A Web Audio AnalyserNode reads RMS amplitude from Mira's audio track and maps it to mouth aperture. Not phoneme-perfect, but motion follows speech naturally and avoids the cost / setup of paid avatar services. Replaces TalkingHead / Tavus / Beyond Presence for the time-boxed demo. Swap to a 3D avatar later by replacing `components/Avatar.tsx`.

## Deploy

Vercel: `vercel link`, push, set env vars from `.env.example`. `LIVEKIT_API_KEY`/`SECRET` must be set so `/api/token` can sign JWTs.
