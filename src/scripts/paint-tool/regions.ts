/**
 * Construcción de zonas pintables.
 *
 * Cada zona necesita tres lienzos del tamaño de la foto:
 *
 *   shape  — alfa: dónde está la zona. Para la pared del fondo viene de la
 *            máscara generada en build (scripts/build-wall-mask.mjs); para las
 *            zonas que marca el usuario es un rectángulo.
 *   shade  — gris: el sombreado real de la foto, normalizado contra su punto
 *            más claro. Es lo que hace que el color respete sombras y textura.
 *   paint  — alfa: dónde ha pintado el usuario. Empieza vacío.
 *
 * SOBRE EL SOMBREADO
 * El color final de un píxel es  color × (L / L_ref)  donde L es la luminancia
 * original y L_ref el percentil 98 de la zona. Al normalizar contra el punto
 * MÁS CLARO el factor nunca pasa de 1, así que basta un `multiply` de canvas
 * (acelerado por GPU) en lugar de recorrer píxeles en cada fotograma. El
 * resultado es el de la pintura real: color pleno donde da la luz, y más
 * oscuro en la sombra, conservando el grano del ladrillo.
 */
import type { FractionRect, Region } from './types';
import { ctx2d, makeCanvas, percentileU8 } from './canvas-utils';

/** Luminancia por píxel de la foto base, calculada una sola vez. */
export type LumaMap = { data: Uint8Array; width: number; height: number };

export function buildLumaMap(photo: HTMLImageElement | HTMLCanvasElement, w: number, h: number): LumaMap {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(photo, 0, 0, w, h);
  const { data } = g.getImageData(0, 0, w, h);
  const luma = new Uint8Array(w * h);
  for (let i = 0, p = 0; i < luma.length; i++, p += 4) {
    luma[i] = (data[p]! * 299 + data[p + 1]! * 587 + data[p + 2]! * 114) / 1000;
  }
  return { data: luma, width: w, height: h };
}

/** Convierte una imagen en escala de grises en una máscara alfa. */
export function maskToAlpha(mask: HTMLImageElement, w: number, h: number): HTMLCanvasElement {
  const src = makeCanvas(w, h);
  const sg = src.getContext('2d', { willReadFrequently: true })!;
  sg.drawImage(mask, 0, 0, w, h);
  const img = sg.getImageData(0, 0, w, h);
  const d = img.data;
  for (let p = 0; p < d.length; p += 4) {
    // El gris de la máscara pasa a ser el alfa; el color, blanco.
    d[p + 3] = d[p]!;
    d[p] = 255; d[p + 1] = 255; d[p + 2] = 255;
  }
  const out = makeCanvas(w, h);
  ctx2d(out).putImageData(img, 0, 0);
  return out;
}

/** Máscara alfa rectangular, a partir de fracciones del encuadre. */
export function rectToAlpha(rect: FractionRect, w: number, h: number): HTMLCanvasElement {
  const c = makeCanvas(w, h);
  const g = ctx2d(c);
  g.fillStyle = '#fff';
  g.fillRect(Math.round(rect.x * w), Math.round(rect.y * h), Math.round(rect.w * w), Math.round(rect.h * h));
  return c;
}

/**
 * Mapa de sombreado de una zona: gris = L/L_ref, acotado a 1.
 * Fuera de la zona se deja blanco (factor 1); da igual, porque al componer se
 * recorta con la máscara de forma.
 */
export function buildShade(luma: LumaMap, shape: HTMLCanvasElement): HTMLCanvasElement {
  const { width: w, height: h, data: L } = luma;

  const sg = shape.getContext('2d', { willReadFrequently: true })!;
  const alpha = sg.getImageData(0, 0, w, h).data;

  // Referencia = percentil 98 de la luminancia DENTRO de la zona.
  const inside = new Uint8Array(w * h);
  let n = 0;
  for (let i = 0; i < w * h; i++) {
    if (alpha[i * 4 + 3]! > 200) inside[n++] = L[i]!;
  }
  // Zona vacía: sin referencia fiable, se deja el sombreado neutro.
  const ref = n > 0 ? Math.max(percentileU8(inside, n, 0.98), 1) : 255;

  const out = makeCanvas(w, h);
  const og = ctx2d(out);
  const img = og.createImageData(w, h);
  const d = img.data;
  for (let i = 0, p = 0; i < w * h; i++, p += 4) {
    const v = Math.min(255, Math.round((L[i]! / ref) * 255));
    d[p] = v; d[p + 1] = v; d[p + 2] = v; d[p + 3] = 255;
  }
  og.putImageData(img, 0, 0);
  return out;
}

export function makeRegion(
  id: string,
  label: string,
  kind: Region['kind'],
  shape: HTMLCanvasElement,
  luma: LumaMap,
  rect?: FractionRect,
): Region {
  return {
    id, label, kind, rect,
    color: null,
    shape,
    shade: buildShade(luma, shape),
    paint: makeCanvas(shape.width, shape.height),
  };
}
