var PREFIX='diego-flip-'+new URL('./',self.location.href).pathname+'-';
var CACHE=PREFIX+'c16f2b77db8f';
var FILES=["./index.html", "./flip-ui.css", "./visual-v2.css", "./diegoland.css", "./diegoland-arte.css", "./diegoland-games.css", "./pregrafismo-v2.css", "./parole-layout.css", "./manifest.webmanifest", "./acqua.html", "./scacchi-stelle.html", "./trova-il-numero.html", "./trova-il-4.html", "./colori-animali.html", "./crediti-foto.html", "./test-lim.html", "./diagnostica-flip.html", "./unisci-quantita.html", "./prova-suoni.html", "./pregrafismo.html", "./parole.html", "./diego-runtime.js", "./diego-runtime.css", "./diego-audio.js", "./diego-lessico.js", "./pregrafismo-scene.js", "./pregrafismo-pc-data.js", "./pregrafismo-nuovi.js", "./offline-check.html", "./assets/associazioni/auto.webp", "./assets/associazioni/banana.webp", "./assets/associazioni/bicicletta.webp", "./assets/associazioni/mela.webp", "./assets/colori/coccinella.svg", "./assets/colori/elefante.svg", "./assets/colori/fenicottero.svg", "./assets/colori/leone.svg", "./assets/colori/panda.svg", "./assets/colori/pinguino.svg", "./assets/colori/rana.svg", "./assets/colori/tigre.svg", "./assets/colori/volpe.svg", "./assets/colori/zebra.svg", "./assets/diegoland/bolle.svg", "./assets/diegoland/esploratore.webp", "./assets/diegoland/esploratore_intero.webp", "./assets/diegoland/onde.svg", "./assets/diegoland/piccoli_animali.webp", "./assets/diegoland/scena_originale_scelta.webp", "./assets/diegoland/sottomarino.webp", "./assets/diegoland/squalo_giaguaro.webp", "./assets/habitat/aquila.webp", "./assets/habitat/balena.webp", "./assets/habitat/cane.webp", "./assets/habitat/cavallo.webp", "./assets/habitat/cielo.webp", "./assets/habitat/delfino.webp", "./assets/habitat/elefante.webp", "./assets/habitat/gabbiano.webp", "./assets/habitat/giraffa.webp", "./assets/habitat/gufo.webp", "./assets/habitat/leone.webp", "./assets/habitat/manifest.json", "./assets/habitat/mare.webp", "./assets/habitat/pappagallo.webp", "./assets/habitat/pesce.webp", "./assets/habitat/polpo.webp", "./assets/habitat/squalo.webp", "./assets/habitat/terra.webp", "./assets/icons/acqua.png", "./assets/icons/acqua.svg", "./assets/icons/altri.png", "./assets/icons/altri.svg", "./assets/icons/animali.jpg", "./assets/icons/app-180.png", "./assets/icons/app-192.png", "./assets/icons/app-512.png", "./assets/icons/associazioni.png", "./assets/icons/associazioni.svg", "./assets/icons/attenzione.png", "./assets/icons/attenzione.svg", "./assets/icons/kit-v2/acqua.svg", "./assets/icons/kit-v2/altri.svg", "./assets/icons/kit-v2/animali.svg", "./assets/icons/kit-v2/associazioni.svg", "./assets/icons/kit-v2/attenzione.svg", "./assets/icons/kit-v2/colori.svg", "./assets/icons/kit-v2/conta.svg", "./assets/icons/kit-v2/matematica.svg", "./assets/icons/kit-v2/memoria.svg", "./assets/icons/kit-v2/numeri.svg", "./assets/icons/kit-v2/pregrafismo.svg", "./assets/icons/kit-v2/scacchi.svg", "./assets/icons/kit-v2/traccia-acqua.svg", "./assets/icons/kit-v2/traccia-cerchi.svg", "./assets/icons/kit-v2/traccia-curve.svg", "./assets/icons/kit-v2/traccia-diagonali.svg", "./assets/icons/kit-v2/traccia-onde.svg", "./assets/icons/kit-v2/traccia-rette.svg", "./assets/icons/kit-v2/traccia-segni.svg", "./assets/icons/kit-v2/unisci.svg", "./assets/icons/mare.jpg", "./assets/icons/matematica.png", "./assets/icons/matematica.svg", "./assets/icons/memoria.png", "./assets/icons/memoria.svg", "./assets/icons/pregrafismo.svg", "./assets/icons/scacchi.png", "./assets/icons/scacchi.svg", "./assets/icons/unisci.svg", "./assets/parole/ape.mp3", "./assets/parole/babbo.mp3", "./assets/parole/bravo.mp3", "./assets/parole/cane.mp3", "./assets/parole/gatto.mp3", "./assets/parole/mamma.mp3", "./assets/parole/mare.mp3", "./assets/parole/nonna.mp3", "./assets/parole/nonno.mp3", "./assets/parole/rana.mp3", "./assets/parole/sole.mp3", "./assets/parole/topo.mp3", "./assets/parole/uva.mp3", "./assets/scacchi/cburnett/wK.svg", "./assets/scacchi/cburnett/wQ.svg", "./assets/scacchi/cburnett/wR.svg", "./assets/suoni/acqua-bolle-naturali.wav", "./assets/suoni/acqua-corrente.wav", "./assets/suoni/acqua-risacca.wav", "./assets/suoni/acqua-schizzo-1.wav", "./assets/suoni/acqua-schizzo-2.wav", "./assets/suoni/bolle.wav", "./assets/suoni/bravo.wav", "./assets/suoni/fantastico.wav", "./assets/suoni/stella.wav", "./assets/suoni/successo.wav"];

