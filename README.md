# EL UNIVERSO MMA

Web moderna sobre artes marciales mixtas: organizaciones, luchadores, ranking P4P, combates, noticias, disciplinas y reglas.

## Estructura
- `index.html` — estructura de la página.
- `style.css` — estilos (tema oscuro, rojo, responsive, animaciones).
- `app.js` — interactividad (acordeones, buscador, filtros, modales, navegación).
- `data.js` — **datos editables** (organizaciones, luchadores, ranking, noticias…).

## Cómo editar los datos
Abre `data.js` y edita las listas. Reglas:
- No se inventan récords ni títulos.
- `record: null` → se muestra "sin verificar".
- `status: null` → no se muestra etiqueta de campeón.
- Para fotos reales, pon una URL fiable en el campo `foto`. Si falla, la tarjeta muestra la inicial.
- El ranking P4P es una **clasificación editorial propia, no oficial**.
- Las noticias y los próximos combates son **contenido de demostración**.

Actualiza la fecha `DATA_ACTUALIZADO` al cambiar datos.

## Ver la web
Abre `index.html` en el navegador, o visita la versión publicada:
https://manriquesuarezemilio.github.io/mma/
