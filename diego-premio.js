/* Diego · premio tattile marino. ES5, DOM leggero, nessuna risorsa esterna. */
(function (w, d) {
  'use strict';
  var assets = [
    ['acqua-sottomarino-canonico.webp', 'Sottomarino'],
    ['squalo-giaguaro-nuoto.webp', 'Squalo'],
    ['pesce-canonico.webp', 'Pesce'],
    ['chitarra-canonica.webp', 'Chitarra'],
    ['polpo-canonico.webp', 'Polpo'],
    ['stella-marina-canonica.webp', 'Stella']
  ];
  var round = 0;
  function stop(host) {
    if (!host) return;
    if (host._diegoPremioTimer) w.clearTimeout(host._diegoPremioTimer);
    host._diegoPremioTimer = 0;
    host._diegoPremioActive = false;
    var child = host.querySelector('.diego-premio-play');
    if (child && child.parentNode) child.parentNode.removeChild(child);
    host.classList.remove('diego-premio-attivo');
  }
  function show(host, done) {
    if (!host || typeof done !== 'function') return;
    stop(host);
    var id = ++round, started = Date.now(), lastSound = 0;
    host._diegoPremioActive = true;
    host.classList.add('diego-premio-attivo');
    var surface = d.createElement('div');
    surface.className = 'diego-premio-play';
    surface.setAttribute('role', 'group');
    surface.setAttribute('aria-label', 'Tocca gli animali e gli oggetti del mare');
    var bubbles = d.createElement('span');
    bubbles.className = 'diego-premio-bolle';
    bubbles.setAttribute('aria-hidden', 'true');
    bubbles.textContent = '○  ○  ○';
    surface.appendChild(bubbles);
    function advance() {
      if (!host._diegoPremioActive || host._diegoPremioId !== id) return;
      stop(host);
      done();
    }
    function schedule(delay) {
      if (host._diegoPremioTimer) w.clearTimeout(host._diegoPremioTimer);
      host._diegoPremioTimer = w.setTimeout(advance, delay);
    }
    function tap(btn) {
      if (!host._diegoPremioActive || host._diegoPremioId !== id) return;
      btn.classList.remove('diego-premio-salta');
      /* Ripetere la stessa animazione a ogni tocco, anche rapido. */
      void btn.offsetWidth;
      btn.classList.add('diego-premio-salta');
      bubbles.classList.remove('diego-premio-bolle-on');
      void bubbles.offsetWidth;
      bubbles.classList.add('diego-premio-bolle-on');
      var now = Date.now();
      if (now - lastSound > 250 && w.DiegoAudio && w.DiegoAudio.isEnabled()) {
        w.DiegoAudio.play('stella'); lastSound = now;
      }
      /* Se sta giocando, non portargli via il premio all'improvviso. */
      var available = Math.max(0, 15000 - (now - started));
      schedule(Math.min(2000, available));
    }
    for (var i = 0; i < 3; i++) {
      var item = assets[(round + i * 2) % assets.length];
      var btn = d.createElement('button'), img = d.createElement('img');
      btn.type = 'button';
      btn.className = 'diego-premio-oggetto';
      btn.setAttribute('aria-label', 'Gioca: ' + item[1]);
      img.src = 'assets/diegoland/' + item[0];
      img.alt = '';
      img.draggable = false;
      btn.appendChild(img);
      (function (b) { b.addEventListener('click', function () { tap(b); }); })(btn);
      surface.appendChild(btn);
    }
    host._diegoPremioId = id;
    host.appendChild(surface);
    schedule(3100);
  }
  w.DiegoPremio = { show: show, stop: stop };
})(window, document);
