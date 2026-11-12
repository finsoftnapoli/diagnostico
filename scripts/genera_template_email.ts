// Genera i modelli delle email di accesso da incollare in Supabase (Authentication > Emails > Templates),
// con la stessa impaginazione delle email del sito. Uso: npx tsx scripts/genera_template_email.ts
import { writeFileSync } from "node:fs";
import { authEmail } from "../src/lib/auth-email";

const TEMPLATES = [
  ["magic-link", "magiclink", "Magic link or OTP"],
  ["conferma-registrazione", "signup", "Confirm sign up"],
  ["invito", "invite", "Invite user"],
  ["cambio-email", "email_change", "Change email address"],
] as const;

for (const [file, action, label] of TEMPLATES) {
  const m = authEmail({ action, token: "{{ .Token }}", link: "{{ .ConfirmationURL }}" });
  writeFileSync(`supabase/email-templates/${file}.html`, `${m.html}\n<!-- Supabase: ${label}. Oggetto: ${m.subject} -->\n`);
  console.log(`${label}: oggetto "${m.subject}" → supabase/email-templates/${file}.html`);
}
