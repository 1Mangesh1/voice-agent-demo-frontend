# voice-agent-demo-frontend

Next.js 16 + Tailwind v4 + Daily React.

Two pages: landing + call. Call page is where the work happens.

## Live

- Frontend: https://voice-agent-demo-frontend.vercel.app
- Backend repo: https://github.com/1Mangesh1/voice-agent-demo-backend
- Backend health: https://voice-agent-demo-api.onrender.com/health
- Demo recording: _(coming Fri)_

## On the live demo

Tavus's free tier caps at 25 conversation-minutes/month. The demo recording is the canonical walkthrough; the live URL is functional but rate-limited. Free-tier artifact, not a production constraint.

## Stack note

Backend runs Tavus CVI for the whole voice pipeline (STT + LLM + TTS + talking avatar). This frontend owns:

- joining the Daily room Tavus returns
- rendering Mira's video tile
- intercepting `conversation.tool_call` app-messages and forwarding them to the backend
- broadcasting the result back via `conversation.respond`
- the transcript, tool ticker, and post-call summary view

See the backend README for the full "Tavus vs the suggested multi-vendor stack" decision.

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

## Reviewing this

Try without setup:
1. Open https://voice-agent-demo-frontend.vercel.app/call
2. Grant mic when the browser asks
3. Wait ~5–10s for Mira's face to fill the tile
4. Speak naturally — give your phone, ask to book, modify, or cancel
5. Press **End** → summary card appears with the bullet recap, on-file appointments, duration, and cost

If the call doesn't start: backend dyno is cold (Render free tier sleeps after 15 min idle). Reload the landing page first — the warmup ping will wake it within ~30s. Then click into `/call`.

## Not implemented (and why)

- **Caller voice clone via Tavus** — could echo the caller's pronunciation back. Out of scope for the assignment.
- **Mobile haptic on tool fire** — nice touch on phones. Skipped to keep scope small.
- **In-call slot picker UI** — a clickable list of free slots could shortcut the voice loop. Decided against because it would defeat the "voice-first" point of the assignment.
- **Self-view tile** — added complexity, no value for a one-on-one front-desk call where the user doesn't need to see themselves.
