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
  // Tone mapping + color correcto: evita el aspecto "tosco"/quemado
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  if ("outputEncoding" in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  const TUNNEL_LEN = 120, END_Z = -TUNNEL_LEN, W = 7.5, H = 5.6;

  /* ---------- Textura procedural de hormigón (ruido) ---------- */
  function concreteTexture(base) {
    const s = 256, c = document.createElement("canvas"); c.width = c.height = s; const g = c.getContext("2d");
    g.fillStyle = base; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 9000; i++) { const x = Math.random() * s, y = Math.random() * s, r = Math.random() * 1.6; const v = (Math.random() - 0.5) * 36; g.fillStyle = `rgba(${128 + v|0},${128 + v|0},${132 + v|0},0.05)`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    // juntas/paneles
    g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2;
    for (let y = 0; y <= s; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 10); return t;
  }

  /* ---------- Materiales ---------- */
  const concreteMap = concreteTexture("#3a3a3e");
  const concrete = new THREE.MeshStandardMaterial({ color: 0x4a4a50, map: concreteMap, metalness: 0.05, roughness: 0.92 });
  const concreteDark = new THREE.MeshStandardMaterial({ color: 0x2a2a2f, map: concreteTexture("#26262b"), metalness: 0.05, roughness: 1 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x34343a, map: concreteTexture("#30303a"), metalness: 0.35, roughness: 0.4 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x24242b, metalness: 0.8, roughness: 0.35 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xeef2ff });

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
  // Sin disco sólido central (quedaba como un foco artificial). La luz del fondo
  // viene solo de una luz cálida difusa, mucho más natural.
  const sunGlow = new THREE.PointLight(0xffd79a, 2.4, 150); sunGlow.position.set(0, H * 0.55, END_Z + 8); scene.add(sunGlow);

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

  scene.add(new THREE.AmbientLight(0x1a1c22, 0.7));
  scene.add(new THREE.HemisphereLight(0x8899bb, 0x120a0c, 0.55)); // cielo frío / suelo cálido: relieve suave

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
  // cada punto: posición + hacia dónde mira. 'hold' = pausa DESPUÉS de llegar.
  const OCT_Z = arena.position.z;
  const wp = [
    { p: new THREE.Vector3(0, 1.7, 16),          l: new THREE.Vector3(0, 1.6, 0),         hold: 0.6 }, // 0 inicio (pausa inicial)
    { p: new THREE.Vector3(0, 1.7, -36),         l: new THREE.Vector3(0, 1.6, -66),       hold: 0.5 }, // 1 avanzando por el túnel
    { p: new THREE.Vector3(0, 1.7, END_Z + 8),   l: new THREE.Vector3(0, 1.6, END_Z - 10),hold: 0.7 }, // 2 boca: se asoma a la arena
    { p: new THREE.Vector3(0, 1.6, OCT_Z + 7),   l: new THREE.Vector3(0, 1.3, OCT_Z),     hold: 0.4 }, // 3 cruza la puerta
    { p: new THREE.Vector3(0, 1.5, OCT_Z + 0.5), l: new THREE.Vector3(0, 1.2, OCT_Z - 4), hold: 0.8 }, // 4 dentro, en el centro (pausa larga)
    { p: new THREE.Vector3(0, 6.5, OCT_Z + 10),  l: new THREE.Vector3(0, 1.0, OCT_Z),     hold: 0.0 }  // 5 se eleva
  ];
  // Construir una línea de tiempo: alternar tramo de MOVIMIENTO (peso 1) y PAUSA (peso hold)
  const segs = []; let totalW = 0;
  for (let i = 0; i < wp.length; i++) {
    if (i < wp.length - 1) { segs.push({ type: "move", a: i, b: i + 1, w: 1 }); totalW += 1; }
    if (wp[i].hold > 0) { segs.push({ type: "hold", a: i, w: wp[i].hold }); totalW += wp[i].hold; }
  }
  const curPos = wp[0].p.clone(), curLook = wp[0].l.clone(), tgtPos = new THREE.Vector3(), tgtLook = new THREE.Vector3();

  function progress() { const span = innerHeight * 6.0; return Math.max(0, Math.min(1, scrollY / span)); } // viaje más largo
  function sample(t) {
    // posición a lo largo de la línea de tiempo ponderada (incluye pausas)
    let acc = 0, target = t * totalW;
    for (let s = 0; s < segs.length; s++) {
      const seg = segs[s];
      if (target <= acc + seg.w || s === segs.length - 1) {
        const k = seg.w ? Math.max(0, Math.min(1, (target - acc) / seg.w)) : 0;
        if (seg.type === "hold") {            // PAUSA: la cámara se queda en el waypoint a
          tgtPos.copy(wp[seg.a].p); tgtLook.copy(wp[seg.a].l); return seg.a;
        } else {                               // MOVIMIENTO entre a y b
          const ke = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // ease-in-out suave
          tgtPos.lerpVectors(wp[seg.a].p, wp[seg.b].p, ke);
          tgtLook.lerpVectors(wp[seg.a].l, wp[seg.b].l, ke);
          return seg.a;
        }
      }
      acc += seg.w;
    }
    tgtPos.copy(wp[wp.length - 1].p); tgtLook.copy(wp[wp.length - 1].l); return wp.length - 1;
  }

  /* ---------- POST-PROCESADO (look cinematográfico tipo Lusion) ---------- */
  // bloom (brillo de luces), grano de película y aberración cromática sutil.
  let composer = null, bloomPass = null;
  (function setupPost() {
    if (!THREE.EffectComposer || !THREE.RenderPass || !THREE.UnrealBloomPass || !THREE.ShaderPass) return; // sin addons -> render normal
    try {
      composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight),
        isMobile ? 0.4 : 0.65,   // fuerza del bloom (más contenida)
        0.5,                     // radio
        0.9);                    // umbral alto: solo lo MUY brillante sangra luz
      composer.addPass(bloomPass);
      // aberración cromática + viñeta en un shader ligero
      const ChromaVignette = {
        uniforms: { tDiffuse: { value: null }, amount: { value: isMobile ? 0.0018 : 0.0035 }, vig: { value: 0.9 } },
        vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
        fragmentShader:
          "uniform sampler2D tDiffuse; uniform float amount; uniform float vig; varying vec2 vUv;" +
          "void main(){ vec2 d=vUv-0.5;" +
          " float r=texture2D(tDiffuse, vUv+d*amount).r;" +
          " float g=texture2D(tDiffuse, vUv).g;" +
          " float b=texture2D(tDiffuse, vUv-d*amount).b;" +
          " vec3 c=vec3(r,g,b);" +
          " float v=smoothstep(0.9,vig*0.35,length(d));" + // viñeta
          " gl_FragColor=vec4(c*mix(0.55,1.0,v),1.0); }"
      };
      composer.addPass(new THREE.ShaderPass(ChromaVignette));
      if (THREE.FilmPass && !isMobile) composer.addPass(new THREE.FilmPass(0.22, 0.25, 648, false)); // grano
      composer.setPixelRatio(Math.min(devicePixelRatio, 2));
      composer.setSize(innerWidth, innerHeight);
    } catch (e) { composer = null; }
  })();

  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    if (composer) composer.setSize(innerWidth, innerHeight);
    if (bloomPass) bloomPass.setSize(innerWidth, innerHeight);
  }, { passive: true });

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

    if (composer) composer.render(dt); else renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
