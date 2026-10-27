/* ============================================================
   tunnel.js — Película de fondo 3D (Three.js)
   Túnel de hormigón detallado -> cruza la puerta de la jaula ->
   entra al octágono. La cámara recorre waypoints según el scroll
   (con lerp): se detiene al parar y retrocede al subir.
   Publica el progreso en window.__mma (para sincronizar el HTML).
   Fondo fijo, no bloquea clics. Degrada sin WebGL / reduced-motion.
   ============================================================ */
(function () {
  "use strict";
  const canvas = document.getElementById("tunnel");
  if (!canvas) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.__mma = { p: 0, stage: 0 }; // progreso global y etapa (0 túnel,1 puerta,2 octágono)

  function webglOK() { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch (e) { return false; } }
  if (!window.THREE || !webglOK()) {
    canvas.style.background = "radial-gradient(circle at 50% 34%, rgba(255,190,120,.4), rgba(120,60,20,.15) 30%, transparent 55%), linear-gradient(180deg,#0c0c0e,#060606)";
    return;
  }

  const THREE = window.THREE;
  const isMobile = innerWidth < 760;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060606);
  scene.fog = new THREE.FogExp2(0x0a0a0c, 0.025);

  const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 600);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const TUNNEL_LEN = 120, END_Z = -TUNNEL_LEN, W = 7.5, H = 5.6;

  /* ---------- Materiales ---------- */
  const concrete = new THREE.MeshStandardMaterial({ color: 0x3a3a3e, metalness: 0.06, roughness: 0.95 });
  const concreteDark = new THREE.MeshStandardMaterial({ color: 0x222226, metalness: 0.06, roughness: 1 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x2c2c30, metalness: 0.25, roughness: 0.45 }); // algo de reflejo (suelo "mojado")
  const steel = new THREE.MeshStandardMaterial({ color: 0x1b1b20, metalness: 0.6, roughness: 0.5 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xdfe6ff });

  function plane(w, l, mat, rot, pos) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), mat); if (rot.x) m.rotation.x = rot.x; if (rot.y) m.rotation.y = rot.y; m.position.set(pos.x, pos.y, pos.z); scene.add(m); return m; }
  plane(W, TUNNEL_LEN + 40, floorMat, { x: -Math.PI / 2 }, { x: 0, y: 0, z: -TUNNEL_LEN / 2 });
  plane(W, TUNNEL_LEN + 40, concreteDark, { x: Math.PI / 2 }, { x: 0, y: H, z: -TUNNEL_LEN / 2 });
  plane(H, TUNNEL_LEN + 40, concrete, { y: Math.PI / 2 }, { x: -W / 2, y: H / 2, z: -TUNNEL_LEN / 2 });
  plane(H, TUNNEL_LEN + 40, concrete, { y: -Math.PI / 2 }, { x: W / 2, y: H / 2, z: -TUNNEL_LEN / 2 });

  /* ---------- Detalle del túnel: vigas, rejillas, cables, puertas, lámparas ---------- */
  const lampLights = [];
  for (let z = 8; z > -TUNNEL_LEN; z -= 6) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(W, 0.3, 0.3), steel); beam.position.set(0, H - 0.2, z); scene.add(beam);
    // rejilla de techo (barras finas transversales)
    for (let gx = -2; gx <= 2; gx++) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 5.6), steel); g.position.set(gx * 1.2, H - 0.45, z); scene.add(g); }
    // cable colgante
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), steel); cable.position.set((z % 12 === 0 ? -2 : 2), H - 0.7, z); scene.add(cable);
    // tubería lateral
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 7, 8), steel); pipe.rotation.z = Math.PI / 2; pipe.position.set(0, H - 0.55, z); scene.add(pipe);
    // lámpara fría
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.3), lampMat); lamp.position.set(0, H - 0.35, z); scene.add(lamp);
    if (!isMobile && Math.round(z) % 12 === 0) { const pl = new THREE.PointLight(0xcfe0ff, 0.7, 12); pl.position.set(0, H - 0.6, z); scene.add(pl); lampLights.push(pl); }
    // puertas metálicas en las paredes cada 24
    if (Math.round(z) % 24 === 0) {
      [-1, 1].forEach(s => { const d = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.2, 1.8), steel); d.position.set(s * (W / 2 - 0.06), 1.7, z); scene.add(d); });
    }
  }

  /* ---------- Salida: estallido de luz cálido ---------- */
  const sun = new THREE.Mesh(new THREE.CircleGeometry(3.4, 40), new THREE.MeshBasicMaterial({ color: 0xffe6b0 }));
  sun.position.set(0, H * 0.55, END_Z + 3); scene.add(sun);
  const sunGlow = new THREE.PointLight(0xffd79a, 3, 140); sunGlow.position.set(0, H * 0.55, END_Z + 8); scene.add(sunGlow);

  /* ---------- Estadio + OCTÁGONO con puerta abierta ---------- */
  const arena = new THREE.Group(); arena.position.set(0, 0, END_Z - 14); scene.add(arena);
  const standMat = new THREE.MeshStandardMaterial({ color: 0x101014, metalness: 0.2, roughness: 1 });
  [-17, 17].forEach(x => { const s = new THREE.Mesh(new THREE.BoxGeometry(10, 18, 56), standMat); s.position.set(x, 9, 0); arena.add(s); });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(76, 30, 2), standMat); backWall.position.set(0, 13, -30); arena.add(backWall);

  // plataforma del octágono
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.8, 1, 8), new THREE.MeshStandardMaterial({ color: 0x18181d, metalness: .5, roughness: .55 }));
  plat.position.y = 0.5; arena.add(plat);
  // postes de la jaula (con hueco = puerta hacia el túnel, en el poste frontal)
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xe10a17 });
  const postMat = new THREE.MeshStandardMaterial({ color: 0x14141a, metalness: .7, roughness: .4 });
  const RJ = 5.6;
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.4, 10), postMat);
    p.position.set(Math.cos(a) * RJ, 2.6, Math.sin(a) * RJ); arena.add(p);
  }
  // malla de la jaula (anillos horizontales) con un tramo frontal abierto (la puerta)
  [1.2, 2.2, 3.2, 4.0].forEach(h => {
    const r = new THREE.Mesh(new THREE.TorusGeometry(RJ, 0.04, 8, 56, Math.PI * 1.6), ringMat); // arco incompleto -> puerta
    r.rotation.x = Math.PI / 2; r.rotation.z = Math.PI * 0.2; r.position.y = h; arena.add(r);
  });
  // lona con logo tenue
  const canvasMat = new THREE.MeshStandardMaterial({ color: 0x0e0e12, metalness: .1, roughness: .9 });
  const lona = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.3, 0.1, 8), canvasMat); lona.position.y = 1.05; arena.add(lona);

  // focos de arena (haces) + luz roja central + spot blanco cenital
  const beamGeo = new THREE.ConeGeometry(2.6, 20, 18, 1, true);
  const beamM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false });
  [[-11, 20, -6], [11, 20, -6], [0, 22, 8], [-6, 21, 10], [6, 21, 10]].forEach(([x, y, z]) => { const c = new THREE.Mesh(beamGeo, beamM); c.position.set(x, y, z); c.lookAt(0, 1, 0); arena.add(c); });
  const redArena = new THREE.PointLight(0xe10a17, 2.6, 80); redArena.position.set(0, 11, 0); arena.add(redArena);
  const whiteArena = new THREE.SpotLight(0xffffff, 2.6, 90, Math.PI / 6, 0.5); whiteArena.position.set(0, 26, 6); whiteArena.target = plat; arena.add(whiteArena);

  scene.add(new THREE.AmbientLight(0x1a1c22, 0.9));

  /* ---------- Humo por capas ---------- */
  const smokeTex = (function () { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); const grd = g.createRadialGradient(32, 32, 2, 32, 32, 32); grd.addColorStop(0, "rgba(255,255,255,.5)"); grd.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = grd; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const smokes = []; const smokeN = isMobile ? 16 : 36;
  for (let i = 0; i < smokeN; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0xcfc6bd, transparent: true, opacity: 0.11, depthWrite: false })); m.position.set((Math.random() - .5) * W, Math.random() * H, -Math.random() * TUNNEL_LEN); const s = 3 + Math.random() * 5; m.scale.set(s, s, 1); scene.add(m); smokes.push({ m, sp: 0.2 + Math.random() * 0.5 }); }

  /* ---------- Chispas (puntos cálidos que caen) ---------- */
  const spGeo = new THREE.BufferGeometry(); const spN = isMobile ? 40 : 90; const sp = new Float32Array(spN * 3);
  for (let i = 0; i < spN; i++) { sp[i*3] = (Math.random() - .5) * W; sp[i*3+1] = Math.random() * H; sp[i*3+2] = -Math.random() * TUNNEL_LEN; }
  spGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({ color: 0xffb060, size: 0.05, transparent: true, opacity: 0.6, depthWrite: false }));
  scene.add(sparks);

  /* ---------- Cámara por WAYPOINTS (túnel -> puerta -> centro del octágono) ---------- */
  // cada punto: posición + hacia dónde mira
  const OCT_Z = arena.position.z; // z del centro del octágono
  const wp = [
    { p: new THREE.Vector3(0, 1.7, 16),         l: new THREE.Vector3(0, 1.6, 0) },     // 0 inicio túnel
    { p: new THREE.Vector3(0, 1.7, -40),        l: new THREE.Vector3(0, 1.6, -70) },   // 1 avanzando
    { p: new THREE.Vector3(0, 1.7, END_Z + 6),  l: new THREE.Vector3(0, 1.6, END_Z - 10) }, // 2 boca del túnel
    { p: new THREE.Vector3(0, 1.6, OCT_Z + 7),  l: new THREE.Vector3(0, 1.3, OCT_Z) },  // 3 cruzando la puerta de la jaula
    { p: new THREE.Vector3(0, 1.5, OCT_Z + 0.5),l: new THREE.Vector3(0, 1.2, OCT_Z - 4) }, // 4 dentro, en el centro
    { p: new THREE.Vector3(0, 6.5, OCT_Z + 9),  l: new THREE.Vector3(0, 1.0, OCT_Z) }   // 5 se eleva: vista del octágono
  ];
  const curPos = wp[0].p.clone(), curLook = wp[0].l.clone(), tgtPos = new THREE.Vector3(), tgtLook = new THREE.Vector3();

  function progress() { const span = innerHeight * 3.2; return Math.max(0, Math.min(1, scrollY / span)); }
  function sample(t) {
    const n = wp.length - 1, f = Math.max(0, Math.min(n, t * n)), i = Math.floor(f), k = f - i;
    const a = wp[Math.min(i, n)], b = wp[Math.min(i + 1, n)];
    tgtPos.lerpVectors(a.p, b.p, k); tgtLook.lerpVectors(a.l, b.l, k);
    return i;
  }

  window.addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }, { passive: true });

  const clock = new THREE.Clock();
  function animate() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const p = reduce ? 0 : progress();
    window.__mma.p = p; window.__mma.stage = sample(p);
    // lerp suave hacia el objetivo del waypoint
    const k = Math.min(1, dt * 2.6);
    curPos.lerp(tgtPos, k); curLook.lerp(tgtLook, k);
    camera.position.copy(curPos);
    camera.position.y += Math.sin(performance.now() * 0.0006) * 0.03; // vaivén de caminar
    camera.lookAt(curLook);

    sunGlow.intensity = 3 + p * 8;
    lampLights.forEach((l, i) => l.intensity = 0.6 + Math.sin(performance.now() * 0.002 + i) * 0.15);
    redArena.intensity = 2.2 + Math.sin(performance.now() * 0.004) * 0.5;

    for (const s of smokes) { s.m.position.z += s.sp * dt * 6; if (s.m.position.z > camera.position.z + 4) s.m.position.z = END_Z - 10; }
    const a = sparks.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * 0.6; if (y < 0) y = H; a.setY(i, y); } a.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
