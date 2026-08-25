/**
 * Revelado al hacer scroll.
 *
 * Dos cosas con el mismo observador:
 *   · Los puntos del proceso se encienden al llegar a pantalla (`.lit`).
 *   · Todo lo marcado con `data-reveal` entra con una subida corta (`.is-in`).
 *
 * La clase `reveal-ready` se pone en el <html> ANTES de observar nada: el CSS
 * sólo esconde los elementos si esa clase está puesta, así que si este script
 * no llega a ejecutarse la web se ve entera igualmente. Cada elemento se deja
 * de observar en cuanto entra: no hay animación de salida ni trabajo de más al
 * volver a subir.
 */
export function initRevealOnScroll(): void {
  const steps = document.querySelectorAll<HTMLElement>('.process-step');
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], .section-head');

  if (!('IntersectionObserver' in window)) {
    steps.forEach((s) => s.classList.add('lit'));
    targets.forEach((t) => t.classList.add('is-in'));
    return;
  }

  document.documentElement.classList.add('reveal-ready');

  const reveal = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        reveal.unobserve(entry.target);
      }
    },
    // Un pelín antes de que asome del todo: así el movimiento acompaña al
    // scroll en vez de dispararse cuando el bloque ya está a la vista.
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  targets.forEach((t) => reveal.observe(t));

  if (steps.length === 0) return;

  const lit = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('lit');
        lit.unobserve(entry.target);
      }
    },
    { threshold: 0.5 },
  );
  steps.forEach((s) => lit.observe(s));
}
