# EL UNIVERSO MMA

Plataforma premium de artes marciales mixtas: organizaciones, luchadores, ranking P4P, cara a cara, combates, noticias, disciplinas y reglas.

## Estructura
- `index.html` — estructura de la página.
- `style.css` — estilos (tema oscuro/claro, animaciones, responsive).
- `app.js` — interactividad (acordeones, buscador, comparador, modales, countdown…).
- `data.js` — **cargador**: lee `data.json` (con respaldo embebido si no hay servidor).
- `data.json` — **todos los datos editables** (organizaciones, luchadores, ranking, combates, noticias).
- `img/` — retratos. SVG generados por defecto; algunas fotos reales con licencia libre.

## Editar los datos
Abre `data.json`. Reglas que seguimos:
- No se inventan récords, títulos ni combates.
- `record`, `status`, `altura`, `alcance` en `null` → se muestran como "sin verificar".
- Ranking P4P: **clasificación editorial propia, no oficial**.
- Noticias y combates: **contenido de demostración**.
- Para una foto real: guarda la imagen en `img/` y pon su ruta en `foto`. Si la foto tiene licencia (CC), rellena `credito` y `licencia` — se muestran en el perfil.

Actualiza `actualizado` al cambiar datos.

## Créditos de fotos
Algunas fotos proceden de Wikimedia Commons con licencia Creative Commons (CC BY / CC BY-SA). El crédito y la licencia se muestran en el perfil de cada luchador. Las demás usan un retrato SVG generado.

## Ver la web
Ábrela desde un servidor (o publicada). Al abrir el archivo directamente con `file://`, el navegador bloquea la carga de `data.json` y se usa un respaldo reducido.

Versión publicada: https://manriquesuarezemilio.github.io/mma/
