#!/usr/bin/env python3
"""Gera o documento consolidado da 1ª entrega (DOCX + HTML para PDF) a partir de docs/*.md.

Uso:
  python3 ferramentas/gerar_documento_entrega.py --repo . --saida entrega \
      --mmdc node_modules/.bin/mmdc --puppeteer-config ferramentas/puppeteer.json

Requisitos: pandoc, mermaid-cli (mmdc), python-docx. O PDF é gerado depois por
ferramentas/html_para_pdf.mjs (Playwright/Chromium, PDF marcado/acessível).
"""
import argparse
import re
import shlex
import subprocess
import sys
import tempfile
from pathlib import Path

ORDEM = [
    "00-sumario-executivo.md",
    "01-contexto-problema-objetivos.md",
    "02-pesquisa-e-benchmark.md",
    "03-personas-e-jornadas.md",
    "04-telas-e-fluxos.md",
    "05-requisitos.md",
    "06-linguagem.md",
    "07-arquitetura.md",
    "08-plataforma-e-tecnologias.md",
    "09-tecnologia-sorteada-react-nextjs.md",
    "10-dados-e-rotas.md",
    "11-acessibilidade-legal-lgpd.md",
    "12-qualidade-e-testes.md",
    "13-plano-mvp-riscos-roadmap.md",
    "14-operacao-no-shopping.md",
]
APENDICES = [
    ("Apêndice A. Wireframes das telas (baixa fidelidade)", "wireframes"),
    ("Apêndice B. Registros de decisão de arquitetura (ADRs)", "adr"),
    ("Apêndice C. Glossário", "glossario.md"),
    ("Apêndice D. Referências", "referencias.md"),
]
TELAS = [
    ("T00", "Início"), ("T01", "Preferências"), ("T02", "Mapa por piso"), ("T03", "Buscar"),
    ("T04", "Detalhe do local"), ("T05", "Rota passo a passo"), ("T06", "Conversar"),
    ("T07", "Prancha de comunicação"), ("T08", "Pedir ajuda"), ("T09", "Acompanhar pedido"),
    ("T10", "Avaliar / reportar barreira"), ("T11", "Serviços acessíveis"), ("T13", "Modo totem"),
]


def apendice_wireframes(titulo: str, pasta: Path) -> str:
    partes = [f"# {titulo}\n",
              "Esboços de baixa fidelidade das telas do visitante (T00–T11, T13) e da Central da equipe (T12). "
              "Versão navegável: `wireframes/index.html` no repositório. Dados de lojas conferidos na Planta Mix; "
              "cardápios ilustrativos.\n"]
    for i in range(0, len(TELAS), 2):
        par = TELAS[i:i + 2]
        cab = " | ".join(f"**{c} · {n}**" for c, n in par)
        img = " | ".join(f"![Wireframe da tela {c}: {n}]({(pasta / (c + '.png')).as_posix()}){{width=7.2cm}}" for c, n in par)
        if len(par) == 1:
            cab += " | "
            img += " | "
        partes.append(f"| {cab} |\n|---|---|\n| {img} |\n")
    partes.append(f"**T12 · Central da equipe (uso interno)**\n\n![Wireframe da tela T12: Central da equipe]({(pasta / 'T12.png').as_posix()}){{width=16cm}}\n")
    return "\n".join(partes)

QUEBRA_DOCX = '\n```{=openxml}\n<w:p><w:r><w:br w:type="page"/></w:r></w:p>\n```\n'
RE_MERMAID = re.compile(r"```mermaid\n(.*?)```", re.S)
RE_LINK_LOCAL = re.compile(r"\[([^\]]+)\]\((?!https?://|mailto:|#)[^)]+\)")

RE_SEPARADOR = re.compile(r"^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$")


def _celulas(linha: str) -> list:
    linha = linha.strip()
    if linha.startswith("|"):
        linha = linha[1:]
    if linha.endswith("|") and not linha.endswith("\\|"):
        linha = linha[:-1]
    return [c.strip() for c in re.split(r"(?<!\\)\|", linha)]


