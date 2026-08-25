/**
 * Resuelve una clave del manifiesto (src/data/photos.ts) al archivo real, para
 * que Astro pueda optimizarlo (AVIF/WebP responsive) en tiempo de build.
 *
 * Se usa `import.meta.glob` eager porque son pocas imágenes y así una clave que
 * no existe se detecta al construir, no en producción.
 */
import type { ImageMetadata } from 'astro';
import { PHOTO_BY_KEY } from '~/data/photos';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/photos/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const byKey = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const key = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  byKey.set(key, mod.default);
}

/** La imagen de una clave, o `undefined` si todavía no está en disco. */
export function photoSrc(key: string): ImageMetadata | undefined {
  return byKey.get(key);
}

/** Texto alternativo declarado en el manifiesto. */
export function photoAlt(key: string): string {
  return PHOTO_BY_KEY[key]?.alt ?? '';
}

/** ¿Falta alguna foto declarada en el manifiesto? Útil al arrancar en local. */
export function missingPhotos(): string[] {
  return Object.keys(PHOTO_BY_KEY).filter((k) => !byKey.has(k));
}
