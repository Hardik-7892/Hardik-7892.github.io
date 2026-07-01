/* ============================================================
   VISITOR INFO — IP / location detection (cyber page)
   Fully opt-in — no data is fetched until the visitor clicks "Reveal".
   Primary: ipapi.co (HTTPS, 1k/day). Fallback: ipinfo.io.
   ============================================================ */
(function () {
  var el = document.getElementById('visitorInfo');
  if (!el) return;

  /* ---------- opt-in prompt ---------- */
  function showOptIn() {
    el.innerHTML =
      '<div class="vi-row">' +
        '<span class="vi-icon">\u25C8</span>' +
        '<span class="vi-label">IP lookup</span>' +
        '<button class="vi-reveal-btn">Reveal</button>' +
      '</div>' +
      '<div class="vi-row vi-optin-hint">' +
        '<span class="vi-icon-placeholder"></span>' +
        '<span class="vi-optin-text">Your IP &amp; location will be fetched and shown on this widget</span>' +
      '</div>';
    el.classList.add('vi-optin');

    var btn = el.querySelector('.vi-reveal-btn');
    btn.addEventListener('click', function () {
      fetchData();
    });
  }

  /* ---------- data fetch ---------- */
  function fetchData() {
    el.innerHTML = '<div class="vi-row"><span class="vi-icon">\u25C8</span><span class="vi-label">Detecting...</span></div>';

    fetch('https://ipapi.co/json/')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.error) throw new Error(d.reason || d.error);
        render(d, 'ipapico');
      })
      .catch(function () {
        fetch('https://ipinfo.io/json')
          .then(function (r) { return r.json(); })
          .then(function (d) { render(d, 'ipinfo'); })
          .catch(function () {
            el.innerHTML = '<span class="vi-icon">\u25C8</span><span class="vi-error">unavailable</span>';
          });
      });
  }

  /* ---------- render fetched data ---------- */
  function render(d, source) {
    var ip, city, region, country, tz, postal, lat, lon, orgName, asn, flags, hostname;

    if (source === 'ipapico') {
      ip = d.ip || '\u2014';
      city = d.city || '';
      region = d.region || '';
      country = d.country_name || '';
      tz = d.timezone || '';
      postal = d.postal || '';
      lat = d.latitude;
      lon = d.longitude;
      asn = (d.asn || '').replace(/^AS/, '');
      orgName = d.org || '';
      flags = [];
      hostname = '';
    } else {
      ip = d.ip || '\u2014';
      city = d.city || '';
      region = d.region || '';
      country = d.country || '';
      tz = d.timezone || '';
      postal = d.postal || '';
      var c = (d.loc || '').split(',');
      lat = c[0];
      lon = c[1];
      var raw = d.org || '';
      asn = (raw.match(/^AS(\d+)/) || [])[1] || '';
      orgName = raw.replace(/^AS\d+\s*/, '');
      flags = [];
      hostname = d.hostname || '';
    }

    var locParts = [];
    if (city) locParts.push(city);
    if (country) locParts.push(country);
    var loc = locParts.join(', ');

    var coords = '';
    if (lat && lon) coords = lat + ',' + lon;

    var headerRow = '<div class="vi-row">';
    headerRow += '<span class="vi-icon">\u25C8</span><span class="vi-label">IP</span><span class="vi-val">' + ip + '</span>';
    headerRow += '</div>';

    var bodyRows = '';
    if (loc) bodyRows += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Location</span><span class="vi-val vi-loc">' + loc + '</span></div>';
    if (region) bodyRows += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Region</span><span class="vi-val vi-org">' + region + '</span></div>';
    if (tz) bodyRows += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Timezone</span><span class="vi-val vi-org">' + tz + '</span></div>';
    if (hostname) bodyRows += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Hostname</span><span class="vi-val vi-org">' + hostname + '</span></div>';
    if (asn) bodyRows += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">ASN</span><span class="vi-val vi-org">AS' + asn + '</span></div>';
    if (orgName) bodyRows += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">ISP</span><span class="vi-val vi-org">' + orgName + '</span></div>';

    el.innerHTML = '<div class="vi-header">' + headerRow + '<button class="vi-toggle" aria-label="Toggle details">\u2212</button></div><div class="vi-body">' + bodyRows + '</div>';
    el.classList.remove('vi-optin');
    el.classList.add('vi-ready');

    var toggle = el.querySelector('.vi-toggle');
    var body = el.querySelector('.vi-body');

    toggle.addEventListener('click', function () {
      var collapsed = el.classList.toggle('vi-collapsed');
      toggle.textContent = collapsed ? '+' : '\u2212';
      if (body) body.style.display = collapsed ? 'none' : '';
      localStorage.setItem('vi-collapsed', collapsed);
    });
  }

  /* ---------- start: show opt-in ---------- */
  showOptIn();
})();
