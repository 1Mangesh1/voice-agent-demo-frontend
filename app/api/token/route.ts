import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const identity = (body.identity as string) || `caller-${crypto.randomUUID().slice(0, 8)}`;
  const room = (body.room as string) || `call-${crypto.randomUUID().slice(0, 8)}`;

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!apiKey || !apiSecret || !url) {
    return NextResponse.json({ error: "livekit env missing" }, { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, { identity, name: identity, ttl: "1h" });
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
  const token = await at.toJwt();
  return NextResponse.json({ token, url, room, identity });
}
