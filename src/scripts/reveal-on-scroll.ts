/**
 * Enciende los puntos del proceso a medida que entran en pantalla.
 * Un solo observer para todos los pasos, y cada uno se deja de observar en
 * cuanto se ilumina.
 */
export function initRevealOnScroll(): void {
  const steps = document.querySelectorAll<HTMLElement>('.process-step');
  if (steps.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    steps.forEach((s) => s.classList.add('lit'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('lit');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.5 },
  );
  steps.forEach((s) => observer.observe(s));
}
