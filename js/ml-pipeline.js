(function () {
  const container = document.getElementById('ml-bg');
  if (!container) return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
  camera.position.set(1, 2, 18);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const GREEN = 0x22C55E;
  const LIGHT = 0x86EFAC;
  const DIM = 0x166534;

  const stageNames = ['Ingest', 'Validate', 'Train', 'Evaluate', 'Deploy', 'Monitor'];

  const positions = [
    new THREE.Vector3(-5.5, -3,   0),
    new THREE.Vector3(-2.5,  2,  -0.5),
    new THREE.Vector3( 0.5, -2.5, 1),
    new THREE.Vector3( 3.5,  2.5, -0.5),
    new THREE.Vector3( 6.5, -0.5, 0.5),
    new THREE.Vector3( 9,   -3,   0),
  ];

  const nodeMat = new THREE.MeshBasicMaterial({
    color: GREEN,
    transparent: true,
    opacity: 0.3
  });
  const nodeGeom = new THREE.BoxGeometry(1.4, 0.9, 0.9);
  const nodeMeshes = positions.map(p => {
    const m = new THREE.Mesh(nodeGeom, nodeMat.clone());
    m.position.copy(p);
    group.add(m);
    return m;
  });

  function makeLabel(text) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 72;
    const ctx = c.getContext('2d');
    ctx.font = 'bold 26px "DM Sans", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#A3E635';
    ctx.fillText(text, 128, 36);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#84CC16';
    ctx.fillText(text, 128, 36);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.6, 0.75, 1);
    return sprite;
  }

  positions.forEach((p, i) => {
    const label = makeLabel(stageNames[i]);
    label.position.set(p.x, p.y - 1.2, p.z);
    group.add(label);
  });

  const conns = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
    [1, 3],
    [5, 0],
  ];

  const edgeMat = new THREE.LineBasicMaterial({
    color: GREEN,
    transparent: true,
    opacity: 0.1
  });
  conns.forEach(([a, b]) => {
    const geom = new THREE.BufferGeometry().setFromPoints([positions[a], positions[b]]);
    group.add(new THREE.Line(geom, edgeMat));
  });

  const pGeom = new THREE.SphereGeometry(0.1, 6, 6);
  const pMat = new THREE.MeshBasicMaterial({ color: LIGHT });
  const particles = [];
  for (let k = 0; k < 30; k++) {
    const mesh = new THREE.Mesh(pGeom, pMat);
    const ci = Math.floor(Math.random() * conns.length);
    mesh.userData = {
      conn: conns[ci],
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.004
    };
    group.add(mesh);
    particles.push(mesh);
  }

  let activeIdx = 0;
  setInterval(() => {
    activeIdx = (activeIdx + 1) % nodeMeshes.length;
  }, 2800);

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    nodeMeshes.forEach((m, i) => {
      if (i === activeIdx) {
        m.material.opacity = 0.3 + Math.sin(time * 5) * 0.2;
      } else {
        m.material.opacity = 0.25;
      }
    });

    for (const p of particles) {
      p.userData.progress += p.userData.speed;
      if (p.userData.progress >= 1) {
        p.userData.progress = 0;
        const ci = Math.floor(Math.random() * conns.length);
        p.userData.conn = conns[ci];
      }
      const [a, b] = p.userData.conn;
      p.position.lerpVectors(positions[a], positions[b], p.userData.progress);
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
