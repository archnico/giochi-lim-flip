# Diego — menu unico per adulti (14 novembre 2026)

## Decisione approvata
Il menu principale è usato **dall'adulto che seleziona l'attività**, non da Diego mentre lavora.
Perciò viene eliminata la distinzione fra poche macroaree e una schermata
«Altri giochi». **Tutte e otto le categorie sono visibili da subito**.

## Categorie di primo livello
1. **Segni e parole** → Pregrafismo, Componi la parola
2. **Acqua** → Splash (apertura diretta)
3. **Scacchi** → Scacchi (apertura diretta)
4. **Matematica** → Conta, Trova il numero, Unisci numeri e quantità
5. **Animali e natura** → Dove vive? L1/L2, I colori degli animali
6. **Attenzione** → Trova uguale, L'intruso
7. **Associazioni** → Abbina (apertura diretta)
8. **Memoria** → Memory (apertura diretta)

Ogni gioco è disponibile esattamente in una categoria. Le categorie con un
solo gioco partono con **un tocco**; le altre aprono la scelta delle singole
attività (sempre per l'adulto). Il pulsante MENU di ogni schermata rimanda
a questa superficie unica. Link profondi a singoli giochi e categorie rimangono
validi.

## Impaginazione
- **LIM 1920×1080**: otto tessere visibili insieme, quattro colonne × due righe.
- **Desktop stretto/tablet**: due colonne e scorrimento naturale.
- **Smartphone**: una colonna, stessa pagina senza compartimenti nascosti.
- Titolo, sottotitolo esplicativo e immagine in ogni tessera; queste scritte
  sono rivolte all'adulto, non appartengono al lessico didattico di Diego.
- Palette Wada/Diegoland con pastelli distinti e contrasto omogeneo.
- Belafonte nell'intestazione, come motivo visivo, **non** tasto «Altri».
- Solo illustrazioni già canonizzate (tranne l'icona funzionale con cifre per
  Matematica); rimosse ancora, manta, granchio e corallo non approvati dai sottomenu.

## Protezioni
- Non aggiungere livelli nascosti, dashboard o interruzioni nel flusso di Diego.
- Le attività didattiche restano snelle, con pochissime parole, target grandi
  e progressione automatica; menu adulto ed esercizio non vanno confusi.
- Le sei figure canoniche del gioco Conta non cambiano.
- File: `index.html` (routing), `diego-menu.css` (impaginazione), `sw.js` (offline).
- Script di audit: `scripts/verifica_grafica.py`, comprende copertura di tutti
  i giochi nelle otto categorie, asset, cache, JavaScript e immagini canoniche.
- Test fotografici desktop/headless non sostituiscono collaudo tattile su
  Samsung Flip 2 WM55R e telefono.
