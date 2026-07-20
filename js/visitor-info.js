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

    /* Build the widget DOM using textContent for API-sourced values */
    el.innerHTML = '';
    el.classList.remove('vi-optin');
    el.classList.add('vi-ready');

    var header = document.createElement('div');
    header.className = 'vi-header';

    var ipRow = document.createElement('div');
    ipRow.className = 'vi-row';
    var ipIcon = document.createElement('span');
    ipIcon.className = 'vi-icon';
    ipIcon.textContent = '\u25C8';
    ipRow.appendChild(ipIcon);
    var ipLabel = document.createElement('span');
    ipLabel.className = 'vi-label';
    ipLabel.textContent = 'IP';
    ipRow.appendChild(ipLabel);
    var ipVal = document.createElement('span');
    ipVal.className = 'vi-val';
    ipVal.textContent = ip;
    ipRow.appendChild(ipVal);
    header.appendChild(ipRow);

    var toggle = document.createElement('button');
    toggle.className = 'vi-toggle';
    toggle.setAttribute('aria-label', 'Toggle details');
    toggle.textContent = '\u2212';
    header.appendChild(toggle);

    el.appendChild(header);

    var body = document.createElement('div');
    body.className = 'vi-body';

    function addRow(label, value, extraCls) {
      if (!value) return;
      var row = document.createElement('div');
      row.className = 'vi-row';
      var ph = document.createElement('span');
      ph.className = 'vi-icon-placeholder';
      row.appendChild(ph);
      var lbl = document.createElement('span');
      lbl.className = 'vi-label';
      lbl.textContent = label;
      row.appendChild(lbl);
      var val = document.createElement('span');
      val.className = 'vi-val' + (extraCls ? ' ' + extraCls : '');
      val.textContent = value;
      row.appendChild(val);
      body.appendChild(row);
    }

    var displayLoc = loc || '';
    addRow('Location', displayLoc, 'vi-loc');
    addRow('Region', region, 'vi-org');
    addRow('Timezone', tz, 'vi-org');
    addRow('Hostname', hostname, 'vi-org');
    if (asn) addRow('ASN', 'AS' + asn, 'vi-org');
    addRow('ISP', orgName, 'vi-org');

    el.appendChild(body);

    var saved = localStorage.getItem('vi-collapsed');
    if (saved === 'true') {
      el.classList.add('vi-collapsed');
      toggle.textContent = '+';
      body.style.display = 'none';
    }

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
