/* Rinforzi locali: nessun errore audio puo' interrompere un gioco. ES5. */
(function (w, d) {
  'use strict';
  var names = { bravo: 'bravo.wav', fantastico: 'fantastico.wav', stella: 'stella.wav', bolle: 'bolle.wav', successo: 'successo.wav' };
  var sounds = {}, enabled = true, button = null, listeners = [], sequence = 0;
  try { enabled = w.localStorage.getItem('diego-audio-enabled') !== 'false'; } catch (ignore) {}
  function report(e) { if (w.DiegoRuntime) w.DiegoRuntime.record('audio', e && e.name || 'Risorsa non disponibile'); }
  function reset(a) { try { a.pause(); } catch (ignore) {} try { a.currentTime = 0; } catch (ignore) {} }
  function stop() { sequence++; Object.keys(sounds).forEach(function (k) { reset(sounds[k]); }); }
  function updateButton() {
    if (!button) return;
    button.textContent = enabled ? 'SUONI' : 'MUTO';
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Disattiva suoni' : 'Attiva suoni');
  }
  function setEnabled(value) {
    enabled = !!value;
    try { w.localStorage.setItem('diego-audio-enabled', String(enabled)); } catch (ignore) {}
    if (!enabled) stop();
    updateButton(); listeners.slice().forEach(function (fn) { try { fn(enabled); } catch (e) { report(e); } });
  }
  function play(name) {
    if (!enabled || !names[name] || d.hidden) return false;
    try {
      stop(); var token = sequence, a = sounds[name];
      if (!a) {
        a = new w.Audio('assets/suoni/' + names[name]); a.preload = 'auto'; a.volume = .8;
        a.addEventListener('error', function () { report({ name: 'File audio non disponibile: ' + name }); });
        sounds[name] = a;
      }
      var result = a.play();
      if (result && result.catch) result.catch(function (e) { if (token === sequence && e.name !== 'AbortError') report(e); });
      return true;
    } catch (e) { report(e); return false; }
  }
  function init() {
    if (d.getElementById('diego-audio-toggle') || d.getElementById('sound')) return;
    button = d.createElement('button'); button.type = 'button'; button.id = 'diego-audio-toggle';
    button.style.cssText = 'font:700 18px Arial,sans-serif;min-width:92px;min-height:48px;padding:8px 12px;background:#fff;color:#153553;border:3px solid #5595c9;border-radius:14px;cursor:pointer;touch-action:manipulation;z-index:50;';
    var toolbar = d.querySelector('.toolbar') || d.querySelector('header .nav') || d.querySelector('header');
    if (toolbar) toolbar.appendChild(button);
    else { button.className = 'diego-standalone-audio'; d.body.appendChild(button); }
    button.onclick = function () { setEnabled(!enabled); if (enabled) play('bravo'); };
    updateButton();
  }
  w.DiegoAudio = { play: play, stop: stop, setEnabled: setEnabled, isEnabled: function () { return enabled; },
    subscribe: function (fn) { listeners.push(fn); fn(enabled); return function () { var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }; } };
  w.addEventListener('storage', function (e) { if (e.key === 'diego-audio-enabled') setEnabled(e.newValue !== 'false'); });
  w.addEventListener('pagehide', stop);
  d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); });
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
