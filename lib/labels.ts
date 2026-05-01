import type { ToolEvent } from "./types";

export function toolLabel(name: ToolEvent["name"]): string {
  switch (name) {
    case "identify_user": return "Identifying";
    case "fetch_slots": return "Reading calendar";
    case "book_appointment": return "Booking";
    case "retrieve_appointments": return "Fetching file";
    case "cancel_appointment": return "Cancelling";
    case "modify_appointment": return "Rescheduling";
    case "end_conversation": return "Wrapping up";
  }
}

export function formatSlot(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return iso;
  const [, y, mo, d, h, mi] = m;
  const date = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi));
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = +d;
  let hour = +h;
  const ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12 || 12;
  const minStr = mi === "00" ? "" : `:${mi}`;
  return `${month} ${day} · ${hour}${minStr} ${ampm}`;
}
