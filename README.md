# voice-agent-demo-frontend

Next.js 16 + Tailwind v4 + Daily React.

Two pages: landing + call. Call page is where the work happens.

## Press Start. What happens.

1. `POST /tavus/start` → Daily room URL.
2. Daily call object joins. Mic on, no camera.
3. Tavus replica (Mira / Anna's face) joins ~5s later. Video fills the tile, audio plays via `<DailyAudio />`.
4. Mira talks → her LLM emits `conversation.tool_call` Daily app-message.
5. Frontend POSTs `/tools/{name}` → JSON result → broadcasts back as `conversation.respond` (prefixed `[tool_result]`, hidden from UI transcript).
6. Mira reads the result naturally.
7. Every utterance lands in the transcript panel + posted to `/transcript` for the summary.
8. End → `daily.leave()` → `/summary`. Card shows: count, Gemini bullets, on-file appointments, duration, cost ($ + ₹), stamped time.

## Layout

```
app/
  page.tsx          landing + warmup ping
  call/page.tsx     mounts <CallShell />
components/
  CallShell.tsx     Daily lifecycle, tool dispatch, phase machine
  Avatar.tsx        Daniel/Anna's video tile (DailyVideo)
  Transcript.tsx    centered turns, color-coded
  SummaryView.tsx   numeral + bullets + cost
  Warmup.tsx        ping /health on landing mount
lib/
  types.ts, labels.ts
```

## Look

Geist alone, paper white, near-black, one persimmon signal color. No drop shadows, no glass, no serifs. Mira left in ink, you right in persimmon.

## Run local

```bash
npm install
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev
```

Backend repo must be running.

## Deploy

```bash
vercel --prod
```

Only env: `NEXT_PUBLIC_BACKEND_URL`.

## Notes

- Tavus owns STT + LLM + TTS + face. Frontend owns UI + tool dispatch.
- `<DailyVideo>` + `useParticipantIds({ filter: p => p.user_id?.includes('tavus-replica') })` is the canonical Tavus pattern.
- Tool ticker shows last tool: `Identifying…` → `✓ done`, fades in 3.5s.
- Landing pings backend `/health` on mount → cold-start budget burns while user reads, not after they click.
