/* ============================================================
   ROLES INDEX (roles.html) — live preview switching
   Shows the role-preview panel matching the hovered/focused entry.
   Everything is pre-rendered in the DOM; JS only flips .is-active.
   ============================================================ */
(function () {
  var entries = document.querySelectorAll('.role-entry');
  var panels = document.querySelectorAll('.role-preview-panel');
  if (!entries.length || !panels.length) return;

  function show(name) {
    var active = false;
    panels.forEach(function (p) {
      var on = p.dataset.preview === name;
      p.classList.toggle('is-active', on);
      if (on) active = true;
    });
    if (!active) {
      panels.forEach(function (p) {
        if (p.dataset.preview === 'default') p.classList.add('is-active');
      });
    }
  }

  entries.forEach(function (entry) {
    var name = entry.dataset.role || 'default';
    entry.addEventListener('mouseenter', function () { show(name); });
    entry.addEventListener('focus', function () { show(name); });
    entry.addEventListener('mouseleave', function () { show('default'); });
    entry.addEventListener('blur', function () { show('default'); });
  });
})();

/* ============================================================
   ACT II — scroll-driven scene
   Ignites the eye once when the section is reached; then a
   passive rAF-throttled scroll handler writes --act2-p (0..1)
   on #act2, and the band variables in roles.css choreograph the
   bird breakout, eye exit and "coming soon" reveal from it.
   Reduced-motion -> ignite at once, no scroll driver.
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
