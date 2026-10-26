// Invito di calendario (.ics) per le sessioni di consulenza.

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escText = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
/** Righe lunghe spezzate a 75 caratteri come richiesto dallo standard. */
const fold = (line: string) => line.match(/.{1,74}/g)!.join("\r\n ");

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
