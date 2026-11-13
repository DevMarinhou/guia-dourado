# -*- coding: utf-8 -*-
"""
GrafoPlanta v2 — extrai nos e arestas de navegacao da planta Mix do
Capim Dourado Shopping (2026_11_CDS_MIX.pdf, nov/2026) para
data/grafo-planta.json.

Metodo:
  1. pdfplumber.extract_text_lines() por pagina (reconstroi rotulos partidos).
  2. Rotulos capturados por regex na linha; areas (m2) associadas ao rotulo
     mais proximo (< 90 pt) na mesma folha.
  3. Pavimento: pagina 2 = Terreo, pagina 3 = Praca de Alimentacao,
     pagina 1 = folha "MIX L2" (apenas rotulos ausentes nas outras).
  4. Marcas comerciais (Mc Donald's, Giraffas...) fundidas ao nó loja/quiosque
     mais proximo do mesmo piso.
  5. Arestas: 3 vizinhos mais proximos por piso + transicoes de piso
     (rotulo comum aos dois pisos) + contrapartes verticais estimadas.

Limitacoes declaradas no JSON (Fase 2 = vetorizacao oficial + validacao).
"""

import json
import math
import re
from collections import defaultdict
from pathlib import Path

import pdfplumber

PDF = Path(r"C:\Users\Dev Marinho\Downloads\2026_11_CDS_MIX.pdf")
OUT = Path(r"C:\Users\Dev Marinho\capim-dourado-acessivel\data\grafo-planta.json")

PAGINA_PISO = {1: "mix-l2", 2: "terreo", 3: "praca-alimentacao"}

# --------------------------------------------------------------- padroes

MARCAS = [
    "MC DONALD'?S", "GIRAFFAS", "HAVANNA", "OAKBERRY", "NUTTY BAVARIAN",
    "AMERICAN COOKIES", "TOCA DA PIPOCA", "REI DA PA.OCACA", "REI DA PAÇOCA",
    "GELATOS SORVETERIA", "BUBBLE MIX", "MACHINE GAMES", "NEW ERA",
    "MONKEY SHOP", "GOLD SPELL", "GOOLD SPELL", "PANDA POOL", "FUN PHOTO",
    "FUN PHOTOS", "DINOS", "KEKALA", "AROMAAH", "DIVINO", "EMPIRIO ESSENZA",
    "PRONTOFIBRA", "SALVE CLUB", "POP CORN", "ACR.LICOS E CIA", "WE PINK",
    "ACIUM", "MILKMOO", "TOUTI", "SUPER SOFT", "SHAFT", "MINI CARS",
    "CHUTE PLAY", "ARTES JALAP.AO", "TROPIMANGA", "MAROMBAS? SUPLEMENTOS?",
    "MYRRA PERFUMARIA", "KAZZU SPORTS", "VIVANCE", "HAPPY HOUR", "GRUA CHAVES",
    "MOROFOOD", "CHOPP BRAHMA", "BRAHMA", "RESOLVE PALMAS", "ESKILODE",
    "CENTAURO", "SUPERBIG", "MARIA EXPRESS", "Fini", "Fini Pocket",
    "MY", "MY CASE", "Toca da Pipoca", "LAVA JATO CAR COUTO",
]

SERVICOS = [
    r"PRA.A DE EVENTOS", r"ALAMEDA DAS CORES", r"MUNDO IMERSIVO",
    r"EVENTO IMERSO MAR", r"ESP.A FAM.LIA", r"COL.GIO INTERA..O\w*",
    r"UNICESUMAR", r"DELIVERY", r"CENTRO DE DISTRIBUI..O[\s\w]*",
    r"MARIA EXPRESS", r"SE SHOPPING", r"REFEITORIO", r"SEGURAN.A",
    r"CFTV", r"BRIGADA(?:\s+\d+)?", r"KIT CRISE", r"MANUTEN..O", r"LIMPEZA",
    r"SALA [A-Z.A]+", r"ESTACIONAMENTO DE MOTOS", r"BICICLET.RIO",
]

