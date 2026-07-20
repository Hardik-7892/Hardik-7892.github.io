(function () {
  var page = document.body.dataset.page;
  if (!page) return;

  /* project / profile / badge render calls */
  switch (page) {

    case 'home':
      renderProjects('featuredProjects', { featured: true });
      break;

    case 'projects':
      renderProjects('projectsGrid');
      break;

    case 'profiles':
      renderProfiles('profileCards', { ids: ['gcp-skills', 'vercel', 'itchio'] });
      break;

    case 'cyber':
      renderProjects('cyberProjects', { role: 'cyber' });
      renderBadges('badgeList', 'cyber');
      break;

    case 'ml':
      renderProjects('mlProjects', { role: 'ml' });
      renderBadges('badgeList', 'ml');
      break;

    case 'cloud':
      initCloudPage();
      break;
  }

  /* ---------- cloud page: filter + URL params ---------- */
  function initCloudPage() {
    var VALID_FILTERS = ['all', 'genai', 'ml', 'cyber', 'infra', 'data', 'appdev', 'arcade', 'general'];
    var params = new URLSearchParams(window.location.search);
    var rawFilter = params.get('filter') || 'all';
    var defaultFilter = VALID_FILTERS.indexOf(rawFilter) !== -1 ? rawFilter : 'all';

    renderBadges('badgeList', defaultFilter);

    function forceBadgesVisible() {
      document.querySelectorAll('#badgeList .fade-in').forEach(function (el) { el.classList.add('visible'); });
    }

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderBadges('badgeList', btn.dataset.filter);
        forceBadgesVisible();
      });
    });

    if (defaultFilter !== 'all') {
      document.querySelectorAll('.filter-btn').forEach(function (btn) {
        if (btn.dataset.filter === defaultFilter) {
          document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
        }
      });
    }
  }
})();
