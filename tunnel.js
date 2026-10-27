/* ============================================================
   tunnel.js — Túnel de entrada 3D (Three.js) como fondo fijo
   Estilo según referencias: hormigón oscuro, humo denso, luz
   cálida/blanca cegadora al fondo, focos de arena. La cámara
   avanza por el túnel con el scroll (lerp), se detiene al parar
   y retrocede al subir. No bloquea clics. Degrada sin WebGL.
   ============================================================ */
(function () {
  "use strict";
  const canvas = document.getElementById("tunnel");
  if (!canvas) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function webglOK() { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch (e) { return false; } }
  if (!window.THREE || !webglOK()) {
    canvas.style.background = "radial-gradient(circle at 50% 34%, rgba(255,190,120,.4), rgba(120,60,20,.15) 30%, transparent 55%), linear-gradient(180deg,#0c0c0e,#060606)";
    return;
  }

  const THREE = window.THREE;
  const isMobile = innerWidth < 760;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060606);
  scene.fog = new THREE.FogExp2(0x0a0a0c, 0.03);

  const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 500);
  camera.position.set(0, 1.7, 16);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const TUNNEL_LEN = 110;
  const END_Z = -TUNNEL_LEN;
  const W = 7.5, H = 5.6;

  /* ---------- Hormigón (paredes, suelo, techo) ---------- */
  // color gris frío, muy poco metálico, rugoso -> aspecto cemento
  const concrete = new THREE.MeshStandardMaterial({ color: 0x3a3a3e, metalness: 0.05, roughness: 0.95 });
  const concreteDark = new THREE.MeshStandardMaterial({ color: 0x242428, metalness: 0.05, roughness: 1.0 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2f, metalness: 0.12, roughness: 0.7 });

  function plane(w, l, mat, rot, pos) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), mat);
    if (rot.x) m.rotation.x = rot.x; if (rot.y) m.rotation.y = rot.y;
    m.position.set(pos.x, pos.y, pos.z); scene.add(m); return m;
  }
  plane(W, TUNNEL_LEN + 30, floorMat, { x: -Math.PI / 2 }, { x: 0, y: 0, z: -TUNNEL_LEN / 2 });
  plane(W, TUNNEL_LEN + 30, concreteDark, { x: Math.PI / 2 }, { x: 0, y: H, z: -TUNNEL_LEN / 2 });
  plane(H, TUNNEL_LEN + 30, concrete, { y: Math.PI / 2 }, { x: -W / 2, y: H / 2, z: -TUNNEL_LEN / 2 });
  plane(H, TUNNEL_LEN + 30, concrete, { y: -Math.PI / 2 }, { x: W / 2, y: H / 2, z: -TUNNEL_LEN / 2 });

  /* ---------- Vigas de techo + tuberías + lámparas frías ---------- */
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x1c1c20, metalness: 0.4, roughness: 0.7 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xdfe6ff });
  const lampLights = [];
  for (let z = 6; z > -TUNNEL_LEN; z -= 7) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(W, 0.3, 0.3), beamMat); beam.position.set(0, H - 0.2, z); scene.add(beam);
    // tubería lateral
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 7, 8), beamMat); pipe.rotation.z = Math.PI / 2; pipe.position.set(0, H - 0.5, z); scene.add(pipe);
    // lámpara fría de techo (como la 1ª imagen)
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.3), lampMat); lamp.position.set(0, H - 0.35, z); scene.add(lamp);
    if (!isMobile && Math.round(z) % 14 === 0) { const pl = new THREE.PointLight(0xcfe0ff, 0.7, 12); pl.position.set(0, H - 0.6, z); scene.add(pl); lampLights.push(pl); }
  }

  /* ---------- SALIDA: estallido de luz cálido al final ---------- */
  // disco brillante (el "sol" de la arena) + resplandor
  const sun = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40), new THREE.MeshBasicMaterial({ color: 0xffe6b0 }));
  sun.position.set(0, H * 0.55, END_Z + 3); scene.add(sun);
  const sunGlow = new THREE.PointLight(0xffd79a, 3, 120); sunGlow.position.set(0, H * 0.55, END_Z + 8); scene.add(sunGlow);
  // marco de salida (boca del túnel) iluminado por detrás
  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(W + 3, H + 2), new THREE.MeshBasicMaterial({ color: 0xffdca0, transparent: true, opacity: 0.0 }));
  mouth.position.set(0, H / 2, END_Z + 2.5); scene.add(mouth);

  /* ---------- Estadio al fondo (siluetas + focos) ---------- */
  const arena = new THREE.Group(); arena.position.set(0, 0, END_Z - 8);
  const standMat = new THREE.MeshStandardMaterial({ color: 0x101014, metalness: 0.2, roughness: 1 });
  [-16, 16].forEach(x => { const s = new THREE.Mesh(new THREE.BoxGeometry(9, 16, 50), standMat); s.position.set(x, 8, 0); arena.add(s); });
  const back = new THREE.Mesh(new THREE.BoxGeometry(70, 28, 2), standMat); back.position.set(0, 12, -26); arena.add(back);
  // octágono central con luz roja (como en la 2ª imagen)
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.6, 1, 8), new THREE.MeshStandardMaterial({ color: 0x18181d, metalness: .5, roughness: .6 }));
  plat.position.y = 0.5; arena.add(plat);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xe10a17 });
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 4, 10), beamMat); p.position.set(Math.cos(a) * 5.5, 2.5, Math.sin(a) * 5.5); arena.add(p); }
  [1.2, 2.2, 3.2].forEach(h => { const r = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.05, 8, 48), ringMat); r.rotation.x = Math.PI / 2; r.position.y = h; arena.add(r); });
  // haces de focos de arena (conos tenues apuntando al centro)
  const beamGeo = new THREE.ConeGeometry(2.4, 18, 16, 1, true);
  const beamM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false });
  [[-10, 18, -6], [10, 18, -6], [0, 20, 6]].forEach(([x, y, z]) => { const c = new THREE.Mesh(beamGeo, beamM); c.position.set(x, y, z); c.lookAt(0, 1, 0); arena.add(c); });
  const redArena = new THREE.PointLight(0xe10a17, 2.4, 70); redArena.position.set(0, 10, 0); arena.add(redArena);
  const whiteArena = new THREE.SpotLight(0xffffff, 2.2, 80, Math.PI / 6, 0.5); whiteArena.position.set(0, 24, 4); whiteArena.target = plat; arena.add(whiteArena);
  scene.add(arena);

  /* ---------- Luces del túnel (tenues, frías) ---------- */
  scene.add(new THREE.AmbientLight(0x1a1c22, 0.9));

  /* ---------- HUMO denso (billboards suaves) ---------- */
  const smokeTex = (function () {
    const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
    const grd = g.createRadialGradient(32, 32, 2, 32, 32, 32); grd.addColorStop(0, "rgba(255,255,255,.5)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t;
  })();
  const smokeGroup = new THREE.Group(); scene.add(smokeGroup);
  const smokeN = isMobile ? 14 : 30;
  const smokes = [];
  for (let i = 0; i < smokeN; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xcfc6bd, transparent: true, opacity: 0.12, depthWrite: false }));
    const z = -Math.random() * TUNNEL_LEN;
    m.position.set((Math.random() - .5) * W, Math.random() * H, z);
    const s = 3 + Math.random() * 4; m.scale.set(s, s, 1);
    smokeGroup.add(m); smokes.push({ m, sp: 0.2 + Math.random() * 0.4 });
  }

  /* ---------- Cámara ligada al scroll (lerp) ---------- */
  const START_Z = 16, TRAVEL_END = END_Z + 12;
  function progress() { const span = innerHeight * 2.4; return Math.max(0, Math.min(1, scrollY / span)); }
  let curZ = START_Z;

  window.addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }, { passive: true });

  const clock = new THREE.Clock();
  function animate() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const p = reduce ? 0 : progress();
    const targetZ = START_Z + (TRAVEL_END - START_Z) * p;
    curZ += (targetZ - curZ) * Math.min(1, dt * 3);
    camera.position.z = curZ;
    camera.position.y = 1.7 + Math.sin(performance.now() * 0.0006) * 0.04;
    camera.lookAt(0, 1.55, curZ - 12);

    // la luz de salida crece al acercarse; la boca se enciende
    sunGlow.intensity = 3 + p * 7;
    mouth.material.opacity = Math.max(0, p - 0.3) * 0.5;
    lampLights.forEach((l, i) => l.intensity = 0.6 + Math.sin(performance.now() * 0.002 + i) * 0.15);

    // humo deriva hacia la cámara y recicla
    for (const s of smokes) { s.m.position.z += s.sp * dt * 6; if (s.m.position.z > curZ + 4) s.m.position.z = END_Z; }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
