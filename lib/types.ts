export type ToolEvent = {
  type: "tool";
  name:
    | "identify_user"
    | "fetch_slots"
    | "book_appointment"
    | "retrieve_appointments"
    | "cancel_appointment"
    | "modify_appointment"
    | "end_conversation";
  status: "running" | "done";
  args?: Record<string, unknown>;
  result?: { ok: boolean; [k: string]: unknown };
};

export type ToolFeedItem = ToolEvent & { id: string; ts: number };

export type TranscriptTurn = { role: "user" | "assistant"; text: string; ts: number };

export type SummaryPayload = {
  room: string;
  summary: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  cost_usd: number | null;
  user_phone: string | null;
  appointments: { id: number; slot: string; status: string }[];
};
