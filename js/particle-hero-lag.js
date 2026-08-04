(function() {
  var el = document.getElementById('particle-hero');
  if (!el || !window.ParticleHeroControls) return;

  var controls = window.ParticleHeroControls;

  var PROBE_WINDOW_MS = 3000;
  var SETTLE_DELAY_MS = 4000;
  var LAG_FRAME_MS = 25;
  var LONG_TASK_MIN = 4;
  var MOUNT_WAIT_TIMEOUT = 15000;
  var AUTO_DISABLE_COOLDOWN_MS = 15000;
  var TOAST_DURATION_MS = 7000;
  var TIP_DURATION_MS = 6000;
  var TIP_SEEN_KEY = 'hero-3d-tip-seen';

  var toggleEl = null;
  var tipEl = null;
  var tipTimer = null;
  var toastEl = null;
  var toastTimer = null;
  var probeRaf = null;
  var settleTimer = null;
  var probing = false;
  var probedThisMount = false;
  var lastAutoDisableAt = 0;

  function addToggle() {
    var box = document.createElement('div');
    box.className = 'hero-3d-controls';

    var tip = document.createElement('span');
    tip.className = 'hero-3d-tip';
    tip.textContent = 'Feels laggy? Turn 3D off with this switch.';
    box.appendChild(tip);

    var btn = document.createElement('button');
    btn.className = 'hero-3d-toggle';
    btn.type = 'button';
    btn.setAttribute('role', 'switch');
    btn.setAttribute('aria-label', 'Toggle 3D animation');
    btn.innerHTML = '<span class="hero-3d-toggle__track"><span class="hero-3d-toggle__thumb"></span></span>' +
      '<span class="hero-3d-toggle__label">3D</span>';
    btn.addEventListener('click', function() {
      if (controls.isDisabled()) controls.enable();
      else controls.disable();
    });
    btn.addEventListener('mouseenter', showTip);
    btn.addEventListener('mouseleave', hideTip);
    btn.addEventListener('focus', showTip);
    btn.addEventListener('blur', hideTip);

    box.appendChild(btn);
    document.body.appendChild(box);
    toggleEl = btn;
    tipEl = tip;
    syncToggle();
  }

  function showTip() {
    if (!tipEl) return;
    if (tipTimer) {
      clearTimeout(tipTimer);
      tipTimer = null;
    }
    tipEl.classList.add('visible');
  }

  function hideTip() {
    if (!tipEl) return;
    if (tipTimer) {
      clearTimeout(tipTimer);
      tipTimer = null;
    }
    tipEl.classList.remove('visible');
  }

  function showTipOnce() {
    if (!tipEl) return;
    var seen = false;
    try { seen = sessionStorage.getItem(TIP_SEEN_KEY) === '1'; } catch (err) {}
    if (seen) return;
    try { sessionStorage.setItem(TIP_SEEN_KEY, '1'); } catch (err) {}
    showTip();
    tipTimer = setTimeout(hideTip, TIP_DURATION_MS);
  }

  function syncToggle() {
    if (!toggleEl) return;
    var on = !controls.isDisabled();
    toggleEl.setAttribute('aria-checked', on ? 'true' : 'false');
  }

  function addToast() {
    var box = document.createElement('div');
    box.className = 'hero-3d-toast';
    box.setAttribute('role', 'status');
    box.innerHTML = '<p class="hero-3d-toast__text">3D animation turned off for smoother performance.</p>' +
      '<button type="button" class="hero-3d-toast__btn">Turn back on</button>';
    box.addEventListener('click', function(e) {
      if (e.target && e.target.classList && e.target.classList.contains('hero-3d-toast__btn')) {
        hideToast();
        controls.enable();
      }
    });
    document.body.appendChild(box);
    toastEl = box;
  }

  function showToast() {
    if (!toastEl) addToast();
    if (!toastEl) return;
    toastEl.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, TOAST_DURATION_MS);
  }

  function hideToast() {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    if (toastEl) toastEl.classList.remove('visible');
  }

  function autoDisable() {
    var now = Date.now();
    if (now - lastAutoDisableAt < AUTO_DISABLE_COOLDOWN_MS) return;
    lastAutoDisableAt = now;
    controls.disable();
    showToast();
  }

  function probeSmoothness() {
    if (probing || probedThisMount) return;
    if (controls.isDisabled() || !controls.isMounted()) return;
    probing = true;

    var start = performance.now();
    var last = null;
    var deltas = [];
    var longTaskCount = 0;
    var obs = null;

    if (window.PerformanceObserver) {
      try {
        obs = new PerformanceObserver(function(list) {
          longTaskCount += list.getEntries().length;
        });
        obs.observe({ entryTypes: ['longtask'] });
      } catch (err) {
        obs = null;
      }
    }

    function finish() {
      if (obs) {
        try { obs.disconnect(); } catch (err) {}
      }
      probing = false;
      probedThisMount = true;

      if (controls.isDisabled()) return;

      var laggy = false;
      if (deltas.length > 0) {
        deltas.sort(function(a, b) { return a - b; });
        if (deltas[Math.floor(deltas.length / 2)] > LAG_FRAME_MS) laggy = true;
      }
      if (longTaskCount >= LONG_TASK_MIN) laggy = true;

      if (laggy) autoDisable();
    }

    function step(now) {
      if (controls.isDisabled() || !controls.isMounted()) {
        finish();
        return;
      }
      if (last !== null) {
        var delta = now - last;
        if (delta <= 1000) deltas.push(delta);
      }
      last = now;

      if (now - start < PROBE_WINDOW_MS) {
        probeRaf = requestAnimationFrame(step);
        return;
      }
      finish();
    }

    probeRaf = requestAnimationFrame(step);
  }

  function startProbeIfNeeded() {
    if (probing || probedThisMount) return;
    if (controls.isDisabled() || !controls.isMounted()) return;
    if (settleTimer) return;
    settleTimer = setTimeout(function() {
      settleTimer = null;
      probeSmoothness();
    }, SETTLE_DELAY_MS);
  }

  function cancelProbe() {
    if (settleTimer) {
      clearTimeout(settleTimer);
      settleTimer = null;
    }
  }

  function waitForMount() {
    var waited = 0;
    var check = setInterval(function() {
      waited += 250;
      if (controls.isDisabled()) {
        clearInterval(check);
        return;
      }
      if (controls.isMounted()) {
        clearInterval(check);
        startProbeIfNeeded();
      } else if (waited >= MOUNT_WAIT_TIMEOUT) {
        clearInterval(check);
      }
    }, 250);
  }

  function init() {
    if (controls.canRender()) addToggle();
    if (controls.isDisabled() || !controls.canRender()) return;
    waitForMount();
  }

  var prevDisabled = controls.isDisabled();

  window.addEventListener('particle-hero-statechange', function() {
    var disabled = controls.isDisabled();
    syncToggle();

    if (disabled) {
      cancelProbe();
      hideToast();
      prevDisabled = true;
      return;
    }

    if (prevDisabled) {
      probedThisMount = false;
      lastAutoDisableAt = 0;
    }
    prevDisabled = false;

    if (controls.isMounted()) {
      startProbeIfNeeded();
      showTipOnce();
    }
  });

  init();
})();
