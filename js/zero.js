/* ============================================================
   0.html — scroll-driven scene (moved from roles.js)
   ============================================================ */
(function () {
  var section = document.getElementById('act2');
  if (!section) return;

  function ignite() {
    section.classList.add('activated');
  }

  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    ignite();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        ignite();
        io.disconnect();
      }
    });
  }, { threshold: 0 });
  io.observe(section);

  var ticking = false;
  function update() {
    ticking = false;
    var rect = section.getBoundingClientRect();
    var travel = rect.height - window.innerHeight;
    var p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    section.style.setProperty('--act2-p', p.toFixed(4));
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
