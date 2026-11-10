/* Diego LIM: compatibilita' e ciclo di vita, senza dipendenze di rete. ES5. */
(function (w, d) {
  'use strict';
  var errors = [], layoutFrame = 0, scopes = [], offline = 'non richiesto';
  var raf = w.requestAnimationFrame || function (fn) { return w.setTimeout(function () { fn(Date.now()); }, 16); };
  w.requestAnimationFrame = raf; w.cancelAnimationFrame = w.cancelAnimationFrame || w.clearTimeout;
  if (!w.performance) w.performance = { now: function () { return Date.now(); } };
  if (w.NodeList && !w.NodeList.prototype.forEach) w.NodeList.prototype.forEach = Array.prototype.forEach;
  if (w.Element && !w.Element.prototype.replaceChildren) {
    w.Element.prototype.replaceChildren = function () {
      while (this.firstChild) this.removeChild(this.firstChild);
      for (var i = 0; i < arguments.length; i++) this.appendChild(typeof arguments[i] === 'string' ? d.createTextNode(arguments[i]) : arguments[i]);
    };
  }
  // L'audio non deve essere indispensabile per giocare.
  if (!w.DiegoAudio) w.DiegoAudio = { play: function () {}, stop: function () {}, setEnabled: function () {}, isEnabled: function () { return false; }, subscribe: function () {} };
  function record(kind, value) {
    errors.push({ kind: kind, message: String(value || '').slice(0, 160) });
    if (errors.length > 20) errors.shift();
  }
  function createScope() {
    var timers = [], generation = 0;
    var scope = {
      later: function (fn, ms) {
        var token = generation, id = w.setTimeout(function () {
          var i = timers.indexOf(id); if (i >= 0) timers.splice(i, 1);
          if (token === generation) fn();
        }, ms);
        timers.push(id); return id;
      },
      reset: function () { generation++; timers.forEach(w.clearTimeout); timers = []; },
      pending: function () { return timers.length; }
    };
    scopes.push(scope); return scope;
  }
  function fullscreen() {
    var el = d.documentElement, exit = d.exitFullscreen || d.webkitExitFullscreen || d.msExitFullscreen;
    var enter = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    try {
      var result = (d.fullscreenElement || d.webkitFullscreenElement || d.msFullscreenElement) ? exit && exit.call(d) : enter && enter.call(el);
      if (result && result.catch) result.catch(function () { record('fullscreen', 'Richiesta rifiutata dal browser'); });
      return !!enter;
    } catch (e) { record('fullscreen', e.name); return false; }
  }
  // Un solo flusso per gesto: Pointer Events oppure touch/mouse.
  function press(el, handlers) {
    var active = null, lastTouch = 0, listeners = [];
    function on(target, name, fn, options) { target.addEventListener(name, fn, options || false); listeners.push([target, name, fn, options || false]); }
    function end(e) {
      if (active === null) return;
      if (e && e.pointerId !== undefined && e.pointerId !== active) return;
      if (e && e.changedTouches) {
        var found = false;
        for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === active) found = true;
        if (!found) return;
      }
      active = null; if (handlers.end) handlers.end(e);
    }
    function start(e) {
      if (active !== null || (e.button !== undefined && e.button !== 0)) return;
      if (e.type === 'mousedown' && Date.now() - lastTouch < 750) return;
      var touch = e.changedTouches && e.changedTouches[0];
      if (touch) lastTouch = Date.now();
      active = touch ? touch.identifier : (e.pointerId !== undefined ? e.pointerId : 'mouse');
      if (e.cancelable) e.preventDefault();
      try { if (el.setPointerCapture && e.pointerId !== undefined) el.setPointerCapture(e.pointerId); } catch (ignore) {}
      if (handlers.start) handlers.start(touch || e);
    }
    function move(e) {
      if (active === null) return;
      if (e.pointerId !== undefined && e.pointerId !== active) return;
      var touch = null;
      if (e.changedTouches) {
        for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === active) touch = e.changedTouches[i];
        if (!touch) return; lastTouch = Date.now();
      }
      if (e.cancelable) e.preventDefault();
      if (handlers.move) handlers.move(touch || e);
    }
    if (w.PointerEvent) {
      on(el, 'pointerdown', start); on(w, 'pointermove', move);
      on(w, 'pointerup', end); on(w, 'pointercancel', end); on(el, 'lostpointercapture', end);
    } else {
      on(el, 'touchstart', start, { passive: false }); on(w, 'touchmove', move, { passive: false });
      on(w, 'touchend', end); on(w, 'touchcancel', end);
      on(el, 'mousedown', start); on(w, 'mousemove', move); on(w, 'mouseup', end);
    }
    on(w, 'blur', function () { end(); }); on(w, 'pagehide', function () { end(); });
    on(d, 'visibilitychange', function () { if (d.hidden) end(); });
    return { cancel: function () { end(); }, destroy: function () { end(); listeners.forEach(function (v) { v[0].removeEventListener(v[1], v[2], v[3]); }); } };
  }
  var flexGap = true;
  function detectFlexGap() {
    var test = d.createElement('div');
    test.style.cssText = 'position:absolute;visibility:hidden;display:flex;flex-direction:column;row-gap:1px;';
    test.appendChild(d.createElement('div')); test.appendChild(d.createElement('div'));
    test.children[0].style.height = '1px'; test.children[1].style.height = '1px';
    d.body.appendChild(test); flexGap = test.scrollHeight === 3; d.body.removeChild(test);
  }
  function layout() {
    layoutFrame = 0;
    if (!flexGap) {
      var nodes = d.querySelectorAll('header,footer,main,.toolbar,.gamewrap,.gamehead,.stage,.samewrap,.habitat-animal,.colori-figure,.colori-choice,.controls,.pick,.modes,.page,.top,.heading,.bottom,.quantity-tile,.right,.menu,.mode,.view,.choice,.animal,.progressbox,.nav,.flip-card,.flip-visual,.flip-other');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i], style = w.getComputedStyle(el), children = el.children;
        if (style.display.indexOf('flex') < 0) continue;
        var gap = style.getPropertyValue('--diego-gap').trim(), column = style.flexDirection.indexOf('column') === 0;
        if (!gap) continue;
        var visible = 0;
        for (var j = 0; j < children.length; j++) {
          var child = children[j], cs = w.getComputedStyle(child);
          if (cs.display === 'none' || cs.position === 'absolute' || cs.position === 'fixed') continue;
          if (!child._diegoMargin) child._diegoMargin = [child.style.marginLeft, child.style.marginTop, cs.marginLeft, cs.marginTop];
          var saved = child._diegoMargin;
          child.style.marginLeft = visible && !column ? 'calc(' + saved[2] + ' + ' + gap + ')' : saved[0];
          child.style.marginTop = visible && column ? 'calc(' + saved[3] + ' + ' + gap + ')' : saved[1];
          visible++;
        }
      }
    }
    if (!w.CSS || !w.CSS.supports || !w.CSS.supports('aspect-ratio', '1')) {
      var squares = d.querySelectorAll('.mem');
      for (var k = 0; k < squares.length; k++) squares[k].style.height = squares[k].getBoundingClientRect().width + 'px';
    }
    if (d.title.indexOf('Scacchi Stellari') === 0 && (!w.CSS || !w.CSS.supports || !w.CSS.supports('width', 'min(1px,2px)') || !w.CSS.supports('height', '100dvh'))) {
      var main = d.querySelector('main'), header = d.querySelector('header');
      if (main && header) {
        var width = d.documentElement.clientWidth, height = w.innerHeight || d.documentElement.clientHeight;
        var size = width <= 850 ? Math.min(width - 24, height * .60) : Math.min(height - header.getBoundingClientRect().height - 36, width - 390);
        main.style.setProperty('--board-size', Math.max(160, Math.floor(size)) + 'px');
      }
    }
  }
  function scheduleLayout() { if (!layoutFrame) layoutFrame = raf(layout); }
  function failedImage(e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || img._diegoFallback) return;
    img._diegoFallback = true; record('immagine', img.alt || 'Risorsa locale');
    var fallback = d.createElement('span'); fallback.className = 'diego-image-fallback';
    fallback.textContent = img.alt || 'Immagine non disponibile';
    var retry = d.createElement('button'); retry.type = 'button'; retry.className = 'diego-retry'; retry.textContent = 'RIPROVA IMMAGINE';
    var parent = img.parentNode, insideButton = false;
    for (var p = parent; p && p !== d.body; p = p.parentNode) if (p.tagName === 'BUTTON' || p.tagName === 'A') insideButton = true;
    if (!insideButton) {
      retry.onclick = function () { var src = img.getAttribute('src'); img._diegoFallback = false; parent.removeChild(fallback); img.style.display = ''; img.src = src; };
      fallback.appendChild(retry);
    }
    img.style.display = 'none'; parent.appendChild(fallback);
  }
  w.addEventListener('error', function (e) { if (e.target && e.target.tagName === 'IMG') failedImage(e); else if (e.message) record('javascript', e.message); }, true);
  w.addEventListener('unhandledrejection', function (e) { record('promise', e.reason && (e.reason.name || e.reason.message) || 'Operazione non disponibile'); });
  w.addEventListener('resize', scheduleLayout); w.addEventListener('orientationchange', scheduleLayout);
  if (w.visualViewport) w.visualViewport.addEventListener('resize', scheduleLayout);
  w.addEventListener('pagehide', function () { scopes.forEach(function (s) { s.reset(); }); });
  // Il ripristino della bfcache non deve lasciare livelli bloccati da timer annullati.
  w.addEventListener('pageshow', function (e) { if (e.persisted) w.location.reload(); });
  function init() {
    detectFlexGap(); layout();
    if (w.MutationObserver) new w.MutationObserver(scheduleLayout).observe(d.body, { childList: true, subtree: true });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
  if (d.documentElement.getAttribute('data-diego-edition') === 'flip') {
    w.addEventListener('load', function () {
      if (!('serviceWorker' in navigator) || !w.isSecureContext) { offline = 'contesto non supportato'; return; }
      offline = 'preparazione';
      navigator.serviceWorker.register('./sw.js').then(function (reg) {
        offline = reg.active ? 'disponibile' : 'installazione';
        navigator.serviceWorker.ready.then(function () { offline = 'disponibile'; });
      }).catch(function (e) { offline = 'non disponibile'; record('offline', e.name); });
    });
  }
  w.DiegoRuntime = { createScope: createScope, fullscreen: fullscreen, press: press, layout: scheduleLayout, record: record,
    diagnostics: function () { return { version: '2026-11-05.1', pointer: !!w.PointerEvent, flexGap: flexGap, offline: offline, errors: errors.slice(), pendingTimers: scopes.reduce(function (n, s) { return n + s.pending(); }, 0) }; } };
})(window, document);