_main = (
    r"\bVAGALOJA\s+\d+"
    r"|LOJA\s+(?:ANC\.?\s*A?9\b|ANCORA\s*\d+\b|PC\s*\d+[A-Z]?\b|\d+(?:\s*/\s*\d+)?(?:[\s-]?[A-Z])?\b)"
    r"|\bQ\s*\d{1,2}[A-Z]?(?:-[A-Z])?\b"
    r"|\bESCADA\s*E?\d+\b"
    r"|\bE[237]\b"
    r"|\bESCADA\b"
    r"|\b(?:SOBE|DESCE)\b"
    r"|\bDOCA(?:[\s\-]+\d+[A-Z]?)?(?:\s+(?:RENNER|MARISA|SUPERBIG|COMPARTILHADA))?"
    r"|\bACESSO\s+(?:PEDESTRE|PEDESTRES(?:/CICLISTAS)?|MOTOS)\b"
    r"|\bENTRADA\b"
    r"|\b(?:SANIT|WC)(?:\.|\s|$)(?:\s*(?:FEM\w*|MASC\w*|PNE))?"
    r"|\bSUBSOLO\s*\d\b"
)
_svc = "|".join(s.replace(" ", r"\s+") for s in SERVICOS)
_mrc = "|".join(m.replace(" ", r"\s+") for m in MARCAS)
PAT = re.compile(_main + r"|(?:" + _svc + r")|(?:" + _mrc + r")\b", re.I)

AREA_RE = re.compile(r"(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*m[\u00b2\u00b3xX]?\b")

TIPO_POR_PREFIXO = {
    "VAGALOJA": "loja", "LOJA": "loja",
    "Q": "quiosque", "ESCADA": "escada", "E": "escada",
    "SOBE": "escada_rolante", "DESCE": "escada_rolante",
    "DOCA": "entrada", "ACESSO": "entrada", "ENTRADA": "entrada",
    "SANIT": "sanitario", "WC": "sanitario",
    "SUBSOLO": "estacionamento",
}

SERVICO_TIPOS = {
    "PRA.A DE EVENTOS": "servico_praça",
    "ALAMEDA DAS CORES": "circulacao",
    "SE SHOPPING": "servico",
    "REFEITORIO": "servico",
    "SEGURAN.A": "servico",
    "CFTV": "servico",
    "BRIGADA": "servico",
    "KIT CRISE": "servico",
    "MANUTEN..O": "servico",
    "LIMPEZA": "servico",
    "SALA": "servico",
    "DELIVERY": "servico",
    "UNICESUMAR": "servico",
    "MARIA EXPRESS": "servico",
    "COL.GIO": "servico",
    "CENTRO DE DISTRIBUI..O": "servico",
    "ESTACIONAMENTO": "estacionamento",
    "BICICLET": "entrada",
    "ESP.A FAM.LIA": "servico",
    "MUNDO IMERSIVO": "lazer",
    "EVENTO IMERSO MAR": "lazer",
}


def classificar(rot: str) -> str | None:
    r = re.sub(r"\s+", " ", rot).strip(" -")
    if len(r) < 2:
        return None
    ru = r.upper()
    if re.fullmatch(r"E\d{1,2}", ru):
        return "escada"
    head = re.split(r"[\s\-]", ru, maxsplit=1)[0].rstrip(".")
    if head in TIPO_POR_PREFIXO:
        return TIPO_POR_PREFIXO[head]
    for chave, tipo in SERVICO_TIPOS.items():
        if ru.startswith(chave) or re.match(chave, ru):
            return tipo
    # marcas
    for m in MARCAS:
        if re.fullmatch(m, ru, re.I):
            return "marca"
    return None


def parse_area(raw: str) -> float | None:
    raw = raw.strip()
    if "," in raw:
        raw = raw.replace(".", "").replace(",", ".")
    try:
        return float(raw)
    except ValueError:
        return None


