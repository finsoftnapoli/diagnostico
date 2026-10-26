"""Genera src/lib/modules.ts e il file Excel di revisione dai contenuti in scripts/moduli_content.py.
Uso: python3 scripts/genera_moduli.py [cartella per l'Excel]  (dalla cartella del progetto)"""
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import moduli_content as M
import content as C

ROOT = pathlib.Path(__file__).parent.parent
NAMES = {a[0]: a[1] for a in C.AMBITI}

modules = {}
for area, qs in M.MODULI.items():
    assert area in NAMES, area
    ids = set()
    out = []
    for q in qs:
        qid, theme, text, levels, check, na = q
        assert qid.startswith(area + "-A") and qid not in ids, qid
        assert len(levels) == 4 and all(l.strip() for l in levels), qid
        ids.add(qid)
        chk = None
        if check:
            ctext, opts, min_level, flag = check
            assert all(f in opts for f in flag), (qid, flag, opts)
            chk = dict(text=ctext, options=opts, flag=dict(minLevel=min_level, answers=flag))
        out.append(dict(id=qid, area=area, theme=theme, text=text, levels=levels, check=chk, na=na))
    assert 8 <= len(out) <= 14, (area, len(out))
    modules[area] = out

ts = f"""// Generato da scripts/genera_moduli.py (moduli di approfondimento v{M.VERSION}). Non modificare a mano:
// cambiare scripts/moduli_content.py e rigenerare.
import type {{ AreaCode }} from "./types";

export const MODULE_VERSION = "{M.VERSION}";

export interface ModuleQuestion {{
  id: string;
  area: AreaCode;
  theme: string;
  text: string;
  levels: string[];
  check: {{ text: string; options: string[]; flag: {{ minLevel: number; answers: string[] }} }} | null;
  /** La domanda può non riguardare l'azienda: si può rispondere "non applicabile". */
  na: boolean;
}}

export const MODULE_QUESTIONS: Record<AreaCode, ModuleQuestion[]> = {json.dumps(modules, ensure_ascii=False, indent=2)};

export const ROADMAP_HORIZONS = {json.dumps(M.ORIZZONTI, ensure_ascii=False)};
"""
(ROOT / "src/lib/modules.ts").write_text(ts, encoding="utf-8")
print("src/lib/modules.ts:", sum(len(v) for v in modules.values()), "domande")

# ---------- Excel di revisione ----------
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

NAVY = "0A2A4A"
HDR = PatternFill("solid", fgColor=NAVY)
NOTE = PatternFill("solid", fgColor="FFF2CC")
thin = Side(style="thin", color="BFC5CC")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP = Alignment(wrap_text=True, vertical="top")
f = lambda **k: Font(name="Arial", size=k.pop("size", 10), **k)

wb = Workbook()
ws = wb.active
ws.title = "Leggimi"
ws["A1"] = f"Moduli di approfondimento per ambito — bozza v{M.VERSION} da rivedere"
ws["A1"].font = f(bold=True, size=14, color=NAVY)
ws["A2"] = "Testi originali. Annota le modifiche nella colonna gialla «Note di revisione» di ogni foglio: le riporto nel sistema."
ws["A2"].font = f(italic=True, color="595959")
rows = [
    ("Come funziona", "Ogni modulo si attiva con l'acquisto dell'approfondimento dell'ambito (€100 + IVA) o con il percorso completo."),
    ("Domande", "Circa 10 domande per ambito, una per tema, ognuna con 4 livelli di maturità dal più basso al più alto."),
    ("Verifica", "Alcune domande hanno una domanda di verifica: se il livello scelto è alto ma la verifica dice il contrario, il report segnala una possibile sovrastima."),
    ("Non applicabile", "Le domande segnate «Sì» nella colonna N/A ammettono la risposta «non riguarda la nostra azienda» (per esempio magazzino nelle aziende di servizi)."),
    ("Punteggio", "Livello 1 = 0, 2 = 33, 3 = 67, 4 = 100; punteggio del modulo = media dei temi applicabili. Lo stesso metodo del diagnostico gratuito."),
    ("Report", "L'AI scrive diagnosi per tema, piano a 3, 6 e 12 mesi e indicatori da seguire a partire dalle risposte; il report va in revisione allo staff prima dell'invio."),
]
ws.column_dimensions["A"].width = 18
ws.column_dimensions["B"].width = 110
for i, (k, v) in enumerate(rows, start=4):
    ws.cell(row=i, column=1, value=k).font = f(bold=True)
    c = ws.cell(row=i, column=2, value=v)
    c.font = f()
    c.alignment = WRAP
r = 4 + len(rows) + 1
ws.cell(row=r, column=1, value="Ambito").font = f(bold=True, color="FFFFFF")
ws.cell(row=r, column=2, value="Domande").font = f(bold=True, color="FFFFFF")
ws.cell(row=r, column=1).fill = HDR
ws.cell(row=r, column=2).fill = HDR
for area, qs in modules.items():
    r += 1
    ws.cell(row=r, column=1, value=NAMES[area]).font = f()
    ws.cell(row=r, column=2, value=f"{len(qs)} domande · temi: " + "; ".join(q["theme"] for q in qs)).font = f()
    ws.cell(row=r, column=2).alignment = WRAP

cols = ["ID", "Tema", "Domanda", "Livello 1", "Livello 2", "Livello 3", "Livello 4", "Domanda di verifica", "Risposte", "Segnale di sovrastima", "N/A", "Note di revisione"]
widths = [10, 20, 36, 30, 30, 30, 30, 30, 16, 22, 6, 30]
for area, qs in modules.items():
    s = wb.create_sheet(area)
    s.freeze_panes = "C2"
    for i, (h, w) in enumerate(zip(cols, widths), start=1):
        c = s.cell(row=1, column=i, value=h)
        c.font = f(bold=True, color="FFFFFF")
        c.fill = HDR
        c.alignment = Alignment(wrap_text=True, vertical="center")
        c.border = BOX
        s.column_dimensions[c.column_letter].width = w
    for j, q in enumerate(qs, start=2):
        chk = q["check"]
        vals = [q["id"], q["theme"], q["text"], *q["levels"],
                chk["text"] if chk else "", " / ".join(chk["options"]) if chk else "",
                (f"Livello {chk['flag']['minLevel']} o più con risposta " + " o ".join(chk["flag"]["answers"])) if chk else "",
                "Sì" if q["na"] else "", ""]
        for i, v in enumerate(vals, start=1):
            c = s.cell(row=j, column=i, value=v)
            c.font = f()
            c.alignment = WRAP
            c.border = BOX
            if i == len(vals):
                c.fill = NOTE
    s.title = area + " " + NAMES[area].split(" ")[0]

out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".") / f"Moduli_approfondimento_v{M.VERSION}.xlsx"
wb.save(out)
print("Excel:", out)
