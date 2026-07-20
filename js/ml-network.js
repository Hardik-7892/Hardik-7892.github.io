(function () {
  if (window.innerWidth <= 640) return;
  const container = document.getElementById('cyber-bg');
  if (!container) return;

  const LAYERS = [4, 5, 7, 3];
  const LAYER_NAMES = ['Input Layer', 'Hidden Layer 1', 'Hidden Layer 2', 'Output Layer'];
  const NODE_R = 15;
  const HOVER_R = 22;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;pointer-events:auto;cursor:pointer;position:absolute;inset:0;';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let cw, ch, marginTop = 0;
  let nodes = [], edges = [], layerX = [];
  let hoveredId = -1;

  const tooltip = document.createElement('div');
  tooltip.className = 'nn-tooltip';
  document.body.appendChild(tooltip);

  function tooltipContent(d) {
    const inputs = d.layer > 0 ? LAYERS[d.layer - 1] : 0;
    const outputs = d.layer < LAYERS.length - 1 ? LAYERS[d.layer + 1] : 0;
    let html = '<div class="tt-layer">' + LAYER_NAMES[d.layer] + '</div>';
    html += '<div class="tt-neuron">Neuron ' + (d.index + 1) + ' of ' + d.total + '</div>';
    const parts = [];
    if (inputs) parts.push('\u2190 ' + inputs + ' inputs');
    if (outputs) parts.push(outputs + ' outputs \u2192');
    if (parts.length) html += '<div class="tt-conns">' + parts.join(' &nbsp;|&nbsp; ') + '</div>';
    return html;
  }

  function layout() {
    marginTop = 30;
    const availH = ch - marginTop - 10;
    layerX = LAYERS.map(function (_, l) { return (l + 0.5) * cw / LAYERS.length; });
    const maxN = Math.max.apply(null, LAYERS);
    const spacingY = Math.min(36, (availH - 16) / (maxN - 1));

    nodes = [];
    var id = 0;
    LAYERS.forEach(function (n, l) {
      var cx = layerX[l];
      var totalH = (n - 1) * spacingY;
      var startY = marginTop + (availH - totalH) / 2;
      for (var i = 0; i < n; i++) {
        nodes.push({ id: id, layer: l, index: i, total: n, x: cx, y: startY + i * spacingY });
        id++;
      }
    });

    edges = [];
    var offsets = [], off = 0;
    LAYERS.forEach(function (n) { offsets.push(off); off += n; });
    for (var l = 0; l < LAYERS.length - 1; l++) {
      var off0 = offsets[l], off1 = offsets[l + 1];
      var n0 = LAYERS[l], n1 = LAYERS[l + 1];
      for (var i = 0; i < n0; i++) {
        for (var j = 0; j < n1; j++) {
          edges.push({ from: off0 + i, to: off1 + j });
        }
      }
    }
  }

  function accent() {
    return (getComputedStyle(document.body).getPropertyValue('--accent') || '#22C55E').trim();
  }
  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function draw() {
    var col = accent();
    var dark = isDark();
    var lineBase = dark ? 0.1 : 0.2;
    var lineHl = dark ? 0.5 : 0.6;
    var nodeAlpha = dark ? 0.9 : 1;

    ctx.clearRect(0, 0, cw, ch);

    ctx.lineWidth = 2;
    ctx.strokeStyle = col;
    ctx.shadowBlur = 0;
    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      var a = nodes[e.from], b = nodes[e.to];
      var hl = hoveredId >= 0 && (e.from === hoveredId || e.to === hoveredId);
      ctx.globalAlpha = hl ? lineHl : lineBase;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    ctx.globalAlpha = nodeAlpha;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var hl = n.id === hoveredId;
      ctx.fillStyle = col;
      ctx.shadowBlur = 0;
      if (hl) {
        ctx.shadowColor = col;
        ctx.shadowBlur = 18;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, hl ? HOVER_R : NODE_R, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  function hitTest(mx, my) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var dx = mx - n.x, dy = my - n.y;
      if (dx * dx + dy * dy <= NODE_R * NODE_R) return n.id;
    }
    return -1;
  }

  function resize() {
    var rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    cw = rect.width;
    ch = rect.height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
    draw();
  }

  canvas.addEventListener('mousemove', function (e) {
    var rect = this.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var found = hitTest(mx, my);

    if (found !== hoveredId) {
      hoveredId = found;
      draw();
    }

    if (found !== -1) {
      tooltip.innerHTML = tooltipContent(nodes[found]);
      tooltip.style.left = (e.pageX + 16) + 'px';
      tooltip.style.top = (e.pageY + 16) + 'px';
      tooltip.classList.add('visible');
    } else {
      tooltip.classList.remove('visible');
    }
  });

  canvas.addEventListener('mouseleave', function () {
    hoveredId = -1;
    draw();
    tooltip.classList.remove('visible');
  });

  window.addEventListener('resize', resize);
  resize();

  requestAnimationFrame(function () {
    resize();
  });

  new MutationObserver(function () { draw(); }).observe(
    document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }
  );
  container.classList.add('loaded');
})();
