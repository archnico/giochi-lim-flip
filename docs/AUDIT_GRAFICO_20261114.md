# Diego — audit di coerenza grafica (14 novembre 2026)

## Regola visiva
Palette Diegoland marina ispirata al collage scelto: blu petrolio, ceruleo, laguna, giallo sommergibile, avorio e piccoli accenti rosso/corallo. Icone con sagoma chiara, sfondo trasparente, niente risorse o font esterni. I soggetti didattici (fotografie, lettere, cifre e pezzi degli scacchi) prevalgono sempre sulla decorazione.

## Controlli effettuati
- Home a 1920×1080 e 440×844 tramite Firefox headless.
- Scacchi a 1280×900: stesso logo marino in home e intestazione, scacchiera e pezzi ben distinti.
- Parole a 1280×900: palette coordinata, visibilità della parola breve «TOCCA».
- Numeri a 1280×900: titolo breve «TROVA 1», grandi cifre mantenute.
- Unisci a 1280×900 e 440×844: nessuna sovrapposizione tra il comando audio e «RICOMINCIA»; le impostazioni restano per l'adulto.
- Verifiche automatiche in `scripts/verifica_grafica.py`: validità sintattica dei JavaScript, presenza delle risorse HTML/CSS, SVG, cache offline, identità del logo e corretto instradamento del comando audio. Risultato: 283 controlli senza problemi.

## Correzioni
1. Tessera «NUMERI»: la conchiglia, poco riconoscibile come simbolo matematico, è sostituita da un'icona SVG marina con 1, 2, 3 in grandi cerchi.
2. «PAROLE»: eliminato l'arcobaleno introduttivo a favore di un soggetto marino; il piccolo simbolo di tocco che poteva apparire minuscolo ora è «TOCCA».
3. «UNISCI»: il pulsante SUONI ora condivide la barra superiore con le impostazioni, senza coprire il comando di ripartenza; istruzione resa visiva «1 → ●»; testo del titolo ridotto.
4. Pulsante SUONI condiviso: usa blu petrolio, avorio e verde laguna coerenti con le altre barre.
5. «TROVA IL NUMERO»: titolo corrente sintetico «TROVA 1» ecc.
6. Nuovo asset inserito nella cache; nuovo cache key per attivare l'aggiornamento offline.

## Limiti del controllo
Screenshot e test di questo audit sono su Firefox desktop in due classi di schermo: non sostituiscono il collaudo diretto sul Samsung Flip 2 WM55R con il suo browser Tizen 5 e sul telefono reale. Nessuna variazione alla meccanica didattica, alla logica di correttezza o alla progressione dei livelli.
