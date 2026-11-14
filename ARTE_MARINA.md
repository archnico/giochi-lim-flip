# Diego — direzione grafica scelta il 13 novembre 2026

La versione grafica scelta dall’utente è la **tavola collage** con:
- esploratore con cuffia rossa, barba bianca e tuta azzurra;
- sottomarino giallo con oblò blu e striscia scura;
- squalo giaguaro arancione leopardato;
- piccoli pesci, alghe, bolle e coralli su sfondo mare petrolio.

Palette di riferimento: #12354E, #0093A5, #B4CDC2, #F99D1B, #FFEFAE, #F48067, #DD4027 e #FFF9EC.
Nome pubblico della piattaforma: **Diego**; Diegoland indica il tema.

Le derivazioni WebP in `assets/diegoland/` sono state ricavate dal **set esatto indicato dall’utente**, usando il suo screenshot. L’originale dello screenshot è custodito nell’archivio privato e non viene pubblicato per evitare di esporre i comandi del telefono.

Applicazione iniziale: figure sulle grandi tessere Home (Pregrafismo, Acqua, Animali) e palette CSS `diegoland-arte.css`. Le immagini didattiche negli esercizi e le aree toccabili non vengono ridotte. Gli asset WebP sono locali e sono inseriti nell’elenco dei file del Service Worker; nessuna risorsa remota a runtime.

Collaudo reale su Samsung Flip 2 WM55R e telefono: ancora da completare; sintassi JavaScript, riferimenti asset e integrità immagine verificati da n1.

### Rifinitura grafica 14/11/2026

Conservato il set collage scelto. Eliminati componenti alpha isolati (frammenti sotto le scarpe dell'esploratore e lungo il bordo dello squalo), puliti gli alpha, ritagliate le tele con margini regolari e ricampionati in WebP trasparente a 3× per la LIM. Originali locali in `~/src/diego/Consegne/arte_20261114_originali/`; rigenerazione ripetibile: `python3 tools/refine_diegoland_assets.py ~/src/diego/Consegne/arte_20261114_originali assets/diegoland`. Il precedente pittogramma del berretto sul tabellone è stato sostituito con una cuffia rossa frontale a coste, SVG originale nitido anche nelle caselle piccole. Verificata la resa Home e scacchiera con Firefox headless su n1; collaudo tattile reale ancora da fare.

## Scacchi

La scacchiera usa re, torre e regina, 12 livelli ciascuno in sequenza
automatica (36 in totale). Un tocco è la modalità predefinita;
due tocchi e trascinamento sono disponibili. Gli obiettivi marini
compaiono contemporaneamente ai livelli multipli.


## Canone grafico aggiornato (14 novembre 2026)

Le prime tre identità visive **approvate una per volta** sostituiscono i prototipi:
- **SCACCHI:** torre marina senza cuffia rossa; `docs/SCACCHI_ICONA_CANONICA_20261114.md`.
- **ACQUA:** unico sottomarino giallo, `docs/ACQUA_ICONA_CANONICA_20261114.md`.
- **SQUALO:** un solo squalo giaguaro in due pose, V1 NUOTO e V2 VIRATA;
  `docs/SQUALO_GIAGUARO_CANONICO_20261114.md`.
Le quattro immagini prodotte e approvate sono raccolte in `docs/ICONE_APPROVATE.html`.
Gli SVG precedenti nella galleria `galleria-vettori.html` sono materiale di
lavoro *non approvato*, non la collezione canonica. Una sola nuova icona per
volta, senza spostare nel gioco prototipi non convalidati.

La descrizione storica qui sopra delle 36 prove con tre pezzi è superata:
il gioco attuale conserva la progressione continua con re, torre, regina,
alfiere, cavallo e pedone; il logo rimane indipendente dalle regole didattiche.


### Canone aggiuntivo — polpo e stella marina (14/11/2026)

- `docs/POLPO_CANONICO_20261114.md`: polpo a otto tentacoli con occhi, come approvato.
- `docs/STELLA_MARINA_CANONICA_20261114.md`: stella marina a cinque bracci, **senza occhi e senza sorriso**, come approvato.
- Entrambe le figure sono già utilizzate in Conta, con archivio di provenienza, hash e cache offline.
- Il prossimo eventuale soggetto deve essere approvato prima dell'integrazione.

### Pesce unico approvato (14/11/2026)

- `docs/PESCE_CANONICO_20261114.md`: nuovo pesce turchese/coda gialla, WebP trasparente, un solo esemplare.
- Usato in `Conta` e nelle icone secondarie, non al posto delle fotografie degli esercizi.
- La chitarra è il prossimo soggetto da proporre, **non ancora approvato**.
