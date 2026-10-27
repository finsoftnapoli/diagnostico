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
- Prezzi solo in `src/config/offers.ts`; testi delle pagine pubbliche in `src/config/ambiti.ts` e `src/config/faq.ts`.
- Ogni nuova migrazione deve essere rieseguibile (`if not exists`, `drop ... if exists`) e va aggiunta a
  `supabase/setup_completo.sql` con `scripts/genera_setup.sh`; aggiornare README e piano quando cambia una funzione visibile.
- Il motore in `src/lib/scoring.ts` deve sempre riprodurre il foglio Excel: `npm test` prima di ogni commit.
- Database: ogni nuova tabella ha la sicurezza a livello di riga attiva e una prova in `supabase/tests/rls_test.sql`.
- Mai chiavi nel codice; variabili d'ambiente elencate in `.env.example`.
