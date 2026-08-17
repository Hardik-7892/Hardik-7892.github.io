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

    case 'software':
      renderProjects('softwareProjects', { role: 'software' });
      renderBadges('badgeList', 'infra');
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

    function applyFilter(filter) {
      document.querySelectorAll('.filter-btn').forEach(function (b) {
        var active = b.dataset.filter === filter;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      renderBadges('badgeList', filter);
      forceBadgesVisible();
    }

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;
        applyFilter(filter);
        var url = new URL(window.location.href);
        if (filter === 'all') url.searchParams.delete('filter');
        else url.searchParams.set('filter', filter);
        history.replaceState(null, '', url);
      });
    });

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      var active = btn.dataset.filter === defaultFilter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
})();
