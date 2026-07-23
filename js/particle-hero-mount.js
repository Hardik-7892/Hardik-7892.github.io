(function() {
  var el = document.getElementById('particle-hero');
  if (!el) return;

  window.ParticleHeroWidget.mount(el, {
    debugUi: false,
    enableOrbitControls: false,
    modelYawSpeedDegPerSec: 20,
    viewYawOffsetDeg: 45,
    modelUrls: [
      "/assets/models/profile_nobg.bin",
      "/assets/models/cyber.bin",
      "/assets/models/ml.bin",
      "/assets/models/gamedev.bin",
      "/assets/models/cloud.bin",
      "/assets/models/webdev.bin"
    ]
  });
})();
