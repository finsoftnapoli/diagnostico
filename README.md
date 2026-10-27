# Diagnostico d'impresa (nome provvisorio)

Servizio web di Finsoft S.r.l.: diagnostico gestionale gratuito su 8 ambiti per PMI italiane (indicativamente fino a 100
milioni di fatturato), con profilo a radar (l'**Ottogramma**), confronto con aziende simili, tre priorità calcolate con
regole dichiarate e un report approfondito in differita. A pagamento: approfondimenti per ambito, consulenze da remoto e
percorso completo.

Il piano di lavoro e le decisioni di prodotto sono nel documento "Diagnostico PMI — Piano per il sito operativo".

## Stato (27 ottobre 2026)

In prova su Vercel con database Supabase di test. Funziona:

| Area | Cosa c'è |
|---|---|
| Sito pubblico | Pagina iniziale, 8 pagine degli ambiti (`/ambiti/...`), il nostro metodo (`/metodo`), informativa privacy e condizioni di vendita in bozza, sitemap, robots, dati strutturati, anteprima social |
| Diagnostico gratuito | Questionario in 5 sezioni (consensi, profilo, ambizioni, 24 domande, sfide) con salvataggio automatico e "salva e continua più tardi" via email; verifica anti-bot Cloudflare Turnstile; partita IVA verificata su VIES |
| Documenti | Visura e bilancio in PDF letti con Claude durante il questionario (precompilano il profilo); dall'area personale anche bilanci e visure aggiornati, business plan e altri documenti, usati nei report successivi |
| Risultati | Ottogramma subito dopo la conferma dell'email: punteggi, confronto di fascia, evidenze chiave, offerte; report approfondito scritto dall'AI in differita, rivisto e approvato dallo staff, poi inviato per email; PDF dalla stampa del browser |
| Più manager | Inviti ai colleghi (suggeriti dalla visura), spazio aziendale con confronto delle visioni nell'area personale |
| Vendite | Dati di fatturazione, acquisto con Stripe Checkout, attivazione di moduli e ore di consulenza, fattura elettronica FatturaPA (invio ad Aruba o coda da caricare a mano), prenotazione delle consulenze sugli orari dell'esperto con invito di calendario |
| Approfondimenti | 8 moduli, ciascuno un Ottogramma dell'ambito con 8 sotto-ambiti e 16-18 domande; punteggi subito, report AI rivisto dallo staff |
| Area staff | Compilazioni ed esportazione CSV, report da rivedere con editor, ordini e fatture, agenda delle consulenze |

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
- Attività pianificate (Vercel Cron, protette da `CRON_SECRET`): `/api/cron/report` alle 7:00 genera i report in coda
  e avvisa lo staff; `/api/cron/pulizia` alle 3:30 elimina bozze scadute e documenti da non conservare.

### Flussi principali

1. **Diagnostico**: `/diagnostico` → conferma email (`SaveGate`) → `/api/compilazioni` ricalcola i punteggi sul server e
   salva → Ottogramma (`/risultati`). Il report approfondito resta "in coda", poi "da rivedere" e diventa visibile in
   `/area/report/<id>` quando lo staff lo approva.
2. **Acquisto**: `/area/servizi` → dati di fatturazione (`/api/fatturazione`) → `/api/acquisti` crea l'ordine e la sessione
   Stripe → `/api/stripe/webhook` segna l'ordine pagato, attiva moduli e ore, conferma la prenotazione, emette la fattura e
   invia le email (`src/lib/commerce.ts`).
3. **Modulo**: `/api/moduli` avvia il modulo acquistato → `/area/modulo/<id>` (questionario, poi Ottogramma dell'ambito) →
   report nel cron, revisione in `/admin/modulo/<id>`.
4. **Consulenza**: lo staff pubblica gli orari in `/admin/agenda`; il cliente prenota pagando o con le ore del percorso
   (`/api/prenotazioni`); conferma e annullamento con invito di calendario.

## Struttura

| Percorso | Contenuto |
|---|---|
| `src/config/brand.ts` | Nome del servizio, dati di Finsoft, versioni di informativa e condizioni: l'unico punto da cambiare per il nome |
| `src/config/offers.ts` | Prezzi e descrizioni dei servizi a pagamento |
| `src/config/benchmark.ts` | Riferimento indicativo per fascia di fatturato, macro-fasce e soglia per la mediana reale |
| `src/config/ambiti.ts`, `faq.ts`, `site.ts` | Testi delle pagine pubbliche degli ambiti, domande frequenti, indirizzo del sito |
| `src/lib/questionnaire.ts`, `modules.ts` | Domande del diagnostico e dei moduli (generati dagli script, non modificare a mano) |
| `src/lib/scoring.ts`, `module-scoring.ts` | Motori di punteggio e priorità |
| `src/lib/insights.ts` | Evidenze, prontezza per le ambizioni, cause delle sfide, prossimi passi |
| `src/lib/report-narrative.ts`, `module-report.ts`, `report-jobs.ts`, `narrative-spec.ts` | Report scritti dall'AI, coda di generazione e revisione |
| `src/lib/documents.ts`, `company-docs.ts` | Lettura dei documenti e loro uso nei report |
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

## Messa in produzione

1. Nome e dominio definitivi; `PUBLIC_SITE_URL` e nome in `src/config/brand.ts`; mittente Resend sul nuovo dominio.
2. Nuovo progetto Supabase a Francoforte: eseguire `supabase/setup_completo.sql`, staff, URL di accesso, SMTP e modelli
   email, chiavi in Vercel. Aggiornare l'informativa (oggi dice Francoforte, il test è a Londra).
3. Stripe: account live, chiavi `sk_live_`, webhook con gli eventi elencati in `.env.example`.
4. Fatturazione: dati `SELLER_*` e in `brand.ts`, sezionale concordato con il commercialista, utenza Aruba con API
   (`ARUBA_ENV=prod`).
5. Revisione legale di informativa e condizioni di vendita; completare i punti tra parentesi quadre.
6. Tetto di spesa nella Console Anthropic; backup giornalieri Supabase (piano Pro); piano Vercel Pro per uso commerciale.
7. Revisione delle domande dei moduli (Excel v0.2) e calibrazione dei parametri dopo le prime compilazioni reali.

## Regole

- Chiavi e password solo nelle variabili d'ambiente (vedi `.env.example`), mai nel codice.
- Sicurezza a livello di riga attiva su ogni tabella, con una prova in `supabase/tests/rls_test.sql`; punteggi, ordini e
  fatture li scrive solo il server.
- Ogni modifica al motore di punteggio passa da `npm test`; ogni compilazione registra la versione del questionario.
- Nomi di soci e amministratori letti dalla visura restano nel browser di chi carica il documento: mai nel database.
- I testi rivolti agli utenti parlano di "esperti" (chi valida i report e fa le consulenze), di "Ottogramma" (il profilo) e
  di "metodologia, algoritmi e sistemi proprietari": nessun dettaglio pubblico su formule o uso dell'AI, salvo il minimo
  richiesto nell'informativa privacy (fornitori e natura del trattamento). I report si promettono "entro 2 giorni lavorativi".
