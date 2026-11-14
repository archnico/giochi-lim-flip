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

# CHITARRA approvata: la stessa icona usata in Conta e nel canone.
guitar_file = ROOT / "assets/diegoland/chitarra-canonica.webp"
verify(guitar_file.is_file(), "Chitarra canonica mancante")
if guitar_file.is_file():
    verify(sha256(guitar_file.read_bytes()).hexdigest()
           == "708a69a2db5c491e8dee4248998832ac14f622d894540d0cbea52a4f31e50b7e",
           "Chitarra canonica alterata")
    verify(guitar_file.stat().st_size < 100_000, "Chitarra troppo pesante per LIM")
    try:
        from PIL import Image
        with Image.open(guitar_file) as im:
            verify(im.size == (768, 768) and im.mode == "RGBA",
                   "Chitarra: dimensioni/trasparenza errate")
    except ImportError:
        pass
verify("{name:'CHITARRA',file:'assets/diegoland/chitarra-canonica.webp'}" in index,
       "Conta mostra una chitarra non canonica")
verify("assets/diegoland/vettori/chitarra.svg" not in index,
       "Icona chitarra provvisoria ancora usata")
verify("../assets/diegoland/chitarra-canonica.webp" in
       (ROOT / "docs/ICONE_APPROVATE.html").read_text(encoding="utf8"),
       "Chitarra non presente nella galleria delle icone approvate")

# Salvagente approvato per la navigazione, NON come oggetto di Conta.
lifebuoy = ROOT / "assets/diegoland/salvagente-canonico.webp"
verify(lifebuoy.is_file(), "Salvagente canonico mancante")
if lifebuoy.is_file():
    verify(sha256(lifebuoy.read_bytes()).hexdigest()
           == "da5fdcc2aa66b4e73ffd4b7436b6c731ac3f1e682e37698e4c431748a2342464",
           "Salvagente canonico alterato")
    verify(lifebuoy.stat().st_size < 125_000, "Salvagente troppo pesante")
    try:
        from PIL import Image
        with Image.open(lifebuoy) as im:
            verify(im.size == (768, 768) and im.mode == "RGBA",
                   "Salvagente: dimensioni o trasparenza sbagliate")
            verify(im.getpixel((384, 384))[3] < 8,
                   "Salvagente: il foro centrale deve essere trasparente")
    except ImportError:
        pass
verify(index.count("assets/diegoland/salvagente-canonico.webp") == 2,
       "Salvagente: incoerenza nella navigazione Associazioni")
verify("assets/diegoland/vettori/salvagente.svg" not in index,
       "Salvagente provvisorio ancora usato")
verify("SALVAGENTE" not in index.split("const countTypes=[",1)[1].split("];",1)[0],
       "Salvagente introdotto senza richiesta in Conta")
verify("../assets/diegoland/salvagente-canonico.webp" in
       (ROOT / "docs/ICONE_APPROVATE.html").read_text(encoding="utf8"),
       "Salvagente assente dalla galleria approvata")

# Chiusura: nave ed esploratore approvati, puramente navigazionali.
for name,filename,digest,dimensions,max_bytes in (
    ("Belafonte", "belafonte-canonica.webp",
     "9a49b0ff64361e31c7c5fba4958e8beef8e3e005aedba1374ebfa2601393d57f",
     (1480,493), 150_000),
    ("Esploratore", "esploratore-canonico.webp",
     "7dfdd995af8ea3538c08511fbcc00fdb2d0e911326c9ebdd2d0afafb0ee2887b",
     (430,900), 75_000),
):
    pth = ROOT / "assets/diegoland" / filename
    verify(pth.is_file(), f"{name}: asset canonico assente")
    if pth.is_file():
        verify(sha256(pth.read_bytes()).hexdigest()==digest,
               f"{name}: il file approvato è stato alterato")
        verify(pth.stat().st_size < max_bytes, f"{name}: risorsa pesante")
        try:
            from PIL import Image
            with Image.open(pth) as im:
                verify(im.size == dimensions and im.mode == "RGBA",
                       f"{name}: dimensioni/trasparenza non coerenti")
                verify(im.getpixel((0,0))[3] == 0,
                       f"{name}: sfondo non trasparente")
        except ImportError:
            pass
    verify(("../assets/diegoland/"+filename) in
           (ROOT / "docs/ICONE_APPROVATE.html").read_text(encoding="utf8"),
           f"{name}: manca nella galleria canonica")

verify("pregrafismo:'assets/diegoland/esploratore-canonico.webp'" in index,
       "PAROLE: manca l'esploratore dalla barba bianca")
