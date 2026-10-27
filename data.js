/* ============================================================
   data.js — cargador de datos
   Lee data.json (editable sin tocar codigo). Si el fetch falla
   (p. ej. al abrir el HTML con file:// sin servidor), usa una
   copia embebida de respaldo para que la web siga funcionando.
   Publica los datos en window.MMA y lanza el evento 'mma:data'.
   ============================================================ */
(function () {
  "use strict";

  // Respaldo minimo embebido (se usa solo si no se puede leer data.json).
  const FALLBACK = {
    actualizado: "2026-10-27",
    organizaciones: [
      { id:"ufc", nombre:"UFC", nombreLargo:"Ultimate Fighting Championship", pais:"Estados Unidos", desc:"La mayor organizacion de MMA del mundo.", color:"#d20a0a",
        luchadores:[
          { nombre:"Islam Makhachev", pais:"Rusia", bandera:"🇷🇺", peso:"Depende de divisiones", sexo:"M", estilo:"Grappling / Sambo", record:null, status:null, altura:null, alcance:null, foto:"img/islam-makhachev.svg", credito:null, licencia:null },
          { nombre:"Alex Pereira", pais:"Brasil", bandera:"🇧🇷", peso:"Semipesado", sexo:"M", estilo:"Kickboxing", record:null, status:null, altura:null, alcance:null, foto:"img/alex-pereira.jpg", credito:"Wikimedia Commons", licencia:"CC BY 3.0" }
        ] }
    ],
    p4p:{ actualizado:"2026-10-27", fuente:"Clasificacion editorial propia (no oficial)", lista:[ { pos:1, nombre:"Islam Makhachev", org:"UFC", peso:"—", motivo:"Grappling de elite." } ] },
    noticias:[ { fecha:"2026-10-20", destacada:true, org:"UFC", tag:"Noticia", titulo:"Noticia de ejemplo", resumen:"Demostracion.", cuerpo:"Demostracion." } ],
    proximos:[ { estado:"next", evento:"Evento demo", org:"UFC", peso:"Pesado", when:null, main:true, verificado:false, a:{nombre:"Luchador A", bandera:"🏳️"}, b:{nombre:"Luchador B", bandera:"🏳️"} } ],
    categorias:[ { div:"Peso ligero", kg:"hasta 70,3 kg", sexo:"M" } ],
    disciplinas:[ { nombre:"Boxeo", icono:"🥊", desc:"Golpes de puños." } ],
    reglas:[ { t:"Asaltos", icono:"⏱️", d:"3 o 5 asaltos de 5 min. Varia por competicion." } ]
  };

  function publicar(d) {
    window.MMA = {
      DATA_ACTUALIZADO: d.actualizado,
      ORGANIZACIONES: d.organizaciones,
      P4P: d.p4p,
      NOTICIAS: d.noticias,
      PROXIMOS: d.proximos,
      CATEGORIAS: d.categorias,
      DISCIPLINAS: d.disciplinas,
      REGLAS: d.reglas
    };
    window.dispatchEvent(new CustomEvent("mma:data"));
  }

  fetch("data.json", { cache: "no-cache" })
    .then(r => { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
    .then(publicar)
    .catch(err => {
      console.warn("No se pudo leer data.json (" + err.message + "). Uso respaldo embebido. Para datos completos, abre la web desde un servidor o publicada.");
      publicar(FALLBACK);
    });
})();
