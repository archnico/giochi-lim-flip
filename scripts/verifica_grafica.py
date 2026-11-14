#!/usr/bin/env python3
"""Audit grafico e tecnico di Diego: asset locali, logo, home, pagine e cache offline."""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
from tempfile import NamedTemporaryFile
from urllib.parse import urlsplit
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
checks = 0


def verify(ok: bool, message: str):
    global checks
    checks += 1
    if not ok:
        errors.append(message)


class Resources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs: list[str] = []
        self.scripts: list[str] = []
        self.script_content: list[str] = []
        self.inside = False

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if tag in ("img", "link", "script", "source"):
            v = props.get("src") or (props.get("href") if tag == "link" else None)
            if v:
                self.refs.append(v)
        if tag == "script" and "src" not in props and props.get("type", "") not in ("application/ld+json", "application/json"):
            self.inside = True
            self.script_content = []

    def handle_data(self, data):
        if self.inside:
            self.script_content.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.inside:
            self.scripts.append("".join(self.script_content))
            self.inside = False


def local(ref: str):
    value = urlsplit(ref).path
    if not value or value.startswith("/") or ":" in value or value.startswith("#"):
        return None
    return value

# Ogni schermata HTML ha riferimenti locali e script validi.
for html in ROOT.glob("*.html"):
    p = Resources()
    p.feed(html.read_text(encoding="utf-8"))
    for ref in p.refs:
        resource = local(ref)
        if resource:
            verify((html.parent / resource).is_file(), f"{html.name}: risorsa mancante {ref}")
    for i, source in enumerate(p.scripts):
        with NamedTemporaryFile("w", encoding="utf-8", suffix=".js") as tmp:
            tmp.write(source)
            tmp.flush()
            result = subprocess.run(["node", "--check", tmp.name], capture_output=True, text=True)
            verify(result.returncode == 0, f"{html.name}: JS inline #{i}: {result.stderr.strip()[:150]}")

# Gli asset CSS referenziati restano sullo stesso sito.
for css in ROOT.glob("*.css"):
    text = css.read_text(encoding="utf-8")
    for raw in re.findall(r"url\(\s*['\"]?([^)'\"]+)", text):
        res = local(raw.strip())
        if res and not res.startswith("data:"):
            verify((css.parent / res).is_file(), f"{css.name}: immagine CSS mancante {raw}")
for js in ROOT.glob("*.js"):
    result = subprocess.run(["node", "--check", str(js)], capture_output=True, text=True)
    verify(result.returncode == 0, f"{js.name}: JS non valido: {result.stderr.strip()[:150]}")

# Tutti gli SVG del kit marino devono avere coordinate e parse validi.
icons = sorted((ROOT / "assets/diegoland/vettori").glob("*.svg"))
verify(len(icons) >= 19, f"Kit marino incompleto: {len(icons)}")
for svg in icons:
    try:
        node = ET.parse(svg).getroot()
        verify(node.attrib.get("viewBox") == "0 0 256 256", f"{svg.name}: viewBox irregolare")
    except ET.ParseError as exc:
        verify(False, f"{svg.name}: SVG malformato: {exc}")

# Il logo approvato dev'essere il medesimo nella home e nella pagina scacchi.
logo = ROOT / "assets/diegoland/scacchi-logo.webp"
verify(logo.is_file(), "Logo scacchi assente")
if logo.is_file():
    verify(logo.stat().st_size < 100_000, "Logo scacchi troppo pesante per LIM")
    verify(logo.read_bytes()[:4] == b"RIFF", "Logo non WebP")
    try:
        from PIL import Image
        with Image.open(logo) as im:
            verify(im.size == (512, 512) and "A" in im.getbands(), "Logo: dimensioni/trasparenza non corrette")
    except ImportError:
        pass

index = (ROOT / "index.html").read_text(encoding="utf-8")
chess = (ROOT / "scacchi-stelle.html").read_text(encoding="utf-8")
parole = (ROOT / "parole.html").read_text(encoding="utf-8")
unisci = (ROOT / "unisci-quantita.html").read_text(encoding="utf-8")
audio = (ROOT / "diego-audio.js").read_text(encoding="utf-8")
verify("scacchi:'assets/diegoland/scacchi-logo.webp'" in index, "Home usa un altro logo scacchi")
verify('class="chess-brand-logo"' in chess and 'src="assets/diegoland/scacchi-logo.webp"' in chess,
       "Testata Scacchi usa un altro logo")
verify("matematica:'assets/diegoland/vettori/numeri.svg'" in index, "Icona numeri poco rappresentativa")
verify("🌈</div>" not in parole and "textContent='TOCCA'" in parole, "Parole conserva un simbolo/istruzione incoerente")
verify('class="top-actions"' in unisci and "querySelector('.top-actions')" in audio,
       "Audio può sovrapporsi a Ricomincia in Unisci")

# Lo stesso sottomarino canonico rappresenta sempre lo stesso oggetto.
submarine = ROOT / "assets/diegoland/acqua-sottomarino-canonico.webp"
verify(submarine.is_file(), "Icona Acqua canonica assente")
if submarine.is_file():
    verify(submarine.stat().st_size < 100_000, "Icona Acqua troppo pesante")
    verify(submarine.read_bytes()[:4] == b"RIFF", "Icona Acqua non WebP")
    for page in ("index.html", "pregrafismo.html", "scacchi-stelle.html"):
        verify("assets/diegoland/acqua-sottomarino-canonico.webp" in (ROOT / page).read_text(encoding="utf8"),
               f"{page}: sottomarino non canonico")

# La cache offline deve contenere ogni file del gioco, incluse le nuove icone.
service_worker = (ROOT / "sw.js").read_text(encoding="utf-8")
m = re.search(r"var FILES=(\[[^\n]*\]);", service_worker)
verify(bool(m), "Lista offline Service Worker non trovata")
if m:
    files = json.loads(m.group(1))
    verify(len(files) == len(set(files)), "Duplicati nella cache offline")
    for ref in files:
        verify((ROOT / ref).is_file(), f"Cache offline: manca {ref}")
    for path in ("./assets/diegoland/scacchi-logo.webp",
                 "./assets/diegoland/vettori/numeri.svg",
                 "./parole.html", "./unisci-quantita.html",
                 "./diegoland-arte.css", "./diego-audio.js"):
        verify(path in files, f"File essenziale non in cache: {path}")
    verify("f==='./assets/diegoland/scacchi-logo.webp'" in service_worker
           and "f.indexOf('./assets/diegoland/vettori/')===0" in service_worker,
           "Icone marine non precaricate offline")

print(f"Diego — verifiche grafiche: {checks}, problemi: {len(errors)}")
for msg in errors:
    print("ERRORE:", msg)
sys.exit(bool(errors))
