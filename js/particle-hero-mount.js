(function() {
  var el = document.getElementById('particle-hero');
  if (!el) return;

  var VIDEO_HTML = '<div class="n"><video class="e" src="/video/video-fallback.mp4" autoplay loop muted playsinline preload="metadata"></video></div>';

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

  function showVideoFallback() {
    if (!el || el.querySelector('video')) return;
    el.innerHTML = VIDEO_HTML;
    var video = el.querySelector('video');
    if (video && video.play) {
      var p = video.play();
      if (p && p.catch) p.catch(function() {});
    }
  }

  function mount() {
    var handle = window.ParticleHeroWidget.mount(el, {
      debugUi: false,
      enableOrbitControls: false,
      modelYawSpeedDegPerSec: 20,
      viewYawOffsetDeg: 45,
      onError: function(err) {
        console.warn('[particle-hero] model load error:', err);
        if (!el.querySelector('video')) {
          try { handle.unmount(); } catch (e) {}
          showVideoFallback();
        }
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
  }

  function start() {
    if (prefersReducedMotion() || !webgl2Available()) {
      showVideoFallback();
      return;
    }
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
      } else if (waited >= 6000) {
        clearInterval(check);
        showVideoFallback();
      }
    }, 50);
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 2500 });
  } else {
    setTimeout(start, 300);
  }
})();