def larguras_proporcionais(md: str) -> str:
    """Reescreve a linha separadora das tabelas pipe com traços proporcionais ao conteúdo,
    para o pandoc gerar colunas de largura adequada (em vez de colunas iguais)."""
    linhas = md.split("\n")
    i = 0
    while i < len(linhas) - 1:
        if linhas[i].lstrip().startswith("|") and RE_SEPARADOR.match(linhas[i + 1].strip()):
            ini = i
            fim = i + 2
            while fim < len(linhas) and linhas[fim].lstrip().startswith("|"):
                fim += 1
            corpo = [linhas[ini]] + linhas[ini + 2:fim]
            tabela = [_celulas(l) for l in corpo]
            n = len(_celulas(linhas[ini + 1]))
            pesos = []
            for c in range(n):
                tams = [len(re.sub(r"[`*_]|<[^>]+>", "", r[c])) if c < len(r) else 0 for r in tabela]
                media = sum(tams) / max(len(tams), 1)
                pesos.append(max(4.0, min(90.0, 0.6 * media + 0.4 * max(tams))))
            total = sum(pesos)
            seps = _celulas(linhas[ini + 1])
            novos = []
            for c in range(n):
                tracos = max(3, round(pesos[c] / total * 100))
                sep = seps[c] if c < len(seps) else "---"
                esq = ":" if sep.startswith(":") else ""
                dir_ = ":" if sep.endswith(":") else ""
                novos.append(esq + "-" * tracos + dir_)
            linhas[ini + 1] = "|" + "|".join(novos) + "|"
            i = fim
        else:
            i += 1
    return "\n".join(linhas)


def deslocar_titulos(md: str, n: int) -> str:
    def f(m):
        return "#" * (len(m.group(1)) + n) + m.group(2)
    return re.sub(r"^(#{1,5})(\s)", f, md, flags=re.M)


def tirar_primeiro_titulo(md: str) -> str:
    return re.sub(r"^#\s.*\n", "", md, count=1)


def renderizar_mermaid(md: str, pasta_img: Path, cont: list, args) -> str:
    def subst(m):
        cont[0] += 1
        n = cont[0]
        antes = md[: m.start()]
        titulos = re.findall(r"^#{1,6}\s+(.*)$", antes, flags=re.M)
        alt = titulos[-1] if titulos else "Diagrama"
        alt = re.sub(r"[`*_]", "", alt)
        mmd = pasta_img / f"diagrama-{n:02d}.mmd"
        png = pasta_img / f"diagrama-{n:02d}.png"
        mmd.write_text(m.group(1), encoding="utf-8")
        cmd = shlex.split(args.mmdc) + ["-i", str(mmd), "-o", str(png), "-s", "2", "-b", "white", "-q"]
        if args.puppeteer_config:
            cmd += ["-p", args.puppeteer_config]
        if args.mermaid_config:
            cmd += ["-c", args.mermaid_config]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0 or not png.exists():
            sys.stderr.write(f"[ERRO] diagrama {n} ({alt}):\n{r.stdout}\n{r.stderr}\n")
            raise SystemExit(2)
        return f"\n![Diagrama {n}: {alt}]({png.as_posix()})\n"
    return RE_MERMAID.sub(subst, md)


def montar(args) -> Path:
    repo = Path(args.repo)
    docs = repo / "docs"
    saida = Path(args.saida)
    saida.mkdir(parents=True, exist_ok=True)
    pasta_img = saida / "diagramas"
    pasta_img.mkdir(exist_ok=True)
    cont = [0]
    partes = []
    for nome in ORDEM:
        md = (docs / nome).read_text(encoding="utf-8")
        md = RE_LINK_LOCAL.sub(r"\1", md)
        md = larguras_proporcionais(md)
        md = renderizar_mermaid(md, pasta_img, cont, args)
        partes.append(md)
    for titulo, alvo in APENDICES:
        if alvo == "wireframes":
            pasta_wf = saida / "wireframes"
            if not (pasta_wf / "T00.png").exists():
                sys.stderr.write("[aviso] rode antes: node ferramentas/capturar_wireframes.mjs\n")
                continue
            partes.append(apendice_wireframes(titulo, pasta_wf))
            continue
        if alvo == "adr":
            pasta = docs / "adr"
            idx = (pasta / "README.md").read_text(encoding="utf-8")
            idx = idx.split("## Modelo")[0]
            bloco = [f"# {titulo}\n", deslocar_titulos(tirar_primeiro_titulo(idx), 0)]
            for f in sorted(pasta.glob("0*.md")):
                bloco.append(deslocar_titulos(f.read_text(encoding="utf-8"), 1))
            md = "\n\n".join(bloco)
        else:
            md = (docs / alvo).read_text(encoding="utf-8")
            md = f"# {titulo}\n" + tirar_primeiro_titulo(md)
            md = deslocar_titulos(md, 0)
        md = RE_LINK_LOCAL.sub(r"\1", md)
        md = larguras_proporcionais(md)
        md = renderizar_mermaid(md, pasta_img, cont, args)
        partes.append(md)
    meta = (
        "---\n"
        "title: \"Guia Dourado: Planejamento Técnico Inicial\"\n"
        "subtitle: \"Acessibilidade e Comunicação Universal no Capim Dourado Shopping (Palmas/TO). Desafio 01, 1ª entrega. Tecnologia sorteada: React + Next.js (TypeScript)\"\n"
        "author: \"Equipe do Desafio 01: Acessibilidade e comunicação universal\"\n"
        "date: \"13 de novembro de 2026 · versão 2.0\"\n"
        "lang: pt-BR\n"
        "toc-title: \"Sumário\"\n"
        "---\n\n"
    )
    corpo_docx = meta + QUEBRA_DOCX.join(partes)
    corpo_html = meta + "\n\n".join(partes)
    md_docx = saida / "_entrega_docx.md"
    md_html = saida / "_entrega_html.md"
    md_docx.write_text(corpo_docx, encoding="utf-8")
    md_html.write_text(corpo_html, encoding="utf-8")
    print(f"diagramas renderizados: {cont[0]}")
    return md_docx, md_html


