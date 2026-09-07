/* ============================================================
   CURSOR DOT + RING — extracted from main.js for bundle splitting
   Only loaded on generic pages (not cyber/ml, respects reduced-motion)
   ============================================================ */
(function () {
  var page = document.body.dataset.page;
  if (page === 'cyber' || page === 'ml') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.body.classList.add('custom-cursor-active');

  var dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  var ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);

  var mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
  });

  var lastX = 0, lastY = 0;

  function tick() {
    rx += (mx - rx) * 0.25;
    ry += (my - ry) * 0.25;

    var dx = mx - lastX;
    var dy = my - lastY;

    var speed = Math.min(Math.sqrt(dx * dx + dy * dy), 20);
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;

    var stretch = 1 + speed * 0.025;

    ring.style.transform =
      'translate(' + rx + 'px,' + ry + 'px) ' +
      'translate(-50%,-50%) ' +
      'rotate(' + angle + 'deg) ' +
      'scale(' + stretch + ',' + (1 / stretch) + ')';

    lastX = mx;
    lastY = my;

    requestAnimationFrame(tick);
  }
  tick();

  document.querySelectorAll('a, button, [role="button"], input, .card, .pill, .contact-card').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('cursor-ring--hover'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('cursor-ring--hover'); });
  });
})();
