/* ============================================================
   app.js — EL UNIVERSO MMA (edición premium)
   Datos desde window.MMA (data.js). Nada inventado: los datos
   no verificados se muestran como "sin verificar".
   ============================================================ */
(function () {
  "use strict";
  // data.js carga data.json de forma asincrona. Arrancamos cuando los datos esten listos.
  if (window.MMA) boot();
  else window.addEventListener("mma:data", boot, { once: true });

  function boot() {
  const D = window.MMA;
  if (!D) { console.error("No se cargó data.js"); return; }

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ini = (n) => (n || "?").replace(/\(.*?\)/g, "").trim().charAt(0).toUpperCase() || "?";
  const color = (n) => { let h = 0; for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 360; return `linear-gradient(135deg,hsl(${h} 60% 30%),hsl(${(h + 38) % 360} 55% 16%))`; };
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* índice plano de luchadores */
  const TODOS = [];
  D.ORGANIZACIONES.forEach(o => o.luchadores.forEach(l => TODOS.push({ ...l, org: o.nombre })));
  const key = (l) => `${l.org}::${l.nombre}`;
  const paises = [...new Set(TODOS.map(l => l.pais))].sort();
  const pesos = [...new Set(TODOS.map(l => l.peso))].sort();

  /* avatar (img o inicial con color) */
  function ava(l, cls) {
    if (l.foto) return `<img src="${esc(l.foto)}" alt="${esc(l.nombre)}" loading="lazy" onerror="this.parentNode.classList.add('noimg');this.remove()">`;
    return "";
  }
  function avaBox(l, cls, extra = "") {
    const bg = l.foto ? "" : `style="background:${color(l.nombre)}"`;
    const inner = l.foto ? `<img src="${esc(l.foto)}" alt="${esc(l.nombre)}" loading="lazy" onerror="this.remove();this.parentNode.setAttribute('style','background:${color(l.nombre)}');this.parentNode.textContent='${ini(l.nombre)}'">` : ini(l.nombre);
    return `<div class="${cls}" ${bg} ${extra}>${inner}</div>`;
  }

  /* ===== Toast ===== */
  const toastEl = $("#toast"); let toastT;
  function toast(m) { toastEl.textContent = m; toastEl.hidden = false; requestAnimationFrame(() => toastEl.classList.add("show")); clearTimeout(toastT); toastT = setTimeout(() => { toastEl.classList.remove("show"); setTimeout(() => toastEl.hidden = true, 300); }, 2200); }

  /* ===== Tema ===== */
  const themeBtn = $("#themeBtn");
  const setTheme = (t) => { document.documentElement.setAttribute("data-theme", t); themeBtn.textContent = t === "light" ? "☀️" : "🌙"; };
  setTheme(localStorage.getItem("mma_tema") || "dark");
  themeBtn.addEventListener("click", () => { const t = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light"; setTheme(t); try { localStorage.setItem("mma_tema", t); } catch {} });

  /* ===== Favoritos ===== */
  let favs = []; try { favs = JSON.parse(localStorage.getItem("mma_fav") || "[]"); } catch {}
  const isFav = (k) => favs.includes(k);
  function toggleFav(k) { const i = favs.indexOf(k); if (i >= 0) { favs.splice(i, 1); toast("Quitado de favoritos"); } else { favs.push(k); toast("Añadido a favoritos ⭐"); } try { localStorage.setItem("mma_fav", JSON.stringify(favs)); } catch {} refreshStars(); }
  function refreshStars() { $$(".fav-star").forEach(b => b.classList.toggle("on", isFav(b.dataset.fav))); }

  /* ===== NAV + progreso + to-top ===== */
  const nav = $("#nav"), navLinks = $("#navLinks"), navToggle = $("#navToggle"), prog = $("#scrollProgress"), toTop = $("#toTop");
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    toTop.hidden = y < 500;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (y / h * 100) : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  navToggle.addEventListener("click", () => { const o = navLinks.classList.toggle("open"); navToggle.classList.toggle("open", o); navToggle.setAttribute("aria-expanded", String(o)); });
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => { navLinks.classList.remove("open"); navToggle.classList.remove("open"); }));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* scrollspy */
  const spy = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { const id = e.target.id; $$(".nav-links a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id)); } }), { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach(s => spy.observe(s));

  /* reveal */
  const rev = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rev.unobserve(e.target); } }), { threshold: .12 });
  $$(".reveal").forEach(el => rev.observe(el));

  /* ===== HERO: parallax + partículas + typewriter ===== */
  const heroBg = $("#heroBg");
  const heroTint = document.querySelector(".hero-tint");
  if (!reduce) {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - .5) * 14, y = (e.clientY / window.innerHeight - .5) * 14;
      // Movemos la CAPA DE COLOR, no la foto: así el zoom lento (Ken Burns) del fondo no se pisa.
      if (heroTint) heroTint.style.transform = `translate(${x}px,${y}px)`;
    });
    const pc = $("#heroParticles");
    if (pc) for (let i = 0; i < 28; i++) { const p = document.createElement("span"); p.className = "p"; p.style.left = Math.random() * 100 + "%"; p.style.animationDuration = (5 + Math.random() * 7) + "s"; p.style.animationDelay = (-Math.random() * 10) + "s"; p.style.opacity = (.2 + Math.random() * .5).toFixed(2); pc.appendChild(p); }
    const phrases = ["EL COMBATE EMPIEZA AQUÍ", "OCHO LIGAS. UN SOLO SUEÑO.", "DE LA JAULA AL LEGADO."];
    const type = $("#heroType"); let pi = 0, ci = 0, del = false;
    (function tw() { const w = phrases[pi]; type.textContent = del ? w.slice(0, ci--) : w.slice(0, ci++); if (!del && ci > w.length) { del = true; setTimeout(tw, 1600); return; } if (del && ci < 0) { del = false; pi = (pi + 1) % phrases.length; ci = 0; } setTimeout(tw, del ? 35 : 70); })();
  } else { $("#heroType").textContent = "EL COMBATE EMPIEZA AQUÍ"; }

  /* hero featured (primeros 5 con retrato) */
  $("#heroFeatured").innerHTML = TODOS.slice(0, 5).map((l, i) =>
    `<div class="hf-card" data-key="${esc(key(l))}" style="animation-delay:${i * .08}s">
      <img src="${esc(l.foto)}" alt="${esc(l.nombre)}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect width=%22120%22 height=%22120%22 fill=%22%23222%22/%3E%3C/svg%3E'">
      <div class="hf-name">${esc(l.nombre)}</div>
    </div>`).join("");
  $$("#heroFeatured .hf-card").forEach(c => c.addEventListener("click", () => { const l = TODOS.find(x => key(x) === c.dataset.key); if (l) openProfile(l); }));

  /* ===== Rellenar selects ===== */
  function fillSelect(sel, items) { items.forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = v; sel.appendChild(o); }); }
  fillSelect($("#orgPeso"), pesos); fillSelect($("#orgPais"), paises);
  fillSelect($("#fPeso"), pesos); fillSelect($("#fPais"), paises);
  D.ORGANIZACIONES.forEach(o => { [$("#fOrg"), $("#fightOrg")].forEach(sel => { const op = document.createElement("option"); op.value = o.nombre; op.textContent = o.nombre; sel.appendChild(op); }); });
  [...new Set(D.NOTICIAS.map(n => n.tag))].forEach(t => { const o = document.createElement("option"); o.value = t; o.textContent = t; $("#newsTag").appendChild(o); });

  /* ===== Tarjeta de luchador ===== */
  function statusChip(l) { return l.status ? `<span class="chip champ">${esc(l.status)}</span>` : `<span class="chip" title="No verificado">estatus sin verificar</span>`; }
  function card(l) {
    const k = key(l), rec = l.record ? esc(l.record) : "sin verificar";
    return `<article class="fighter" data-key="${esc(k)}">
      <button class="fav-star ${isFav(k) ? "on" : ""}" data-fav="${esc(k)}" aria-label="Favorito">★</button>
      ${avaBox(l, "fighter-photo")}<span class="fighter-flag" style="position:absolute;top:8px;left:8px">${esc(l.bandera || "")}</span>
      <div class="fighter-body">
        <h4>${esc(l.nombre)}</h4>
        <span class="fighter-line">${esc(l.bandera || "")} ${esc(l.pais)} · ${esc(l.org)}</span>
        <span class="fighter-line">${esc(l.peso)}</span>
        ${statusChip(l)}
        <span class="fighter-line">Récord: ${rec}</span>
        <button class="btn-profile" data-key="${esc(k)}">Ver perfil</button>
      </div></article>`;
  }
  function bindCards(root) {
    $$(".btn-profile", root).forEach(b => b.addEventListener("click", () => { const l = TODOS.find(x => key(x) === b.dataset.key); if (l) openProfile(l); }));
    $$(".fav-star", root).forEach(b => b.addEventListener("click", (e) => { e.stopPropagation(); toggleFav(b.dataset.fav); }));
    // Nota: sin tilt 3D en tarjetas de luchador. La skill "animate" desaconseja
    // mover por estilo contenido que el usuario lee. El hover de elevacion
    // (CSS .fighter:hover, gateado por hover) ya aporta feedback suficiente.
  }

  /* ===== Organizaciones (acordeón) ===== */
  const orgList = $("#orgList");
  const oFil = { q: "", peso: "", pais: "" };
  function matchOrg(l) {
    if (oFil.q && !l.nombre.toLowerCase().includes(oFil.q)) return false;
    if (oFil.peso && l.peso !== oFil.peso) return false;
    if (oFil.pais && l.pais !== oFil.pais) return false;
    return true;
  }
  function renderOrgs(keepOpen) {
    const open = keepOpen || $$(".org.open", orgList).map(o => o.dataset.id);
    orgList.innerHTML = "";
    D.ORGANIZACIONES.forEach(org => {
      const vis = org.luchadores.map(l => ({ ...l, org: org.nombre })).filter(matchOrg);
      const el = document.createElement("div"); el.className = "org"; el.dataset.id = org.id;
      el.innerHTML = `<button class="org-head" aria-expanded="false">
          <span class="org-badge" style="background:${esc(org.color)}">${esc(org.nombre.slice(0, 4))}</span>
          <span class="org-meta"><h3>${esc(org.nombre)}</h3><span class="org-long">${esc(org.nombreLargo)} · ${esc(org.pais)}</span><span class="org-desc">${esc(org.desc)}</span></span>
          <span class="org-count">${vis.length} luchador${vis.length === 1 ? "" : "es"}</span><span class="org-arrow">▾</span></button>
        <div class="org-panel"><div class="org-panel-inner">
          ${vis.length ? `<div class="fighter-grid">${vis.map(card).join("")}</div>` : `<div class="empty"><span class="empty-ico">🥋</span>Ningún luchador coincide con el filtro.</div>`}
        </div></div>`;
      orgList.appendChild(el);
    });
    $$(".org-head", orgList).forEach(h => h.addEventListener("click", () => { const o = h.closest(".org"); const op = o.classList.toggle("open"); h.setAttribute("aria-expanded", String(op)); }));
    bindCards(orgList);
    const hay = oFil.q || oFil.peso || oFil.pais;
    $$(".org", orgList).forEach(o => { const t = $(".fighter", o); if ((hay && t) || (!hay && open.includes(o.dataset.id))) { o.classList.add("open"); $(".org-head", o).setAttribute("aria-expanded", "true"); } });
  }
  $("#orgSearch").addEventListener("input", e => { oFil.q = e.target.value.trim().toLowerCase(); renderOrgs(); });
  $("#orgPeso").addEventListener("change", e => { oFil.peso = e.target.value; renderOrgs(); });
  $("#orgPais").addEventListener("change", e => { oFil.pais = e.target.value; renderOrgs(); });
  $("#expandAll").addEventListener("click", () => $$(".org", orgList).forEach(o => { o.classList.add("open"); $(".org-head", o).setAttribute("aria-expanded", "true"); }));
  $("#collapseAll").addEventListener("click", () => $$(".org", orgList).forEach(o => { o.classList.remove("open"); $(".org-head", o).setAttribute("aria-expanded", "false"); }));

  /* ===== Buscador avanzado ===== */
  const sFil = { q: "", org: "", peso: "", pais: "", sexo: "" };
  const searchGrid = $("#searchGrid"), chips = $("#activeChips"), rc = $("#resultCount");
  function matchS(l) {
    if (sFil.q && !l.nombre.toLowerCase().includes(sFil.q)) return false;
    if (sFil.org && l.org !== sFil.org) return false;
    if (sFil.peso && l.peso !== sFil.peso) return false;
    if (sFil.pais && l.pais !== sFil.pais) return false;
    if (sFil.sexo && (l.sexo || "") !== sFil.sexo) return false;
    return true;
  }
  function renderSearch() {
    const res = TODOS.filter(matchS);
    searchGrid.innerHTML = res.length ? res.map(card).join("") : `<div class="empty"><span class="empty-ico">🔍</span>Sin resultados. <button class="btn-mini" id="emptyReset">Restablecer búsqueda</button></div>`;
    bindCards(searchGrid);
    const er = $("#emptyReset"); if (er) er.addEventListener("click", clearSearch);
    rc.textContent = `${res.length} luchador${res.length === 1 ? "" : "es"} encontrados de ${TODOS.length}`;
    const act = [];
    if (sFil.q) act.push(["q", `Nombre: "${sFil.q}"`]);
    if (sFil.org) act.push(["org", sFil.org]);
    if (sFil.peso) act.push(["peso", sFil.peso]);
    if (sFil.pais) act.push(["pais", sFil.pais]);
    if (sFil.sexo) act.push(["sexo", sFil.sexo === "M" ? "Masculino" : "Femenino"]);
    chips.innerHTML = act.map(([k, t]) => `<span class="ac" data-k="${k}">${esc(t)}</span>`).join("");
    $$(".ac", chips).forEach(c => c.addEventListener("click", () => { const k = c.dataset.k; sFil[k] = ""; syncInputs(); renderSearch(); }));
    writeUrl();
  }
  function writeUrl() {
    const qs = new URLSearchParams();
    if (sFil.q) qs.set("q", sFil.q);
    if (sFil.org) qs.set("org", sFil.org);
    if (sFil.peso) qs.set("peso", sFil.peso);
    if (sFil.pais) qs.set("pais", sFil.pais);
    if (sFil.sexo) qs.set("sexo", sFil.sexo);
    const s = qs.toString();
    history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + (location.hash || ""));
  }
  function readUrl() {
    const qs = new URLSearchParams(location.search);
    sFil.q = (qs.get("q") || "").toLowerCase();
    sFil.org = qs.get("org") || ""; sFil.peso = qs.get("peso") || "";
    sFil.pais = qs.get("pais") || ""; sFil.sexo = qs.get("sexo") || "";
    syncInputs();
  }
  function syncInputs() { $("#fSearch").value = sFil.q; $("#fOrg").value = sFil.org; $("#fPeso").value = sFil.peso; $("#fPais").value = sFil.pais; $("#fSexo").value = sFil.sexo; }
  function clearSearch() { Object.keys(sFil).forEach(k => sFil[k] = ""); syncInputs(); renderSearch(); }
  $("#fSearch").addEventListener("input", e => { sFil.q = e.target.value.trim().toLowerCase(); renderSearch(); });
  $("#fOrg").addEventListener("change", e => { sFil.org = e.target.value; renderSearch(); });
  $("#fPeso").addEventListener("change", e => { sFil.peso = e.target.value; renderSearch(); });
  $("#fPais").addEventListener("change", e => { sFil.pais = e.target.value; renderSearch(); });
  $("#fSexo").addEventListener("change", e => { sFil.sexo = e.target.value; renderSearch(); });
  $("#fClear").addEventListener("click", clearSearch);

  /* ===== Ranking P4P (podio + resto) ===== */
  $("#p4pMeta").textContent = `· Actualizado ${D.P4P.actualizado} · ${D.P4P.fuente}`;
  function fotoDe(nombre) { const m = TODOS.find(l => l.nombre === nombre); return m ? m.foto : ""; }
  function renderP4P(sort = "pos") {
    const list = [...D.P4P.lista].sort((a, b) => sort === "nombre" ? a.nombre.localeCompare(b.nombre) : sort === "org" ? a.org.localeCompare(b.org) : a.pos - b.pos);
    const top3 = list.slice(0, 3), rest = list.slice(3);
    const podCard = (p, cls) => {
      const f = p.foto || fotoDe(p.nombre);
      const inner = f ? `<img src="${esc(f)}" alt="${esc(p.nombre)}" onerror="this.remove();this.parentNode.setAttribute('style','background:${color(p.nombre)}');this.parentNode.textContent='${ini(p.nombre)}'">` : ini(p.nombre);
      const bg = f ? "" : `style="background:${color(p.nombre)}"`;
      return `<div class="pod ${cls}"><div class="rank">#${p.pos}</div><div class="pod-ava" ${bg}>${inner}</div><h4>${esc(p.nombre)}</h4><span class="pod-sub">${esc(p.org)} · ${esc(p.peso)}</span><p class="pod-why">${esc(p.motivo)}</p></div>`;
    };
    // orden visual: 2º, 1º, 3º
    const g = top3.find(p => p.pos === 1) || top3[0];
    const s = top3.find(p => p.pos === 2) || top3[1];
    const b = top3.find(p => p.pos === 3) || top3[2];
    $("#podium").innerHTML = [s && podCard(s, "silver"), g && podCard(g, "gold"), b && podCard(b, "bronze")].filter(Boolean).join("");
    $("#p4pRest").innerHTML = rest.map(p => {
      const f = p.foto || fotoDe(p.nombre);
      const inner = f ? `<img src="${esc(f)}" alt="${esc(p.nombre)}" onerror="this.remove();this.parentNode.setAttribute('style','background:${color(p.nombre)}');this.parentNode.textContent='${ini(p.nombre)}'">` : ini(p.nombre);
      const bg = f ? "" : `style="background:${color(p.nombre)}"`;
      return `<div class="rest-card"><span class="rc-pos">#${p.pos}</span><div class="rc-ava" ${bg}>${inner}</div><div><h4>${esc(p.nombre)}</h4><span class="fighter-line">${esc(p.org)} · ${esc(p.peso)}</span></div></div>`;
    }).join("");
  }
  $("#p4pSort").addEventListener("change", e => renderP4P(e.target.value));

  /* ===== Comparador ===== */
  const cmpA = $("#cmpA"), cmpB = $("#cmpB"), versus = $("#versus");
  const opts = `<option value="">— elige —</option>` + TODOS.map((l, i) => `<option value="${i}">${esc(l.nombre)} (${esc(l.org)})</option>`).join("");
  cmpA.innerHTML = opts; cmpB.innerHTML = opts;
  function vsSide(l) {
    const dato = (v) => v ? esc(v) : "Sin verificar";
    const f = l.foto;
    const inner = f ? `<img src="${esc(f)}" alt="${esc(l.nombre)}" onerror="this.remove();this.parentNode.setAttribute('style','background:${color(l.nombre)}');this.parentNode.textContent='${ini(l.nombre)}'">` : ini(l.nombre);
    const bg = f ? "" : `style="background:${color(l.nombre)}"`;
    return `<div class="vs-side"><div class="vs-ava" ${bg}>${inner}</div><h4>${esc(l.nombre)}</h4><p class="fighter-line">${esc(l.bandera || "")} ${esc(l.pais)}</p>
      <div class="vs-row"><span>Liga</span><strong>${esc(l.org)}</strong></div>
      <div class="vs-row"><span>Categoría</span><strong>${esc(l.peso)}</strong></div>
      <div class="vs-row"><span>Altura</span><strong>${dato(l.altura)}</strong></div>
      <div class="vs-row"><span>Alcance</span><strong>${dato(l.alcance)}</strong></div>
      <div class="vs-row"><span>Estilo</span><strong>${dato(l.estilo)}</strong></div>
      <div class="vs-row"><span>Récord</span><strong>${dato(l.record)}</strong></div>
      <div class="vs-row"><span>Estatus</span><strong>${dato(l.status)}</strong></div></div>`;
  }
  function renderVs() {
    const a = cmpA.value === "" ? null : TODOS[+cmpA.value];
    const b = cmpB.value === "" ? null : TODOS[+cmpB.value];
    if (!a && !b) { versus.innerHTML = `<div class="vs-empty">Elige dos luchadores para compararlos.</div>`; return; }
    versus.innerHTML = `${a ? vsSide(a) : `<div class="vs-empty">Elige el luchador A</div>`}<div class="vs-mid"><div class="vs-badge">VS</div></div>${b ? vsSide(b) : `<div class="vs-empty">Elige el luchador B</div>`}`;
  }
  cmpA.addEventListener("change", renderVs); cmpB.addEventListener("change", renderVs);
  $("#cmpSwap").addEventListener("click", () => { const t = cmpA.value; cmpA.value = cmpB.value; cmpB.value = t; renderVs(); });
  $("#cmpClear").addEventListener("click", () => { cmpA.value = ""; cmpB.value = ""; renderVs(); });

  /* ===== Modal ===== */
  const modal = $("#modal"), modalBody = $("#modalBody");
  function openProfile(l) {
    const dato = (v) => v ? esc(v) : "Sin verificar";
    const k = key(l), url = location.origin + location.pathname + "#f=" + encodeURIComponent(k);
    const f = l.foto;
    const hero = f ? `<img src="${esc(f)}" alt="${esc(l.nombre)}" onerror="this.remove();this.parentNode.setAttribute('style','background:${color(l.nombre)}');this.parentNode.textContent='${ini(l.nombre)}'">` : ini(l.nombre);
    const hbg = f ? "" : `style="background:${color(l.nombre)}"`;
    modalBody.innerHTML = `<div class="modal-hero" ${hbg}>${hero}</div>
      <h3>${esc(l.nombre)}</h3><p class="fighter-line">${esc(l.bandera || "")} ${esc(l.pais)} · ${esc(l.org)}</p>
      <div class="modal-actions"><button class="btn-mini" id="mFav">${isFav(k) ? "★ En favoritos" : "☆ Añadir a favoritos"}</button><button class="btn-mini" id="mShare">🔗 Compartir</button></div>
      <div class="modal-grid">
        <div class="mg"><span>Categoría</span><strong>${esc(l.peso)}</strong></div>
        <div class="mg"><span>Estilo</span><strong>${dato(l.estilo)}</strong></div>
        <div class="mg"><span>Récord</span><strong>${dato(l.record)}</strong></div>
        <div class="mg"><span>Estatus</span><strong>${dato(l.status)}</strong></div>
        <div class="mg"><span>Altura</span><strong>${dato(l.altura)}</strong></div>
        <div class="mg"><span>Alcance</span><strong>${dato(l.alcance)}</strong></div>
      </div>
      ${l.credito ? `<p class="modal-note" style="border-color:var(--line)">Foto: ${esc(l.credito)} · ${esc(l.licencia || "")}</p>` : ""}
      <p class="modal-note">Los datos «Sin verificar» no se muestran como oficiales. Edita <code>data.json</code> con fuentes fiables. Revisión: ${esc(D.DATA_ACTUALIZADO)}.</p>`;
    modal.hidden = false; document.body.style.overflow = "hidden"; $(".modal-close", modal).focus();
    $("#mFav").addEventListener("click", () => { toggleFav(k); closeModal(); });
    $("#mShare").addEventListener("click", () => { if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast("Enlace copiado 🔗"), () => toast(url)); else toast(url); });
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ""; if (location.hash.startsWith("#f=")) history.replaceState(null, "", location.pathname); }
  $$("[data-close]", modal).forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  function fromHash() { const m = location.hash.match(/^#f=(.+)$/); if (!m) return; const l = TODOS.find(x => key(x) === decodeURIComponent(m[1])); if (l) openProfile(l); }
  window.addEventListener("hashchange", fromHash);

  /* ===== Combates + countdown + tabs ===== */
  let fightTab = "next", fightOrg = "";
  const fightGrid = $("#fightGrid");
  let cdTimer = null;
  function renderFights() {
    if (cdTimer) { clearInterval(cdTimer); cdTimer = null; }
    const list = D.PROXIMOS.filter(f => f.estado === fightTab && (!fightOrg || f.org === fightOrg));
    if (!list.length) { fightGrid.innerHTML = `<div class="empty"><span class="empty-ico">🥊</span>No hay combates que mostrar.</div>`; return; }
    fightGrid.innerHTML = list.map((f, i) => `
      <article class="fight ${f.main ? "main" : ""}">
        ${f.main ? `<span class="main-tag">Combate estelar</span>` : ""}
        <div class="fight-vs">
          <div class="fight-side"><div class="fs-ava">${esc(f.a.bandera || "🥊")}</div><h4>${esc(f.a.nombre)}</h4></div>
          <span class="vs">VS</span>
          <div class="fight-side"><div class="fs-ava">${esc(f.b.bandera || "🥊")}</div><h4>${esc(f.b.nombre)}</h4></div>
        </div>
        ${f.when && f.estado === "next" ? `<div class="countdown" data-when="${esc(f.when)}">—</div>` : ""}
        ${f.verificado ? `<span class="badge-ok">Combate confirmado</span>` : ""}
        <div class="fight-foot"><span>${esc(f.evento)} · ${esc(f.org)}</span><span>${esc(f.peso)}${f.when ? "" : " · fecha por confirmar"}</span></div>
      </article>`).join("");
    // countdown en vivo
    const cds = $$(".countdown", fightGrid);
    if (cds.length && !reduce) {
      const tick = () => cds.forEach(el => {
        const diff = new Date(el.dataset.when).getTime() - Date.now();
        if (isNaN(diff)) { el.textContent = "Fecha por confirmar"; return; }
        if (diff <= 0) { el.textContent = "¡En directo / finalizado!"; return; }
        const d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5), m = Math.floor(diff % 36e5 / 6e4), s = Math.floor(diff % 6e4 / 1e3);
        el.textContent = `⏱ ${d}d ${h}h ${m}m ${s}s`;
      });
      tick(); cdTimer = setInterval(tick, 1000);
    } else { cds.forEach(el => { const diff = new Date(el.dataset.when).getTime() - Date.now(); el.textContent = isNaN(diff) ? "Fecha por confirmar" : "⏱ próximamente"; }); }
  }
  $$("[data-fighttab]").forEach(b => b.addEventListener("click", () => { $$("[data-fighttab]").forEach(x => x.classList.remove("active")); b.classList.add("active"); fightTab = b.dataset.fighttab; renderFights(); }));
  $("#fightOrg").addEventListener("change", e => { fightOrg = e.target.value; renderFights(); });

  /* ===== Noticias ===== */
  let nQ = "", nTag = "";
  const newsGrid = $("#newsGrid"), newsFeat = $("#newsFeatured");
  function renderNews() {
    let list = D.NOTICIAS.filter(n => (!nQ || (n.titulo + n.resumen).toLowerCase().includes(nQ)) && (!nTag || n.tag === nTag));
    const feat = list.find(n => n.destacada);
    if (feat && !nQ && !nTag) {
      newsFeat.innerHTML = `<article class="nf" style="background:${color(feat.titulo)}"><div class="nf-body"><span class="news-tag">${esc(feat.tag)}</span><h3 style="margin:.6rem 0 .4rem;font-size:1.6rem">${esc(feat.titulo)}</h3><p style="color:var(--text);opacity:.85">${esc(feat.resumen)}</p><button class="readmore" data-n="${esc(feat.titulo)}">Leer completa →</button></div></article>`;
      list = list.filter(n => n !== feat);
    } else { newsFeat.innerHTML = ""; }
    newsGrid.innerHTML = list.length ? list.map(n => `
      <article class="news"><span class="news-tag">${esc(n.tag)}</span><h4>${esc(n.titulo)}</h4><p>${esc(n.resumen)}</p><div class="news-date">${esc(n.fecha)} · ${esc(n.org)}</div><button class="readmore" data-n="${esc(n.titulo)}">Leer más →</button></article>`).join("")
      : `<div class="empty"><span class="empty-ico">📰</span>Sin noticias para ese filtro.</div>`;
    $$(".readmore").forEach(b => b.addEventListener("click", () => { const n = D.NOTICIAS.find(x => x.titulo === b.dataset.n); if (n) openNews(n); }));
  }
  function openNews(n) {
    modalBody.innerHTML = `<div class="modal-hero" style="background:${color(n.titulo)}">📰</div><span class="news-tag">${esc(n.tag)}</span><h3 style="margin-top:.6rem">${esc(n.titulo)}</h3><p class="fighter-line">${esc(n.fecha)} · ${esc(n.org)}</p><p style="margin:1rem 0">${esc(n.cuerpo || n.resumen)}</p><p class="modal-note">Noticia de demostración. No procede de una fuente real.</p>`;
    modal.hidden = false; document.body.style.overflow = "hidden"; $(".modal-close", modal).focus();
  }
  $("#newsSearch").addEventListener("input", e => { nQ = e.target.value.trim().toLowerCase(); renderNews(); });
  $("#newsTag").addEventListener("change", e => { nTag = e.target.value; renderNews(); });

  /* ===== Rankings por división (acordeón) ===== */
  (function () {
    const host = $("#divList");
    if (!host || !D.RANKINGS || !D.RANKINGS.divisiones) { if (host) host.innerHTML = `<div class="empty">Rankings no disponibles.</div>`; return; }
    const meta = $("#rankMeta"); if (meta) meta.textContent = `· ${D.RANKINGS.fuente}`;
    const esF = (s) => s === "F";
    host.innerHTML = D.RANKINGS.divisiones.map((dv, idx) => {
      const camp = dv.campeon && dv.campeon !== "por confirmar"
        ? `<div class="rank-row champ"><span class="rank-pos">🏆</span><span class="rank-name">${esc(dv.campeon)}</span><span class="chip champ">Campeón</span></div>`
        : `<div class="rank-row champ"><span class="rank-pos">🏆</span><span class="rank-name" style="color:var(--muted)">Campeón por confirmar</span></div>`;
      const filas = (dv.rank || []).map((n, i) => {
        const pc = n === "por confirmar";
        return `<div class="rank-row"><span class="rank-pos">${i + 1}</span><span class="rank-name"${pc ? ' style="color:var(--muted)"' : ''}>${esc(n)}</span></div>`;
      }).join("");
      return `<div class="org" data-id="div${idx}">
        <button class="org-head" aria-expanded="false">
          <span class="org-badge" style="background:${esF(dv.sexo) ? "#b5179e" : "#d20a0a"}">${esF(dv.sexo) ? "F" : "M"}</span>
          <span class="org-meta"><h3>${esc(dv.div)}</h3><span class="org-long">Campeón + 15 rankeados</span></span>
          <span class="org-count">${(dv.rank || []).filter(x => x !== "por confirmar").length}/15 confirmados</span>
          <span class="org-arrow">▾</span>
        </button>
        <div class="org-panel"><div class="org-panel-inner"><div class="rank-list">${camp}${filas}</div></div></div>
      </div>`;
    }).join("");
    $$(".org-head", host).forEach(h => h.addEventListener("click", () => { const o = h.closest(".org"); const op = o.classList.toggle("open"); h.setAttribute("aria-expanded", String(op)); }));
  })();

  /* ===== Secciones estáticas ===== */
  $("#weightGrid").innerHTML = D.CATEGORIAS.map(c => `<div class="weight"><span class="wsex">${esc(c.sexo)}</span><h4>${esc(c.div)}</h4><p>${esc(c.kg)}</p></div>`).join("");
  $("#discGrid").innerHTML = D.DISCIPLINAS.map(d => `<article class="disc"><div class="disc-ico">${esc(d.icono)}</div><h3>${esc(d.nombre)}</h3><p>${esc(d.desc)}</p></article>`).join("");
  $("#rulesGrid").innerHTML = D.REGLAS.map(r => `<article class="rule"><div class="rule-ico">${esc(r.icono)}</div><h3>${esc(r.t)}</h3><p>${esc(r.d)}</p></article>`).join("");
  $("#footMeta").textContent = `Datos editables en data.js. Revisión: ${D.DATA_ACTUALIZADO}. Récords y estatus no verificados se marcan como tales. Rankings, noticias y combates son editoriales o de demostración.`;

  /* ===== Init ===== */
  readUrl();
  renderOrgs([]); renderSearch(); renderP4P("pos"); renderVs(); renderFights(); renderNews(); fromHash();
  } // boot
})();

