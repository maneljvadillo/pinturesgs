/** Utilidades de lienzo para la herramienta de pintar. */

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const g = c.getContext('2d', { willReadFrequently: false });
  if (!g) throw new Error('No hay contexto 2D disponible.');
  return g;
}

/** Copia un lienzo en uno nuevo del mismo tamaño. */
export function cloneCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = makeCanvas(src.width, src.height);
  ctx2d(out).drawImage(src, 0, 0);
  return out;
}

/** Lienzo vacío del mismo tamaño que otro. */
export function emptyLike(src: HTMLCanvasElement): HTMLCanvasElement {
  return makeCanvas(src.width, src.height);
}

/**
 * Carga una imagen y la deja lista para dibujarla en un lienzo.
 *
 * Se resuelve con el evento `load`, no con `decode()`: si la pestaña está en
 * segundo plano, el navegador puede dejar la promesa de `decode()` pendiente
 * indefinidamente porque la imagen no se va a pintar, y la herramienta se
 * quedaba colgada en "Preparando la pared…". `load` llega igual esté la
 * pestaña visible o no.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.addEventListener('load', () => resolve(img), { once: true });
    img.addEventListener('error', () => reject(new Error(`No se ha podido cargar ${src}`)), { once: true });
    img.src = src;
    // Si venía de la caché, puede estar lista antes de enganchar los eventos.
    if (img.complete && img.naturalWidth > 0) resolve(img);
  });
}

/** #rrggbb -> [r,g,b]. Acepta también #rgb. */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = Number.parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Percentil de un array de números SIN ordenarlo entero: se usa sobre cientos
 * de miles de píxeles, y un histograma de 256 cubos es suficiente y mucho más
 * rápido que un sort.
 */
export function percentileU8(values: Uint8Array, count: number, p: number): number {
  const hist = new Uint32Array(256);
  for (let i = 0; i < count; i++) hist[values[i]!]!++;
  const target = Math.floor(count * p);
  let acc = 0;
  for (let v = 0; v < 256; v++) {
    acc += hist[v]!;
    if (acc >= target) return v;
  }
  return 255;
}
