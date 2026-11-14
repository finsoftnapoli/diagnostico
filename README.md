# Diagnostico d'impresa (nome provvisorio)

Servizio web di Finsoft S.r.l.: diagnostico gestionale gratuito su 8 ambiti per PMI italiane (indicativamente fino a 100
milioni di fatturato), con profilo a radar (l'**Ottogramma**), confronto con aziende simili, tre priorità calcolate con
regole dichiarate e un report approfondito in differita. A pagamento: approfondimenti per ambito, consulenze da remoto e
percorso completo.

Il piano di lavoro e le decisioni di prodotto sono nel documento "Diagnostico PMI — Piano per il sito operativo".

## Stato (13 novembre 2026)

In prova su Vercel con database Supabase di test. Funziona:

| Area | Cosa c'è |
|---|---|
| Sito pubblico | Pagina iniziale, 8 pagine degli ambiti (`/ambiti/...`), il nostro metodo (`/metodo`), informativa privacy e condizioni di vendita in bozza, sitemap, robots, dati strutturati, anteprima social |
| Diagnostico gratuito | Questionario a una domanda per schermata (avvio con consensi, 24 domande, ambizioni, sfide, dati dell'azienda alla fine) con l'Ottogramma che si disegna mentre si risponde (`src/lib/flow.ts`, `LiveOttogramma`), salvataggio automatico e "salva e continua più tardi" via email; verifica anti-bot Cloudflare Turnstile; partita IVA verificata su VIES |
| Documenti | Visura e bilancio in PDF letti con Claude durante il questionario (precompilano il profilo), anche trascinando il file; bilancio anche in XBRL (il file del Registro Imprese), letto direttamente senza AI; dall'area personale anche bilanci e visure aggiornati, business plan e altri documenti, usati nei report successivi |
| Risultati | Ottogramma subito dopo la conferma dell'email: punteggi, confronto di fascia, evidenze chiave, offerte; report approfondito scritto dall'AI in differita, rivisto e approvato dallo staff, poi inviato per email; PDF impaginato dal sito (`/api/report/<id>/pdf`, copertina, guida alla lettura, priorità con le schede «Come fare», dettaglio) e, per i moduli, `/api/moduli/<id>/pdf`; punteggi spiegati in parole; registro "voi" in tutti i report |
| Report interattivo | Indice che segue la lettura, Ottogramma esplorabile (si sceglie un ambito, anche dal grafico), azioni da spuntare con conteggio (`report_actions`), «Invia il report a…»: link in sola lettura a `/condiviso/<link>` con scadenza a 7, 30 o 90 giorni, solo sintesi o report completo, revocabile, con numero di aperture; del link si conserva solo l'impronta (`src/lib/share.ts`). Report di esempio pubblico in `/esempio` (azienda di fantasia, `src/lib/example-report.ts`) |
| Più manager | Inviti ai colleghi (suggeriti dalla visura), spazio aziendale nell'area personale con confronto delle visioni: profili sovrapposti, temi su cui le risposte divergono, ambizioni e sfide indicate da tutti, da alcuni, da uno solo |
| Vendite | Dati di fatturazione, acquisto con Stripe Checkout, attivazione di moduli e ore di consulenza, fattura elettronica FatturaPA (invio ad Aruba o coda da caricare a mano), prenotazione delle consulenze sugli orari dell'esperto con invito di calendario |
| Approfondimenti | 8 moduli, ciascuno un Ottogramma dell'ambito con 8 sotto-ambiti e 16-18 domande; punteggi subito, report AI rivisto dallo staff |
| Area personale | Pagina di riepilogo: «Da fare adesso» (report in arrivo con giorno e ora, report pronto, approfondimenti da compilare, consulenza), report, approfondimenti e consulenze, management, documenti |
| Promemoria | Uno solo per bozza lasciata a metà (dopo 2 giorni) e per invito senza risposta (dopo 5), dall'esecuzione del mattino (`src/lib/reminders.ts`, `REMINDERS=0` li disattiva) |
| Libreria delle raccomandazioni | 72 schede di metodo in `src/config/recommendations.ts` (24 temi × 3 passaggi di livello: tre passi, strumento, indicatore, tempi, errore da evitare, riferimenti normativi con data di verifica). La generazione dei report parte dalle schede dei temi prioritari; il report online le mostra in «Come fare»; lo staff le consulta in `/admin/raccomandazioni` |
| Area staff | Compilazioni ed esportazione CSV, report da rivedere con editor, ordini e fatture, agenda delle consulenze |
| Controlli e andamento | `/admin/controlli`: controlli di configurazione, passi del questionario in cui le persone si fermano (misure anonime, senza cookie né identificativi), riscontri e domande dei clienti, errori di browser e server, consumo medio dell'IA per report (con costo stimato se si impostano i prezzi), ultima copia di sicurezza. Copia giornaliera dei dati nel bucket privato `backup` (30 giorni). Verifiche automatiche a ogni invio su GitHub (`.github/workflows/verifiche.yml`) |

Non ancora fatto: dominio e nome definitivi, migrazione del database a Francoforte, chiavi Stripe e dati del cedente,
CRM, analytics, revisione legale. Dettagli nella sezione "Messa in produzione".

## Comandi

```bash
npm install                                   # dipendenze
npm run dev                                   # sito in locale su http://localhost:3000
npm test                                      # test (motore di punteggio, moduli, acquisti, fatture, documenti)
npm run lint                                  # controllo del codice
npm run build                                 # build di produzione
python3 scripts/genera_domande.py             # rigenera le domande del diagnostico da scripts/content.py
python3 scripts/genera_moduli.py <cartella>   # rigenera i moduli da scripts/moduli_content.py e l'Excel di revisione
```

Prove delle regole di accesso del database su un Postgres locale: `supabase/tests/local_stub.sql`, poi
`supabase/setup_completo.sql` (anche due volte), poi `supabase/tests/rls_test.sql`; l'esito atteso è
"TUTTI I CONTROLLI SUPERATI".

## Architettura

- **Next.js 16** (App Router, Cache Components, `proxy.ts` al posto del middleware) con Tailwind 4, su **Vercel**
  (funzioni a Francoforte, `vercel.json`).
- **Supabase**: Postgres con sicurezza a livello di riga su ogni tabella, accesso con codice o link via email, archivio
  privato `documenti`. Il browser legge solo i propri dati; tutte le scritture definitive passano dal server con la chiave
  di servizio.
- **Claude API** (Sonnet 5.5): lettura dei documenti e prima stesura dei report, sempre a partire da dati già calcolati.
  Nessun punteggio è calcolato dall'AI.
- **Resend** (email del servizio e codici di accesso), **Cloudflare Turnstile** (verifica anti-bot), **Stripe**
  (pagamenti), **Aruba Fatturazione Elettronica** (invio allo SDI), Google Meet o simili per le videochiamate.
- Report: la generazione parte all'invio della compilazione (`after()` in `/api/compilazioni` e `/api/moduli/<id>`); il report passa
  dai controlli di `src/lib/release-checks.ts` e da una seconda lettura indipendente (`src/lib/release.ts`): se li supera
  ne viene programmato l'invio per le 9 del giorno successivo alla compilazione (`src/lib/release-schedule.ts`; lo staff è avvisato
  e può correggere, inviare subito o trattenere), altrimenti resta "da rivedere" e lo staff riceve un avviso con i motivi
  (`REPORT_AUTO_RELEASE=0` riporta tutto alla revisione). Il testo del report si legge solo dal server
  (`src/lib/report-access.ts`), che registra anche aperture e scarichi (`report_events`, visibili nell'area staff).
- Attività pianificate (Vercel Cron, protette da `CRON_SECRET`): `/api/cron/report` alle 8:10 UTC (dopo le 9 italiane) invia i report
  programmati, riprende quelli rimasti in coda e ricorda allo staff quelli trattenuti; `/api/cron/pulizia` alle 3:30 elimina bozze scadute e documenti da non conservare.

### Flussi principali

1. **Diagnostico**: `/diagnostico` → conferma email (`SaveGate`) → `/api/compilazioni` ricalcola i punteggi sul server e
   salva → Ottogramma (`/risultati`). Il report approfondito resta "in coda", poi "da rivedere" e diventa visibile in
   `/area/report/<id>` quando lo staff lo approva.
2. **Acquisto**: `/area/servizi` → dati di fatturazione (`/api/fatturazione`) → `/api/acquisti` crea l'ordine e la sessione
   Stripe → `/api/stripe/webhook` segna l'ordine pagato, attiva moduli e ore, conferma la prenotazione, emette la fattura e
   invia le email (`src/lib/commerce.ts`).
3. **Modulo**: `/api/moduli` avvia il modulo acquistato → `/area/modulo/<id>` (questionario, poi Ottogramma dell'ambito) →
   report nel cron, revisione in `/admin/modulo/<id>` (con anteprima del PDF), poi PDF scaricabile dal cliente.
4. **Consulenza**: lo staff pubblica gli orari in `/admin/agenda`; il cliente prenota pagando o con le ore del percorso
   (`/api/prenotazioni`); conferma e annullamento con invito di calendario.

## Struttura

| Percorso | Contenuto |
|---|---|
| `src/config/brand.ts` | Nome del servizio, dati di Finsoft, versioni di informativa e condizioni: l'unico punto da cambiare per il nome |
| `src/config/offers.ts` | Prezzi e descrizioni dei servizi a pagamento |
| `src/config/benchmark.ts` | Riferimento dell'esperto per fascia di fatturato (sempre mostrato), macro-fasce e soglia oltre la quale compare anche la mediana reale, in un altro colore |
| `src/config/ambiti.ts`, `faq.ts`, `site.ts` | Testi delle pagine pubbliche degli ambiti, domande frequenti, indirizzo del sito |
| `src/lib/questionnaire.ts`, `modules.ts` | Domande del diagnostico e dei moduli (generati dagli script, non modificare a mano) |
| `src/lib/scoring.ts`, `module-scoring.ts` | Motori di punteggio e priorità |
| `src/lib/insights.ts` | Evidenze, prontezza per le ambizioni, cause delle sfide, prossimi passi |
| `src/lib/report-narrative.ts`, `module-report.ts`, `report-jobs.ts`, `narrative-spec.ts`, `narrative-checks.ts`, `release-checks.ts`, `release.ts`, `report-access.ts` | Report scritti dall'AI, controlli prima del rilascio, seconda lettura, coda di generazione, lettura protetta e tracciamento |
| `src/app/api/admin/accrediti`, `grantCredit` in `src/lib/commerce.ts` | Accredito di servizi senza pagamento dall'area staff (ordine a importo zero, senza fattura) |
| `src/lib/score-meaning.ts`, `src/pdf/` | Lettura dei punteggi in parole; report del diagnostico e dei moduli in PDF (@react-pdf/renderer, elementi comuni in `kit.tsx`, font Inter in `src/pdf/fonts`) |
| `src/lib/output-quality.test.ts`, `src/lib/fixtures/` | Controllo automatico dei testi che il cliente legge (refusi meccanici, valori mancanti, registro) su profili di risposta diversi |
| `src/lib/documents.ts`, `xbrl.ts`, `doc-format.ts`, `company-docs.ts` | Lettura dei documenti (PDF con Claude, bilancio XBRL con la tassonomia itcc-ci), formati accettati, uso nei report |
| `src/lib/commerce.ts`, `billing.ts`, `invoice.ts`, `aruba.ts`, `stripe.ts`, `ics.ts` | Ordini, fatture elettroniche, pagamenti, prenotazioni |
| `src/app/` | Pagine e API (vedi i flussi) |
| `supabase/migrations/` | Schema del database e regole di accesso, rieseguibili; `supabase/setup_completo.sql` le riunisce (`scripts/genera_setup.sh`) |
| `scripts/` | Banca delle domande e moduli in Python, con generazione di codice ed Excel |

### Database

| Tabelle | Uso |
|---|---|
| `companies`, `company_members`, `invitations`, `staff` | Aziende, membri con ruolo, inviti, staff |
| `assessments`, `answers`, `area_scores`, `consents`, `drafts` | Compilazioni, risposte, punteggi, consensi, bozze |
| `documents` | Documenti caricati (dati estratti, mai nomi di persone) |
| `billing_profiles`, `orders`, `entitlements`, `invoices`, `invoice_counters` | Fatturazione, ordini, moduli e ore attivati, fatture |
| `expert_slots`, `bookings` | Orari dell'esperto e prenotazioni |
| `module_assessments` | Moduli di approfondimento |
| `interests` | Richieste di contatto della prima versione delle offerte (non più usata) |
| `report_events` | Aperture e download dei report |
| `report_shares`, `report_actions` | Link di condivisione dei report (solo l'impronta del link) e azioni spuntate; solo server |
| `feedback`, `funnel_events`, `error_log` | Riscontri dei clienti, misure anonime del percorso, errori (solo server e staff; misure ed errori cancellati dopo 90 giorni) |

## Messa in produzione

1. Nome e dominio definitivi; `PUBLIC_SITE_URL` e nome in `src/config/brand.ts`; mittente Resend sul nuovo dominio.
2. Nuovo progetto Supabase a Francoforte: eseguire `supabase/setup_completo.sql`, staff, URL di accesso, SMTP, modelli
   email da `supabase/email-templates/` (rigenerabili con `npx tsx scripts/genera_template_email.ts`) oppure il Send Email
   Hook verso `/api/auth/email` con `SEND_EMAIL_HOOK_SECRET`, chiavi in Vercel. Aggiornare l'informativa (oggi dice Francoforte, il test è a Londra).
3. Stripe: account live, chiavi `sk_live_`, webhook con gli eventi elencati in `.env.example`.
4. Fatturazione: dati `SELLER_*` e in `brand.ts`, sezionale concordato con il commercialista, utenza Aruba con API
   (`ARUBA_ENV=prod`).
5. Revisione legale di informativa e condizioni di vendita; completare i punti tra parentesi quadre.
6. Tetto di spesa nella Console Anthropic; backup giornalieri Supabase (piano Pro); piano Vercel Pro per uso commerciale.
7. Calibrazione di pesi, riferimenti di fascia e soglie dopo le prime compilazioni reali (banca delle domande v0.5, moduli v0.3).
8. Riferimenti normativi della libreria delle raccomandazioni: ricontrollarli (ultima verifica novembre 2026).

## Regole

- Chiavi e password solo nelle variabili d'ambiente (vedi `.env.example`), mai nel codice.
- Sicurezza a livello di riga attiva su ogni tabella, con una prova in `supabase/tests/rls_test.sql`; punteggi, ordini e
  fatture li scrive solo il server.
- Ogni modifica al motore di punteggio passa da `npm test`; ogni compilazione registra la versione del questionario.
- Nomi di soci e amministratori letti dalla visura restano nel browser di chi carica il documento: mai nel database.
- I testi rivolti agli utenti parlano di "esperti" (chi valida i report e fa le consulenze), di "Ottogramma" (il profilo) e
  di "metodologia, algoritmi e sistemi proprietari": nessun dettaglio pubblico su formule o uso dell'AI, salvo il minimo
  richiesto nell'informativa privacy (fornitori e natura del trattamento). I report si promettono con `BRAND.reportPromise` ("la mattina del giorno successivo").
