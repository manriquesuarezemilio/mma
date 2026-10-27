/* ============================================================
   data.js  —  Datos de organizaciones, luchadores y rankings
   ------------------------------------------------------------
   EDITA AQUÍ para actualizar la web. Nada está "en directo".
   Reglas que seguimos:
   - No inventamos récords ni títulos.
   - record: null  -> se muestra "sin verificar".
   - status: null  -> no se muestra ninguna etiqueta.

   FOTOS:
   - Cada luchador usa un retrato generado en img/<nombre>.svg
     (silueta deportiva + iniciales + color). Nunca se rompe.
   - ¿Tienes una FOTO REAL con permiso? Guárdala en img/ (p. ej.
     img/islam-makhachev.jpg) y cambia aquí "foto" a esa ruta.
   Última revisión editorial: 2026-10-27  (actualízala al editar)
   ============================================================ */

const DATA_ACTUALIZADO = "2026-10-27";

const ORGANIZACIONES = [
  {
    id: "ufc",
    nombre: "UFC",
    nombreLargo: "Ultimate Fighting Championship",
    pais: "Estados Unidos",
    desc: "La mayor organización de MMA del mundo. Sede en Las Vegas.",
    color: "#d20a0a",
    luchadores: [
      { nombre: "Islam Makhachev", pais: "Rusia", bandera: "🇷🇺", peso: "Depende de divisiones", sexo: "M", estilo: "Grappling / Sambo", record: null, status: null, foto: "img/islam-makhachev.svg" },
      { nombre: "Alex Pereira", pais: "Brasil", bandera: "🇧🇷", peso: "Semipesado", sexo: "M", estilo: "Kickboxing", record: null, status: null, foto: "img/alex-pereira.svg" },
      { nombre: "Ilia Topuria", pais: "España / Georgia", bandera: "🇪🇸", peso: "Ligero (histórico pluma)", sexo: "M", estilo: "Boxeo / Grappling", record: null, status: null, foto: "img/ilia-topuria.svg" },
      { nombre: "Tom Aspinall", pais: "Reino Unido", bandera: "🇬🇧", peso: "Pesado", sexo: "M", estilo: "Grappling / KO", record: null, status: null, foto: "img/tom-aspinall.svg" },
      { nombre: "Dricus du Plessis", pais: "Sudáfrica", bandera: "🇿🇦", peso: "Medio", sexo: "M", estilo: "Presión / Grappling", record: null, status: null, foto: "img/dricus-du-plessis.svg" },
      { nombre: "Zhang Weili", pais: "China", bandera: "🇨🇳", peso: "Paja (F)", sexo: "F", estilo: "Completa", record: null, status: null, foto: "img/zhang-weili.svg" }
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
      { nombre: "Francis Ngannou", pais: "Camerún", bandera: "🇨🇲", peso: "Pesado", sexo: "M", estilo: "KO / Potencia", record: null, status: null, foto: "img/francis-ngannou.svg" },
      { nombre: "Jakob Nedoh", pais: "Eslovenia", bandera: "🇸🇮", peso: "Variable", sexo: "M", estilo: "Completa", record: null, status: null, foto: "img/jakob-nedoh.svg" }
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
      { nombre: "Anatoly Malykhin", pais: "Rusia", bandera: "🇷🇺", peso: "Pesado / Semipesado", sexo: "M", estilo: "KO / Lucha", record: null, status: null, foto: "img/anatoly-malykhin.svg" },
      { nombre: "Demetrious Johnson", pais: "Estados Unidos", bandera: "🇺🇸", peso: "Mosca", sexo: "M", estilo: "Técnico / Completa", record: null, status: null, foto: "img/demetrious-johnson.svg" }
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
      { nombre: "Kleber Koike", pais: "Brasil / Japón", bandera: "🇧🇷", peso: "Pluma", sexo: "M", estilo: "Jiu-Jitsu", record: null, status: null, foto: "img/kleber-koike.svg" },
      { nombre: "Roberto de Souza", pais: "Brasil", bandera: "🇧🇷", peso: "Ligero", sexo: "M", estilo: "Grappling", record: null, status: null, foto: "img/roberto-de-souza.svg" }
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
      { nombre: "Losene Keita", pais: "Bélgica / Guinea", bandera: "🇧🇪", peso: "Pluma", sexo: "M", estilo: "Completa", record: null, status: null, foto: "img/losene-keita.svg" }
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
      { nombre: "Mateusz Gamrot (histórico)", pais: "Polonia", bandera: "🇵🇱", peso: "Ligero", sexo: "M", estilo: "Grappling", record: null, status: null, foto: "img/mateusz-gamrot-historico.svg" }
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
      { nombre: "Promesas europeas (variable)", pais: "Europa", bandera: "🇪🇺", peso: "Varias", sexo: "M", estilo: "Varias", record: null, status: null, foto: "img/promesas-europeas-variable.svg" }
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
      { nombre: "Prospectos norteamericanos (variable)", pais: "Norteamérica", bandera: "🇺🇸", peso: "Varias", sexo: "M", estilo: "Varias", record: null, status: null, foto: "img/prospectos-norteamericanos-variable.svg" }
    ]
  }
];

