"""Cria o modelo de estilos (reference.docx) usado pelo pandoc para o DOCX da entrega."""
import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.shared import Pt, RGBColor

destino = Path(sys.argv[1] if len(sys.argv) > 1 else "ferramentas/reference.docx")
with open(destino, "wb") as f:
    subprocess.run(["pandoc", "--print-default-data-file", "reference.docx"], stdout=f, check=True)

doc = Document(str(destino))
AZUL = RGBColor(0x0B, 0x4F, 0x8A)
config = {
    "Normal": (10.5, None, False),
    "Body Text": (10.5, None, False),
    "First Paragraph": (10.5, None, False),
    "Compact": (9.5, None, False),
    "Title": (28, AZUL, True),
    "Subtitle": (13, RGBColor(0x2B, 0x34, 0x40), False),
    "Author": (11, RGBColor(0x5B, 0x64, 0x70), False),
    "Date": (11, RGBColor(0x5B, 0x64, 0x70), False),
    "Heading 1": (18, AZUL, True),
    "Heading 2": (14, AZUL, True),
    "Heading 3": (12, RGBColor(0x12, 0x38, 0x5F), True),
    "Heading 4": (11, RGBColor(0x12, 0x38, 0x5F), True),
    "TOC Heading": (18, AZUL, True),
}
for nome, (tam, cor, negrito) in config.items():
    try:
        st = doc.styles[nome]
    except KeyError:
        continue
    st.font.name = "Arial"
    st.font.size = Pt(tam)
    st.font.bold = negrito
    if cor is not None:
        st.font.color.rgb = cor
doc.save(str(destino))
print("reference.docx criado em", destino)
