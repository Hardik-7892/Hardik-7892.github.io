(function() {
  var el = document.getElementById('particle-hero');
  if (!el) return;

  // Swapping to the 30fps file is a one-line change here.
  var FALLBACK_SRC = '/video/video-fallback-60fps.webp';
  var FALLBACK_HTML = '<div class="n"><img class="e" src="' + FALLBACK_SRC + '" alt="" aria-hidden="true"></div>';

  var DISABLED_KEY = 'hero-3d-disabled';
  var VARIANT_KEY = 'hero-variant'; // vanilla-only

  function getVariant() {
    // vanilla-only replica — ignore legacy ?hero=react and migrate to vanilla
    try {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('hero');
      if (q === 'react' || q === 'vanilla') {
        try { localStorage.setItem(VARIANT_KEY, 'vanilla'); } catch (e) {}
        return 'vanilla';
      }
    } catch (e) {}
    // migrate legacy stored variant
    try {
      if (localStorage.getItem(VARIANT_KEY) === 'react') localStorage.setItem(VARIANT_KEY, 'vanilla');
    } catch (e) {}
    return 'vanilla';
  }

  function isVanilla() {
    return true;
  }

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
      if (window.ParticleHeroVanilla) {
        handle = window.ParticleHeroVanilla.mount(el, {
          modelUrls: [
            "/assets/models/profile_nobg.bin",
            "/assets/models/cyber.bin",
            "/assets/models/ml.bin",
            "/assets/models/gamedev.bin",
            "/assets/models/cloud.bin",
            "/assets/models/webdev.bin"
          ],
          onError: function(err) {
            console.warn('[vanilla-hero] mount error:', err);
            unmount();
            showFallback();
          }
        });
      } else {
        var vs = document.createElement('script');
        vs.src = '/js/particle-hero-vanilla.js?v=28';
        vs.onload = function () {
          mounting = false;
          mount();
        };
        vs.onerror = function (e) {
          console.warn('[vanilla-hero] load failed', e);
          mounting = false;
          showFallback();
        };
        document.head.appendChild(vs);
        return;
      }
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
    getVariant: getVariant,
    isVanilla: isVanilla,
    setVariant: function (v) {
      // vanilla-only: keep API but no-op for react
      try { localStorage.setItem(VARIANT_KEY, 'vanilla'); } catch (e) {}
      if (v === 'vanilla') return;
      window.location.reload();
    },
    _sync: function() {
      var ev = new CustomEvent('particle-hero-statechange', {
        detail: { mounted: isMounted(), disabled: isDisabled(), variant: getVariant() }
      });
      window.dispatchEvent(ev);
    }
  };

  function mountWhenReady() {
    if (mounting || handle) return;
    mount();
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