var SCOPE=new URL('./',self.location.href);
var ALLOWED=FILES.map(function(f){return new URL(f,SCOPE).pathname});
// Cache the lightweight app and its positive sounds first; large photos on demand.
var CORE=FILES.filter(function(f){return f.indexOf('./assets/')!==0||f.indexOf('./assets/suoni/')===0;});
self.addEventListener('install',function(e){
 e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
 e.waitUntil(caches.keys().then(function(names){
  return Promise.all(names.filter(function(n){return n.indexOf(PREFIX)===0&&n!==CACHE}).map(function(n){return caches.delete(n)}));
 }).then(function(){return self.clients.claim()}));
});
function fromRange(request,response){
 var value=request.headers.get('range');
 if(!value)return Promise.resolve(response);
 var range=/^bytes=(\d*)-(\d*)$/.exec(value);
 if(!range)return Promise.resolve(response);
 return response.arrayBuffer().then(function(buffer){
  var length=buffer.byteLength,start=range[1]?Number(range[1]):Math.max(0,length-Number(range[2]));
  var end=range[1]&&range[2]?Math.min(Number(range[2]),length-1):length-1;
  if(start>=length||end<start)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+length}});
  var headers=new Headers(response.headers);
  headers.set('Content-Range','bytes '+start+'-'+end+'/'+length);
  headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
  return new Response(buffer.slice(start,end+1),{status:206,headers:headers});
 });
}
self.addEventListener('fetch',function(e){
 var url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==SCOPE.origin)return;
 if(url.pathname===SCOPE.pathname)url.pathname+='index.html';
 if(ALLOWED.indexOf(url.pathname)<0)return;
 // I parametri game, topic e numero scelgono la schermata; i byte HTML sono gli stessi.
 url.search='';url.hash='';
 e.respondWith(caches.open(CACHE).then(function(c){
  return c.match(url.href).then(function(response){
    if(response)return fromRange(e.request,response);
    return fetch(e.request).then(function(network){
      if(network&&network.ok)c.put(url.href,network.clone()).catch(function(){});
      return network;
    });
  });
}));
});
