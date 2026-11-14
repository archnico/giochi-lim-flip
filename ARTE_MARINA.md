# Diego — direzione grafica scelta il 13 novembre 2026

La versione grafica scelta dall’utente è la **tavola collage** con:
- esploratore con cuffia rossa, barba bianca e tuta azzurra;
- sottomarino giallo con oblò blu e striscia scura;
- squalo giaguaro arancione leopardato;
- piccoli pesci, alghe, bolle e coralli su sfondo mare petrolio.

Palette di riferimento: #12354E, #0093A5, #B4CDC2, #F99D1B, #FFEFAE, #F48067, #DD4027 e #FFF9EC.
Nome pubblico della piattaforma: **Diego**; Diegoland indica il tema.

Le derivazioni WebP in `assets/diegoland/` sono state ricavate dal **set esatto indicato dall’utente**, usando il suo screenshot. L’originale dello screenshot è custodito localmente in `~/src/diego/Consegne/Diego_riferimento_grafico_2026-11-13.jpg`, non pubblicato per evitare di esporre i comandi del telefono.

Applicazione iniziale: figure sulle grandi tessere Home (Pregrafismo, Acqua, Animali) e palette CSS `diegoland-arte.css`. Le immagini didattiche negli esercizi e le aree toccabili non vengono ridotte. Gli asset WebP sono locali e sono inseriti nell’elenco dei file del Service Worker; nessuna risorsa remota a runtime.

Collaudo reale su Samsung Flip 2 WM55R e telefono: ancora da completare; sintassi JavaScript, riferimenti asset e integrità immagine verificati da n1.


## Rifinitura visiva del 14 novembre 2026

Ritagli collage originali conservati: eliminati i pixel isolati intorno allo squalo e sotto Zissou, rifinita la trasparenza e preparate derivazioni WebP 3× per la LIM. La cuffia rossa sul tabellone è stata ridisegnata come pittogramma frontale in SVG, con risvolto a coste riconoscibile anche da piccola. Originali non ripuliti custoditi su n1 in `~/src/diego/Consegne/arte_20261114_originali/`; rigenerazione: `tools/refine_diegoland_assets.py` (solo sorgenti locali, non distribuito nel sito). Screenshot Home e scacchiera verificati su Firefox; collaudo tattile su WM55R e telefono ancora da fare.
