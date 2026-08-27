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
} as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/*
  ── El teléfono ──────────────────────────────────────────────────────────
  El formulario enseña el +376 fijo al lado del campo, así que lo que escribe
  el visitante son sus seis cifras andorranas y nada más. Antes el marcador de
  posición ponía "+34 600 000 000", que además de ser el prefijo equivocado
  invitaba a escribir un número español.

  Se acepta también un internacional completo (empezando por +) para quien
  llame desde fuera: obligar a todo el mundo a tener número andorrano dejaría
  fuera a un cliente español con una obra en Andorra, que es un caso real.

  Estas dos funciones son la ÚNICA fuente de verdad, y las usan el navegador y
  el servidor. Si sólo validara el navegador, cualquiera podría saltárselo; si
  cada lado tuviera su regla, una aceptaría lo que la otra rechaza.
*/

/** Seis cifras: un número andorrano sin prefijo. */
export const AD_PHONE_RE = /^\d{6}$/;
/** Un internacional completo, en E.164 (entre 8 y 15 cifras tras el +). */
export const INTL_PHONE_RE = /^\+\d{8,15}$/;

/**
 * Deja el teléfono en E.164 (`+376608908`) o devuelve `null` si no vale.
 * Se le quitan espacios, puntos, guiones y paréntesis antes de mirarlo: la
 * gente escribe "608 908", "608-908" y "(376) 608908" y las tres son válidas.
 */
export function normalizePhone(raw: string): string | null {
  const clean = raw.replace(/[\s().\-\u00A0]/g, '');
  if (AD_PHONE_RE.test(clean)) return `+376${clean}`;
  if (INTL_PHONE_RE.test(clean)) return clean;
  // "+376608908" ya viene entero; "376608908" es lo mismo sin el +.
  if (/^376\d{6}$/.test(clean)) return `+${clean}`;
  return null;
}

/** Lo mismo al revés, para leerlo: `+376608908` → `+376 608 908`. */
export function displayPhone(e164: string): string {
  if (e164.startsWith('+376') && e164.length === 10) {
    const n = e164.slice(4);
    return `+376 ${n.slice(0, 3)} ${n.slice(3)}`;
  }
  return e164;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} kB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

