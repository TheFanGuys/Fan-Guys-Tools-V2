/* Fan Guys Tools: shared bits loaded by every tool page.
   - Home button (draggable) to get back to the job screen
   - Fills the tool's job fields from the current job, only when they're empty
   - Labor rates live on this phone (Settings), never in the code */
(function () {
  var TOOL = (document.currentScript && document.currentScript.getAttribute('data-tool')) || '';

  function get(k, d) { try { var v = FGTStore.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { FGTStore.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function currentJob() {
    var id = get('fgt-current', null), jobs = get('fgt-jobs', []);
    for (var i = 0; i < jobs.length; i++) if (jobs[i].id === id) return jobs[i];
    return null;
  }
  function oneLine(j) {
    var cityLine = [j.city, [j.state, j.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    return [j.street, cityLine].filter(Boolean).join(', ');
  }

  /* ---------- Labor rates ---------- */
  var RATE_MODELS = ['ztech', 'zchill', 'taz', 'taz36'];
  var RATE_TYPES = ['turnkey', 'mech_hook', 'mech_hang'];
  function rates() { return get('fg_estimate_rates_v2',null)||get('fgt-rates', null); }
  function applyRates(models) {
    var r = rates() || {};
    models.forEach(function (m) {
      RATE_TYPES.forEach(function (t) { m.labor[t] = +((r[m.id] || {})[t]) || 0; });
    });
    return !!rates();
  }

  /* ---------- Materials: seed its save before React reads it ---------- */
  if (TOOL === 'materials') {
    var j = currentJob();
    if (j) {
      var s = get('fg_materials_autosave_v1', {}) || {};
      if (!s.jobName && !s.jobLocation) {
        s.jobName = j.name || ''; s.jobLocation = oneLine(j);
        set('fg_materials_autosave_v1', s);
      }
    }
  }

  /* ---------- Fill empty DOM fields after the tool restores its own save ---------- */
  function fill(id, val) {
    var el = document.getElementById(id);
    if (!el || !val || el.value) return false;
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  function prefill() {
    var j = currentJob(); if (!j) return;
    if (TOOL === 'survey') {
      fill('jobName', j.name); fill('addrStreet', j.street); fill('addrCity', j.city);
      fill('addrState', j.state); fill('addrZip', j.zip);
    } else if (TOOL === 'estimate') {
      var z = document.getElementById('zip');
      var q = j.zip ? String(j.zip).slice(0, 5) : (j.city ? j.city + (j.state ? ', ' + j.state : '') : '');
      if (z && !z.value && q) { z.value = q; z.dispatchEvent(new Event('input', { bubbles: true })); z.dispatchEvent(new Event('change', { bubbles: true })); }
    }
  }

  /* ---------- Home button ---------- */
  function homeButton() {
    var css = document.createElement('style');
    css.textContent =
      '#fgt-home{position:fixed;z-index:2147483000;display:flex;align-items:center;gap:6px;height:44px;padding:0 14px 0 6px;' +
      'border-radius:22px;border:0;background:#F28C0F;color:#1B1C1E;font:800 16px/1 "Barlow Condensed",Barlow,system-ui,sans-serif;' +
      'box-shadow:0 4px 14px rgba(0,0,0,.45),0 0 0 2px #1B1C1E;touch-action:none;-webkit-tap-highlight-color:transparent;cursor:pointer;-webkit-user-select:none;user-select:none}' +
      '#fgt-home img{width:32px;height:32px;border-radius:9px;pointer-events:none}' +
      '#fgt-home:active{transform:scale(.95)}' +
      '#fgt-ratebar{position:sticky;top:0;z-index:2147482999;background:#F28C0F;color:#1B1C1E;font:600 14px/1.35 Barlow,system-ui,sans-serif;' +
      'padding:10px 14px;padding-top:calc(10px + env(safe-area-inset-top))}#fgt-ratebar a{color:#1B1C1E;font-weight:800}';
    document.head.appendChild(css);
    var b = document.createElement('button');
    b.id = 'fgt-home'; b.type = 'button'; b.setAttribute('aria-label', 'Back to Fan Guys Tools home');
    b.innerHTML = '<img src="../shared/mark.png" alt="">\u2039 Tools';
    var pos = get('fgt-home-pos2-' + TOOL, null);
    function place(x, y) {
      var w = window.innerWidth, h = window.innerHeight;
      var bw = b.offsetWidth || 100; x = Math.max(6, Math.min(w - bw - 6, x)); y = Math.max(6, Math.min(h - 50, y));
      b.style.left = x + 'px'; b.style.top = y + 'px';
      return { x: x, y: y };
    }
    document.body.appendChild(b);
    var start = pos || { x: 10, y: window.innerHeight - 150 };
    var at = place(start.x, start.y);
    var drag = null, moved = false;
    b.addEventListener('pointerdown', function (e) { drag = { dx: e.clientX - at.x, dy: e.clientY - at.y, sx: e.clientX, sy: e.clientY }; moved = false; b.setPointerCapture(e.pointerId); });
    b.addEventListener('pointermove', function (e) {
      if (!drag) return;
      if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 8) moved = true;
      if (moved) at = place(e.clientX - drag.dx, e.clientY - drag.dy);
    });
    b.addEventListener('pointerup', function () { if (moved) set('fgt-home-pos2-' + TOOL, at); drag = null; });
    b.addEventListener('pointercancel', function () { drag = null; });
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (moved) { moved = false; return; }
      location.assign(new URL('../', location.href).href);
    });
    window.addEventListener('resize', function () { at = place(at.x, at.y); });

    if (TOOL === 'estimate' && !rates()) {
      var bar = document.createElement('div');
      bar.id = 'fgt-ratebar';
      bar.innerHTML = 'Labor rates aren\'t set, so labor shows $0. <a href="../#rates">Set your rates</a>';
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  function ready() {
    // Navigation is provided by the shared workspace shell.
    setTimeout(prefill, 700);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();

  window.FGT = { currentJob: currentJob, applyRates: applyRates, rates: rates, RATE_MODELS: RATE_MODELS, RATE_TYPES: RATE_TYPES };
})();