def build_lines(words: list[dict], top_tol: float = 1.2) -> list[dict]:
    """Agrupa palavras em linhas horizontais (upright) e verticais (rotacionadas).

    top_tol pequeno e essencial: na planta, o rotulo da loja e o valor de area
    sao desenhados sobrepostos (~3 pt de diferenca) e devem ficar em linhas
    distintas.
    """
    h = sorted([w for w in words if w.get("upright", True)],
               key=lambda w: (w["top"], w["x0"]))
    v = sorted([w for w in words if not w.get("upright", True)],
               key=lambda w: (w["x0"], w["top"]))
    lines: list[dict] = []

    cur: list[dict] = []
    for w in h:
        if cur and abs(w["top"] - cur[0]["top"]) > top_tol:
            lines.append(_flush_h(cur))
            cur = []
        cur.append(w)
    if cur:
        lines.append(_flush_h(cur))

    cur = []
    for w in v:
        if cur and abs(w["x0"] - cur[0]["x0"]) > 10:
            lines.append(_flush_v(cur))
            cur = []
        cur.append(w)
    if cur:
        lines.append(_flush_v(cur))
    return lines


def _flush_h(ws: list[dict]) -> dict:
    ws = sorted(ws, key=lambda w: w["x0"])
    return {"text": " ".join(w["text"] for w in ws),
            "x0": ws[0]["x0"], "x1": ws[-1]["x1"],
            "top": min(w["top"] for w in ws),
            "bottom": max(w["bottom"] for w in ws),
            "upright": True}


def _flush_v(ws: list[dict]) -> dict:
    ws = sorted(ws, key=lambda w: w["top"])
    return {"text": " ".join(w["text"] for w in ws),
            "x0": min(w["x0"] for w in ws), "x1": max(w["x1"] for w in ws),
            "top": ws[0]["top"], "bottom": ws[-1]["bottom"],
            "upright": False}


def pos(ln: dict, start: int, end: int) -> tuple[float, float]:
    """Centro aproximado de [start,end] da linha no espaco da pagina."""
    txt = ln["text"]
    n = max(len(txt), 1)
    frac = (start + (end - start) / 2) / n
    if ln["upright"]:
        w = max(ln["x1"] - ln["x0"], 1)
        return ln["x0"] + frac * w, (ln["top"] + ln["bottom"]) / 2
    h = max(ln["bottom"] - ln["top"], 1)
    return (ln["x0"] + ln["x1"]) / 2, ln["top"] + frac * h


def enriquecer(rot: str, x: float, y: float, words: list[dict]) -> str:
    """Completa rotulos incompletos com a palavra vizinha mais proxima
    (ex.: 'ESCADA' + 'E2' -> 'ESCADA E2'; 'SANIT.' + 'FEM.' -> 'SANIT. FEM.')."""
    r = rot.upper()
    def near(pat: str, raio: float) -> str | None:
        cand = [(math.hypot(w["x0"] - x, w["top"] - y), w["text"].strip())
                for w in words
                if re.fullmatch(pat, w["text"].strip(), re.I)
                and math.hypot(w["x0"] - x, w["top"] - y) < raio]
        return min(cand)[1] if cand else None

    if r.startswith("ESCADA") and not re.search(r"E\d", r):
        n = near(r"E\d{1,2}", 55)
        if n:
            return f"{rot} {n}"
    if re.fullmatch(r"E\d{1,2}", r):
        n = near(r".*ESCADA.*", 55)
        if n:
            return f"ESCADA {r}"
    if r.rstrip(".") in ("SANIT", "WC"):
        n = near(r"(?:FEM|MASC|PNE)\.?", 60)
        if n:
            return f"{rot} {n}"
    return rot


# tipos com instancias distintas no mesmo pavimento (nao fundir por nome)
POS_KEYED = {"sanitario", "servico_praça", "entrada", "circulacao", "marca"}


