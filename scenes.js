/* ============================================================
   scenes.js — Modo 100% cinemática
   Convierte cada <section> en una escena que aparece y se va con
   el scroll, sobre el fondo 3D. No reescribe el contenido: lo
   envuelve en .scene-wrap para animarlo. Usa IntersectionObserver
   (barato) para marcar la escena activa. Respeta reduced-motion.
   Se ejecuta tras app.js para que las tarjetas ya existan.
   ============================================================ */
(function () {
  "use strict";
  function start() {
    const html = document.documentElement;
    html.classList.add("cine-mode");

    const sections = Array.prototype.slice.call(document.querySelectorAll("section.section"));
    if (!sections.length) return;

    // Envolver el contenido de cada sección en .scene-wrap y asignar dirección alterna
    sections.forEach((sec, i) => {
      const wrap = document.createElement("div");
      wrap.className = "scene-wrap";
      while (sec.firstChild) wrap.appendChild(sec.firstChild);
      sec.appendChild(wrap);
      sec.classList.add(i % 2 ? "scene-right" : "scene-left");
    });

    // Activar la escena cuando está centrada
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const on = e.isIntersecting && e.intersectionRatio > 0.35;
        e.target.classList.toggle("scene-on", on);
        if (on) setActiveDot(sections.indexOf(e.target));
      });
    }, { threshold: [0, 0.35, 0.6, 1], rootMargin: "-10% 0px -10% 0px" });
    sections.forEach(s => io.observe(s));

    // Puntos de progreso lateral (saltar a cada escena)
    const nav = document.createElement("div");
    nav.className = "scene-progress"; nav.setAttribute("aria-hidden", "true");
    sections.forEach((s, i) => {
      const d = document.createElement("button");
      d.className = "dot"; d.title = s.id || ("escena " + (i + 1));
      d.addEventListener("click", () => s.scrollIntoView({ behavior: "smooth", block: "center" }));
      nav.appendChild(d);
    });
    document.body.appendChild(nav);
    const dots = Array.prototype.slice.call(nav.children);
    function setActiveDot(i) { dots.forEach((d, j) => d.classList.toggle("on", j === i)); }

    // primera escena visible al cargar
    if (sections[0]) sections[0].classList.add("scene-on");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(start, 80));
  else setTimeout(start, 80);
})();
