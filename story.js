/* story.js — enciende las capas de texto según el progreso del viaje 3D
   (window.__mma.p lo publica tunnel.js). Ligero: un rAF que solo
   cambia clases. Si no hay motor 3D o reduced-motion, no hace nada. */
(function () {
  "use strict";
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const lines = Array.prototype.slice.call(document.querySelectorAll(".story-line"));
  if (!lines.length) return;
  const ranges = lines.map(el => ({ el, from: parseFloat(el.dataset.from) || 0, to: parseFloat(el.dataset.to) || 1 }));

  function tick() {
    const p = (window.__mma && typeof window.__mma.p === "number") ? window.__mma.p : (function () {
      const span = innerHeight * 3.2; return Math.max(0, Math.min(1, scrollY / span));
    })();
    for (const r of ranges) r.el.classList.toggle("on", p >= r.from && p <= r.to);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
