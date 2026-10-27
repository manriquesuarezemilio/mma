/* ============================================================
   app.js — EL UNIVERSO MMA
   Toda la interactividad. Datos desde window.MMA (data.js).
   ============================================================ */
(function () {
  "use strict";
  const D = window.MMA;
  if (!D) { console.error("No se cargó data.js"); return; }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const inicial = (n) => (n || "?").trim().charAt(0).toUpperCase();

  /* --- Estado de filtros --- */
  const filtro = { nombre: "", peso: "", sexo: "" };

  /* ===== NAV ===== */
  const nav = $("#nav"), navLinks = $("#navLinks"), navToggle = $("#navToggle");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
    $("#toTop").hidden = window.scrollY < 500;
  });
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => {
    navLinks.classList.remove("open"); navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }));
  $("#toTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* Resaltar enlace activo según sección visible */
  const secciones = $$("section[id], span.anchor[id]");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        $$(".nav-links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secciones.forEach(s => spy.observe(s));

  /* ===== Contadores del hero ===== */
  const counters = $$(".stat-num");
  const cObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count; let n = 0;
      const step = Math.max(1, Math.round(target / 30));
      const t = setInterval(() => { n += step; if (n >= target) { n = target; clearInterval(t); } el.textContent = n; }, 30);
      cObs.unobserve(el);
    });
  }, { threshold: .6 });
  counters.forEach(c => cObs.observe(c));

  /* ===== Reveal al hacer scroll ===== */
  const rObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rObs.unobserve(e.target); } });
  }, { threshold: .12 });
  $$(".reveal").forEach(el => rObs.observe(el));

  /* ===== Rellenar filtro de peso ===== */
  (function () {
    const pesos = new Set();
    D.ORGANIZACIONES.forEach(o => o.luchadores.forEach(l => l.peso && pesos.add(l.peso)));
    const sel = $("#filterPeso");
    Array.from(pesos).sort().forEach(p => {
      const opt = document.createElement("option"); opt.value = p; opt.textContent = p; sel.appendChild(opt);
    });
  })();

  /* ===== Tarjeta de luchador ===== */
  function statusChip(l) {
    if (l.status) return `<span class="chip champ">${esc(l.status)}</span>`;
    return `<span class="chip unknown" title="Dato no verificado">estatus sin verificar</span>`;
  }
  function fighterCard(l, orgNombre) {
    const foto = l.foto
      ? `<img src="${esc(l.foto)}" alt="${esc(l.nombre)}" loading="lazy" onerror="this.remove();this.parentNode.textContent='${inicial(l.nombre)}'" />`
      : inicial(l.nombre);
    const rec = l.record ? esc(l.record) : "sin verificar";
    return `
    <article class="fighter" data-nombre="${esc(l.nombre.toLowerCase())}" data-peso="${esc(l.peso)}" data-sexo="${esc(l.sexo || "")}">
      <div class="fighter-photo">${foto}<span class="fighter-flag">${esc(l.bandera || "")}</span></div>
      <div class="fighter-body">
        <h4>${esc(l.nombre)}</h4>
        <span class="fighter-line">${esc(l.bandera || "")} ${esc(l.pais)} · ${esc(orgNombre)}</span>
        <span class="fighter-line">${esc(l.peso)}</span>
        ${statusChip(l)}
        <span class="fighter-line">Récord: ${rec}</span>
        <button class="btn-profile" data-profile='${esc(JSON.stringify({ ...l, org: orgNombre }))}'>Ver perfil</button>
      </div>
    </article>`;
  }

  /* ===== Render organizaciones (acordeones independientes) ===== */
  const orgList = $("#orgList");
  function renderOrgs() {
    orgList.innerHTML = "";
    D.ORGANIZACIONES.forEach(org => {
      const visibles = org.luchadores.filter(matchFiltro);
      const el = document.createElement("div");
      el.className = "org"; el.dataset.id = org.id;
      el.innerHTML = `
        <button class="org-head" aria-expanded="false">
          <span class="org-badge" style="background:${esc(org.color)}">${esc(org.nombre.slice(0, 4))}</span>
          <span class="org-meta">
            <h3>${esc(org.nombre)}</h3>
            <span class="org-long">${esc(org.nombreLargo)} · ${esc(org.pais)}</span>
            <span class="org-desc">${esc(org.desc)}</span>
          </span>
          <span class="org-count">${visibles.length} luchador${visibles.length === 1 ? "" : "es"}</span>
          <span class="org-arrow">▾</span>
        </button>
        <div class="org-panel"><div class="org-panel-inner">
          ${visibles.length
            ? `<div class="fighter-grid">${visibles.map(l => fighterCard(l, org.nombre)).join("")}</div>`
            : `<div class="empty"><span class="empty-ico">🥋</span>Ningún luchador coincide con el filtro.</div>`}
        </div></div>`;
      orgList.appendChild(el);
    });
    bindOrgs();
  }

  function matchFiltro(l) {
    if (filtro.nombre && !l.nombre.toLowerCase().includes(filtro.nombre)) return false;
    if (filtro.peso && l.peso !== filtro.peso) return false;
    if (filtro.sexo && (l.sexo || "") !== filtro.sexo) return false;
    return true;
  }

  function bindOrgs() {
    $$(".org-head", orgList).forEach(head => {
      head.addEventListener("click", () => {
        const org = head.closest(".org");
        const open = org.classList.toggle("open");           // independiente: no cierra las demás
        head.setAttribute("aria-expanded", String(open));
      });
    });
    $$(".btn-profile", orgList).forEach(b => b.addEventListener("click", () => openProfile(JSON.parse(b.dataset.profile))));
  }

  /* Al filtrar, si hay búsqueda por nombre, abrimos las orgs con resultados */
  function aplicarFiltros() {
    const abiertas = $$(".org.open", orgList).map(o => o.dataset.id);
    renderOrgs();
    const hayBusqueda = filtro.nombre || filtro.peso || filtro.sexo;
    $$(".org", orgList).forEach(o => {
      const tiene = $(".fighter", o);
      const debeAbrir = (hayBusqueda && tiene) || (!hayBusqueda && abiertas.includes(o.dataset.id));
      if (debeAbrir) { o.classList.add("open"); $(".org-head", o).setAttribute("aria-expanded", "true"); }
    });
  }

  $("#searchFighter").addEventListener("input", e => { filtro.nombre = e.target.value.trim().toLowerCase(); aplicarFiltros(); });
  $("#filterPeso").addEventListener("change", e => { filtro.peso = e.target.value; aplicarFiltros(); });
  $("#filterSexo").addEventListener("change", e => { filtro.sexo = e.target.value; aplicarFiltros(); });

  /* ===== Modal perfil ===== */
  const modal = $("#modal"), modalBody = $("#modalBody");
  function openProfile(l) {
    const rec = l.record ? esc(l.record) : "Sin verificar";
    const status = l.status ? esc(l.status) : "Sin verificar";
    const estilo = l.estilo ? esc(l.estilo) : "Sin verificar";
    modalBody.innerHTML = `
      <div class="modal-hero">${l.foto ? `<img src="${esc(l.foto)}" alt="${esc(l.nombre)}" style="width:100%;height:100%;object-fit:cover;border-radius:14px" onerror="this.remove()">` : inicial(l.nombre)}</div>
      <h3>${esc(l.nombre)}</h3>
      <p class="fighter-line">${esc(l.bandera || "")} ${esc(l.pais)} · ${esc(l.org)}</p>
      <div class="modal-grid">
        <div class="mg"><span>Categoría</span><strong>${esc(l.peso)}</strong></div>
        <div class="mg"><span>Estilo</span><strong>${estilo}</strong></div>
        <div class="mg"><span>Récord</span><strong>${rec}</strong></div>
        <div class="mg"><span>Estatus</span><strong>${status}</strong></div>
      </div>
      <p class="modal-note">Los datos que aparecen como «Sin verificar» no se muestran como oficiales. Edita <code>data.js</code> para completarlos con fuentes fiables. Última revisión: ${esc(D.DATA_ACTUALIZADO)}.</p>`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus();
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ""; }
  $$("[data-close]", modal).forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  /* ===== P4P ===== */
  const p4pGrid = $("#p4pGrid");
  $("#p4pMeta").textContent = `Actualizado: ${D.P4P.actualizado} · ${D.P4P.fuente}`;
  function renderP4P(sort = "pos") {
    const lista = [...D.P4P.lista].sort((a, b) =>
      sort === "nombre" ? a.nombre.localeCompare(b.nombre) : a.pos - b.pos);
    p4pGrid.innerHTML = lista.map(p => `
      <article class="p4p-card">
        <span class="p4p-pos">${p.pos}</span>
        <div class="p4p-photo">${p.foto ? `<img src="${esc(p.foto)}" alt="${esc(p.nombre)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px" onerror="this.remove()">` : inicial(p.nombre)}</div>
        <h4>${esc(p.nombre)}</h4>
        <span class="p4p-sub">${esc(p.org)} · ${esc(p.peso)}</span>
        <p class="p4p-why">${esc(p.motivo)}</p>
      </article>`).join("");
  }
  $("#p4pSort").addEventListener("change", e => renderP4P(e.target.value));

  /* ===== Próximos combates ===== */
  $("#fightGrid").innerHTML = D.PROXIMOS.map(f => `
    <article class="fight">
      <div class="fight-vs">
        <div class="fight-side"><div class="fs-ava">${esc(f.a.bandera || "🥊")}</div><h4>${esc(f.a.nombre)}</h4></div>
        <span class="vs">VS</span>
        <div class="fight-side"><div class="fs-ava">${esc(f.b.bandera || "🥊")}</div><h4>${esc(f.b.nombre)}</h4></div>
      </div>
      <div class="fight-foot"><span>${esc(f.evento)}</span><span>${esc(f.peso)} · ${esc(f.fecha)}</span></div>
    </article>`).join("");

  /* ===== Noticias ===== */
  $("#newsGrid").innerHTML = D.NOTICIAS.map(n => `
    <article class="news">
      <span class="news-tag">${esc(n.tag)}</span>
      <h4>${esc(n.titulo)}</h4>
      <p>${esc(n.resumen)}</p>
      <div class="news-date">${esc(n.fecha)}</div>
    </article>`).join("");

  /* ===== Categorías de peso ===== */
  $("#weightGrid").innerHTML = D.CATEGORIAS.map(c => `
    <div class="weight"><span class="wsex">${esc(c.sexo)}</span><h4>${esc(c.div)}</h4><p>${esc(c.kg)}</p></div>`).join("");

  /* ===== Disciplinas ===== */
  $("#discGrid").innerHTML = D.DISCIPLINAS.map(d => `
    <article class="disc"><div class="disc-ico">${esc(d.icono)}</div><h3>${esc(d.nombre)}</h3><p>${esc(d.desc)}</p></article>`).join("");

  /* ===== Reglas ===== */
  $("#rulesGrid").innerHTML = D.REGLAS.map(r => `
    <article class="rule"><div class="rule-ico">${esc(r.icono)}</div><h3>${esc(r.t)}</h3><p>${esc(r.d)}</p></article>`).join("");

  /* ===== Footer meta ===== */
  $("#footMeta").textContent = `Datos de referencia (editables en data.js). Última revisión: ${D.DATA_ACTUALIZADO}. Récords y estatus no verificados se marcan como tales.`;

  /* ===== Init ===== */
  renderOrgs();
  renderP4P("pos");
})();
