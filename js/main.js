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
    if (trigger) {
      trigger.addEventListener('click', e => {
        if (window.innerWidth <= 640) {
          e.preventDefault();
          e.stopPropagation();
          drop.classList.toggle('open');
        }
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

  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggle.textContent = '\u2600';
  }

  toggle.addEventListener('click', () => {
    const nowDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (nowDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      toggle.textContent = '\u263E';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      toggle.textContent = '\u2600';
    }
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
          card.classList.add('visible');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();
