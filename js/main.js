/* ============================================================
   GOATCOUNTER — visitor analytics
   ============================================================ */
(function () {
  var s = document.createElement('script');
  s.src = 'https://gc.zgo.at/count.js';
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.integrity = 'sha384-2UjvVpptg4JlEVgJI2PdscrjOjPcil/4F1ZvIMJ81CShQnEDSlPI+l4PfogvTLYi';
  s.dataset.goatcounter = 'https://goatcounter.hardik-pandey.com/count';
  document.head.appendChild(s);
})();

/* ============================================================
   SERVICE WORKER — PWA offline caching
   ============================================================ */
(function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
})();

/* ============================================================
   NAV — scrolled state + active link + hamburger + dropdown
   ============================================================ */
(function () {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const currentPage = document.body.dataset.page;

  // Mark active link
  if (currentPage) {
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.page === currentPage) link.classList.add('active');
    });
    // Mark parent dropdown trigger active when a child page is active
    document.querySelectorAll('.nav-dropdown').forEach(drop => {
      if (drop.querySelector('.dropdown-menu .nav-link.active')) {
        const parentLink = drop.querySelector(':scope > .nav-link');
        if (parentLink) parentLink.classList.add('active');
      }
    });
  }

  // Scrolled border
  function updateNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Hamburger toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
    });

    // Close on link click (mobile) — skip dropdown parent trigger
    links.querySelectorAll('.nav-link').forEach(l => {
      l.addEventListener('click', () => {
        if (l.parentElement.classList.contains('nav-dropdown')) return;
        toggle.classList.remove('open');
        links.classList.remove('open');
      });
    });
  }

  // Dropdown toggle on mobile (click instead of hover)
  document.querySelectorAll('.nav-dropdown').forEach(drop => {
    const trigger = drop.querySelector('.nav-link');
    if (!trigger) return;

    function open() { drop.classList.add('open'); }
    function close() { drop.classList.remove('open'); }
    function isOpen() { return drop.classList.contains('open'); }

    trigger.addEventListener('click', e => {
      if (window.innerWidth <= 640) {
        e.preventDefault();
        e.stopPropagation();
        drop.classList.toggle('open');
      }
    });

    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isOpen()) { close(); } else { open(); }
        var first = drop.querySelector('.dropdown-menu .nav-link');
        if (first && !isOpen()) first.focus();
      }
      if (e.key === 'Escape') { close(); trigger.focus(); }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        open();
        var first = drop.querySelector('.dropdown-menu .nav-link');
        if (first) first.focus();
      }
    });
  });

  // Close on Escape from within dropdown
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        d.classList.remove('open');
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        d.classList.remove('open');
      });
    }
  });
})();


/* ============================================================
   TYPED EFFECT — cycles through roles on the hero
   ============================================================ */
