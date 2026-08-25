/**
 * Cursor de brocha. Persigue al puntero con un poco de retardo y se inclina
 * según la dirección del movimiento, como si arrastrase pintura.
 *
 * Sólo se activa con puntero fino y si el usuario no ha pedido menos
 * movimiento. El bucle se para solo cuando el cursor alcanza al puntero.
 */
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
  let running = false;

  const loop = () => {
    x += (targetX - x) * 0.35;
    y += (targetY - y) * 0.35;
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.6) angle = (Math.atan2(dy, dx) * 180) / Math.PI + 45;

    brush.style.transform = `translate(${x - 4}px, ${y - 4}px) rotate(${angle}deg)`;

    if (dist < 0.2) { running = false; return; }
    requestAnimationFrame(loop);
  };

  const kick = () => {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  };

  document.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    kick();
  }, { passive: true });

  zones.forEach((zone) => {
    zone.addEventListener('pointerenter', () => brush.classList.add('show'));
    zone.addEventListener('pointerleave', () => brush.classList.remove('show'));
  });
}
