/* Lessico canonico Diego: poche parole, ripetute in piu giochi. ES5/Tizen 5. */
(function(w){'use strict';
 var base=[
  {word:'APE',emoji:'🐝'}, {word:'UVA',emoji:'🍇'},
  {word:'CANE',image:'assets/habitat/cane.webp',emoji:'🐶'},
  {word:'RANA',image:'assets/colori/rana.svg',emoji:'🐸'},
  {word:'TOPO',emoji:'🐭'},
  {word:'MARE',image:'assets/habitat/mare.webp',emoji:'🌊'},
  {word:'MAMMA',emoji:'👩‍👧'}, {word:'BABBO',emoji:'👨‍👧'}
 ];
 var dopo=[
  {word:'SOLE',emoji:'☀️'}, {word:'GATTO',emoji:'🐱'},
  {word:'NONNO',emoji:'👴'}, {word:'NONNA',emoji:'👵'},
  {word:'BRAVO',emoji:'🌟'}
 ];
 var figure=['APE','UVA','CANE','RANA','TOPO','MARE','SOLE','GATTO'];
 var key='diego-lessico-progressi-v1';
 function leggi(){
  try {var d=JSON.parse(w.localStorage.getItem(key)||'{}');
   return d&&typeof d==='object'&&!Array.isArray(d)?d:{};}catch(e){return {};}
 }
 function registra(word,azione){
  if(azione!=='componi'&&azione!=='riconosci')return;
  if(!base.concat(dopo).some(function(x){return x.word===word;}))return;
  var d=leggi(),p=d[word]||{componi:0,riconosci:0};
  p[azione]=Math.min(999,(Number(p[azione])||0)+1);d[word]=p;
  try{w.localStorage.setItem(key,JSON.stringify(d));}catch(e){}
 }
 function sblocchi(){
  var d=leggi(),minimo=999;
  base.forEach(function(x){minimo=Math.min(minimo,(d[x.word]&&Number(d[x.word].componi))||0);});
  return Math.min(dopo.length,Math.floor(minimo/2));
 }
 function parole(serie){return serie===2?dopo.slice():base.concat(dopo.slice(0,sblocchi()));}
 function abbina(){
  return parole(1).filter(function(x){return figure.indexOf(x.word)!==-1;})
   .map(function(x){return {name:x.word,file:x.image||null,emoji:x.emoji};});
 }
 w.DiegoLessico={
  base:base,dopo:dopo,foto:figure,parole:parole,abbina:abbina,
  registra:registra,statistiche:leggi,sblocchi:sblocchi,
  incluso:function(t){return base.concat(dopo).some(function(x){return x.word===t;});}
 };
}(window));
