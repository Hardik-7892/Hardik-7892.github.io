(function () {
  if (window.innerWidth <= 640) return;
  const container = document.getElementById('cyber-bg');
  if (!container) return;

  const W = container.clientWidth || 800;
  const H = container.clientHeight || 420;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / Math.max(H, 1), 0.1, 100);
  camera.position.z = 15;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.pointerEvents = 'auto';
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const R = 5.5;
  const ACCENT = 0x0EA5E9;
  const ALERT = 0xEF4444;

  /* ---------- wireframe ---------- */
  const wireMat = new THREE.LineBasicMaterial({
    color: ACCENT,
    transparent: true,
    opacity: 0.15
  });

  for (let lat = -60; lat <= 60; lat += 30) {
    const pts = [];
    const phi = (90 - lat) * Math.PI / 180;
    for (let lng = 0; lng <= 360; lng += 4) {
      const theta = lng * Math.PI / 180;
      pts.push(new THREE.Vector3(
        -R * Math.sin(phi) * Math.cos(theta),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(theta)
      ));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
  }

  for (let lng = 0; lng < 360; lng += 30) {
    const pts = [];
    const theta = lng * Math.PI / 180;
    for (let lat = -90; lat <= 90; lat += 4) {
      const phi = (90 - lat) * Math.PI / 180;
      pts.push(new THREE.Vector3(
        -R * Math.sin(phi) * Math.cos(theta),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(theta)
      ));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
  }

  /* ---------- nodes (dots) ---------- */
  const NUM_DOTS = 80;
  const dotGeom = new THREE.SphereGeometry(0.18, 8, 8);
  const dots = [];
  const dotPositions = [];
  let totalElapsed = 0;

  for (let i = 0; i < NUM_DOTS; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = R * Math.sin(phi) * Math.cos(theta);
    const y = R * Math.cos(phi);
    const z = R * Math.sin(phi) * Math.sin(theta);

    const hue = 0.56 + Math.random() * 0.08;
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.9, 0.6)
    });
    const mesh = new THREE.Mesh(dotGeom, mat);
    mesh.position.set(x, y, z);
    mesh.userData = {
      id: 'NODE-' + String(i + 1).padStart(3, '0'),
      status: 'up',
      origColor: mat.color.getHex(),
      totalDown: 0,
      uptime: 100
    };
    group.add(mesh);
    dots.push(mesh);
    dotPositions.push(new THREE.Vector3(x, y, z));
  }

  /* ---------- arcs ---------- */
  const arcs = [];
  const MAX_ARC_DIST = R * 1.8;
  for (let i = 0; i < NUM_DOTS; i++) {
    for (let j = i + 1; j < NUM_DOTS; j++) {
      if (dotPositions[i].distanceTo(dotPositions[j]) < MAX_ARC_DIST) {
        const mid = dotPositions[i].clone().add(dotPositions[j]).multiplyScalar(0.5);
        const elevation = 1 + Math.random() * 1.5;
        mid.normalize().multiplyScalar(R + elevation);
        const curve = new THREE.QuadraticBezierCurve3(dotPositions[i], mid, dotPositions[j]);
        const pts = curve.getPoints(16);
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({
          color: ACCENT,
          transparent: true,
          opacity: 0.08
        });
        const line = new THREE.Line(geom, lineMat);
        group.add(line);
        arcs.push({ line, idxA: i, idxB: j });
      }
    }
  }

  /* ---------- orbiting particles ---------- */
  const pGeom = new THREE.SphereGeometry(0.08, 4, 4);
  const pMat = new THREE.MeshBasicMaterial({ color: 0x6B7280 });
  const particles = [];
  for (let k = 0; k < 30; k++) {
    const mesh = new THREE.Mesh(pGeom, pMat);
    const r = R + 1 + Math.random() * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
    mesh.userData = {
      r, theta, phi,
      speed: 0.002 + Math.random() * 0.004,
      thetaDir: Math.random() > 0.5 ? 1 : -1
    };
    group.add(mesh);
    particles.push(mesh);
  }

  /* ---------- node health simulation ---------- */
  function setNodeStatus(dot, status) {
    dot.userData.status = status;
    if (status === 'down') {
      dot.material.color.setHex(ALERT);
      dot.material.opacity = 1;
      dot.scale.setScalar(1.5);
      dot.userData.downUntil = performance.now() + 5000 + Math.random() * 10000;
    } else {
      dot.material.color.setHex(dot.userData.origColor);
      dot.material.opacity = 0.8;
      dot.scale.setScalar(1);
      delete dot.userData.downUntil;
    }
    updateDownArcs();
  }

  function updateDownArcs() {
    for (const arc of arcs) {
      const a = dots[arc.idxA];
      const b = dots[arc.idxB];
      const bothDown = a.userData.status === 'down' && b.userData.status === 'down';
      arc.line.material.color.setHex(bothDown ? ALERT : ACCENT);
      arc.line.material.opacity = bothDown ? 0.6 : 0.08;
    }
  }

  let healthTimer = 0;
  let nextHealthCheck = 2 + Math.random() * 4;
  const MAX_DOWN = 12;
  function simulateHealth() {
    const now = performance.now();

    // recover nodes whose down duration has elapsed
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      if (d.userData.status === 'down' && d.userData.downUntil && now >= d.userData.downUntil) {
        setNodeStatus(d, 'up');
      }
    }

    // take down some up nodes (capped at MAX_DOWN)
    const currentDown = dots.filter(d => d.userData.status === 'down').length;
    const currentUp = dots.filter(d => d.userData.status === 'up');
    const maxNew = Math.min(currentUp.length, MAX_DOWN - currentDown);
    const downCount = Math.min(maxNew, 1 + Math.floor(Math.random() * 2));
    for (let i = 0; i < downCount; i++) {
      if (currentUp.length === 0) break;
      const idx = Math.floor(Math.random() * currentUp.length);
      setNodeStatus(currentUp[idx], 'down');
      currentUp.splice(idx, 1);
    }
  }

  /* ---------- hover detection ---------- */
  var raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  let selectedNode = null;
  let hovering = null;
  let hoverTimeout = null;

  function getNodeInfoEl() {
    return document.getElementById('nodeInfo');
  }

  function positionNodeInfo(pos) {
    var el = getNodeInfoEl();
    if (!el) return;
    var x = pos.x + 16;
    var y = pos.y + 16;
    var iw = window.innerWidth;
    var ih = window.innerHeight;
    var ew = el.offsetWidth;
    var eh = el.offsetHeight;
    el.classList.toggle('ni-flip-x', x + ew > iw);
    el.style.left = Math.min(x, iw - ew - 8) + 'px';
    el.style.top = (y + eh > ih ? ih - eh - 8 : y) + 'px';
  }

  function showNodeInfo(dot) {
    selectedNode = dot;
    var el = getNodeInfoEl();
    if (!el) return;
    var d = dot.userData;
    var statusClass = d.status === 'up' ? 'status-up' : 'status-down';
    var statusText = d.status === 'up' ? 'UP' : 'DOWN';
    var durText = d.status === 'up' ? '\u2014' : d.totalDown.toFixed(1) + 's';
    el.innerHTML =
      '<div class="ni-header"><span class="ni-icon">\u2B24</span><span class="ni-id">' + d.id + '</span><button class="ni-close" aria-label="Close node info">&times;</button></div>' +
      '<div class="ni-body">' +
        '<div class="ni-row"><span class="ni-label">Status</span><span class="ni-val ni-status-val ' + statusClass + '">' + statusText + '</span></div>' +
        '<div class="ni-row"><span class="ni-label">Uptime</span><span class="ni-val ni-uptime-val">' + d.uptime.toFixed(1) + '%</span></div>' +
        '<div class="ni-row"><span class="ni-label">Down</span><span class="ni-val ni-dur-val">' + durText + '</span></div>' +
      '</div>';
    el.classList.add('ni-visible');
    var closeBtn = el.querySelector('.ni-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null; }
        hideNodeInfo();
      });
    }
  }

  function hideNodeInfo() {
    selectedNode = null;
    hovering = null;
    var el = getNodeInfoEl();
    if (el) el.classList.remove('ni-visible');
  }

  function scheduleHideNodeInfo() {
    if (hoverTimeout) return;
    hoverTimeout = setTimeout(function () {
      hideNodeInfo();
      hoverTimeout = null;
    }, 300);
  }

  function hitTestNode(pos) {
    scene.updateMatrixWorld(true);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    var rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((pos.x - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((pos.y - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    var intersects = raycaster.intersectObjects(dots);
    return intersects.length > 0 ? intersects[0].object : null;
  }

  /* ---------- drag / hover handlers ---------- */
  var isDragging = false;
  var prevMouse = { x: 0, y: 0 };
  var autoRotate = true;
  var lastDragEndTime = 0;

  function getClientPos(e) {
    return {
      x: e.clientX || (e.touches && e.touches[0].clientX),
      y: e.clientY || (e.touches && e.touches[0].clientY)
    };
  }

  function onPointerDown(e) {
    var pos = getClientPos(e);
    if (pos.x == null) return;
    isDragging = true;
    autoRotate = false;
    prevMouse.x = pos.x;
    prevMouse.y = pos.y;
  }

  function onPointerMove(e) {
    var pos = getClientPos(e);
    if (pos.x == null) return;

    if (isDragging) {
      var dx = pos.x - prevMouse.x;
      var dy = pos.y - prevMouse.y;
      group.rotation.y += dx * 0.01;
      group.rotation.x += dy * 0.005;
      group.rotation.x = Math.max(-0.5, Math.min(0.5, group.rotation.x));
      prevMouse.x = pos.x;
      prevMouse.y = pos.y;
      if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null; }
      hideNodeInfo();
      return;
    }

    // hover detection
    var hit = hitTestNode(pos);
    if (hit) {
      if (hit !== hovering) {
        hovering = hit;
        if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null; }
        showNodeInfo(hit);
      }
      positionNodeInfo(pos);
    } else if (hovering) {
      hovering = null;
      scheduleHideNodeInfo();
    }
  }

  function onPointerUp() {
    isDragging = false;
    lastDragEndTime = performance.now();
  }

  const canvas = renderer.domElement;
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);
  canvas.addEventListener('touchstart', onPointerDown, { passive: true });
  canvas.addEventListener('touchmove', onPointerMove, { passive: true });
  canvas.addEventListener('touchend', onPointerUp);

  /* ---------- animate ---------- */
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    totalElapsed += dt;

    // update health simulation on random interval
    healthTimer += dt;
    if (healthTimer >= nextHealthCheck) {
      healthTimer = 0;
      nextHealthCheck = 2 + Math.random() * 4;
      simulateHealth();
    }

    // update uptime
    for (const dot of dots) {
      if (dot.userData.status === 'down') {
        dot.userData.totalDown += dt;
      }
      dot.userData.uptime = totalElapsed > 0
        ? ((totalElapsed - dot.userData.totalDown) / totalElapsed) * 100
        : 100;
    }

    // keep selected node panel up to date
    if (selectedNode) {
      const el = getNodeInfoEl();
      if (el && el.classList.contains('ni-visible')) {
        const data = selectedNode.userData;
        const statusEl = el.querySelector('.ni-status-val');
        const uptimeEl = el.querySelector('.ni-uptime-val');
        const durEl = el.querySelector('.ni-dur-val');
        if (statusEl && uptimeEl && durEl) {
          if (data.status === 'up') {
            statusEl.textContent = 'UP';
            statusEl.className = 'ni-val status-up';
          } else {
            statusEl.textContent = 'DOWN';
            statusEl.className = 'ni-val status-down';
          }
          uptimeEl.textContent = data.uptime.toFixed(1) + '%';
          durEl.textContent = data.status === 'up' ? '\u2014' : data.totalDown.toFixed(1) + 's';
        }
      }
    }

    if (autoRotate && !isDragging) {
      group.rotation.y += 0.002;
    } else if (!isDragging && lastDragEndTime && now - lastDragEndTime > 1000) {
      autoRotate = true;
      lastDragEndTime = 0;
    }

    for (const p of particles) {
      p.userData.theta += p.userData.speed * p.userData.thetaDir;
      p.position.set(
        p.userData.r * Math.sin(p.userData.phi) * Math.cos(p.userData.theta),
        p.userData.r * Math.cos(p.userData.phi),
        p.userData.r * Math.sin(p.userData.phi) * Math.sin(p.userData.theta)
      );
    }

    // keep panel up to date
    if (hovering && selectedNode) {
      var el = getNodeInfoEl();
      if (el && el.classList.contains('ni-visible')) {
        var data = selectedNode.userData;
        var statusEl = el.querySelector('.ni-status-val');
        var uptimeEl = el.querySelector('.ni-uptime-val');
        var durEl = el.querySelector('.ni-dur-val');
        if (statusEl && uptimeEl && durEl) {
          statusEl.textContent = data.status === 'up' ? 'UP' : 'DOWN';
          statusEl.className = 'ni-val ' + (data.status === 'up' ? 'status-up' : 'status-down');
          uptimeEl.textContent = data.uptime.toFixed(1) + '%';
          durEl.textContent = data.status === 'up' ? '\u2014' : data.totalDown.toFixed(1) + 's';
        }
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  /* ---------- resize ---------- */
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
