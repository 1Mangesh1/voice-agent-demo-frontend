# voice-agent-demo-frontend

Next.js 16 + Tailwind v4 + Daily React. Two pages: a landing screen and the
call screen. The call screen is where everything happens.

## What happens when you press Start

1. `POST /tavus/start` on the backend → returns a Daily room URL.
2. Daily call object joins the room (mic on, camera off).
3. Tavus's replica (Mira) joins the same room a few seconds later. Her video
   shows in the orb; her audio plays through `<DailyAudio />`.
4. Mira talks. Her LLM decides to call a tool — Tavus broadcasts a
   `conversation.tool_call` Daily app-message.
5. The frontend dispatches it to `POST /tools/{name}` on the backend, gets a
   JSON result, and broadcasts it back as a `conversation.respond` event.
   Mira reads it out loud as if it were the next user turn.
6. Every utterance is logged into the transcript panel and posted to
   `/transcript` so the summary endpoint has it later.
7. Press End → `daily.leave()` → `POST /summary` → the post-call view shows
   the count of confirmed bookings, Gemini's bullet recap, and the appointments
   on file.

## Layout

```
app/
  page.tsx          landing
  call/page.tsx     mounts <CallShell />
components/
  CallShell.tsx     Daily room lifecycle, tool dispatch, phase machine
  Avatar.tsx        Daniel's video tile (or breathing orb fallback)
  Transcript.tsx    centered conversation, color-coded
  SummaryView.tsx   numeral-led recap + appointments list
lib/
  types.ts, labels.ts
```

## Look

Single sans (Geist), paper white, near-black, one persimmon signal color.
The orb is a circle; when Mira's video track arrives it fills with her face,
otherwise it breathes in place. No drop shadows, no glassmorphism, no
serifs. The transcript is a centered conversation — Mira left in ink, you
right in persimmon. Every spacing decision is in `app/globals.css`.

## Run it locally

```bash
npm install
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev
```

Backend (separate repo) needs to be running for `/tavus/start`, `/tools/*`
and `/summary` to work.

## Deploy

```
vercel --prod
```

`NEXT_PUBLIC_BACKEND_URL` must be set on Vercel — that's the only env var the
frontend needs.

## Notes

- Tavus runs the whole STT → LLM → TTS pipeline. The frontend only owns the
  UI and the tool dispatch loop. That keeps this repo small and the surface
  area minimal.
- Daily defaults the call object to subscribe to all remote tracks, so as
  soon as Mira joins her video and audio just arrive — `<DailyVideo />` and
  `<DailyAudio />` handle the rest.
- The tool ticker above the orb shows the most recent tool name (e.g.
  "Booking") and fades after a few seconds. Useful for live demo legibility.
- An earlier version used LiveKit + a custom SVG portrait with mouth
  animation. The git history walks through the swap to Tavus.
