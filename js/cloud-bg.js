(function () {
  const container = document.getElementById('cloud-bg');
  if (!container) return;

  const W = container.clientWidth || 800;
  const H = container.clientHeight || 420;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -20, 20);
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  var svgStr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">'
    + '<path fill="' + (dark ? 'rgba(66,133,244,0.20)' : 'rgba(37,99,235,0.18)') + '" d="M160,40A88.09,88.09,0,0,0,81.29,88.67,64,64,0,1,0,72,216h88a88,88,0,0,0,0-176Zm0,160H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.11A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,72,72Z"/>'
    + '</svg>';

  var CW = 256, CH = 256;
  var canvas = document.createElement('canvas');
  canvas.width = CW;
  canvas.height = CH;
  var ctx = canvas.getContext('2d');

  var texture = null;

  var img = new Image();
  img.onload = function () {
    ctx.clearRect(0, 0, CW, CH);
    ctx.drawImage(img, 0, 0, CW, CH);
    if (texture) texture.needsUpdate = true;
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(svgStr);

  texture = new THREE.CanvasTexture(canvas);
  var mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  var clouds = [];
  var cloudDefs = [
    { size: 0.50, speed: 0.2, yOff: H * 0.05, startX: -W * 0.4, yAmp: 10, ySpeed: 0.25, opacity: 0.25 },
    { size: 0.40, speed: 0.35, yOff: H * 0.35, startX: W * 0.5, yAmp: 7, ySpeed: 0.35, opacity: 0.30 },
    { size: 0.30, speed: 0.5, yOff: -H * 0.10, startX: -W * 0.2, yAmp: 5, ySpeed: 0.45, opacity: 0.45 },
    { size: 0.22, speed: 0.65, yOff: H * 0.22, startX: W * 0.7, yAmp: 4, ySpeed: 0.55, opacity: 0.40 },
    { size: 0.16, speed: 0.8, yOff: -H * 0.05, startX: -W * 0.6, yAmp: 3, ySpeed: 0.65, opacity: 0.35 },
    { size: 0.12, speed: 0.95, yOff: H * 0.30, startX: W * 0.1, yAmp: 3, ySpeed: 0.75, opacity: 0.30 },
    { size: 0.08, speed: 1.1, yOff: -H * 0.02, startX: -W * 0.8, yAmp: 2, ySpeed: 0.85, opacity: 0.25 },
    { size: 0.07, speed: 1.25, yOff: H * 0.18, startX: W * 0.4, yAmp: 2, ySpeed: 0.9, opacity: 0.22 },
    { size: 0.06, speed: 1.4, yOff: -H * 0.12, startX: -W * 0.3, yAmp: 1.5, ySpeed: 1.0, opacity: 0.20 },
    { size: 0.05, speed: 1.6, yOff: H * 0.28, startX: W * 0.8, yAmp: 1.5, ySpeed: 1.1, opacity: 0.18 },
    { size: 0.04, speed: 1.8, yOff: H * 0.08, startX: -W * 0.5, yAmp: 1, ySpeed: 1.2, opacity: 0.15 },
  ];

  cloudDefs.forEach(function (def, i) {
    var geom = new THREE.PlaneGeometry(7, 7);
    var m = mat.clone();
    m.opacity = def.opacity;
    var mesh = new THREE.Mesh(geom, m);
    var cs = Math.min(W * def.size, 300);
    geom.scale(cs / 7, cs / 7, 1);
    mesh.position.set(def.startX, def.yOff, -i * 0.5);
    scene.add(mesh);
    clouds.push({
      mesh: mesh,
      speed: def.speed,
      yOff: def.yOff,
      yAmp: def.yAmp,
      ySpeed: def.ySpeed,
      xWrap: W / 2 + cs,
      xReset: -(W / 2 + cs),
    });
  });

  var time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      c.mesh.position.x -= c.speed;
      if (c.mesh.position.x < c.xReset) c.mesh.position.x = c.xWrap;
      c.mesh.position.y = c.yOff + Math.sin(time * c.ySpeed + i * 2.1) * c.yAmp;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
