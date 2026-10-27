/* ============================================================
   cine.js — motor cinematográfico ligero
   - NO intercepta la rueda ni bloquea el scroll.
   - Un solo requestAnimationFrame por frame; lecturas de layout
     cacheadas; se apaga con prefers-reduced-motion.
   - Reversible: las animaciones avanzan y retroceden con el scroll.
   ============================================================ */
(function () {
  "use strict";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---- Reveal escalonado (siempre, es barato y accesible) ---- */
  const cine = $$("[data-cine]");
  if (cine.length) {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (e.isIntersecting) {
          const d = +(e.target.dataset.delay || 0);
          e.target.style.transitionDelay = (d * 0.08) + "s";
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    cine.forEach(el => io.observe(el));
  }

  if (reduce) return; // nada de parallax ni escenas animadas

  /* ---- Marcar escenas sticky activas (para animar su contenido) ---- */
  const scenes = $$(".scene-sticky");
  if (scenes.length) {
    const sio = new IntersectionObserver((es) => {
      es.forEach(e => e.target.classList.toggle("active", e.isIntersecting && e.intersectionRatio > 0.5));
    }, { threshold: [0, 0.5, 1] });
    scenes.forEach(s => sio.observe(s));
  }

  /* ---- Bucle de scroll (parallax + progreso de escenas) ---- */
  const parallax = $$("[data-parallax]");          // fondos/elementos con velocidad propia
  const faceoffs = $$(".faceoff");                 // escenas cara a cara
  const octs = $$(".oct-zoom");                    // octágono que se acerca
  let ticking = false;

  function frame() {
    ticking = false;
    const vh = window.innerHeight;

    // parallax: cada elemento se desplaza según su posición en pantalla
    for (const el of parallax) {
      const r = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
    }

    // octágono: escala y opacidad según avance
    for (const el of octs) {
      const r = el.getBoundingClientRect();
      const p = clamp(1 - (r.top + r.height / 2) / vh, 0, 1); // 0 abajo -> 1 centrado/arriba
      el.style.transform = `translate(-50%,-50%) scale(${(0.8 + p * 0.35).toFixed(3)})`;
      el.style.opacity = (0.4 + p * 0.6).toFixed(2);
    }

    // cara a cara: los dos retratos se acercan; el VS aparece al final
    for (const fo of faceoffs) {
      const sticky = fo.closest(".scene-sticky") || fo;
      const scene = fo.closest(".scene") || sticky;
      const sr = scene.getBoundingClientRect();
      // progreso 0..1 mientras la escena cruza el viewport
      const total = sr.height - vh;
      const prog = total > 0 ? clamp(-sr.top / total, 0, 1) : (sr.top < vh / 2 ? 1 : 0);
      const left = fo.querySelector(".left"), right = fo.querySelector(".right"), vs = fo.querySelector(".vs");
      const t = clamp(prog * 1.4, 0, 1); // llegan juntos antes del final
      if (left) left.style.transform = `translateX(${(-60 + t * 60).toFixed(1)}vw)`;
      if (right) right.style.transform = `translateX(${(60 - t * 60).toFixed(1)}vw)`;
      if (vs) { const v = clamp((prog - 0.6) / 0.4, 0, 1); vs.style.opacity = v.toFixed(2); vs.style.transform = `translate(-50%,-50%) scale(${(0.4 + v * 0.6).toFixed(2)})`; }
    }
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // primer frame
  requestAnimationFrame(frame);
})();
