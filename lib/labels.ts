import type { ToolEvent } from "./types";

export function toolLabel(ev: ToolEvent): string {
  if (ev.status === "running") {
    switch (ev.name) {
      case "identify_user": return "Looking you up";
      case "fetch_slots": return "Reading the calendar";
      case "book_appointment": return "Holding your slot";
      case "retrieve_appointments": return "Pulling your file";
      case "cancel_appointment": return "Releasing the slot";
      case "modify_appointment": return "Rescheduling";
      case "end_conversation": return "Wrapping up";
    }
  } else {
    const ok = ev.result?.ok === true;
    switch (ev.name) {
      case "identify_user":
        return ok ? "Identity confirmed" : "Couldn’t identify";
      case "fetch_slots":
        return ok ? "Slots ready" : "No slots";
      case "book_appointment":
        return ok ? "Booking confirmed" : "Booking failed";
      case "retrieve_appointments":
        return ok ? "File retrieved" : "Nothing found";
      case "cancel_appointment":
        return ok ? "Cancelled" : "Cancel failed";
      case "modify_appointment":
        return ok ? "Rescheduled" : "Reschedule failed";
      case "end_conversation":
        return "Goodbye";
    }
  }
  return ev.name;
}

export function formatSlot(iso: string): string {
  // "2026-05-02T14:00" → "May 2 · 2:00 pm"
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
