/* ============================================================
   data.js  —  Datos de organizaciones, luchadores y rankings
   ------------------------------------------------------------
   EDITA AQUÍ para actualizar la web. Nada está "en directo".
   Reglas que seguimos:
   - No inventamos récords ni títulos.
   - record: null  -> se muestra "sin verificar".
   - status: null  -> no se muestra ninguna etiqueta.
   - Fotos: usamos un placeholder elegante si la URL falla.
   Última revisión editorial: 2026-10-27  (actualízala al editar)
   ============================================================ */

const DATA_ACTUALIZADO = "2026-10-27";

/* Fotos: dejamos vacío (""), la tarjeta pinta un avatar con la
   inicial del luchador. Así nunca aparece una imagen rota.
   Si tienes una URL fiable, pégala en "foto". */

const ORGANIZACIONES = [
  {
    id: "ufc",
    nombre: "UFC",
    nombreLargo: "Ultimate Fighting Championship",
    pais: "Estados Unidos",
    desc: "La mayor organización de MMA del mundo. Sede en Las Vegas.",
    color: "#d20a0a",
    luchadores: [
      { nombre: "Islam Makhachev", pais: "Rusia", bandera: "🇷🇺", peso: "Depende de divisiones", sexo: "M", estilo: "Grappling / Sambo", record: null, status: null, foto: "" },
      { nombre: "Alex Pereira", pais: "Brasil", bandera: "🇧🇷", peso: "Semipesado", sexo: "M", estilo: "Kickboxing", record: null, status: null, foto: "" },
      { nombre: "Ilia Topuria", pais: "España / Georgia", bandera: "🇪🇸", peso: "Ligero (histórico pluma)", sexo: "M", estilo: "Boxeo / Grappling", record: null, status: null, foto: "" },
      { nombre: "Tom Aspinall", pais: "Reino Unido", bandera: "🇬🇧", peso: "Pesado", sexo: "M", estilo: "Grappling / KO", record: null, status: null, foto: "" },
      { nombre: "Dricus du Plessis", pais: "Sudáfrica", bandera: "🇿🇦", peso: "Medio", sexo: "M", estilo: "Presión / Grappling", record: null, status: null, foto: "" },
      { nombre: "Zhang Weili", pais: "China", bandera: "🇨🇳", peso: "Paja (F)", sexo: "F", estilo: "Completa", record: null, status: null, foto: "" }
    ]
  },
  {
    id: "pfl",
    nombre: "PFL",
    nombreLargo: "Professional Fighters League",
    pais: "Estados Unidos",
    desc: "Formato de liga con temporada regular, play-offs y final por premio.",
    color: "#e8a600",
    luchadores: [
      { nombre: "Francis Ngannou", pais: "Camerún", bandera: "🇨🇲", peso: "Pesado", sexo: "M", estilo: "KO / Potencia", record: null, status: null, foto: "" },
      { nombre: "Jakob Nedoh", pais: "Eslovenia", bandera: "🇸🇮", peso: "Variable", sexo: "M", estilo: "Completa", record: null, status: null, foto: "" }
    ]
  },
  {
    id: "one",
    nombre: "ONE",
    nombreLargo: "ONE Championship",
    pais: "Singapur",
    desc: "Gran organización asiática. Mezcla MMA, Muay Thai y kickboxing.",
    color: "#c8102e",
    luchadores: [
      { nombre: "Anatoly Malykhin", pais: "Rusia", bandera: "🇷🇺", peso: "Pesado / Semipesado", sexo: "M", estilo: "KO / Lucha", record: null, status: null, foto: "" },
      { nombre: "Demetrious Johnson", pais: "Estados Unidos", bandera: "🇺🇸", peso: "Mosca", sexo: "M", estilo: "Técnico / Completa", record: null, status: null, foto: "" }
    ]
  },
  {
    id: "rizin",
    nombre: "RIZIN",
    nombreLargo: "Rizin Fighting Federation",
    pais: "Japón",
    desc: "Espectáculo japonés. Grandes eventos de fin de año.",
    color: "#ff2d55",
    luchadores: [
      { nombre: "Kleber Koike", pais: "Brasil / Japón", bandera: "🇧🇷", peso: "Pluma", sexo: "M", estilo: "Jiu-Jitsu", record: null, status: null, foto: "" },
      { nombre: "Roberto de Souza", pais: "Brasil", bandera: "🇧🇷", peso: "Ligero", sexo: "M", estilo: "Grappling", record: null, status: null, foto: "" }
    ]
  },
  {
    id: "oktagon",
    nombre: "OKTAGON",
    nombreLargo: "Oktagon MMA",
    pais: "Chequia / Eslovaquia",
    desc: "Gran crecimiento en Europa central. Eventos en estadios.",
    color: "#ff8800",
    luchadores: [
      { nombre: "Losene Keita", pais: "Bélgica / Guinea", bandera: "🇧🇪", peso: "Pluma", sexo: "M", estilo: "Completa", record: null, status: null, foto: "" }
    ]
  },
  {
    id: "ksw",
    nombre: "KSW",
    nombreLargo: "Konfrontacja Sztuk Walki",
    pais: "Polonia",
    desc: "La organización líder en Polonia. Grandes veladas.",
    color: "#e4002b",
    luchadores: [
      { nombre: "Mateusz Gamrot (histórico)", pais: "Polonia", bandera: "🇵🇱", peso: "Ligero", sexo: "M", estilo: "Grappling", record: null, status: null, foto: "" }
    ]
  },
  {
    id: "cw",
    nombre: "Cage Warriors",
    nombreLargo: "Cage Warriors",
    pais: "Reino Unido",
    desc: "Cantera europea. De aquí han salido campeones de UFC.",
    color: "#b31217",
    luchadores: [
      { nombre: "Promesas europeas (variable)", pais: "Europa", bandera: "🇪🇺", peso: "Varias", sexo: "M", estilo: "Varias", record: null, status: null, foto: "" }
    ]
  },
  {
    id: "lfa",
    nombre: "LFA",
    nombreLargo: "Legacy Fighting Alliance",
    pais: "Estados Unidos",
    desc: "Trampolín estadounidense hacia las grandes ligas.",
    color: "#1f6feb",
    luchadores: [
      { nombre: "Prospectos norteamericanos (variable)", pais: "Norteamérica", bandera: "🇺🇸", peso: "Varias", sexo: "M", estilo: "Varias", record: null, status: null, foto: "" }
    ]
  }
];

