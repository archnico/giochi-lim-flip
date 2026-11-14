#!/usr/bin/env python3
"""Audit grafico e tecnico di Diego: asset locali, logo, home, pagine e cache offline."""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
from tempfile import NamedTemporaryFile
from urllib.parse import urlsplit
import json
from hashlib import sha256
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

# Un solo squalo, due pose canoniche verificabili e non confuse fra loro.
sharks = (
    ("nuoto", (950, 511), "b4b669d28bb3410b8176dba50446fee9aa06abde9e34aa31fda2ee6837ca4cc8"),
    ("virata", (598, 785), "897befb90f39f6aa2f842df3b96fe591f781c0e46cf94128829c71f843929d82"),
)
for pose, size, digest in sharks:
    p = ROOT / ("assets/diegoland/squalo-giaguaro-" + pose + ".webp")
    verify(p.is_file(), "Squalo " + pose + " mancante")
    if p.is_file():
        verify(p.stat().st_size < 100_000, "Squalo " + pose + " troppo pesante")
        verify(sha256(p.read_bytes()).hexdigest() == digest, "Squalo " + pose + " alterato")
        try:
            from PIL import Image
            with Image.open(p) as im:
                verify(im.size == size and "A" in im.getbands(),
                       "Squalo " + pose + ": dimensioni/trasparenza errate")
        except ImportError:
            pass
verify("animali:'assets/diegoland/squalo-giaguaro-virata.webp'" in index,
       "La home non mostra lo squalo V2 grande")
verify("squalo-giaguaro-nuoto.webp" in index and "squalo-giaguaro-virata.webp" in index,
       "Conta non dispone di entrambe le pose")
verify("Math.floor(step/countTypes.length)%2" in index,
       "Conta non alterna le pose tra esercizi senza mescolarle")
verify("squalo-giaguaro-nuoto.webp" in chess and "squalo-giaguaro-virata.webp" in chess,
       "Scacchi non usa le due pose approvate")
verify("assets/diegoland/vettori/squalo.svg" not in index + chess,
       "Vecchio squalo non canonico ancora in uso")
verify(index.split("const countTypes=[",1)[1].split("];",1)[0].count("{name:") == 6,
       "Conta dovrebbe proporre soltanto sei tipi di oggetti familiari")

# Icone approvate: stella marina senza volto e polpo blu a tentacoli.
for title, filename, digest, dimensions in (
    ("Stella marina", "stella-marina-canonica.webp", "dfa540c7822cbb26279de8cf7bf31ab195bcc8e9fc27978d33565c34ea88ef0a", (768, 768)),
    ("Polpo", "polpo-canonico.webp", "37ce13cccf5519b5a28d7a3bf310e288bb65955874cb0e1b80f074039992e560", (768, 700)),
):
    p = ROOT / "assets/diegoland" / filename
    verify(p.is_file(), f"{title}: risorsa canonica mancante")
    if p.is_file():
        verify(sha256(p.read_bytes()).hexdigest() == digest, f"{title}: canone alterato")
        verify(p.stat().st_size < 120_000, f"{title}: risorsa pesante")
        try:
            from PIL import Image
            with Image.open(p) as image:
                verify(image.size == dimensions and "A" in image.getbands(),
                       f"{title}: dimensioni o trasparenza errate")
        except ImportError:
            pass
    verify(("assets/diegoland/" + filename) in index, f"{title}: versione provvisoria ancora in Conta")
    verify(("../assets/diegoland/" + filename) in
           (ROOT / "docs/ICONE_APPROVATE.html").read_text(encoding="utf8"),
           f"{title}: assente dalla galleria canonica")

# PESCE è unico: lo stesso asset approvato su menu e Conta.
fish_file = ROOT / "assets/diegoland/pesce-canonico.webp"
verify(fish_file.is_file(), "Pesce canonico mancante")
if fish_file.is_file():
    verify(sha256(fish_file.read_bytes()).hexdigest()
           == "a93b3781bb7eddd314550252f0f767ec3d2735d8e6715801b9c614bce7aa96b4",
           "Pesce canonico alterato")
    verify(fish_file.stat().st_size < 110_000, "Pesce canonico troppo pesante")
    try:
        from PIL import Image
        with Image.open(fish_file) as im:
            verify(im.size == (950, 665) and im.mode == "RGBA", "Pesce dimensioni/trasparenza")
    except ImportError:
        pass
verify(index.count("assets/diegoland/pesce-canonico.webp") == 4,
       "Pesce: incongruenza tra tessere e Conta")
verify("assets/diegoland/vettori/pesce.svg" not in index,
       "Icona del pesce provvisoria ancora in uso")
verify("../assets/diegoland/pesce-canonico.webp" in
       (ROOT / "docs/ICONE_APPROVATE.html").read_text(encoding="utf8"),
       "Pesce assente dalla galleria approvata")

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
                 "./assets/diegoland/squalo-giaguaro-nuoto.webp",
                 "./assets/diegoland/squalo-giaguaro-virata.webp",
                 "./assets/diegoland/stella-marina-canonica.webp",
                 "./assets/diegoland/polpo-canonico.webp",
                 "./assets/diegoland/pesce-canonico.webp",
                 "./assets/diegoland/vettori/numeri.svg",
                 "./parole.html", "./unisci-quantita.html",
                 "./diegoland-arte.css", "./diego-audio.js"):
        verify(path in files, f"File essenziale non in cache: {path}")
    verify("f==='./assets/diegoland/scacchi-logo.webp'" in service_worker
           and "f.indexOf('./assets/diegoland/vettori/')===0" in service_worker
           and "f==='./assets/diegoland/squalo-giaguaro-nuoto.webp'" in service_worker
           and "f==='./assets/diegoland/squalo-giaguaro-virata.webp'" in service_worker
           and "f==='./assets/diegoland/stella-marina-canonica.webp'" in service_worker
           and "f==='./assets/diegoland/polpo-canonico.webp'" in service_worker
           and "f==='./assets/diegoland/pesce-canonico.webp'" in service_worker,
           "Icone marine non precaricate offline")

print(f"Diego — verifiche grafiche: {checks}, problemi: {len(errors)}")
for msg in errors:
    print("ERRORE:", msg)
sys.exit(bool(errors))