/* Ranking P4P — CLASIFICACIÓN EDITORIAL PROPIA, no oficial. */
const P4P = {
  actualizado: "2026-10-27",
  fuente: "Clasificación editorial propia (no oficial)",
  lista: [
    { pos: 1, nombre: "Islam Makhachev", org: "UFC", peso: "—", motivo: "Dominio prolongado y grappling de élite.", foto: "img/islam-makhachev.svg" },
    { pos: 2, nombre: "Ilia Topuria", org: "UFC", peso: "—", motivo: "Invicto con gran poder y técnica.", foto: "img/ilia-topuria.svg" },
    { pos: 3, nombre: "Alex Pereira", org: "UFC", peso: "—", motivo: "Pegada demoledora, varios títulos.", foto: "img/alex-pereira.svg" },
    { pos: 4, nombre: "Tom Aspinall", org: "UFC", peso: "—", motivo: "Pesado rápido y finalizador.", foto: "img/tom-aspinall.svg" },
    { pos: 5, nombre: "Dricus du Plessis", org: "UFC", peso: "—", motivo: "Ritmo altísimo y presión constante.", foto: "img/dricus-du-plessis.svg" }
  ]
};

/* Noticias — CONTENIDO DE DEMOSTRACIÓN. No es información en directo.
   destacada: true -> va en formato panorámico grande.
   tag: Noticia | Análisis | Resultado | Entrevista (etiquetas de ejemplo). */
const NOTICIAS = [
  { fecha:"2026-10-20", destacada:true,  org:"UFC", tag:"Noticia",   titulo:"Ejemplo: se anuncia la cartelera de fin de año", resumen:"Contenido de demostración. Conecta una fuente real para datos en vivo.", cuerpo:"Esta es una noticia de ejemplo para mostrar el diseño. No procede de ninguna fuente real ni está verificada. Sustitúyela editando data.js o conectando una API de noticias." },
  { fecha:"2026-10-18", destacada:false, org:"OKTAGON", tag:"Entrevista", titulo:"Ejemplo: entrevista a una promesa europea", resumen:"Contenido de demostración. No es una entrevista real.", cuerpo:"Texto de ejemplo. Edítalo en data.js." },
  { fecha:"2026-10-16", destacada:false, org:"PFL", tag:"Análisis",  titulo:"Ejemplo: análisis de una división", resumen:"Contenido de demostración, sin fuente conectada.", cuerpo:"Texto de ejemplo. Edítalo en data.js." },
  { fecha:"2026-10-15", destacada:false, org:"UFC", tag:"Resultado", titulo:"Ejemplo: resultado de una velada", resumen:"Contenido de demostración. No es un resultado real.", cuerpo:"Texto de ejemplo. Edítalo en data.js." }
];

/* Combates — DEMOSTRACIÓN. No son enfrentamientos ni resultados reales.
   estado: "next" (próximo) | "past" (finalizado)
   when:  fecha/hora ISO para el contador (null = "por confirmar", sin cuenta atrás)
   main:  true marca el combate estelar
   verificado: true muestra "COMBATE CONFIRMADO" (solo demo) */
const PROXIMOS = [
  { estado:"next", evento:"Evento de ejemplo · Estelar", org:"UFC", peso:"Pesado", when:"2026-12-31T23:00:00Z", main:true,  verificado:false, a:{nombre:"Luchador A", bandera:"🏳️"}, b:{nombre:"Luchador B", bandera:"🏳️"} },
  { estado:"next", evento:"Evento de ejemplo 2",         org:"PFL", peso:"Ligero",  when:"2027-01-15T22:00:00Z", main:false, verificado:false, a:{nombre:"Luchador C", bandera:"🏳️"}, b:{nombre:"Luchador D", bandera:"🏳️"} },
  { estado:"next", evento:"Evento de ejemplo 3",         org:"ONE", peso:"Pluma",   when:null,                   main:false, verificado:false, a:{nombre:"Luchador E", bandera:"🏳️"}, b:{nombre:"Luchador F", bandera:"🏳️"} },
  { estado:"past", evento:"Evento pasado (demo)",        org:"UFC", peso:"Medio",   when:null,                   main:false, verificado:false, a:{nombre:"Luchador G", bandera:"🏳️"}, b:{nombre:"Luchador H", bandera:"🏳️"} }
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