def main() -> None:
    paginas: dict[int, dict] = {}
    rotulos_global: set[str] = set()

    # ---------------------------------------------------------- extracao
    with pdfplumber.open(PDF) as pdf:
        for idx, page in enumerate(pdf.pages, start=1):
            piso = PAGINA_PISO.get(idx, "desconhecido")
            words = page.extract_words(x_tolerance=3, y_tolerance=1.0,
                                       extra_attrs=["upright"])
            lines = build_lines(words)
            labels, areas = [], []

            for ln in lines:
                txt = re.sub(r"\s+", " ", ln["text"] or "").strip()
                if not txt:
                    continue

                for m in PAT.finditer(txt):
                    rot = re.sub(r"\s+", " ", m.group(0)).strip(" -")
                    if classificar(rot) is None:
                        continue
                    x, y = pos(ln, m.start(), m.end())
                    rot = enriquecer(rot, x, y, words)
                    if rot.upper() == "ESCADA":
                        continue  # parte de frase ("AREA DE LOJA SOB ESCADA")
                    labels.append({"rot": rot, "x": x, "y": y})

                for m in AREA_RE.finditer(txt):
                    val = parse_area(m.group(1))
                    if val is None or val <= 0 or val > 40000:
                        continue
                    x, y = pos(ln, m.start(), m.end())
                    areas.append({"val": val, "x": x, "y": y})

            # associa area mais proxima
            for lb in labels:
                melhor, dmin = None, 90.0
                for ar in areas:
                    d = math.hypot(ar["x"] - lb["x"], ar["y"] - lb["y"])
                    if d < dmin:
                        melhor, dmin = ar, d
                lb["areaM2"] = melhor["val"] if melhor else None

            paginas[idx] = {
                "piso": piso, "labels": labels,
                "w": page.width, "h": page.height,
            }

    # --------------------------------------------------- montagem dos nos
    nos: dict[tuple[str, str], dict] = {}

    def adicionar(piso: str, rot: str, x: float, y: float,
                  area: float | None, pagina: int, pw: float, ph: float,
                  extra: dict | None = None) -> dict:
        tipo = classificar(rot) or "ponto_ref"
        if tipo in POS_KEYED:
            chave: tuple = (piso, rot.upper(), round(x / 70), round(y / 70))
        else:
            chave = (piso, rot.upper())
        if chave in nos:
            n = nos[chave]
            k = n["_n"]
            n["coord"] = {"x": round((n["coord"]["x"] * k + x) / (k + 1), 2),
                          "y": round((n["coord"]["y"] * k + y) / (k + 1), 2)}
            n["_n"] = k + 1
            if area and not n.get("areaM2"):
                n["areaM2"] = area
            return n
        base = re.sub(r"[^A-Z0-9]+", "_", rot.upper()).strip("_")[:40]
        nid = f"{piso[:3].upper()}_{base}"
        if tipo in POS_KEYED:
            nid += f"_{int(x)}_{int(y)}"
        n = {
            "id": nid,
            "piso": piso,
            "tipo": tipo,
            "nome": rot,
            "coord": {"x": round(x, 2), "y": round(y, 2)},
            "areaM2": area,
            "_n": 1,
            "_pagina": pagina,
            "_pw": pw, "_ph": ph,
        }
        if extra:
            n.update(extra)
        nos[chave] = n
        return n

    # paginas 2 e 3 primeiro (autoridade por pavimento)
    for idx in (2, 3, 1):
        p = paginas[idx]
        for lb in p["labels"]:
            if idx == 1 and any(lb["rot"].upper() in r for r in rotulos_global):
                continue  # ja existe noutro pavimento / folha
            adicionar(p["piso"], lb["rot"], lb["x"], lb["y"],
                      lb["areaM2"], idx, p["w"], p["h"])
            rotulos_global.add(lb["rot"].upper())

    # ------------------------------------------------- funde marcas
    por_piso = defaultdict(list)
    for n in nos.values():
        por_piso[n["piso"]].append(n)

    for piso, lista in list(por_piso.items()):
        marcas = [n for n in lista if n["tipo"] == "marca"]
        alvos = [n for n in lista if n["tipo"] in ("loja", "quiosque", "lazer", "servico")]
        for mk in marcas:
            melhor, dmin = None, 75.0
            for al in alvos:
                d = math.hypot(al["coord"]["x"] - mk["coord"]["x"],
                               al["coord"]["y"] - mk["coord"]["y"])
                if d < dmin:
                    melhor, d = al, d
                    dmin = d
            if melhor:
                if melhor["nome"].upper() != mk["nome"].upper():
                    melhor["nome"] = f"{melhor['nome']} — {mk['nome']}"
                for k in [k for k, v in nos.items() if v is mk]:
                    nos.pop(k, None)
            else:
                mk["tipo"] = "marca"  # fica como ponto de referencia

    # ------------------------------------------------------- arestas
    arestas = []

    def dist(a, b):
        return math.hypot(a["coord"]["x"] - b["coord"]["x"],
                          a["coord"]["y"] - b["coord"]["y"])

    por_piso = defaultdict(list)
    for n in nos.values():
        por_piso[n["piso"]].append(n)

    for piso, lista in por_piso.items():
        for a in lista:
            viz = sorted((b for b in lista if b is not a),
                         key=lambda b: dist(a, b))[:3]
            for b in viz:
                d = dist(a, b)
                if d > 160:
                    continue
                barreiras = ["degrau"] if "escada" in (a["tipo"], b["tipo"]) else []
                arestas.append({
                    "from": a["id"], "to": b["id"], "piso": piso,
                    "distanciaPt": round(d, 1),
                    "origem": "proximidade_estimada",
                    "barreiras": barreiras,
                    "pesoAcessivel": 5 if barreiras else 0,
                })

    # garante que nenhum nó fica isolado (conexao ao vizinho mais proximo)
    ligados = {e["from"] for e in arestas} | {e["to"] for e in arestas}
    for piso, lista in por_piso.items():
        for a in lista:
            if a["id"] in ligados or len(lista) < 2:
                continue
            b = min((x for x in lista if x is not a), key=lambda x: dist(a, x))
            arestas.append({
                "from": a["id"], "to": b["id"], "piso": piso,
                "distanciaPt": round(dist(a, b), 1),
                "origem": "conexao_forcada",
                "barreiras": [],
                "pesoAcessivel": 0,
            })
            ligados.add(a["id"])

    # transicoes de piso por rotulo comum
    rot_t = {n["nome"].upper(): n for n in por_piso.get("terreo", [])}
    rot_p = {n["nome"].upper(): n for n in por_piso.get("praca-alimentacao", [])}
    transicoes = []
    VERTICAI = ("escada", "escada_rolante", "elevador")
    for r, nt in rot_t.items():
        np_ = rot_p.get(r)
        if np_ and (nt["tipo"] in VERTICAI or np_["tipo"] in VERTICAI):
            barreiras = ["degrau"] if "escada" in (nt["tipo"], np_["tipo"]) else []
            arestas.append({
                "from": nt["id"], "to": np_["id"],
                "pisoTransicao": "terreo->praca-alimentacao",
                "origem": "transicao_piso_detectada",
                "barreiras": barreiras,
                "pesoAcessivel": 5 if barreiras else 0,
            })
            transicoes.append(r)

    # contrapartes verticais estimadas (alinhamento entre pisos)
    contrapartes = 0
    for piso_orig, piso_dest in (("terreo", "praca-alimentacao"),
                                 ("praca-alimentacao", "terreo")):
        for n in list(por_piso.get(piso_orig, [])):
            if n["tipo"] not in VERTICAI:
                continue
            if any(m["nome"].upper() == n["nome"].upper()
                   for m in por_piso.get(piso_dest, [])):
                continue  # rotulo ja existe no piso destino
            destino = {
                "id": f"{piso_dest[:3].upper()}_{re.sub(r'[^A-Z0-9]+', '_', n['nome'].upper())[:40]}",
                "piso": piso_dest,
                "tipo": "transicao_piso",
                "nome": n["nome"],
                "coord": dict(n["coord"]),
                "coord_norm": dict(n.get("_norm", {"x": 0, "y": 0})),
                "origemCoord": "alinhamento_vertical_estimado",
                "acessibilidade": {"semDegraus": False, "rampa": False,
                                   "elevador": False, "sanitarioPNE": False,
                                   "sinalSonora": False},
            }
            # normalizacao usa a pagina do nó de origem
            destino["coord_norm"] = {
                "x": round(n["coord"]["x"] / n["_pw"], 4),
                "y": round(n["coord"]["y"] / n["_ph"], 4),
            }
            chave_d = (piso_dest, destino["nome"].upper())
            if chave_d not in nos:
                nos[chave_d] = destino
                por_piso[piso_dest].append(destino)
                contrapartes += 1
                arestas.append({
                    "from": n["id"], "to": destino["id"],
                    "pisoTransicao": f"{piso_orig}->{piso_dest}",
                    "origem": "alinhamento_vertical_estimado",
                    "barreiras": ["degrau"] if n["tipo"] == "escada" else
                                 (["escada_rolante"] if n["tipo"] == "escada_rolante" else []),
                    "pesoAcessivel": 5 if n["tipo"] == "escada" else 1,
                })

    # ------------------------------------------------------- saida
    for n in nos.values():
        pw = n.pop("_pw", None)
        ph = n.pop("_ph", None)
        pagina = n.pop("_pagina", None)
        n.pop("_n", None)
        if pw and ph:
            n["coord_norm"] = {"x": round(n["coord"]["x"] / pw, 4),
                               "y": round(n["coord"]["y"] / ph, 4)}
        else:
            n.setdefault("coord_norm", {"x": 0.0, "y": 0.0})
        if pagina:
            n["paginaPdf"] = pagina
        if n.get("areaM2") is None:
            n.pop("areaM2", None)
        n.setdefault("acessibilidade", {
            "semDegraus": n["tipo"] not in ("escada", "transicao_piso"),
            "rampa": False, "elevador": n["tipo"] == "elevador",
            "sanitarioPNE": n["tipo"] == "sanitario",
            "sinalSonora": False,
        })

    contagem = defaultdict(int)
    for n in nos.values():
        contagem[f'{n["piso"]}:{n["tipo"]}'] += 1

    grafo = {
        "meta": {
            "projeto": "Capim Dourado Shopping — Acessibilidade e Comunicacao Universal",
            "areaTotalM2": 38800.50,
            "versao": "2026-11-planta-mix-v1",
            "dataExtracao": "2026-11-13",
            "fonte": "2026_11_CDS_MIX.pdf (Plantas Mix, nov/2026, esc. 1:500)",
            "avenidas": ["Avenida JK", "Avenida NS-05", "Avenida LO 2A"],
            "metodo": "pdfplumber extract_text_lines + regex de rotulos + area mais proxima (<90pt)",
            "pavimentos": ["terreo", "praca-alimentacao", "mix-l2"],
            "subsolo1": {"vagas": 140, "pne": 3, "idoso": 11,
                         "neurodiverso": 2, "gestanteCriancas": 4},
            "subsolo2": {"vagas": 216, "pne": 5, "idoso": 8,
                         "neurodiverso": 1, "gestanteCriancas": 4},
            "pendencias": [
                "Marcas ancoradas do briefing (C&A, Riachuelo, Marisa, Outback, Pernambucanas, STZ) a mapear para numeros de loja na planta",
                "Coordenadas = posicao do rotulo no PDF; substituir por vetorizacao oficial na Fase 2",
                "Arestas de proximidade sao estimativas de adjacencia; validar com operacoes do shopping",
                "Contrapartes verticais entre pisos usam alinhamento estimado; confirmar elevadores e escadas rolantes",
            ],
        },
        "resumo": dict(sorted(contagem.items())),
        "transicoesDetectadas": sorted(set(transicoes)),
        "contrapartesVerticaisEstimadas": contrapartes,
        "nos": sorted(nos.values(), key=lambda n: (n["piso"], n["tipo"], n["nome"])),
        "arestas": arestas,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(grafo, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Nos: {len(nos)} | Arestas: {len(arestas)} | "
          f"Transicoes: {len(transicoes)} | Contrapartes: {contrapartes}")
    for k, v in sorted(contagem.items()):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
