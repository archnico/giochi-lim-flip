# Diego — Pregrafismo Diegoland (14 novembre 2026)

## Scopo della revisione

L'utente ha approvato la pulizia grafica del pregrafismo per la Samsung Flip e lo smartphone:
niente emoji di sistema negli esercizi, colori coerenti con il tema Diegoland/Wada e
una distinzione inequivocabile fra **strada guida**, **avanzamento esatto** e
**segno realmente disegnato da Diego**. Non cambiano esercizi, livelli, gesti,
tolleranze, puntatori, coordinate SVG o progressione automatica.

## Tre strati visuali

| Strato | Colore | Scopo |
|---|---|---|
| Guida larga e regolare | sabbia #F4E4B0 | mostra la strada, secondaria |
| Puntinato della guida | ocra #B98741 | aiuto di direzione |
| Avanzamento matematicamente corretto | laguna chiara #9AC9C0 | conferma discreta del tratto esatto |
| Tratto autentico del dito | ceruleo saturo #0093A5 | registra il gesto di Diego, in primo piano |

Il ceruleo **resta visibile anche in modalità assistita**; non viene più ridotto
a opacità .22. Non è stata modificata la geometria dei percorsi. La linea
conforme al modello e il tratto umano possono divergere visivamente senza
confondersi, ma le regole per conteggiare una mossa valida non cambiano.

## Grafica e accessibilità

- Fondo avorio #FFF9EC; area esterna verde laguna chiarissimo #E9F5F1; bordi
  ceruleo #0093A5 e testo petrolio #12354E.
- Pulsanti, contatori, barra del progresso, medaglia finale e marcatori
  armonizzati con l'interfaccia di Diego.
- Gatto, mano e stella emoji eliminati dalla **UI resa**. Un nuovo pittogramma
  locale e neutro di tocco (`assets/diegoland/ui/tocco.svg`) affianca la stella
  marina già approvata (`assets/diegoland/stella-marina-canonica.webp`).
- Eliminati gli emoji decorativi degli angoli del foglio, non i dati e i titoli
  degli esercizi originari.
- Schede dei capitoli: immagini vettoriali locali già esistenti e figure
  canoniche, niente emoji dipendenti dal sistema operativo.
- Sostituiti l'esploratore vecchio e lo squalo vecchio nel menu dei percorsi
  con la barba bianca e la virata canonica.
- I messaggi sul foglio usano pochissime parole come TOCCA, SEGUI e OK.
  I comandi tecnici più descrittivi rimangono riservati all'adulto.

## File modificati

- `pregrafismo.html`: simboli e percorsi visuali, livelli di traccia e stato.
- `pregrafismo-v2.css`: riferimenti alle due illustrazioni canoniche.
- `pregrafismo-diegoland-v2.css`: **nuovo** livello CSS finale di tema.
- `assets/diegoland/ui/tocco.svg`: **nuova** icona funzionale neutra locale.
- `sw.js`: versione cache aggiornata e precache dei nuovi file.
- `scripts/verifica_grafica.py`: test del tema e protezione del tracciamento.

## Verifiche

- Verifica automatica delle risorse, HTML, CSS, script, SVG e cache offline.
- Prova visiva in Firefox headless a 1920×1080, 1366×768 e 440×844.
- Test con un gesto simulato al ~60% del percorso, per vedere contemporaneamente
  la linea guida e quella fatta a mano.
- Confronto delle funzioni di mappatura SVG/tocco e dei passi validi con la
  copia precedente (invariati).
- **Resta necessario** il test reale con dito sulla Samsung Flip 2 WM55R,
  browser Tizen 5.0 e sul Redmi.

Questa revisione non aggiunge nuovi capitoli o oggetti didattici, né abilita
decorazioni o animazioni permanenti.
