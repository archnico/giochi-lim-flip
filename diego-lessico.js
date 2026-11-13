/* Vocabolario di Diego: condiviso tra riconoscimento e composizione. ES5 compatibile Tizen. */
(function(w){'use strict';
 var base=[
  {word:'APE',emoji:'🐝'}, {word:'UVA',emoji:'🍇'},
  {word:'CANE',image:'assets/habitat/cane.webp',emoji:'🐶'},
  {word:'RANA',image:'assets/colori/rana.svg',emoji:'🐸'},
  {word:'TOPO',emoji:'🐭'},
  {word:'MARE',image:'assets/habitat/mare.webp',emoji:'🌊'},
  {word:'MAMMA',emoji:'💗'}, {word:'BABBO',emoji:'💛'}
 ];
 var dopo=[
  {word:'SOLE',emoji:'☀️'}, {word:'GATTO',emoji:'🐱'},
  {word:'NONNO',emoji:'🌻'}, {word:'NONNA',emoji:'🌸'},
  {word:'BRAVO',emoji:'🌟'}
 ];
 var foto=['CANE','RANA','MARE'];
 w.DiegoLessico={base:base,dopo:dopo,foto:foto,
  parole:function(serie){return (serie===2?dopo:base).slice();},
  abbina:function(){return base.filter(function(x){return foto.indexOf(x.word)!==-1;}).map(function(x){return {name:x.word,file:x.image};});},
  incluso:function(t){return base.some(function(x){return x.word===t;});}
 };
}(window));
