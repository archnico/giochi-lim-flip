# Diego — Suoni acquatici realistici · fonti e licenze

Registrazioni sul campo, non suoni sintetici né musica; integrate in Diego con parsimonia.
Le fonti sotto sono tutte **pubblico dominio** secondo le rispettive schede Wikimedia Commons.
Attribuzione non obbligatoria ma fornita per documentare la provenienza.

## Campioni utilizzati

| Effetto nel gioco | Autore registrazione | Fonte e licenza | Campione elaborato |
|---|---|---|---|
| risacca | earthcalling | [Water over rocks as tide recedes.ogg](https://commons.wikimedia.org/wiki/File:Water_over_rocks_as_tide_recedes.ogg) — pubblico dominio | `assets/suoni/acqua-risacca.wav` |

  - Tratto 7,2–15,2 secondi; originale SHA256: `07634cf0f0b5a8ed6e0b83222f41f84b36ca4cb482e3229abfe7a35b9e2b72b6`; campione SHA256: `a7567efd0819804fc85b9324eeddd5e44d4c1912ea140d530ed124462f91eb00`.
| schizzo 1 | gradha (Grzegorz Adam Hankiewicz) | [Bathtub water splashes.ogg](https://commons.wikimedia.org/wiki/File:Bathtub_water_splashes.ogg) — pubblico dominio | `assets/suoni/acqua-schizzo-1.wav` |

  - Tratto 2,95–4,60 secondi; originale SHA256: `471b9c2cc35a183d74af61abc1352c93ecc457450cef1c29aa79669113010f38`; campione SHA256: `3bcf51af3feab3cf55d1876e16de95fe710c03af661e392ef117e652a46e5f4d`.
| schizzo 2 | gradha (Grzegorz Adam Hankiewicz) | [Bathtub water splashes.ogg](https://commons.wikimedia.org/wiki/File:Bathtub_water_splashes.ogg) — pubblico dominio | `assets/suoni/acqua-schizzo-2.wav` |

  - Tratto 24,65–26,55 secondi; originale SHA256: `471b9c2cc35a183d74af61abc1352c93ecc457450cef1c29aa79669113010f38`; campione SHA256: `56b0a44013a2d8381a1f109883b9c2a544886609189fa1c7df16d2e544b0b6de`.
| bolle vere | stephan | [Water bubbles chortling.ogg](https://commons.wikimedia.org/wiki/File:Water_bubbles_chortling.ogg) — pubblico dominio | `assets/suoni/acqua-bolle-naturali.wav` |

  - Tratto 16,5–19,6 secondi; originale SHA256: `6ec962a5a4b089ca505fbf913e90e25f291d15003ef0bbe1596b49adc9efb444`; campione SHA256: `0ee2bd66bc7badf0847785495ed09e2c43ce805104b30c439dbfbff4e5cd1153`.
| acqua corrente | Fg2 | [Flowing-water-100019.ogg](https://commons.wikimedia.org/wiki/File:Flowing-water-100019.ogg) — pubblico dominio | `assets/suoni/acqua-corrente.wav` |

  - Tratto 3,0–10,0 secondi; originale SHA256: `6cab6c85a0b9159aa9e98f30bef16e5f8976a3154d8cec4e00925aac21289f0b`; campione SHA256: `68d5ed9848bb5cc27c81f787fe76fcf07f935bf31d84052d09acade892496543`.

## Trasformazioni e custodia
- Gli originali OGG (4 file) sono conservati in `~/src/diego/AudioFonti/2026-11-12/` su n0. Non vengono distribuiti in GitHub Pages.
- I campioni sono WAV PCM mono, 22,05 kHz, 16 bit, con riduzione del livello e piccole dissolvenze per evitare scatti e improvvisi picchi sonori.
- Ritocco tecnico: filtro passa alto 75 Hz, basso 6800 Hz, moltiplicatori fra 0.45 e 3.4 (la risacca originale è molto tenue), fade-in/out di circa 0.4 s.
- Durante il gioco, l’audio realistico parte solo a seguito di un gesto. Le riproduzioni in loop vengono arrestate cambiando gioco, quando la pagina perde il focus e sul muto.
- I suoni precedenti di rinforzo positivo (`bravo.wav`, `fantastico.wav`, `stella.wav`, `bolle.wav`) rimangono disponibili, immutati e indipendenti.
- Il vecchio sintetizzatore d’acqua è conservato come soluzione di ripiego se la riproduzione del WAV fallisce.
- Nessun invio dati a siti esterni: tutte le risorse audio pubblicate sono locali alla PWA.
- Il suono delle bolle è una registrazione di acqua domestica: reale ma non subacquea oceanica; evitare di presentarlo come un idrofono marino.
