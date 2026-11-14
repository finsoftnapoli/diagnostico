// Invito di calendario (.ics) per le sessioni di consulenza.

export const stamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
export const escText = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");
/** Righe lunghe spezzate a 75 caratteri come richiesto dallo standard. */
export const fold = (line: string) => line.match(/.{1,74}/g)!.join("\r\n ");

export function calendarInvite(p: {
  uid: string;
  start: Date;
  minutes: number;
  title: string;
  description: string;
  url?: string | null;
  organizer: string;
  attendee?: string;
  cancel?: boolean;
}) {
  const end = new Date(p.start.getTime() + p.minutes * 60000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Finsoft//Diagnostico//IT",
    "CALSCALE:GREGORIAN",
    `METHOD:${p.cancel ? "CANCEL" : "REQUEST"}`,
    "BEGIN:VEVENT",
    `UID:${p.uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(p.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escText(p.title)}`,
    `DESCRIPTION:${escText(p.description + (p.url ? `\n\nCollegamento: ${p.url}` : ""))}`,
    ...(p.url ? [`LOCATION:${escText(p.url)}`, `URL:${p.url}`] : []),
    `ORGANIZER:mailto:${p.organizer}`,
    ...(p.attendee ? [`ATTENDEE;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${p.attendee}`] : []),
    `STATUS:${p.cancel ? "CANCELLED" : "CONFIRMED"}`,
    `SEQUENCE:${p.cancel ? 1 : 0}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Calendario delle prenotazioni da sottoscrivere (Google, Outlook, Apple): ogni consulenza confermata blocca l'ora. */
export function bookingsFeed(
  name: string,
  events: { uid: string; start: Date; minutes: number; title: string; description: string; url?: string | null }[],
) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Finsoft//Diagnostico//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escText(name)}`,
    "X-PUBLISHED-TTL:PT15M",
    "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
  ];
  for (const e of events) {
    const end = new Date(e.start.getTime() + e.minutes * 60000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(e.start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escText(e.title)}`,
      `DESCRIPTION:${escText(e.description + (e.url ? `\n\nCollegamento: ${e.url}` : ""))}`,
      ...(e.url ? [`LOCATION:${escText(e.url)}`] : []),
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