verify("esploratore_intero.webp" not in index,
       "PAROLE: vecchio esploratore ancora in uso")
verify('<div class="diego-menu-heading">' in index and
       '<img src="assets/diegoland/belafonte-canonica.webp"' in index,
       "Belafonte non compare nell'intestazione del menu unico")
verify("belafonte-canonica.webp" not in
       index.split("const countTypes=[",1)[1].split("];",1)[0],
       "Belafonte erroneamente introdotta in Conta")
verify("esploratore-canonico.webp" not in
       index.split("const countTypes=[",1)[1].split("];",1)[0],
       "Esploratore erroneamente introdotto in Conta")
verify('diego-menu-heading img' in
       (ROOT / "diego-menu.css").read_text(encoding="utf8"),
       "Belafonte: manca la regola per la silhouette larga")

# Menu adulto: tutte le otto categorie in home e nessuna sezione "Altri".
menu_script=index.split("function home(){",1)[1].split("function flipGameCard(",1)[0]
topics_data=index.split("const topics=[",1)[1].split("];",1)[0]
verify(topics_data.count("{id:") == 8,
       "Menu adulto: attese esattamente otto categorie")
verify("topics.map(function(t)" in menu_script and
       "diego-menu-grid" in menu_script and
       "data-topic" in menu_script,
       "Menu adulto: non tutte le categorie sono generate in superficie")
verify("otherBtn" not in index and "openOthers" not in index and
       "ALTRI GIOCHI" not in index,
       "Menu adulto: persiste la vecchia sezione Altri")
verify("if(t.ids.length===1)start(t.ids[0]);else openTopic(t.id)" in index,
       "Menu adulto: apertura diretta per le categorie con un gioco non attiva")
verify("function openTopic(id)" in index and "backTopic" in index,
       "Menu adulto: selezione dei giochi interni o ritorno al menu assenti")
verify("diego-menu.css" in index,
       "Menu adulto: foglio di stile non caricato")
games_data=index.split("const games=[",1)[1].split("];",1)[0]
all_games=set(re.findall(r"\{id:'([^']+)'", games_data))
topic_groups=re.findall(r"ids:\[([^\]]*)\]",topics_data)
surface_games=[id for group in topic_groups for id in re.findall(r"'([^']+)'",group)]
verify(len(topic_groups)==8 and len(surface_games)==len(set(surface_games)) and
       set(surface_games)==all_games,
       "Menu unico: giochi duplicati o mancanti tra le otto categorie")
verify("vettori/ancora.svg" not in index and
       "vettori/granchio.svg" not in index and
       "vettori/manta.svg" not in index and
       "vettori/corallo.svg" not in index,
       "Navigazione: vecchie illustrazioni non approvate ancora in uso")
verify("numeri:'assets/diegoland/vettori/numeri.svg'" in index,
       "Trova il numero: simbolo numerico assente nella lista dell'adulto")
css=(ROOT / "diego-menu.css").read_text(encoding="utf8")
verify("grid-template-columns:repeat(4,minmax(0,1fr))" in css and
       "grid-template-columns:repeat(2,minmax(0,1fr))" in css and
       "grid-template-columns:minmax(0,1fr)" in css,
       "Menu adulto: griglia non adattiva 4/2/1 colonne")
for category in ("pregrafismo","acqua","scacchi","matematica","animali",
                 "attenzione","associazioni","memoria"):
    verify("id:'"+category+"'" in topics_data and
           category+":" in index.split("const flipVisual={",1)[1].split("};",1)[0],
           "Menu adulto: manca la categoria/immagine "+category)

# Pregrafismo: tema Diegoland e distinzione reale fra guida, progresso
# preciso e tratto libero. Le regole di touch restano quelle collaudate.
preg=(ROOT/'pregrafismo.html').read_text(encoding="utf8")
old_preg=(ROOT/'pregrafismo.html.pre-diegoland-20261114.bak')
pg_css=(ROOT/'pregrafismo-diegoland.css').read_text(encoding="utf8")
pg_v2=(ROOT/'pregrafismo-v2.css').read_text(encoding="utf8")
touch_icon=ROOT/'assets/diegoland/ui/tocco.svg'
verify('<link rel="stylesheet" href="pregrafismo-diegoland.css">' in preg,
       "Pregrafismo: il tema aggiornato non viene caricato")
verify(touch_icon.is_file(),"Pregrafismo: icona tocco assente")
if touch_icon.is_file():
    try:
        svg=ET.parse(touch_icon).getroot()
        verify(svg.attrib.get("viewBox")=="0 0 64 64",
               "Pregrafismo: icona tocco SVG malformata")
    except ET.ParseError:
        verify(False,"Pregrafismo: icona tocco SVG invalida")
