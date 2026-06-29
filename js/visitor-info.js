/* ============================================================
   VISITOR INFO — IP / location detection (cyber page)
   Primary: ipapi.co (HTTPS, 1k/day). Fallback: ipinfo.io.
   ============================================================ */
(function () {
  var el = document.getElementById('visitorInfo');
  if (!el) return;

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

    var html = '<div class="vi-row"><span class="vi-icon">\u25C8</span><span class="vi-label">IP</span><span class="vi-val">' + ip + '</span></div>';
    if (loc) html += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Location</span><span class="vi-val vi-loc">' + loc + '</span></div>';
    if (region) html += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Region</span><span class="vi-val vi-org">' + region + '</span></div>';
    if (tz) html += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Timezone</span><span class="vi-val vi-org">' + tz + '</span></div>';
    if (postal) html += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Postal</span><span class="vi-val vi-org">' + postal + '</span></div>';
    if (hostname) html += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Hostname</span><span class="vi-val vi-org">' + hostname + '</span></div>';
    if (coords) html += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">Coords</span><span class="vi-val vi-org">' + coords + '</span></div>';
    if (asn) html += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">ASN</span><span class="vi-val vi-org">AS' + asn + '</span></div>';
    if (orgName) html += '<div class="vi-row"><span class="vi-icon-placeholder"></span><span class="vi-label">ISP</span><span class="vi-val vi-org">' + orgName + '</span></div>';
    el.innerHTML = html;
    el.classList.add('vi-ready');
  }

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
})();
