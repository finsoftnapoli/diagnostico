# Diagnostico d'impresa (nome provvisorio)

Servizio web di Finsoft: diagnostico gratuito su 8 ambiti di gestione per aziende da 2 a 100 milioni di fatturato,
con profilo a radar e tre priorità calcolate con regole dichiarate.

## Stato

Fase 1 in corso. Funziona già:

- pagina iniziale, questionario in cinque sezioni con salvataggio automatico e ripresa;
- motore di punteggio e priorità, verificato contro il foglio Excel della banca delle domande v0.2;
- pagina dei risultati con radar, tre priorità e avvisi di possibile sovrastima;
- schema del database Supabase con regole di accesso, provato in locale.

Da fare nella fase 1: accesso con link via email, salvataggio nel database, area riservata con esportazione CSV,
informativa iubenda, PostHog.

## Comandi

```bash
npm install        # installa le dipendenze
npm run dev        # sito in locale su http://localhost:3000
npm test           # test del motore di punteggio
npm run lint       # controllo del codice
npm run build      # build di produzione
python3 scripts/genera_domande.py   # rigenera le domande da scripts/content.py
```

## Struttura

| Percorso | Contenuto |
|---|---|
| `src/config/brand.ts` | Nome del servizio e dati di contatto: l'unico punto da cambiare quando il nome sarà deciso |
| `src/lib/questionnaire.ts` | Banca delle domande (generata, non modificare a mano) |
| `src/lib/scoring.ts` | Motore di punteggio e priorità, con i parametri da calibrare nel pilota |
| `src/lib/scoring.test.ts` | Test che confrontano il motore con il foglio di esempio |
| `src/components/Wizard.tsx` | Questionario |
| `src/components/ResultsView.tsx` | Pagina dei risultati |
| `supabase/migrations/` | Schema del database e regole di accesso |
| `supabase/tests/` | Prove delle regole di accesso su un Postgres locale |

## Regole

- Chiavi e password solo nelle variabili d'ambiente (vedi `.env.example`), mai nel codice.
- Sicurezza a livello di riga attiva su ogni tabella; punteggi e risposte definitive li scrive solo il server.
- Ogni modifica al motore di punteggio passa da `npm test`.
- Ogni compilazione registra la versione del questionario.
