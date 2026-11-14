<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Progetto

- Lingua: interfaccia, testi e commenti in italiano; tono executive, niente gergo.
- Il nome del servizio è provvisorio: usarlo solo tramite `src/config/brand.ts`.
- La banca delle domande si modifica in `scripts/content.py` e si rigenera con `python3 scripts/genera_domande.py`;
  i moduli di approfondimento in `scripts/moduli_content.py`, con `python3 scripts/genera_moduli.py <cartella Excel>`.
- Testi pubblici: si parla di metodologia, algoritmi e sistemi proprietari e del ruolo degli esperti, senza descrivere formule
  o uso dell'AI (il minimo legale resta nell'informativa); i report si promettono con `BRAND.reportPromise` ("entro 24 ore", con `BRAND.reportWorking`: «I nostri esperti ci stanno già lavorando»): se superano i controlli partono da soli alle 9 del giorno dopo la compilazione.
- Prezzi solo in `src/config/offers.ts`; testi delle pagine pubbliche in `src/config/ambiti.ts` e `src/config/faq.ts`.
- Ogni nuova migrazione deve essere rieseguibile (`if not exists`, `drop ... if exists`) e va aggiunta a
  `supabase/setup_completo.sql` con `scripts/genera_setup.sh`; aggiornare README e piano quando cambia una funzione visibile.
- Il motore in `src/lib/scoring.ts` deve sempre riprodurre il foglio Excel: `npm test` prima di ogni commit.
- Database: ogni nuova tabella ha la sicurezza a livello di riga attiva e una prova in `supabase/tests/rls_test.sql`.
- Mai chiavi nel codice; variabili d'ambiente elencate in `.env.example`.
- Registro: alla persona (cliente, collega invitato) si dà del «Lei» (verbi, pronomi «Le/La» e possessivi «Suo/Sua»: «Ha indicato», «Inserisca il codice», «la Sua email»); all'azienda, come gruppo di persone, del «voi» («la vostra azienda», «come gestite i clienti»). Non mescolare i due registri nella stessa frase. Le domande dei questionari parlano all'azienda con il «voi»; i report dell'IA danno del «voi» all'azienda e, se serve, del «Lei» alla persona. I pulsanti restano brevi all'imperativo singolare («Apri il report»). Con lo staff (area admin) si dà del tu. Fanno eccezione, fino alla revisione legale, informativa privacy e condizioni di vendita.
- Il report condiviso (`/condiviso/<link>`) è in sola lettura e si legge con il client di servizio: non aggiungere lì dati che il cliente non ha scelto di condividere (la «sintesi» non contiene bilancio, governance né testi liberi).