(function () {
  const el = document.querySelector('.typed-text');
  if (!el) return;

  const roles = [
    'building local AI systems',
    'digging into security',
    'writing Rust',
    'shipping things',
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;

  function tick() {
    const current = roles[roleIdx];
    if (deleting) {
      charIdx--;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 55);
    } else {
      charIdx++;
      el.textContent = current.substring(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
      setTimeout(tick, 95);
    }
  }

  setTimeout(tick, 600);
})();


/* ============================================================
   FADE-IN ON SCROLL — IntersectionObserver for .fade-in
   ============================================================ */
(function () {
  // Hero elements fade in on load, staggered
  const heroEls = document.querySelectorAll('.hero .fade-in');
  heroEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 110 + 120);
  });

  // Everything else fades in on scroll
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.fade-in:not(.hero .fade-in)').forEach(el => {
    observer.observe(el);
  });

  /* Watch for dynamically created .fade-in elements (cards etc.) */
  var mo = new MutationObserver(function () {
    document.querySelectorAll('.fade-in:not(.hero .fade-in)').forEach(function (el) {
      observer.observe(el);
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();


/* ============================================================
   BACK TO TOP
   ============================================================ */
(function () {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function update() {
    btn.classList.toggle('visible', window.scrollY > 300);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   DARK MODE TOGGLE
   ============================================================ */
(function () {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = stored ? stored === 'dark' : prefersDark;

  function setPhoto() {
    var photo = document.getElementById('aboutPhoto');
    if (!photo) return;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    photo.src = dark ? 'images/dark_theme_profile.webp' : 'images/light_theme_profile.webp';
  }

  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.textContent = '\u2600';
  }
  setPhoto();

  toggle.addEventListener('click', () => {
    var nowDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (nowDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      toggle.textContent = '\u263E';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      toggle.textContent = '\u2600';
    }
    setPhoto();
  });
})();


/* ============================================================
   PROJECT FILTERS (projects.html)
   ============================================================ */
(function () {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.card');
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || (card.dataset.tags || '').split(',').includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();


/* ============================================================
   CURSOR DOT + RING (generic pages)
   ============================================================ */
(function () {
  const page = document.body.dataset.page;
  if (page === 'cyber' || page === 'ml') return;

  document.body.classList.add('custom-cursor-active');

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
  });

  function tick() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    requestAnimationFrame(tick);
  }
  tick();

  // Expand ring on hover over interactive elements
  document.querySelectorAll('a, button, [role="button"], input, .card, .pill, .contact-card').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('cursor-ring--hover'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('cursor-ring--hover'); });
  });
})();


/* ============================================================
   PRIVACY BANNER — GoatCounter notice, opt-out
   ============================================================ */
(function () {
  var banner = document.getElementById('privacyBanner');
  var btn = document.getElementById('privacyBtn');
  if (!banner || !btn) return;

  if (localStorage.getItem('privacy-dismissed')) return;

  // small delay so it doesn't pop in immediately
  setTimeout(function () {
    banner.classList.add('visible');
  }, 800);

  btn.addEventListener('click', function () {
    banner.classList.remove('visible');
    localStorage.setItem('privacy-dismissed', 'true');
  });
})();


/* ============================================================
   FEATURED PROJECTS CAROUSEL — centered peek, auto-cycle
   ============================================================ */
(function () {
  var track = document.getElementById('featuredProjects');
  var section = document.getElementById('featuredSection');
  var dotsEl = document.getElementById('featuredDots');
  var prevBtn = document.querySelector('.carousel-btn--prev');
  var nextBtn = document.querySelector('.carousel-btn--next');
  if (!track || !section || !dotsEl || !prevBtn || !nextBtn) return;
  if (track.children.length === 0) return;

  var CARD_GAP = 20;
  var CARD_W = 280;
  var INTERVAL = 4000;

  var cards = [];
  var cur = 0;
  var timer = null;
  var paused = false;
  var visible = false;
  var realCount = 0;
  var moving = false;
  var cancelSnap = false;
  var OFFSET = 1;

  function getRealIdx(t) { return ((t - OFFSET) % realCount + realCount) % realCount; }

  function step() { return CARD_W + CARD_GAP; }

  function getVw() {
    var vp = section.querySelector('.carousel-viewport');
    return vp ? vp.offsetWidth : 0;
  }

  function calcTx(i) {
    return (getVw() - CARD_W) / 2 - i * step();
  }

  function renderDots() {
    var html = '';
    var realIdx = getRealIdx(cur);
    for (var di = 0; di < realCount; di++) {
      html += '<button class="carousel-dot' + ((di === realIdx) ? ' active' : '') + '" data-i="' + di + '"></button>';
    }
    dotsEl.innerHTML = html;
    dotsEl.setAttribute('aria-label', 'Project ' + (realIdx + 1) + ' of ' + realCount);
  }

  function updateUI(realIdx) {
    realIdx = realIdx === undefined ? getRealIdx(cur) : realIdx;
    cards.forEach(function (c, j) {
      c.classList.toggle('active', getRealIdx(j) === realIdx);
    });
    dotsEl.querySelectorAll('.carousel-dot').forEach(function (d) {
      d.classList.toggle('active', parseInt(d.dataset.i) === realIdx);
    });
    dotsEl.setAttribute('aria-label', 'Project ' + (realIdx + 1) + ' of ' + realCount);
  }
  function goTo(i, anim) {
    if (cards.length === 0) return;
    if (anim === undefined) anim = true;
    if (i < 0) i = 0;
    if (i >= cards.length - 1) i = cards.length - 1;

    cur = i;
    track.style.transition = anim
      ? 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)'
      : 'none';
    track.style.transform = 'translateX(' + calcTx(cur) + 'px)';
    updateUI(getRealIdx(cur));
  }

  function next() {
    if (moving) return;
    moving = true;
    cancelSnap = false;

    if (cur === OFFSET + realCount - 1) {
      goTo(OFFSET + realCount);
      var onEnd = function () {
        track.removeEventListener('transitionend', onEnd);
        if (!cancelSnap) { goTo(OFFSET, false); }
        moving = false;
      };
      track.addEventListener('transitionend', onEnd);
    } else {
      goTo(cur + 1);
      moving = false;
    }
  }

  function prev() {
    if (moving) return;
    moving = true;
    cancelSnap = false;

    if (cur === OFFSET) {
      goTo(OFFSET - 1);
      var onEnd = function () {
        track.removeEventListener('transitionend', onEnd);
        if (!cancelSnap) { goTo(OFFSET + realCount - 1, false); }
        moving = false;
      };
      track.addEventListener('transitionend', onEnd);
    } else {
      goTo(cur - 1);
      moving = false;
    }
  }

  function startAuto() { stopAuto(); if (!paused && visible && cards.length > 1) timer = setInterval(next, INTERVAL); }
  function stopAuto() { clearInterval(timer); timer = null; }
  function pauseAuto() { paused = true; stopAuto(); }
  function resumeAuto() { paused = false; startAuto(); }

  function withPause(fn) {
    return function () { pauseAuto(); fn(); setTimeout(resumeAuto, 2000); };
  }

  /* Visibility */
  var obs = new IntersectionObserver(function (e) {
    visible = e[0].isIntersecting;
    if (visible && !paused) startAuto(); else stopAuto();
  }, { threshold: 0.3 });
  obs.observe(section);

  /* Buttons */
  prevBtn.addEventListener('click', withPause(prev));
  nextBtn.addEventListener('click', withPause(next));

  /* Dots */
  dotsEl.addEventListener('click', function (e) {
    var d = e.target.closest('.carousel-dot');
    if (!d) return;
    cancelSnap = true;
    moving = false;
    pauseAuto();
    goTo(parseInt(d.dataset.i) + OFFSET);
    setTimeout(resumeAuto, 2000);
  });

  /* Hover pause */
  track.addEventListener('mouseenter', pauseAuto);
  track.addEventListener('mouseleave', function () { if (visible) setTimeout(resumeAuto, 1000); });

  /* Touch swipe */
  (function () {
    var sx = 0, ex = 0, swiping = false;
    track.addEventListener('touchstart', function (e) {
      sx = e.changedTouches[0].screenX;
      swiping = true;
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (!swiping) return;
      ex = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', function () {
      if (!swiping) return;
      swiping = false;
      var dist = sx - ex;
      if (Math.abs(dist) > 50) {
        withPause(dist > 0 ? next : prev)();
      }
    });
  })();

  /* Tab visibility */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAuto(); else if (visible && !paused) startAuto();
  });

  /* Keyboard */
  document.addEventListener('keydown', function (e) {
    if (!visible) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); cancelSnap = true; moving = false; pauseAuto(); prev(); setTimeout(resumeAuto, 2000); }
    if (e.key === 'ArrowRight') { e.preventDefault(); cancelSnap = true; moving = false; pauseAuto(); next(); setTimeout(resumeAuto, 2000); }
  });

  /* Resize */
  var raf;
  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () { goTo(cur, false); });
  });

  /* Init */
  cards = Array.from(track.children);
  realCount = cards.length;

  var lastClone = cards[realCount - 1].cloneNode(true);
  lastClone.setAttribute('aria-hidden', 'true');
  track.insertBefore(lastClone, track.firstChild);

  for (var ci = 0; ci < realCount; ci++) {
    var clone = cards[ci].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }

  cards = Array.from(track.children);
  renderDots();
  goTo(OFFSET, false);
  track.setAttribute('tabindex', '0');
  track.setAttribute('aria-label', 'Featured projects');
})();

/* ============================================================
   PAGE TRANSITIONS — View Transitions API fallback
   ============================================================ */
(function () {
  if (!document.startViewTransition) return;
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.indexOf('://') > -1 || href[0] === '#' || href.indexOf('javascript:') === 0 || href.indexOf('mailto:') === 0) return;
    if (a.getAttribute('target') === '_blank') return;
    e.preventDefault();
    var t = document.startViewTransition(function () { window.location.href = href; });
    t.finished.catch(function () { window.location.href = href; });
  });
})();
