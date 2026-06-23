(function () {
  const container = document.getElementById('cyber-bg');
  if (!container) return;

  const W = container.clientWidth || 800;
  const H = container.clientHeight || 420;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / Math.max(H, 1), 0.1, 100);
  camera.position.z = 24;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const N = 70;
  const positions = [];
  for (let i = 0; i < N; i++) {
    positions.push(new THREE.Vector3(
      (Math.random() - 0.5) * 35,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 24
    ));
  }

  const sphereGeom = new THREE.SphereGeometry(0.45, 12, 12);
  const nodeMeshes = [];
  positions.forEach((p, idx) => {
    const hue = 0.56 + Math.random() * 0.08;
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.9, 0.6)
    });
    const mesh = new THREE.Mesh(sphereGeom, mat);
    mesh.position.copy(p);
    mesh.userData.idx = idx;
    mesh.userData.origColor = mat.color.getHex();
    group.add(mesh);
    nodeMeshes.push(mesh);
  });

  const MAX_DIST = 14;
  const DEFAULT_EDGE_COLOR = 0x0EA5E9;
  const ALERT_COLOR = 0xEF4444;
  const edges = [];
  const edgeLines = [];

  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (positions[i].distanceTo(positions[j]) < MAX_DIST) {
        const mat = new THREE.LineBasicMaterial({
          color: DEFAULT_EDGE_COLOR,
          transparent: true,
          opacity: 0.2
        });
        const geom = new THREE.BufferGeometry().setFromPoints([positions[i], positions[j]]);
        const line = new THREE.Line(geom, mat);
        group.add(line);
        edges.push({ a: i, b: j });
        edgeLines.push({ line, nodeA: nodeMeshes[i], nodeB: nodeMeshes[j] });
      }
    }
  }

  function flashAlert() {
    const available = edgeLines.filter(e => e.line.material.color.getHex() === DEFAULT_EDGE_COLOR);
    if (available.length === 0) return;
    const entry = available[Math.floor(Math.random() * available.length)];
    const { line, nodeA, nodeB } = entry;
    const origLineOpacity = line.material.opacity;
    line.material.color.setHex(ALERT_COLOR);
    line.material.opacity = 0.9;
    nodeA.material.color.setHex(ALERT_COLOR);
    nodeB.material.color.setHex(ALERT_COLOR);
    setTimeout(() => {
      line.material.color.setHex(DEFAULT_EDGE_COLOR);
      line.material.opacity = origLineOpacity;
      nodeA.material.color.setHex(nodeA.userData.origColor);
      nodeB.material.color.setHex(nodeB.userData.origColor);
    }, 400);
  }

  setInterval(flashAlert, 2000);
  setInterval(flashAlert, 2500);

  const packets = [];
  if (edges.length > 0) {
    const packetMat = new THREE.MeshBasicMaterial({ color: 0x7DD3FC });
    const packetGeom = new THREE.SphereGeometry(0.22, 8, 8);
    for (let k = 0; k < Math.min(15, edges.length); k++) {
      const mesh = new THREE.Mesh(packetGeom, packetMat);
      const edge = edges[Math.floor(Math.random() * edges.length)];
      mesh.userData = { edge, progress: Math.random(), speed: 0.003 + Math.random() * 0.004 };
      group.add(mesh);
      packets.push(mesh);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.004; // rotate (circular)
    group.rotation.x = Math.sin(Date.now() * 0.0003) * 0.5; // wobble (up down)  // tried tan
    for (const p of packets) {
      p.userData.progress += p.userData.speed;
      if (p.userData.progress >= 1) {
        p.userData.progress = 0;
        p.userData.edge = edges[Math.floor(Math.random() * edges.length)];
      }
      const { a, b } = p.userData.edge;
      p.position.lerpVectors(positions[a], positions[b], p.userData.progress);
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
