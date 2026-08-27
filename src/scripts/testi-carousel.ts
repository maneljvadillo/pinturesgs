/**
 * Las flechas del carrusel de testimonios (sólo móvil).
 *
 * El carrusel en sí es CSS puro: en móvil la lista pasa a `flex` con
 * `overflow-x: auto` y `scroll-snap`. Arrastrando ya funciona sin una línea de
 * JavaScript, y así sigue funcionando si esto no llega a cargarse.
 *
 * Lo que añade este archivo son las DOS FLECHAS, que son las que dicen que hay
 * más tarjetas a los lados. Sin ellas, en una pantalla estrecha el carrusel
 * parece una tarjeta suelta: no hay nada que invite a deslizar.
 *
 * ── Por qué cada flecha aparece y desaparece ──────────────────────────────
 * Una flecha que no lleva a ninguna parte es peor que ninguna flecha. Cada una
 * se enseña sólo si queda algo en su lado, y eso se mira en el propio
 * desplazamiento del carrusel, no contando tarjetas: da igual cuántas haya y
 * cuánto midan.
 *
 * ── Por qué no se recalcula en cada píxel de desplazamiento ───────────────
 * `scroll` dispara decenas de veces por gesto. Lo único que hace falta es
 * saber si se ha llegado a un extremo, así que la comprobación se agrupa en el
 * siguiente fotograma con `requestAnimationFrame`.
 */

/** Margen de tolerancia en px: por los redondeos, el final del desplazamiento
 *  casi nunca cae en el número exacto. */
const EDGE = 8;

export function initTestiCarousel(): void {
  const track = document.getElementById('testiTrack');
  const prev = document.getElementById('testiPrev') as HTMLButtonElement | null;
  const next = document.getElementById('testiNext') as HTMLButtonElement | null;
  if (!track || !prev || !next) return;

  let queued = false;

  function sync(): void {
    queued = false;
    const t = track!;
    // Sin desplazamiento posible (escritorio, donde es una rejilla) no hay
    // flechas que enseñar.
    const scrollable = t.scrollWidth - t.clientWidth > EDGE;
    prev!.hidden = !scrollable || t.scrollLeft <= EDGE;
    next!.hidden = !scrollable || t.scrollLeft >= t.scrollWidth - t.clientWidth - EDGE;
  }

  function queue(): void {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sync);
  }

  /** Un toque de flecha avanza UNA tarjeta, sea cual sea su ancho. */
  function step(dir: 1 | -1): void {
    const card = track!.querySelector<HTMLElement>('.testi-card');
    const gap = parseFloat(getComputedStyle(track!).columnGap) || 0;
    const by = card ? card.getBoundingClientRect().width + gap : track!.clientWidth * 0.85;
    track!.scrollBy({ left: by * dir, behavior: 'smooth' });
  }

  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  /*
    Sólo el desplazamiento se agrupa en el siguiente fotograma: es el que
    dispara decenas de veces por gesto. Al cambiar de tamaño se comprueba en el
    acto —el navegador ya espacia ese evento— y así el resultado no depende de
    que haya fotogramas: en una pestaña de fondo `requestAnimationFrame` no
    corre, y las flechas se quedarían como estaban al volver a ella.
  */
  track.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', sync);
  sync();
}
