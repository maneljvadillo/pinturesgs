/**
 * Cursor de brocha. Persigue al puntero con un poco de retardo y se inclina
 * según la dirección del movimiento, como si arrastrase pintura.
 *
 * Sólo se activa con puntero fino y si el usuario no ha pedido menos
 * movimiento. Vive únicamente en el hero de la home (`.brush-zone`).
 *
 * Sobre la fluidez: el suavizado es exponencial y depende del tiempo real
 * transcurrido entre fotogramas, no de un factor fijo por frame. Con un factor
 * fijo, cualquier fotograma largo (una pantalla a 120 Hz, una pestaña que
 * recupera el foco, un repintado pesado) mueve la brocha lo mismo que uno
 * corto y se percibe como un tirón. El ángulo también se interpola, tomando
 * siempre el camino corto, para que no dé un volantazo al cruzar los ±180°.
 */

/** Constante de tiempo del seguimiento en ms: cuanto mayor, más "pesada" va. */
const FOLLOW_TAU = 60;
/** Constante de tiempo del giro. Más lenta que la posición: gira sin nervio. */
const ANGLE_TAU = 90;
/** Por debajo de esta velocidad (px/s) no se recalcula el ángulo: en reposo
 *  la dirección es ruido y la brocha temblaría. */
const MIN_SPEED = 40;
/** Distancia (px) a la que se considera que ya ha alcanzado al puntero. */
const SETTLED = 0.05;

export function initBrushCursor(): void {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wantsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brush = document.getElementById('brushCursor');
  if (!brush || !canHover || !wantsMotion) return;

  const zones = document.querySelectorAll<HTMLElement>('.brush-zone');
  if (zones.length === 0) return;

  let targetX = -1000, targetY = -1000;
  let x = -1000, y = -1000;
  let angle = 0;
  let targetAngle = 0;
  let seeded = false;
  let running = false;
  let rafId = 0;
  let lastT = 0;

  /** ¿El puntero está sobre algo pulsable (enlace, botón, control)? */
  function overInteractive(target: EventTarget | null): boolean {
    return target instanceof Element && !!target.closest('a, button, input, select, textarea, [role="button"]');
  }

  /** Devuelve `b` reescrito al giro más próximo a `a` (evita el salto ±360°). */
  function nearestTurn(a: number, b: number): number {
    let d = (b - a) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return a + d;
  }

  function render(): void {
    brush!.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0) rotate(${angle.toFixed(2)}deg)`;
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

    // La velocidad del propio seguimiento marca hacia dónde apunta la brocha.
    const speed = (dist / Math.max(dt, 1)) * 1000;
    if (speed > MIN_SPEED) {
      targetAngle = nearestTurn(angle, (Math.atan2(dy, dx) * 180) / Math.PI + 45);
    }

    x += dx * kPos;
    y += dy * kPos;
    angle += (targetAngle - angle) * kAng;

    render();

    // Se para sola cuando ya está encima del puntero y no le queda giro.
    if (dist < SETTLED && Math.abs(targetAngle - angle) < 0.05) {
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
    zone.addEventListener('pointerleave', () => brush.classList.remove('show'));

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
          cancelAnimationFrame(rafId);
          running = false;
        }
      },
      { threshold: 0 },
    ).observe(zone);
  });
}
