/* ============================================================
   ROLES INDEX (roles.html) — live preview switching
   Shows the role-preview panel matching the hovered/focused entry.
   Everything is pre-rendered in the DOM; JS only flips .is-active.
   ============================================================ */
(function () {
  var entries = document.querySelectorAll('.role-entry');
  var panels = document.querySelectorAll('.role-preview-panel');
  if (!entries.length || !panels.length) return;

  function show(name) {
    var active = false;
    panels.forEach(function (p) {
      var on = p.dataset.preview === name;
      p.classList.toggle('is-active', on);
      if (on) active = true;
    });
    if (!active) {
      panels.forEach(function (p) {
        if (p.dataset.preview === 'default') p.classList.add('is-active');
      });
    }
  }

  entries.forEach(function (entry) {
    var name = entry.dataset.role || 'default';
    entry.addEventListener('mouseenter', function () { show(name); });
    entry.addEventListener('focus', function () { show(name); });
    entry.addEventListener('mouseleave', function () { show('default'); });
    entry.addEventListener('blur', function () { show('default'); });
  });
})();