/* Ranking P4P — CLASIFICACIÓN EDITORIAL PROPIA, no oficial.
   Orden por nombre destacado; edítalo libremente. */
const P4P = {
  actualizado: "2026-10-27",
  fuente: "Clasificación editorial propia (no oficial)",
  lista: [
    { pos: 1, nombre: "Islam Makhachev", org: "UFC", peso: "—", motivo: "Dominio prolongado y grappling de élite.", foto: "" },
    { pos: 2, nombre: "Ilia Topuria", org: "UFC", peso: "—", motivo: "Invicto con gran poder y técnica.", foto: "" },
    { pos: 3, nombre: "Alex Pereira", org: "UFC", peso: "—", motivo: "Pegada demoledora, varios títulos.", foto: "" },
    { pos: 4, nombre: "Tom Aspinall", org: "UFC", peso: "—", motivo: "Pesado rápido y finalizador.", foto: "" },
    { pos: 5, nombre: "Dricus du Plessis", org: "UFC", peso: "—", motivo: "Ritmo altísimo y presión constante.", foto: "" }
  ]
};

/* Noticias — CONTENIDO DE DEMOSTRACIÓN. No es información en directo. */
const NOTICIAS = [
  { fecha: "2026-10-20", titulo: "Ejemplo: se anuncia cartelera de fin de año", resumen: "Contenido de demostración. Conecta una fuente real para datos en vivo.", tag: "Demo" },
  { fecha: "2026-10-18", titulo: "Ejemplo: debut de promesa europea", resumen: "Contenido de demostración. No es una noticia verificada.", tag: "Demo" },
  { fecha: "2026-10-15", titulo: "Ejemplo: cambio de categoría de un campeón", resumen: "Contenido de demostración, sin fuente conectada.", tag: "Demo" }
];

/* Próximos combates — DEMOSTRACIÓN. No son enfrentamientos confirmados. */
const PROXIMOS = [
  { evento: "Evento de ejemplo 1", fecha: "Por confirmar", peso: "Pesado", a: { nombre: "Luchador A", bandera: "🏳️" }, b: { nombre: "Luchador B", bandera: "🏳️" } },
  { evento: "Evento de ejemplo 2", fecha: "Por confirmar", peso: "Ligero", a: { nombre: "Luchador C", bandera: "🏳️" }, b: { nombre: "Luchador D", bandera: "🏳️" } }
];

/* Categorías de peso (referencia general; varían por organización) */
const CATEGORIAS = [
  { div: "Peso paja", kg: "hasta 52,2 kg", sexo: "F" },
  { div: "Peso mosca", kg: "hasta 56,7 kg", sexo: "M/F" },
  { div: "Peso gallo", kg: "hasta 61,2 kg", sexo: "M/F" },
  { div: "Peso pluma", kg: "hasta 65,8 kg", sexo: "M/F" },
  { div: "Peso ligero", kg: "hasta 70,3 kg", sexo: "M" },
  { div: "Peso wélter", kg: "hasta 77,1 kg", sexo: "M" },
  { div: "Peso medio", kg: "hasta 83,9 kg", sexo: "M" },
  { div: "Peso semipesado", kg: "hasta 93,0 kg", sexo: "M" },
  { div: "Peso pesado", kg: "hasta 120,2 kg", sexo: "M" }
];

/* Disciplinas base del MMA */
const DISCIPLINAS = [
  { nombre: "Boxeo", icono: "🥊", desc: "Golpes de puños, juego de pies y defensa." },
  { nombre: "Muay Thai", icono: "🦵", desc: "Puños, codos, rodillas y patadas: el arte de las ocho armas." },
  { nombre: "Lucha", icono: "🤼", desc: "Derribos y control del rival en el suelo." },
  { nombre: "Jiu-Jitsu", icono: "🥋", desc: "Llaves y estrangulaciones para forzar la rendición." }
];

/* Reglas (duración y faltas pueden variar por competición) */
const REGLAS = [
  { t: "Asaltos", icono: "⏱️", d: "Normalmente 3 asaltos de 5 min; los combates de título, 5. Varía por competición." },
  { t: "Formas de ganar", icono: "🏆", d: "KO, TKO (parada del árbitro), sumisión o decisión de los jueces." },
  { t: "Faltas", icono: "🚫", d: "Prohibido golpear nuca y columna, meter dedos en los ojos, morder o tirar del pelo." },
  { t: "Golpes al suelo", icono: "⬇️", d: "Algunas reglas prohíben rodillazos o patadas a un rival derribado. Depende del reglamento." }
];

window.MMA = { DATA_ACTUALIZADO, ORGANIZACIONES, P4P, NOTICIAS, PROXIMOS, CATEGORIAS, DISCIPLINAS, REGLAS };
