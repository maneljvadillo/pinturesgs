/** Menú: fondo sólido al bajar y desplegable en móvil. */
export function initNav(): void {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!header || !toggle || !links) return;

  // El scroll dispara muy a menudo: se agrupa en un rAF.
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('solid', window.scrollY > 40);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setOpen = (open: boolean) => {
    links.classList.toggle('open', open);
    /*
      El header se marca mientras el menú está abierto porque el CSS necesita
      apagarle el `backdrop-filter`. Ver la explicación larga en Header.astro:
      en resumen, esa propiedad rompe el `position: fixed` del desplegable.
    */
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    // Con el menú a pantalla completa, el fondo no debe poder desplazarse.
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.querySelectorAll('[data-nav]').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      setOpen(false);
      (toggle as HTMLElement).focus();
    }
  });
}
