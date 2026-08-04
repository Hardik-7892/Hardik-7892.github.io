(function() {
  var el = document.getElementById('particle-hero');
  if (!el) return;

  // Swapping to the 30fps file is a one-line change here.
  var FALLBACK_SRC = '/video/video-fallback-60fps.webp';
  var FALLBACK_HTML = '<div class="n"><img class="e" src="' + FALLBACK_SRC + '" alt="" aria-hidden="true"></div>';

  var DISABLED_KEY = 'hero-3d-disabled';

  var handle = null;
  var mounting = false;

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function webgl2Available() {
    try {
      return !!document.createElement('canvas').getContext('webgl2');
    } catch (err) {
      return false;
    }
  }

  function canRender() {
    return !prefersReducedMotion() && webgl2Available();
  }

  function isDisabled() {
    try {
      return localStorage.getItem(DISABLED_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function showFallback() {
    if (!el || el.querySelector('img')) return;
    el.innerHTML = FALLBACK_HTML;
  }

  function mount() {
    if (mounting || handle) return;
    mounting = true;
    try {
      handle = window.ParticleHeroWidget.mount(el, {
        debugUi: false,
        enableOrbitControls: false,
        modelYawSpeedDegPerSec: 20,
        viewYawOffsetDeg: 45,
        onError: function(err) {
          console.warn('[particle-hero] model load error:', err);
          unmount();
          showFallback();
        },
        modelUrls: [
          "/assets/models/profile_nobg.bin",
          "/assets/models/cyber.bin",
          "/assets/models/ml.bin",
          "/assets/models/gamedev.bin",
          "/assets/models/cloud.bin",
          "/assets/models/webdev.bin"
        ]
      });
      publish();
    } finally {
      mounting = false;
    }
  }

  function unmount() {
    if (handle) {
      try { handle.unmount(); } catch (e) {}
      handle = null;
    }
  }

  function disable() {
    if (mounting) return;
    unmount();
    try { localStorage.setItem(DISABLED_KEY, '1'); } catch (err) {}
    showFallback();
    publish();
  }

  function enable() {
    if (mounting || handle) return;
    try { localStorage.setItem(DISABLED_KEY, '0'); } catch (err) {}
    if (el && el.querySelector('img')) el.innerHTML = '';
    if (canRender()) mountWhenReady();
    else showFallback();
    publish();
  }

  function isMounted() {
    return !!handle;
  }

  function publish() {
    if (window.ParticleHeroControls) {
      window.ParticleHeroControls._sync();
    }
  }

  window.ParticleHeroControls = {
    enable: enable,
    disable: disable,
    isMounted: isMounted,
    isDisabled: isDisabled,
    canRender: canRender,
    _sync: function() {
      var ev = new CustomEvent('particle-hero-statechange', {
        detail: { mounted: isMounted(), disabled: isDisabled() }
      });
      window.dispatchEvent(ev);
    }
  };

  function mountWhenReady() {
    if (mounting || handle) return;
    if (window.ParticleHeroWidget) {
      mount();
      return;
    }
    var waited = 0;
    var check = setInterval(function() {
      waited += 50;
      if (window.ParticleHeroWidget) {
        clearInterval(check);
        mount();
      } else if (waited >= 15000) {
        clearInterval(check);
        showFallback();
      }
    }, 50);
  }

  function start() {
    if (isDisabled()) {
      showFallback();
      return;
    }
    if (!canRender()) {
      showFallback();
      return;
    }
    mountWhenReady();
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 2500 });
  } else {
    setTimeout(start, 300);
  }
})();
