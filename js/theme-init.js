(function () {
  var stored = localStorage.getItem('theme');
  var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.setAttribute('data-theme', 'dark');

  window.syncThemeColor = function (isDark) {
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    if (metas.length) {
      metas[0].content = isDark ? '#121212' : '#F8F7F2';
      metas[0].removeAttribute('media');
    }
    for (var i = 1; i < metas.length; i++) metas[i].remove();
  };

  window.syncThemeColor(dark);
})();