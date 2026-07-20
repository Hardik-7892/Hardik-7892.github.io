(function () {
  if (window.innerWidth <= 640) return;
  const container = document.getElementById('cloud-globe');
  if (!container) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  var GCP_BLUE, GCP_BLUE_OBJ, BLUE_LIGHT, WIRE_OPACITY, RING_OPACITY, ARC_OPACITY_MIN, ARC_OPACITY_RANGE, STAR_COLOR, GLOW_OPACITY;

  if (isDark) {
    GCP_BLUE = '#4285F4';
    BLUE_LIGHT = '#7BAAF7';
    WIRE_OPACITY = 0.12;
    RING_OPACITY = 0.3;
    ARC_OPACITY_MIN = 0.15;
    ARC_OPACITY_RANGE = 0.1;
    STAR_COLOR = '#A0C4FF';
    GLOW_OPACITY = 0.2;
  } else {
    GCP_BLUE = '#2563EB';
    BLUE_LIGHT = '#1D4ED8';
    WIRE_OPACITY = 0.25;
    RING_OPACITY = 0.5;
    ARC_OPACITY_MIN = 0.25;
    ARC_OPACITY_RANGE = 0.15;
    STAR_COLOR = '#94A3B8';
    GLOW_OPACITY = 0.35;
  }
  GCP_BLUE_OBJ = new THREE.Color(GCP_BLUE);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.5, 11);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const R = 6;

  // Wireframe sphere
  const sphereGeom = new THREE.IcosahedronGeometry(R, 2);
  const edges = new THREE.EdgesGeometry(sphereGeom);
  const wireMat = new THREE.LineBasicMaterial({
    color: GCP_BLUE,
    transparent: true,
    opacity: WIRE_OPACITY
  });
  const wireframe = new THREE.LineSegments(edges, wireMat);
  group.add(wireframe);

  const regions = [
    ['us-west1',    45.5,  -123.0],
    ['us-central1', 41.6,  -93.6],
    ['us-east1',    33.0,  -80.0],
    ['europe-west1', 50.8,  4.5],
    ['asia-east1',  25.0,  121.5],
    ['asia-southeast1', 1.3, 103.8],
    ['australia-southeast1', -33.8, 151.0],
    ['southamerica-east1', -23.5, -46.6],
  ];

  function latLngToPos(lat, lng, radius) {
    const phi = lat * Math.PI / 180;
    const theta = lng * Math.PI / 180;
    return new THREE.Vector3(
      radius * Math.cos(phi) * Math.cos(theta),
      radius * Math.sin(phi),
      radius * Math.cos(phi) * Math.sin(theta)
    );
  }

  const regionPositions = regions.map(r => latLngToPos(r[1], r[2], R));

  // Region marker dots + glow rings
  const dotGeom = new THREE.SphereGeometry(0.12, 10, 10);
  const dotMat = new THREE.MeshBasicMaterial({ color: BLUE_LIGHT });
  regionPositions.forEach(pos => {
    const dot = new THREE.Mesh(dotGeom, dotMat);
    dot.position.copy(pos);
    group.add(dot);

    const ringGeom = new THREE.RingGeometry(0.15, 0.25, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: GCP_BLUE,
      transparent: true,
      opacity: RING_OPACITY,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    group.add(ring);
  });

  // Region labels
  regions.forEach((r, i) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 18px "DM Sans", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = BLUE_LIGHT;
    ctx.fillText(r[0], 64, 20);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0.6
    });
    const sprite = new THREE.Sprite(mat);
    const labelPos = regionPositions[i].clone().normalize().multiplyScalar(R + 0.8);
    sprite.position.copy(labelPos);
    sprite.scale.set(2, 0.6, 1);
    group.add(sprite);
  });

  // Data arcs
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 4], [2, 7], [4, 6],
  ];

  const packets = [];
  connections.forEach(([a, b]) => {
    const pA = regionPositions[a];
    const pB = regionPositions[b];
    const mid = pA.clone().add(pB).multiplyScalar(0.5);
    const arcHeight = 2.5 + Math.random() * 2;
    const control = mid.clone().normalize().multiplyScalar(R + arcHeight);

    const curve = new THREE.QuadraticBezierCurve3(pA, control, pB);
    const points = curve.getPoints(24);
    const curveGeom = new THREE.BufferGeometry().setFromPoints(points);
    const curveMat = new THREE.LineBasicMaterial({
      color: GCP_BLUE,
      transparent: true,
      opacity: ARC_OPACITY_MIN + Math.random() * ARC_OPACITY_RANGE
    });
    group.add(new THREE.Line(curveGeom, curveMat));

    const packetGeom = new THREE.SphereGeometry(0.06, 6, 6);
    const packetMat = new THREE.MeshBasicMaterial({
      color: BLUE_LIGHT,
      transparent: true,
      opacity: 0.8
    });
    const packet = new THREE.Mesh(packetGeom, packetMat);
    packet.userData = {
      curve,
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.003
    };
    group.add(packet);
    packets.push(packet);
  });

  function updatePacket(packet) {
    const pt = packet.userData.curve.getPoint(packet.userData.progress);
    packet.position.copy(pt);
  }

  // Background stars
  const starCount = 400;
  const starGeom = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 80;
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: STAR_COLOR,
    size: 0.04,
    transparent: true,
    opacity: 0.4
  });
  const stars = new THREE.Points(starGeom, starMat);
  scene.add(stars);

  // Glow dots around regions
  const glowCount = 60;
  const glowGeom = new THREE.BufferGeometry();
  const glowPos = new Float32Array(glowCount * 3);
  for (let i = 0; i < glowCount; i++) {
    const idx = Math.floor(Math.random() * regionPositions.length);
    const base = regionPositions[idx];
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 1.5
    );
    const p = base.clone().add(offset);
    glowPos[i * 3] = p.x;
    glowPos[i * 3 + 1] = p.y;
    glowPos[i * 3 + 2] = p.z;
  }
  glowGeom.setAttribute('position', new THREE.BufferAttribute(glowPos, 3));
  const glowMat = new THREE.PointsMaterial({
    color: BLUE_LIGHT,
    size: 0.03,
    transparent: true,
    opacity: GLOW_OPACITY
  });
  group.add(new THREE.Points(glowGeom, glowMat));

  // --- Dynamic fixed positioning ---
  var BASE_HEIGHT = 500;
  var BASE_CAM_Z = 11;

  function positionGlobe() {
    const header = document.querySelector('.page-header');
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    const top = Math.max(0, headerBottom);
    const w = window.innerWidth;
    const h = Math.max(window.innerHeight - top, 100);

    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.right = '0';
    container.style.bottom = '0';
    container.style.top = top + 'px';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';

    camera.position.z = BASE_CAM_Z * (Math.max(h, BASE_HEIGHT) / BASE_HEIGHT);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  let scrollPending = false;
  function onScrollOrResize() {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(function () {
        scrollPending = false;
        positionGlobe();
      });
    }
  }

  positionGlobe();
  window.addEventListener('resize', onScrollOrResize);
  window.addEventListener('scroll', onScrollOrResize, { passive: true });

  // --- Animation ---
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    group.rotation.y += 0.002;

    for (const pkt of packets) {
      pkt.userData.progress += pkt.userData.speed;
      if (pkt.userData.progress >= 1) {
        pkt.userData.progress = 0;
        const conn = connections[Math.floor(Math.random() * connections.length)];
        const pA = regionPositions[conn[0]];
        const pB = regionPositions[conn[1]];
        const mid = pA.clone().add(pB).multiplyScalar(0.5);
    const arcHeight = 2.5 + Math.random() * 2;
        const control = mid.clone().normalize().multiplyScalar(R + arcHeight);
        pkt.userData.curve = new THREE.QuadraticBezierCurve3(pA, control, pB);
      }
      updatePacket(pkt);
    }

    stars.rotation.y += 0.0003;
    renderer.render(scene, camera);
  }
  animate();
  container.classList.add('loaded');
})();
