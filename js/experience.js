/* ============================================================
   EXPERIENCE — gallery lightbox (native <dialog>, no deps)
   ============================================================ */
(function () {
  var dialog = document.getElementById('lightbox');
  if (!dialog) return;

  var img = document.getElementById('lightboxImg');
  var cap = document.getElementById('lightboxCap');
  var count = document.getElementById('lightboxCount');
  var prev = document.getElementById('lightboxPrev');
  var next = document.getElementById('lightboxNext');
  var close = document.getElementById('lightboxClose');

  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item img'));
  var idx = 0;

  function render() {
    var item = items[idx];
    img.src = item.currentSrc || item.src;
    img.alt = item.alt;
    var figure = item.closest('figure');
    var figcap = figure ? figure.querySelector('figcaption') : null;
    cap.textContent = figcap ? figcap.textContent : '';
    if (count) count.textContent = (idx + 1) + ' / ' + items.length;
  }

  function show(i) {
    if (!items.length) return;
    idx = (i + items.length) % items.length;
    render();
    document.body.classList.add('lightbox-open');
    if (!dialog.open) dialog.showModal();
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () { show(i); });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Open photo in viewer: ' + item.alt);
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); }
    });
  });

  if (prev) prev.addEventListener('click', function () { show(idx - 1); });
  if (next) next.addEventListener('click', function () { show(idx + 1); });
  if (close) close.addEventListener('click', function () { dialog.close(); });

  // Close on backdrop click and keyboard navigation
  dialog.addEventListener('close', function () {
    document.body.classList.remove('lightbox-open');
  });
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });
  document.addEventListener('keydown', function (e) {
    if (!dialog.open) return;
    if (e.key === 'Escape') dialog.close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
})();
