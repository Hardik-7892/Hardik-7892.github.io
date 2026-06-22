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
