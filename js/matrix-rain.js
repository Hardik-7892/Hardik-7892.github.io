/* ============================================================
   MATRIX RAIN — roles.html invite section
   Lightweight 2D canvas code rain, no deps.
   Pauses on hidden tab / reduced-motion / out-of-viewport.
   ============================================================ */
(function () {
  var canvas = document.getElementById('matrix-rain');
  if (!canvas) return;

  var section = canvas.closest('.matrix-section');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cols = 0;
  var drops = [];
  var raf = 0;
  var running = true;
  var lastT = 0;
  var chars = '01アイウエオカキクケコｱｲｳｴｵｶｷｸｹｺﾊﾋﾌﾍﾎ';
  var fontSize = 14;
  var colW = 0;
  var glyphs = chars.split('');

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // tune cols to container width
    var cssW = rect.width;
    colW = fontSize * 0.95;
    cols = Math.max(1, Math.floor(cssW / colW));
    drops = new Array(cols);
    for (var i = 0; i < cols; i++) drops[i] = Math.floor(Math.random() * -40);
    ctx.font = fontSize + 'px ' + 'JetBrains Mono, monospace';
  }

  function frame(t) {
    raf = 0;
    if (!running) return;
    // throttle to ~22fps for readability + perf
    if (t - lastT < 46) {
      raf = window.requestAnimationFrame(frame);
      return;
    }
    lastT = t;
    var rect = canvas.getBoundingClientRect();
    var w = rect.width, h = rect.height;
    // translucent trail
    ctx.fillStyle = 'rgba(5,10,5,0.22)';
    ctx.fillRect(0, 0, w, h);

    for (var i = 0; i < cols; i++) {
      var x = i * colW + colW * 0.15;
      var y = drops[i] * fontSize;
      var ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      // head brighter
      var bright = Math.random() < 0.12;
      ctx.fillStyle = bright ? '#E8F5E9' : (Math.random() < 0.06 ? '#00FF41' : 'rgba(0, 230, 118, 0.95)');
      // subtle glow for head
      if (bright) {
        ctx.shadowColor = 'rgba(0,255,65,0.85)';
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillText(ch, x, y);
      ctx.shadowBlur = 0;
      // reset with randomness
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      else drops[i]++;
    }
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    running = true;
    lastT = 0;
    raf = window.requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
  }

  resize();
  start();

  var ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(function () { resize(); });
    if (section) ro.observe(section);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });

  // pause when off-screen
  if ('IntersectionObserver' in window && section) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) start();
        else stop();
      });
    }, { threshold: 0 });
    io.observe(section);
  }

  // single draw for noscript-ish reduced visibility
  window.addEventListener('beforeunload', stop);
})();
