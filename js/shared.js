/* ============================================================
   SHARED TEMPLATES — nav, footer, privacy banner
   Injected via placeholder elements to avoid HTML duplication.
   ============================================================ */
(function () {
  /* ---------- helpers ---------- */
  function a(href, cls, text, extra) {
    var e = extra || '';
    return '<a href="' + href + '" class="' + cls + '"' + e + '>' + text + '</a>';
  }

  function navLinks(p) {
    var items = [
      { label: 'Home',    href: p + 'index.html',   page: 'home' },
      { label: 'About',   href: p + 'about.html',   page: 'about' },
      { label: 'Roles',   href: '#',                page: 'roles', dropdown: [
        { label: 'Cyber', href: p + 'roles/cyber.html', page: 'cyber' },
        { label: 'ML',    href: p + 'roles/ml.html',    page: 'ml' },
      ]},
      { label: 'Projects', href: p + 'projects.html', page: 'projects' },
      { label: 'Profiles', href: p + 'profiles.html',  page: 'profiles', dropdown: [
        { label: 'All Profiles',  href: p + 'profiles.html', page: 'profiles' },
        { label: 'Google Cloud',  href: p + 'cloud.html',    page: 'cloud' },
        { label: 'Vercel',  href: 'https://vercel.com/hardiks-projects-9b7e5c43', page: '', external: true },
        { label: 'Itch.io', href: 'https://hardik-7892.itch.io',    page: '', external: true },
      ]},
      { label: 'Contact', href: p + 'contact.html',  page: 'contact' },
    ];

    var html = '';
    items.forEach(function (item) {
      if (item.dropdown) {
        html += '<li class="nav-dropdown">';
        if (item.href === '#') {
          html += '<a role="button" tabindex="0" class="nav-link" data-page="' + item.page + '">' + item.label + ' <span class="dropdown-arrow">&#x25BE;</span></a>';
        } else {
          html += '<a href="' + item.href + '" class="nav-link" data-page="' + item.page + '">' + item.label + ' <span class="dropdown-arrow">&#x25BE;</span></a>';
        }
        html += '<ul class="dropdown-menu">';
        item.dropdown.forEach(function (d) {
          var target = d.external ? ' target="_blank" rel="noopener"' : '';
          html += '<li><a href="' + d.href + '" class="nav-link" data-page="' + d.page + '"' + target + '>' + d.label + '</a></li>';
        });
        html += '</ul></li>';
      } else {
        html += '<li>' + a(item.href, 'nav-link', item.label, ' data-page="' + item.page + '"') + '</li>';
      }
    });

    return html;
  }

  /* ---------- injectors ---------- */
  function injectNav() {
    var el = document.getElementById('shared-nav');
    if (!el) return;
    var pg = el.dataset.page || '';
    var p = el.dataset.prefix || '';

    el.innerHTML =
      '<header class="nav" id="nav">' +
        '<div class="nav-inner">' +
          '<a href="' + p + 'index.html" class="nav-logo">hp.</a>' +
          '<nav>' +
            '<button class="nav-toggle" id="navToggle" aria-label="Toggle navigation"><span></span><span></span><span></span></button>' +
            '<ul class="nav-links" id="navLinks">' +
              navLinks(p) +
              '<li><button class="theme-btn" id="themeToggle" aria-label="Toggle theme">&#x263E;</button></li>' +
            '</ul>' +
          '</nav>' +
        '</div>' +
      '</header>';
  }

  function injectFooter() {
    var el = document.getElementById('shared-footer');
    if (!el) return;
    el.innerHTML =
      '<footer>' +
        '<div class="container">' +
          '<div class="footer-inner">' +
            '<p class="footer-text">Hardik Pandey</p>' +
            '<div class="footer-links">' +
              '<a href="https://github.com/Hardik-7892" target="_blank" rel="noopener" class="footer-link">GitHub</a>' +
              '<a href="https://linkedin.com/in/hp0" target="_blank" rel="noopener" class="footer-link">LinkedIn</a>' +
              '<a href="https://hardik.goatcounter.com" target="_blank" rel="noopener" class="footer-link">Visitors</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  function injectBanner() {
    var el = document.getElementById('shared-banner');
    if (!el) return;
    el.innerHTML =
      '<aside class="privacy-banner" id="privacyBanner">' +
        '<p>This site uses <a href="https://www.goatcounter.com/" target="_blank" rel="noopener">GoatCounter</a> for privacy-friendly analytics (no cookies, no personal data).</p>' +
        '<button class="privacy-btn" id="privacyBtn">Got it</button>' +
      '</aside>';
  }

  /* ---------- run ---------- */
  injectNav();
  injectFooter();
  injectBanner();
})();
