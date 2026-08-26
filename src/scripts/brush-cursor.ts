/**
 * Cursor de brocha. Persigue al puntero y se inclina según el movimiento, como
 * si arrastrase pintura.
 *
 * Sólo se activa con puntero fino y si el usuario no ha pedido menos
 * movimiento. Vive únicamente en el hero de la home (`.brush-zone`).
 *
 * ── Por qué se maneja bien ────────────────────────────────────────────────
 * Tres decisiones, todas sobre lo mismo: que la brocha esté DONDE está el
 * ratón y haga lo que se espera.
 *
 *   1. El ancla es la PUNTA de las cerdas, no la esquina del icono. El icono
 *      declara `--tip-x` / `--tip-y` y aquí se leen una sola vez, así no
 *      pueden desincronizarse del dibujo. Con el ancla en la esquina, la
 *      pintura salía a cuarenta píxeles del puntero.
 *   2. La brocha se INCLINA, no gira. Antes apuntaba en la dirección del
 *      movimiento dando vueltas completas: cruzar la pantalla en diagonal la
 *      ponía boca abajo. Ahora se ladea como mucho MAX_TILT grados sobre su
 *      posición de reposo, y siempre pivotando sobre la punta.
 *   3. El seguimiento es mucho más corto (FOLLOW_TAU). Algo de retardo da
 *      peso; 60 ms daba la sensación de arrastrar la brocha con una goma.
 *
 * Sobre la fluidez: el suavizado es exponencial y depende del tiempo real
 * transcurrido entre fotogramas, no de un factor fijo por frame. Con un factor
 * fijo, cualquier fotograma largo (una pantalla a 120 Hz, una pestaña que
 * recupera el foco, un repintado pesado) mueve la brocha lo mismo que uno
 * corto y se percibe como un tirón.
 */

/** Constante de tiempo del seguimiento en ms: cuanto mayor, más "pesada" va. */
const FOLLOW_TAU = 22;
/** Constante de tiempo del ladeo. Más lenta que la posición: se ladea sin
 *  nervio y vuelve sola a la vertical al parar. */
const ANGLE_TAU = 95;
/** Constante de tiempo con la que se apaga la velocidad cuando dejan de
 *  llegar eventos. Es lo que endereza la brocha al soltar el ratón. */
const VEL_TAU = 90;
/** Ladeo máximo en grados. Una brocha en la mano se ladea; no da vueltas. */
const MAX_TILT = 26;
/** Grados de ladeo por cada px/s de velocidad. A ~870 px/s ya está al tope. */
const TILT_PER_VX = 0.03;
/** El movimiento vertical influye menos: subir o bajar no ladea una brocha
 *  tanto como barrer de lado. */
