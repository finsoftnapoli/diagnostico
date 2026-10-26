"""Rigenera src/lib/questionnaire.ts da scripts/content.py (banca delle domande).
Uso: python3 scripts/genera_domande.py  (dalla cartella del progetto)
Dopo ogni modifica dei contenuti: aggiornare QUESTIONNAIRE_VERSION e lanciare `npm test`."""
import json, re, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import content as C

SETTORI = ["Agricoltura, allevamento e pesca", "Industria alimentare e delle bevande", "Tessile, abbigliamento e moda",
           "Legno, carta, arredo", "Chimica, farmaceutica, gomma e plastica", "Metalli e prodotti in metallo",
           "Macchinari e apparecchiature", "Elettronica ed elettrotecnica", "Mezzi di trasporto e componenti",
           "Altra manifattura", "Energia, acqua e rifiuti", "Costruzioni e impiantistica", "Commercio all'ingrosso",
           "Commercio al dettaglio", "Trasporti e logistica", "Alloggio e ristorazione", "Informatica e telecomunicazioni",
           "Servizi professionali e consulenza", "Altri servizi alle imprese", "Sanità e assistenza", "Altro"]
REGIONI = ["Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli-Venezia Giulia", "Lazio", "Liguria",
           "Lombardia", "Marche", "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana", "Trentino-Alto Adige",
           "Umbria", "Valle d'Aosta", "Veneto"]
VERSION = "0.3"

amb = [dict(code=a[0], name=a[1], description=a[2]) for a in C.AMBITI]
qs = []
for d in C.DOMANDE:
    m = re.match(r"Livello (3 o 4|4) con risposta (.+)$", d[10])
    opts = [o.strip() for o in d[9].split("/")]
    flag = None
    if m:
        flag = dict(minLevel=3 if m.group(1) == "3 o 4" else 4, answers=[x.strip() for x in m.group(2).split(" o ")])
        for a in flag["answers"]:
            assert a in opts, (d[0], a, opts)
    qs.append(dict(id=d[0], area=d[1], theme=d[2], text=d[3], levels=[d[4], d[5], d[6], d[7]],
                   check=dict(text=d[8], options=opts, flag=flag), sizeNote=d[11] or None))
choice = lambda L: [dict(code=o[0], label=o[1], primary=o[2][0], secondary=o[2][1:]) for o in L]
prof = []
for p in C.PROFILAZIONE:
    t = {"Elenco": "select", "Scelta singola": "select", "Numero": "number", "Testo": "text"}[p[2]]
    opts = SETTORI if p[0] == "PR-01" else REGIONI if p[0] == "PR-04" else ([o.strip() for o in p[3].split("/")] if t == "select" else None)
    prof.append(dict(id=p[0], label=p[1], type=t, options=opts, required=p[5] == "Sì", purpose=p[4]))
example = dict(levels=C.ESEMPIO_LIVELLI, importance=C.ESEMPIO_IMPORTANZA, objectives=C.ESEMPIO_OBIETTIVI,
               issues=C.ESEMPIO_CRITICITA, textAreas=[k for k, v in C.ESEMPIO_TESTO.items() if v])
js = lambda x: json.dumps(x, ensure_ascii=False, indent=2)
out = f'''// Generato da scripts/genera_domande.py (banca delle domande v{VERSION}). Non modificare a mano:
// cambiare scripts/content.py e rigenerare.
import type {{ Area, Question, Choice, ProfileField }} from "./types";

export const QUESTIONNAIRE_VERSION = "{VERSION}";

export const AREAS: Area[] = {js(amb)};

export const QUESTIONS: Question[] = {js(qs)};

export const OBJECTIVES: Choice[] = {js(choice(C.OBIETTIVI))};

export const ISSUES: Choice[] = {js(choice(C.CRITICITA))};

export const PROFILE_FIELDS: ProfileField[] = {js(prof)};

/** Azienda di esempio del foglio Esempio_priorita, usata nei test. */
export const EXAMPLE = {js(example)} as const;
'''
target = pathlib.Path(__file__).parent.parent / "src/lib/questionnaire.ts"
target.write_text(out, encoding="utf-8")
print(f"Scritte {len(qs)} domande in {target}")