def pandoc_docx(md: Path, saida: Path, ref: Path | None) -> Path:
    out = saida / "PLANEJAMENTO_TECNICO_INICIAL_v2.docx"
    cmd = ["pandoc", str(md), "-o", str(out), "--toc", "--toc-depth=2", "-f", "markdown+pipe_tables+raw_attribute"]
    if ref and ref.exists():
        cmd += ["--reference-doc", str(ref)]
    subprocess.run(cmd, check=True)
    return out


def pandoc_html(md: Path, saida: Path, css: Path) -> Path:
    out = saida / "_entrega.html"
    cmd = ["pandoc", str(md), "-o", str(out), "--standalone", "--toc", "--toc-depth=2",
           "--embed-resources", "--css", str(css), "-f", "markdown+pipe_tables",
           "--metadata", "pagetitle=Guia Dourado: Planejamento Técnico Inicial v2"]
    subprocess.run(cmd, check=True)
    return out


def pos_processar_docx(caminho: Path) -> None:
    from docx import Document
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    doc = Document(str(caminho))
    for t in doc.tables:
        tblPr = t._tbl.tblPr
        bordas = OxmlElement("w:tblBorders")
        for lado in ("top", "left", "bottom", "right", "insideH", "insideV"):
            b = OxmlElement(f"w:{lado}")
            b.set(qn("w:val"), "single")
            b.set(qn("w:sz"), "4")
            b.set(qn("w:space"), "0")
            b.set(qn("w:color"), "8A94A3")
            bordas.append(b)
        tblPr.append(bordas)
        if t.rows:
            cab = t.rows[0]
            trPr = cab._tr.get_or_add_trPr()
            rep = OxmlElement("w:tblHeader")
            rep.set(qn("w:val"), "true")
            trPr.append(rep)
            for cel in cab.cells:
                tcPr = cel._tc.get_or_add_tcPr()
                shd = OxmlElement("w:shd")
                shd.set(qn("w:val"), "clear")
                shd.set(qn("w:color"), "auto")
                shd.set(qn("w:fill"), "E8F1FA")
                tcPr.append(shd)
    # atualizar o sumário ao abrir no Word
    settings = doc.settings.element
    upd = OxmlElement("w:updateFields")
    upd.set(qn("w:val"), "true")
    settings.append(upd)
    cp = doc.core_properties
    cp.title = "Guia Dourado: Planejamento Técnico Inicial v2"
    cp.subject = "Acessibilidade e comunicação universal no Capim Dourado Shopping"
    cp.language = "pt-BR"
    cp.keywords = "acessibilidade, Libras, WCAG 2.2, Next.js, React, shopping, Palmas"
    doc.save(str(caminho))


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--repo", default=".")
    p.add_argument("--saida", default="entrega")
    p.add_argument("--mmdc", default="mmdc")
    p.add_argument("--puppeteer-config", default="")
    p.add_argument("--mermaid-config", default="")
    p.add_argument("--reference-doc", default="")
    p.add_argument("--css", default="ferramentas/entrega.css")
    a = p.parse_args()
    md_docx, md_html = montar(a)
    saida = Path(a.saida)
    docx = pandoc_docx(md_docx, saida, Path(a.reference_doc) if a.reference_doc else None)
    pos_processar_docx(docx)
    html = pandoc_html(md_html, saida, Path(a.css))
    print(f"DOCX: {docx}\nHTML: {html}")


if __name__ == "__main__":
    main()
