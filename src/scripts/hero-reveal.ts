/**
 * Revelado del hero.
 *
 * La capa blanca es un <canvas> del tamaño del hero. En cada fotograma se
 * repinta de blanco y se borra con `destination-out` siguiendo el trazo del
 * puntero. Cada punto del trazo guarda su instante; su opacidad decae hasta
 * cero en TRAIL_LIFE ms, así que la línea "se cicatriza" sola.
 *
 * Por qué canvas y no una máscara CSS: el prototipo generaba un PNG en base64
 * con `toDataURL()` 25 veces por segundo para alimentar `mask-image`. Eso son
 * ~25 codificaciones PNG completas por segundo en el hilo principal. Aquí el
 * canvas ES la capa blanca, así que no hay ni codificación ni data-URL.
 */

/** ms hasta que un tramo del trazo vuelve a estar blanco del todo.
 *  El encargo pide "menos de medio segundo": 420 ms deja ver bien el trazo
 *  (y que cruce varios colores) y aun así cicatriza dentro de ese margen. */
const TRAIL_LIFE = 420;
/** Grosor de la línea, en px de CSS. */
const LINE_WIDTH = 46;
/** Más allá de esto los puntos ya han caducado; evita que la lista crezca. */
const MAX_POINTS = 240;

type Point = { x: number; y: number; t: number };

export function initHeroReveal(): void {
  const canvas = document.getElementById('heroReveal') as HTMLCanvasElement | null;
  const hero = canvas?.closest('.hero') as HTMLElement | null;
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const white = getComputedStyle(document.body).getPropertyValue('--gesso').trim() || '#FAFAF8';

  let trail: Point[] = [];
  let dpr = 1;
  let w = 0;
  let h = 0;
  let running = false;
  let rafId = 0;
  /* Posición del hero en pantalla. Se cachea porque `getBoundingClientRect()`
     obliga al navegador a recalcular el layout, y llamarlo en cada
     `pointermove` (hasta 120 veces por segundo) es justo lo que hace que el
     trazo salga a tirones. Se invalida al hacer scroll o al redimensionar. */
  let rect = { left: 0, top: 0, width: 0, height: 0 };
  let rectDirty = true;

  function measure(): void {
    const r = hero!.getBoundingClientRect();
    rect = { left: r.left, top: r.top, width: r.width, height: r.height };
    rectDirty = false;
  }

  function resize(): void {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    measure();
    w = rect.width;
    h = rect.height;
    canvas!.width = Math.round(w * dpr);
    canvas!.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw(): void {
    const now = performance.now();
    // Sólo sobreviven los puntos que aún no se han cicatrizado.
    trail = trail.filter((p) => now - p.t < TRAIL_LIFE);

    ctx!.globalCompositeOperation = 'source-over';
    ctx!.globalAlpha = 1;
    ctx!.fillStyle = white;
    ctx!.fillRect(0, 0, w, h);

    if (trail.length > 1) {
      ctx!.globalCompositeOperation = 'destination-out';
      ctx!.lineCap = 'round';
      ctx!.lineJoin = 'round';
      ctx!.lineWidth = LINE_WIDTH;

      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1]!;
        const b = trail[i]!;
        const alpha = 1 - (now - b.t) / TRAIL_LIFE;
        if (alpha <= 0) continue;
        ctx!.globalAlpha = alpha;
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = 'source-over';
    }
  }

  function loop(): void {
    draw();
    // Se deja de dibujar en cuanto el trazo se ha cerrado del todo: en reposo
    // el hero no consume nada.
    if (trail.length === 0) {
      running = false;
      return;
    }
    rafId = requestAnimationFrame(loop);
  }

  function kick(): void {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function addPoint(clientX: number, clientY: number): void {
    if (rectDirty) measure();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
    trail.push({ x, y, t: performance.now() });
    if (trail.length > MAX_POINTS) trail.shift();
    kick();
  }

  // ── Arranque ────────────────────────────────────────────────────────────
  resize();
  canvas.classList.add('ready');

  hero.addEventListener('pointermove', (e) => addPoint(e.clientX, e.clientY), { passive: true });
  // En táctil el dedo arrastra: se revela igual, sin bloquear el scroll.
  hero.addEventListener(
    'touchmove',
    (e) => {
      const t = e.touches[0];
      if (t) addPoint(t.clientX, t.clientY);
    },
    { passive: true },
  );

  let resizeTimer: number | undefined;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  });
  // Al hacer scroll el hero cambia de sitio: basta con marcar la medida como
  // caducada y volver a tomarla en el siguiente punto del trazo.
  window.addEventListener('scroll', () => { rectDirty = true; }, { passive: true });

  // Si el hero deja de verse, se corta el bucle aunque quedara trazo vivo.
  new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) {
        cancelAnimationFrame(rafId);
        running = false;
        trail = [];
        draw();
      }
    },
    { threshold: 0 },
  ).observe(hero);
}
