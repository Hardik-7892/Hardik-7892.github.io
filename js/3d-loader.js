/* ============================================================
   CONDITIONAL three.js LOADER — role/cloud pages
   Skips the ~600KB three.js download + WebGL context on small
   screens and under prefers-reduced-motion. Desktop, fine-pointer
   devices get the globes exactly as before.
   Loaded via an external <script> so it respects the site's CSP
   (script-src has no 'unsafe-inline').
   ============================================================ */
(function () {
  var page = document.body.dataset.page;
  var map = {
    cyber: ['cyber-globe.js'],
    ml: ['ml-pipeline.js'],
    cloud: ['cloud-bg.js', 'cloud-globe.js']
  };
  if (!map[page]) return;
  if (window.innerWidth <= 640) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var nav = document.getElementById('shared-nav');
  var prefix = nav && nav.dataset.prefix ? nav.dataset.prefix : '';
  var base = prefix + 'js/';

  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
  s.integrity = 'sha384-qOkzR5Ke/XkQxuGVJ9hpFEpDlcoLtWwVYhnJf06cLIZa2vaIptSqaubivErzmD5O';
  s.crossOrigin = 'anonymous';
  s.onload = function () {
    map[page].forEach(function (file) {
      var g = document.createElement('script');
      g.src = base + file;
      document.body.appendChild(g);
    });
  };
  document.body.appendChild(s);
})();
