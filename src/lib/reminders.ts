import "server-only";
import { BRAND } from "@/config/brand";
import { emailButton, emailLayout, esc, ownerSentence, para } from "./email-layout";
import { invitationEmail, isEmailConfigured, sendEmail } from "./email";
import { logError } from "./observe";
import type { supabaseService } from "./supabase/server";

type Db = ReturnType<typeof supabaseService>;

/** Giorni dopo i quali parte il promemoria (uno solo) per una bozza lasciata a metà o un invito senza risposta. */
export const DRAFT_REMINDER_DAYS = 2;
export const INVITE_REMINDER_DAYS = 5;
const MAX_PER_RUN = 25;

export const remindersEnabled = () => process.env.REMINDERS !== "0";

export function draftReminderEmail(p: { link: string; expires: Date }) {
  const date = p.expires.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const subject = "Il diagnostico è rimasto a metà";
  const intro = `Ha iniziato il diagnostico di ${BRAND.name} e lo ha salvato per continuare più tardi: le risposte date finora sono al sicuro e si riprende dal punto in cui si è fermato.`;
  const how = `Per riprendere, acceda con la stessa email: Le inviamo un codice e torna subito alle domande. La bozza resta disponibile fino al ${date}.`;
  const text = `Buongiorno,

${intro}

${how}

Riprenda il diagnostico: ${p.link}

Questo è l'unico promemoria che riceverà per questa bozza.

${ownerSentence()}`;
  const html = emailLayout({
    preheader: "Le risposte date finora sono salvate: bastano pochi minuti per arrivare all'Ottogramma.",
    eyebrow: "Diagnostico in sospeso",
    title: "Il diagnostico è rimasto a metà",
    body: `${para("Buongiorno,")}
${para(esc(intro))}
${para(esc(how))}
${emailButton(p.link, "Riprendi il diagnostico")}
${para("Questo è l'unico promemoria che riceverà per questa bozza.", "font-size:13px;color:#5b6573;margin-top:18px")}`,
  });
  return { subject, text, html };
}

/** Invia i promemoria dovuti; ogni bozza e ogni invito ne riceve al massimo uno. Non interrompe mai l'esecuzione pianificata. */
export async function sendReminders(db: Db, origin: string, now = new Date()): Promise<{ drafts: number; invites: number }> {
  const out = { drafts: 0, invites: 0 };
  if (!remindersEnabled() || !isEmailConfigured()) return out;
  const ago = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
  const nowIso = now.toISOString();
  try {
    // bozze salvate da almeno due giorni e da meno di dieci, non ancora scadute
    const { data: drafts, error } = await db
      .from("drafts")
      .select("id, email, created_at, expires_at")
      .is("reminded_at", null)
      .lte("created_at", ago(DRAFT_REMINDER_DAYS))
      .gte("created_at", ago(10))
      .gt("expires_at", nowIso)
      .order("created_at")
      .limit(200);
    if (error) return out; // colonna assente finché la migrazione non è eseguita
    const seen = new Set<string>();
    for (const d of (drafts ?? []) as { id: string; email: string; created_at: string; expires_at: string }[]) {
      if (out.drafts >= MAX_PER_RUN) break;
      const email = d.email.toLowerCase();
      // una sola email per persona, e solo se dopo la bozza non ha completato il diagnostico
      const first = !seen.has(email);
      seen.add(email);
      let send = first;
      if (send) {
        const { count } = await db
          .from("assessments")
          .select("id", { count: "exact", head: true })
          .ilike("respondent_email", email)
          .eq("status", "completed")
          .gte("completed_at", d.created_at);
        send = (count ?? 0) === 0;
      }
      await db.from("drafts").update({ reminded_at: nowIso }).eq("id", d.id);
      if (!send) continue;
      const link = `${origin}/accedi?next=${encodeURIComponent(`/diagnostico?riprendi=${d.id}`)}`;
      await sendEmail({ to: email, ...draftReminderEmail({ link, expires: new Date(d.expires_at) }) });
      out.drafts++;
    }

    // inviti inviati da almeno cinque giorni, ancora senza risposta e non in scadenza
    const { data: invites } = await db
      .from("invitations")
      .select("id, email, token, invitee_name, expires_at, invited_by, companies(name)")
      .eq("status", "pending")
      .is("reminded_at", null)
      .lte("sent_at", ago(INVITE_REMINDER_DAYS))
      .gt("expires_at", new Date(now.getTime() + 86_400_000).toISOString())
      .limit(MAX_PER_RUN);
    for (const i of (invites ?? []) as unknown as {
      id: string;
      email: string;
      token: string;
      invitee_name: string | null;
      expires_at: string;
      invited_by: string;
      companies: { name: string } | null;
    }[]) {
      await db.from("invitations").update({ reminded_at: nowIso }).eq("id", i.id);
      const { data: inviter } = await db.auth.admin.getUserById(i.invited_by);
      const from = inviter.user?.email;
      if (!from) continue;
      const mail = invitationEmail({
        inviter: from,
        company: i.companies?.name ?? "la vostra azienda",
        name: i.invitee_name,
        link: `${origin}/invito?t=${i.token}`,
        expires: new Date(i.expires_at),
      });
      await sendEmail({ to: i.email, ...mail, subject: `Promemoria: ${mail.subject}`, replyTo: from });
      out.invites++;
    }
  } catch (e) {
    await logError("server", `Promemoria non inviati: ${e instanceof Error ? e.message : String(e)}`, "cron/report");
  }
  return out;
}
