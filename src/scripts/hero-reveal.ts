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

/**
 * Lo que dura la entrada del logotipo, leído de `--hero-intro` (tokens.css).
 * Se lee del CSS y no se copia aquí para que el número viva en un solo sitio:
 * la duración cambia entre móvil y escritorio con una media query.
 */
function introMs(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--hero-intro');
  const ms = parseFloat(raw);
  if (!Number.isFinite(ms)) return 0;
  return raw.trim().endsWith('ms') ? ms : ms * 1000;
}

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

  // ── Pasada automática (táctil) ──────────────────────────────────────────
  /*
    En el móvil no se pinta con el dedo. Arrastrar es lo que se hace para
    bajar por la página, así que cada gesto de scroll dejaba un trazo de color
    por encima del titular: parecía un fallo, no un efecto.

    En su lugar la brocha da una pasada sola cada pocos segundos por la franja
    baja del hero, que es la más despejada. Se alimenta el mismo trazo que usa
    el puntero, así que la cicatrización y el dibujado son idénticos.
  */
  const AUTO_TRAVEL = 1900;  // lo que tarda en cruzar
  const AUTO_PAUSE = 5000;   // descanso entre pasadas
  let autoRaf = 0;
  let autoTimer: number | undefined;
  let autoBusy = false;

  function autoStroke(): void {
    autoBusy = true;
    const start = performance.now();
    const step = (now: number): void => {
      const t = (now - start) / AUTO_TRAVEL;
      if (t >= 1) {
        autoBusy = false;
        scheduleStroke(AUTO_PAUSE);
        return;
      }
      // Suavizado en la entrada y en la salida: arranca y frena como una mano.
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const x = -0.08 * w + e * 1.16 * w;
      const y = h * (0.84 - 0.13 * Math.sin(e * Math.PI));
      trail.push({ x, y, t: now });
      if (trail.length > MAX_POINTS) trail.shift();
      kick();
      autoRaf = requestAnimationFrame(step);
    };
    autoRaf = requestAnimationFrame(step);
  }

  /*
    Programar es idempotente: si ya hay una pasada en curso o una esperando, no
    se toca. Sin esto, el observador de visibilidad (que dispara nada más
    empezar) pisaba la primera pasada y la retrasaba hasta el descanso largo.
  */
  function scheduleStroke(delay: number): void {
    if (autoBusy || autoTimer !== undefined) return;
    autoTimer = window.setTimeout(() => {
      autoTimer = undefined;
      autoStroke();
    }, delay);
  }

  function stopAuto(): void {
    window.clearTimeout(autoTimer);
    autoTimer = undefined;
    cancelAnimationFrame(autoRaf);
    autoBusy = false;
  }

  // ── Arranque ────────────────────────────────────────────────────────────
  resize();
  canvas.classList.add('ready');

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wantsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (finePointer) {
    /*
      La brocha no empieza a pintar hasta que el logotipo ha terminado de
      entrar.

      Cada punto del trazo repinta el canvas ENTERO —el hero completo, a dos
      píxeles por píxel de CSS— y en un ordenador el ratón se mueve desde el
      primer segundo, así que ese repintado caía justo encima de la entrada del
      logotipo. Es la razón principal de que en escritorio se viera a tirones y
      en móvil no: en móvil no hay puntero que lo dispare.

      La espera sale de `--hero-intro`, el mismo número que dura la entrada. Si
      se pide menos movimiento no hay entrada que proteger y pinta desde ya.
    */
    const intro = wantsMotion ? introMs() : 0;
    const listen = (): void => {
      hero.addEventListener('pointermove', (e) => addPoint(e.clientX, e.clientY), { passive: true });
    };
    if (intro > 0) window.setTimeout(listen, intro);
    else listen();
  } else if (wantsMotion) {
    // Primera pasada al poco de cargar, para que se vea la idea sin tocar nada.
    scheduleStroke(1400);
  }

  let resizeTimer: number | undefined;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  });
  // Al hacer scroll el hero cambia de sitio: basta con marcar la medida como
  // caducada y volver a tomarla en el siguiente punto del trazo.
  window.addEventListener('scroll', () => { rectDirty = true; }, { passive: true });

  // Si el hero deja de verse, se corta el bucle (y la pasada automática)
  // aunque quedara trazo vivo. Al volver, la pasada se reanuda.
  new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) {
        cancelAnimationFrame(rafId);
        stopAuto();
        running = false;
        trail = [];
        draw();
      } else if (!finePointer && wantsMotion) {
        // Al volver a entrar en pantalla, se reanuda sin pisar la pasada en
        // curso ni adelantar la primera, que ya está programada.
        scheduleStroke(AUTO_PAUSE);
      }
    },
    { threshold: 0 },
  ).observe(hero);
}