verify("assets/diegoland/stella-marina-canonica.webp" in preg
       and "var star=svg('image'" in preg,
       "Pregrafismo: arrivo e premio non usano la stella canonica")
verify("assets/diegoland/ui/tocco.svg" in preg
       and "pg-visual-instruction" in preg,
       "Pregrafismo: istruzioni visive non locali")
verify("var picture='<img src=" in preg and
       "c.icon+'</span>'" not in preg,
       "Pregrafismo: emoji nei capitoli ancora renderizzati")
verify("lesson[2]||''" not in preg and
       "lesson[3]||''" not in preg and
       ".pc-corner {\n  display:none!important" in pg_css,
       "Pregrafismo: vecchi emoji decorativi ancora visibili")
verify("👆 → ⭐" not in preg and
       "setMessage('⭐')" not in preg and
       '">✏️</h1>' not in preg,
       "Pregrafismo: emoji di sistema visibili nelle istruzioni")
verify("stroke:'#F4E4B0'" in preg and
       "stroke:'#B98741'" in preg and
       "stroke:'#9AC9C0'" in preg,
       "Pregrafismo: guida sabbia e progresso laguna non distinti")
verify("stroke:var(--pg-hand)" in pg_css and
       "--pg-hand:#0093A5" in pg_css and
       "opacity:'.98'" in preg and
       "opacity:effectiveMode()===0?'.22':'.9'" not in preg,
       "Pregrafismo: tratto reale non contrastato in ogni modalità")
verify("esploratore_intero.webp" not in pg_v2 and
       "squalo_giaguaro.webp" not in pg_v2 and
       "esploratore-canonico.webp" in pg_v2 and
       "squalo-giaguaro-virata.webp" in pg_v2,
       "Pregrafismo: illustrazioni superate nel selettore")
verify("id=\"guide-hand\" cx=" in preg and
       "setAttribute('cx',point.x)" in preg,
       "Pregrafismo: puntatore demo SVG non collegato")
# Conferma che la patch estetica non modifica la matematica o i limiti touch.
if old_preg.is_file():
    original=old_preg.read_text(encoding="utf8")
    for a,b in (
        ("function mapEvent(e){","function dist(a,b){"),
        ("function moveStep(pt){","function moveGesture(ev,id){"),
        ("function moveGesture(ev,id){","function endGesture(id){")
    ):
        verify(preg.split(a,1)[1].split(b,1)[0] ==
               original.split(a,1)[1].split(b,1)[0],
               "Pregrafismo: modificate accidentalmente le regole del touch")

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
                 "./assets/diegoland/chitarra-canonica.webp",
                 "./assets/diegoland/salvagente-canonico.webp",
                 "./assets/diegoland/esploratore-canonico.webp",
                 "./assets/diegoland/belafonte-canonica.webp",
                 "./assets/diegoland/vettori/numeri.svg",
                 "./parole.html", "./unisci-quantita.html",
                 "./diegoland-arte.css", "./diego-menu.css", "./pregrafismo-diegoland.css",
                 "./assets/diegoland/ui/tocco.svg", "./diego-audio.js"):
        verify(path in files, f"File essenziale non in cache: {path}")
    verify("f==='./assets/diegoland/ui/tocco.svg'" in service_worker
           and "f==='./assets/diegoland/scacchi-logo.webp'" in service_worker
           and "f.indexOf('./assets/diegoland/vettori/')===0" in service_worker
           and "f==='./assets/diegoland/squalo-giaguaro-nuoto.webp'" in service_worker
           and "f==='./assets/diegoland/squalo-giaguaro-virata.webp'" in service_worker
           and "f==='./assets/diegoland/stella-marina-canonica.webp'" in service_worker
           and "f==='./assets/diegoland/polpo-canonico.webp'" in service_worker
           and "f==='./assets/diegoland/pesce-canonico.webp'" in service_worker
           and "f==='./assets/diegoland/chitarra-canonica.webp'" in service_worker
           and "f==='./assets/diegoland/salvagente-canonico.webp'" in service_worker
           and "f==='./assets/diegoland/esploratore-canonico.webp'" in service_worker
           and "f==='./assets/diegoland/belafonte-canonica.webp'" in service_worker,
           "Icone marine non precaricate offline")

print(f"Diego — verifiche grafiche: {checks}, problemi: {len(errors)}")
for msg in errors:
    print("ERRORE:", msg)
sys.exit(bool(errors))
