/* ============================================================
   intro.js — Intro cinematográfica WebGL
   Three.js (octágono + modelos CC0) + Lenis (scroll suave) +
   GSAP ScrollTrigger (viaje de cámara entre escenas).
   Degrada con gracia: si falta una librería o el usuario
   prefiere menos movimiento, muestra los textos y deja pasar.
   ============================================================ */
(function () {
  "use strict";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loadEl = document.getElementById("load");
  const hideLoader = () => { if (loadEl) { loadEl.classList.add("gone"); setTimeout(() => loadEl.remove(), 700); } };

  // Si falta Three o GSAP, no bloqueamos al usuario: mostramos textos y salimos.
  if (!window.THREE || !window.gsap) {
    console.warn("Librerías no disponibles; intro en modo estático.");
    document.querySelectorAll(".scene .box").forEach(b => { b.style.opacity = 1; b.style.transform = "none"; });
    hideLoader();
    return;
  }
  const THREE = window.THREE, gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- Escena WebGL ---------- */
  const canvas = document.getElementById("gl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x09090b, 0.055);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.4, 9);

  // Luces: ambiente tenue + foco rojo + relleno blanco frío
  scene.add(new THREE.AmbientLight(0x404048, 0.8));
  const red = new THREE.PointLight(0xe10a17, 2.2, 40); red.position.set(0, 4, 4); scene.add(red);
  const key = new THREE.DirectionalLight(0xffffff, 0.7); key.position.set(3, 6, 5); scene.add(key);

  // Suelo con reflejo sutil (rejilla)
  const grid = new THREE.GridHelper(60, 60, 0x3a0a0e, 0x1a1a22);
  grid.position.y = -1.2; scene.add(grid);

  // Octágono (anillo de postes) generado
  const octa = new THREE.Group();
  const R = 3.2, N = 8;
  const postMat = new THREE.MeshStandardMaterial({ color: 0x15151b, metalness: .6, roughness: .4, emissive: 0x3a0a0e, emissiveIntensity: .4 });
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 12), postMat);
    post.position.set(Math.cos(a) * R, 0.3, Math.sin(a) * R);
    octa.add(post);
  }
  // cuerdas rojas (3 niveles)
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xe10a17, emissive: 0xe10a17, emissiveIntensity: .6 });
  [0.2, 1.0, 1.8].forEach(h => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.03, 8, 64), ropeMat);
    ring.rotation.x = Math.PI / 2; ring.position.y = h - 1; octa.add(ring);
  });
  octa.position.y = -0.2; scene.add(octa);

  // partículas (polvo / chispas)
  const pGeo = new THREE.BufferGeometry();
  const pN = 400, pos = new Float32Array(pN * 3);
  for (let i = 0; i < pN; i++) { pos[i*3] = (Math.random()-.5)*30; pos[i*3+1] = Math.random()*12-1; pos[i*3+2] = (Math.random()-.5)*30; }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xe10a17, size: 0.04, transparent: true, opacity: .5 }));
  scene.add(particles);

  // Modelos CC0 (se cargan async; la intro funciona aunque tarden)
  let fighterA = null, fighterB = null, mixers = [];
  if (window.THREE.GLTFLoader) {
    const loader = new THREE.GLTFLoader();
    loader.load("models/fighter-a.glb", g => {
      fighterA = g.scene; fighterA.scale.set(2.2, 2.2, 2.2); fighterA.position.set(-1.1, -1.1, 0); scene.add(fighterA);
      if (g.animations && g.animations.length) { const m = new THREE.AnimationMixer(fighterA); m.clipAction(g.animations[0]).play(); mixers.push(m); }
    }, undefined, () => console.warn("No se pudo cargar fighter-a.glb"));
    loader.load("models/fighter-b.glb", g => {
      fighterB = g.scene; fighterB.scale.set(1.6, 1.6, 1.6); fighterB.position.set(1.4, -1.1, -1); fighterB.rotation.y = -0.6; scene.add(fighterB);
      if (g.animations && g.animations.length) { const m = new THREE.AnimationMixer(fighterB); m.clipAction(g.animations[0]).play(); mixers.push(m); }
    }, undefined, () => console.warn("No se pudo cargar fighter-b.glb"));
  }

  hideLoader();

  /* ---------- Render loop ---------- */
  const clock = new THREE.Clock();
  function render() {
    const dt = clock.getDelta();
    mixers.forEach(m => m.update(dt));
    particles.rotation.y += dt * 0.03;
    octa.rotation.y += dt * 0.02;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- Lenis (scroll suave) ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) { lenis.on("scroll", window.ScrollTrigger.update); }
  }

  /* ---------- Texto: cada escena entra y sale ---------- */
  document.querySelectorAll(".scene .box").forEach(box => {
    gsap.to(box, {
      opacity: 1, y: 0, ease: "power3.out", duration: 1,
      scrollTrigger: { trigger: box.parentElement, start: "top 70%", end: "bottom 30%", toggleActions: "play reverse play reverse" }
    });
  });

  /* ---------- Viaje de cámara entre escenas ---------- */
  if (window.ScrollTrigger && !reduce) {
    // trayecto: lejos -> dentro del octágono -> lateral a los modelos -> cara a cara -> alejar
    const path = [
      { x: 0,   y: 1.4, z: 9,   lx: 0, ly: 0.5, lz: 0 },   // 1 vista general
      { x: 0,   y: 1.0, z: 4.2, lx: 0, ly: 0.4, lz: 0 },   // 2 entrando
      { x: -2.6,y: 0.8, z: 2.8, lx: -1, ly: 0, lz: 0 },    // 3 hacia los luchadores
      { x: 0,   y: 0.6, z: 2.2, lx: 0, ly: 0.2, lz: -0.5 },// 4 cara a cara
      { x: 0,   y: 3.0, z: 10,  lx: 0, ly: 0, lz: 0 }      // 5 alejar (final)
    ];
    const look = new THREE.Vector3(0, 0.5, 0);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ".layers", start: "top top", end: "bottom bottom", scrub: 1 }
    });
    for (let i = 1; i < path.length; i++) {
      const p = path[i];
      tl.to(camera.position, { x: p.x, y: p.y, z: p.z, ease: "none",
        onUpdate: () => { look.set(p.lx, p.ly, p.lz); camera.lookAt(look); } }, i - 1);
    }
  } else {
    // reduced-motion: cámara fija mirando el octágono
    camera.lookAt(0, 0.5, 0);
  }

  /* ---------- Barra de progreso ---------- */
  const prog = document.getElementById("prog");
  window.addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (window.scrollY / h * 100) : 0) + "%";
  }, { passive: true });
})();
