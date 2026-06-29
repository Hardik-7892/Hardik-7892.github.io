(function () {
  const container = document.getElementById('cyber-bg');
  if (!container) return;

  const W = container.clientWidth || 800;
  const H = container.clientHeight || 420;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / Math.max(H, 1), 0.1, 100);
  camera.position.z = 16;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const R = 5.5;
  const ACCENT = 0x0EA5E9;
  const ALERT = 0xEF4444;

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

  const NUM_DOTS = 80;
  const dotGeom = new THREE.SphereGeometry(0.18, 8, 8);
  const dots = [];
  const dotPositions = [];

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
    mesh.userData.origColor = mat.color.getHex();
    group.add(mesh);
    dots.push(mesh);
    dotPositions.push(new THREE.Vector3(x, y, z));
  }

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
        const mat = new THREE.LineBasicMaterial({
          color: ACCENT,
          transparent: true,
          opacity: 0.08
        });
        const line = new THREE.Line(geom, mat);
        group.add(line);
        arcs.push({ line, idxA: i, idxB: j });
      }
    }
  }

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

  function flashAlert() {
    const available = dots.filter(d => d.material.color.getHex() !== ALERT);
    if (available.length === 0) return;
    const count = Math.min(2, available.length);
    const redDotIdxs = new Set();
    const flashing = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * available.length);
      const dot = available[idx];
      dot.material.color.setHex(ALERT);
      dot.material.opacity = 1;
      dot.scale.setScalar(1.5);
      flashing.push(dot);
      redDotIdxs.add(dots.indexOf(dot));
      available.splice(idx, 1);
    }
    for (const arc of arcs) {
      if (redDotIdxs.has(arc.idxA) && redDotIdxs.has(arc.idxB)) {
        arc.line.material.color.setHex(ALERT);
        arc.line.material.opacity = 0.6;
        flashing.push(arc.line);
      }
    }
    setTimeout(() => {
      for (const item of flashing) {
        if (item.userData && item.userData.origColor !== undefined) {
          item.material.color.setHex(item.userData.origColor);
          item.material.opacity = 0.8;
          item.scale.setScalar(1);
        } else if (item.material) {
          item.material.color.setHex(ACCENT);
          item.material.opacity = 0.08;
        }
      }
    }, 1000);
  }
  setInterval(flashAlert, 2000);
  setInterval(flashAlert, 2200);
  setInterval(flashAlert, 2500);
  setInterval(flashAlert, 2700);

  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let autoRotate = true;

  function onPointerDown(e) {
    isDragging = true;
    autoRotate = false;
    const rect = renderer.domElement.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX != null) {
      prevMouse.x = clientX;
      prevMouse.y = clientY;
    }
  }
  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX == null) return;
    const dx = clientX - prevMouse.x;
    const dy = clientY - prevMouse.y;
    group.rotation.y += dx * 0.01;
    group.rotation.x += dy * 0.005;
    group.rotation.x = Math.max(-0.5, Math.min(0.5, group.rotation.x));
    prevMouse.x = clientX;
    prevMouse.y = clientY;
  }
  function onPointerUp() {
    isDragging = false;
    setTimeout(() => { autoRotate = true; }, 1000);
  }

  const canvas = renderer.domElement;
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);
  canvas.addEventListener('touchstart', onPointerDown, { passive: true });
  canvas.addEventListener('touchmove', onPointerMove, { passive: true });
  canvas.addEventListener('touchend', onPointerUp);

  function animate() {
    requestAnimationFrame(animate);
    if (autoRotate && !isDragging) {
      group.rotation.y += 0.002;
    }
    for (const p of particles) {
      p.userData.theta += p.userData.speed * p.userData.thetaDir;
      p.position.set(
        p.userData.r * Math.sin(p.userData.phi) * Math.cos(p.userData.theta),
        p.userData.r * Math.cos(p.userData.phi),
        p.userData.r * Math.sin(p.userData.phi) * Math.sin(p.userData.theta)
      );
    }
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
