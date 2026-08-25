/**
 * Reglas del formulario de presupuesto compartidas por cliente y servidor.
 * Tenerlas en un solo sitio evita que el navegador acepte algo que el servidor
 * luego rechaza (o al revés).
 */

export const MAX_FILES = 5;
/** Límite total de adjuntos. Vercel corta el cuerpo de la petición sobre los
 *  4.5 MB, así que se avisa antes de llegar ahí. */
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export const LIMITS = {
  nombre: { min: 2, max: 80 },
  telefono: { min: 6, max: 30 },
  email: { max: 120 },
  ubicacion: { max: 120 },
  descripcion: { max: 3000 },
  diseno: { max: 400 },
} as const;

/** Un teléfono utilizable: dígitos suficientes, con los símbolos habituales. */
export const PHONE_RE = /^[+()\d][\d\s().-]{5,}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} kB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
