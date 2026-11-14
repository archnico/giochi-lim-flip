/* Diego · percorso continuo e libero, compatibile Tizen 5 / ES5.
   Nessun dato inviato: solo ultimi 40 esiti anonimi nel dispositivo. */
(function (w, d) {
  'use strict';
  var VERSION = 'diego-flusso-v1-', LIMIT = 40;
  function historyFor(name) {
    try {
      var a = JSON.parse(w.localStorage.getItem(VERSION + name) || '[]');
      return Array.isArray(a) ? a.filter(function (v) { return v === 'ok' || v === 'salta'; }).slice(-LIMIT) : [];
    } catch (ignore) { return []; }
  }
  function append(name, outcome) {
    var a = historyFor(name);
    a.push(outcome);
    if (a.length > LIMIT) a = a.slice(-LIMIT);
    try { w.localStorage.setItem(VERSION + name, JSON.stringify(a)); } catch (ignore) {}
  }
  function streak(name) {
    var a = historyFor(name), n = 0;
    for (var i = a.length - 1; i >= 0 && a[i] === 'ok'; i--) n++;
    return n;
  }
  function create(name, onSkip, opts) {
    if (typeof name !== 'string' || typeof onSkip !== 'function') throw Error('DiegoFlusso: registrazione non valida');
    opts = opts || {};
    var button = opts.button || d.createElement('button');
    var ownButton = !opts.button, reward = null, next = null, done = false, timer = 0;
    if (ownButton) {
      button.type = 'button';
      button.id = 'diego-salta';
      (opts.mount || d.body).appendChild(button);
    }
    button.classList.add('diego-salta');
    button.textContent = '▶';
    button.title = 'Avanti';
    button.setAttribute('aria-label', 'Salta o vai avanti senza penalità');
    button.hidden = false;
    function close() {
      if (timer) { w.clearTimeout(timer); timer = 0; }
      if (reward) {
        if (w.DiegoPremio) w.DiegoPremio.stop(reward);
        if (reward.parentNode) reward.parentNode.removeChild(reward);
        reward = null;
      }
    }
    function begin() {
      close(); next = null; done = false;
    }
    function go() {
      if (!done || typeof next !== 'function') return;
      var fn = next;
      next = null;
      close();
      fn();
    }
    function skip() {
      if (done) { go(); return; }
      append(name, 'salta');
      close();
      onSkip();
    }
    function complete(after) {
      if (done) return;
      done = true; append(name, 'ok');
      next = typeof after === 'function' ? after : onSkip;
      reward = d.createElement('div');
      reward.className = 'diego-flusso-premio';
      reward.setAttribute('aria-label', 'Premio da toccare');
      d.body.appendChild(reward);
      if (w.DiegoPremio) w.DiegoPremio.show(reward, go);
      else timer = w.setTimeout(go, 1200);
    }
    button.addEventListener('click', skip);
    return {
      begin: begin, skip: skip, complete: complete, streak: function () { return streak(name); },
      stats: function () {
        var a = historyFor(name);
        return { svolti: a.filter(function (v) { return v === 'ok'; }).length,
          saltati: a.filter(function (v) { return v === 'salta'; }).length,
          serie: streak(name) };
      },
      destroy: function () { close(); button.removeEventListener('click', skip); if (ownButton && button.parentNode) button.parentNode.removeChild(button); }
    };
  }
  w.DiegoFlusso = { create: create, streak: streak };
})(window, document);
