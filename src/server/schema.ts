/**
 * Validación en el servidor de la solicitud de presupuesto.
 * Nunca se confía en lo que valida el navegador: esto es la única fuente
 * de verdad de lo que se acepta.
 */
import { z } from 'zod';
import { EMAIL_RE, LIMITS, PHONE_RE } from '~/lib/budget';
import { PROJECT_TYPES } from '~/data/site';

const trimmed = z.string().trim();

export const budgetSchema = z.object({
  nombre: trimmed
    .min(LIMITS.nombre.min, 'Escribe tu nombre.')
    .max(LIMITS.nombre.max, 'El nombre es demasiado largo.'),

  telefono: trimmed
    .min(LIMITS.telefono.min, 'Escribe un teléfono de contacto.')
    .max(LIMITS.telefono.max, 'El teléfono es demasiado largo.')
    .regex(PHONE_RE, 'Revisa el teléfono: parece incompleto.'),

  email: trimmed
    .max(LIMITS.email.max, 'El email es demasiado largo.')
    .regex(EMAIL_RE, 'Revisa el email: falta algo.'),

  tipo: z.enum(PROJECT_TYPES, { message: 'Elige un tipo de proyecto.' }),

  ubicacion: trimmed.max(LIMITS.ubicacion.max, 'La ubicación es demasiado larga.').optional().default(''),
  descripcion: trimmed.max(LIMITS.descripcion.max, 'La descripción es demasiado larga.').optional().default(''),

  /** Resumen del diseño hecho en "Pinta el teu espai". Opcional. */
  diseno: trimmed.max(LIMITS.diseno.max).optional().default(''),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

/** Convierte los errores de Zod en { campo: mensaje } para pintarlos en el form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    out[key] ??= issue.message;
  }
  return out;
}