const TILT_PER_VY = 0.012;
/** Cuánto pesa cada evento nuevo en la velocidad suavizada. */
const VEL_SMOOTH = 0.35;
/** Distancia (px) a la que se considera que ya ha alcanzado al puntero. */
const SETTLED = 0.05;
/** Ladeo (grados) por debajo del cual se considera que ya está enderezada. */
const TILT_SETTLED = 0.08;

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function initBrushCursor(): void {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wantsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brush = document.getElementById('brushCursor');
  if (!brush || !canHover || !wantsMotion) return;

  const zones = document.querySelectorAll<HTMLElement>('.brush-zone');
  if (zones.length === 0) return;

  /*
    La punta la declara el propio icono. Se lee una vez al arrancar: si el
    dibujo cambia de tamaño o de ángulo, basta con tocar el CSS.
  */
  const styles = getComputedStyle(brush);
  const tipX = parseFloat(styles.getPropertyValue('--tip-x')) || 0;
  const tipY = parseFloat(styles.getPropertyValue('--tip-y')) || 0;

  let targetX = -1000, targetY = -1000;
  let x = -1000, y = -1000;
  /** Velocidad suavizada del puntero, en px/s. Marca el ladeo. */
  let vx = 0, vy = 0;
  let tilt = 0;
  let tiltTarget = 0;
  let seeded = false;
  let running = false;
  let rafId = 0;
  let lastT = 0;
  /** Último evento de puntero, para derivar la velocidad. */
  let evT = 0, evX = 0, evY = 0;

  /** ¿El puntero está sobre algo pulsable (enlace, botón, control)? */
  function overInteractive(target: EventTarget | null): boolean {
    return target instanceof Element && !!target.closest('a, button, input, select, textarea, [role="button"]');
  }

  function render(): void {
    brush!.style.transform =
      `translate3d(${(x - tipX).toFixed(2)}px, ${(y - tipY).toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
  }

  function frame(now: number): void {
    const dt = Math.min(now - lastT, 64); // un frame perdido no da un salto
    lastT = now;

    // Suavizado exponencial: la fracción recorrida depende del tiempo real.
    const kPos = 1 - Math.exp(-dt / FOLLOW_TAU);
    const kAng = 1 - Math.exp(-dt / ANGLE_TAU);

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.hypot(dx, dy);

    x += dx * kPos;
    y += dy * kPos;

    /*
      La velocidad se apaga sola. Sin esto, al soltar el ratón la brocha se
      quedaba ladeada en el último ángulo, como colgada.
    */
    const decay = Math.exp(-dt / VEL_TAU);
    vx *= decay;
    vy *= decay;

    tiltTarget = clamp(vx * TILT_PER_VX - vy * TILT_PER_VY, -MAX_TILT, MAX_TILT);
    tilt += (tiltTarget - tilt) * kAng;

    render();

    // Se para sola cuando ya está encima del puntero y enderezada.
    if (dist < SETTLED && Math.abs(tilt) < TILT_SETTLED && Math.abs(tiltTarget) < TILT_SETTLED) {
      tilt = 0;
      render();
      running = false;
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  function kick(): void {
    if (running) return;
    running = true;
    lastT = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  document.addEventListener(
    'pointermove',
    (e) => {
      const now = performance.now();
      const gap = now - evT;
      // Un hueco largo no es movimiento: es que el ratón se había parado.
      if (evT > 0 && gap > 0 && gap < 120) {
        const ivx = ((e.clientX - evX) / gap) * 1000;
        const ivy = ((e.clientY - evY) / gap) * 1000;
        vx += (ivx - vx) * VEL_SMOOTH;
        vy += (ivy - vy) * VEL_SMOOTH;
      }
      evT = now;
      evX = e.clientX;
      evY = e.clientY;

      targetX = e.clientX;
      targetY = e.clientY;
      // El primer movimiento coloca la brocha donde está el puntero: si no,
      // entraría volando desde fuera de la pantalla.
      if (!seeded) {
        seeded = true;
        x = targetX;
        y = targetY;
        render();
      }
      kick();
    },
    { passive: true },
  );

  zones.forEach((zone) => {
    // `pointerenter` no basta: si la página carga con el ratón ya dentro del
    // hero, ese evento no llega nunca y la brocha no aparecía hasta salir y
    // volver a entrar. Con `pointermove` se muestra en cuanto se mueve.
    const show = (e: PointerEvent) => {
      if (overInteractive(e.target)) return;
      brush.classList.add('show');
    };
    zone.addEventListener('pointerenter', show);
    zone.addEventListener('pointermove', show);
    zone.addEventListener('pointerleave', () => {
      brush.classList.remove('show');
      brush.classList.remove('press');
    });

    // Aplastar la brocha al pulsar. Es la única señal de que el clic ha
    // entrado: dentro del hero no hay cursor del sistema que cambie.
    zone.addEventListener('pointerdown', () => brush.classList.add('press'));
    zone.addEventListener('pointerup', () => brush.classList.remove('press'));
    zone.addEventListener('pointercancel', () => brush.classList.remove('press'));

    /*
      Sobre un botón o un enlace mandan la mano del sistema y la brocha se
      esconde. Antes se veían las dos a la vez: el navegador pinta su cursor de
      "pulsable" (los <a> lo traen de serie) y encima quedaba la brocha.
    */
    zone.addEventListener('pointerover', (e) => {
      if (overInteractive(e.target)) brush.classList.remove('show');
    });

    // Si la zona deja de verse (scroll sin mover el ratón) la brocha se va con
    // ella: no debe quedarse flotando sobre el resto de la página.
    new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          brush.classList.remove('show');
          brush.classList.remove('press');
          cancelAnimationFrame(rafId);
          running = false;
        }
      },
      { threshold: 0 },
    ).observe(zone);
  });
}
