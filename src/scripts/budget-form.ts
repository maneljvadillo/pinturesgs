/**
 * Formulario de presupuesto en el navegador.
 *
 * No envía nada a ningún servidor: valida, ordena los datos en un mensaje y
 * abre WhatsApp con todo escrito. La empresa prefirió esta vía antes que
 * montar un proveedor de correo (ver la nota larga en Budget.astro).
 */
import { showToast } from '~/scripts/toast';
import { LIMITS, EMAIL_RE, normalizePhone, displayPhone } from '~/lib/budget';

type Rule = (value: string) => string | null;

const required = (label: string): Rule => (v) => (v.trim() ? null : `${label} es obligatorio.`);

const RULES: Record<string, Rule[]> = {
  nombre: [
    required('El nombre'),
    (v) => (v.trim().length >= LIMITS.nombre.min ? null : 'Escribe al menos 2 caracteres.'),
    (v) => (v.length <= LIMITS.nombre.max ? null : 'El nombre es demasiado largo.'),
  ],
  telefono: [
    required('El teléfono'),
    // La MISMA función que usa el servidor: si aquí pasa, allí pasa.
    (v) => (normalizePhone(v) ? null : 'Revisa el teléfono: un número de Andorra son 6 cifras.'),
  ],
  email: [
    required('El email'),
    (v) => (EMAIL_RE.test(v.trim()) ? null : 'Revisa el email: falta algo.'),
  ],
  tipo: [required('El tipo de proyecto')],
  ubicacion: [(v) => (v.length <= LIMITS.ubicacion.max ? null : 'La ubicación es demasiado larga.')],
  descripcion: [(v) => (v.length <= LIMITS.descripcion.max ? null : 'La descripción es demasiado larga.')],
};

export function initBudgetForm(): void {
  const form = document.getElementById('budgetForm') as HTMLFormElement | null;
  if (!form) return;

  const statusEl = document.getElementById('formStatus')!;


  // ── Validación por campo ──────────────────────────────────────────────
  const fieldOf = (name: string) =>
    form.querySelector<HTMLElement>(`[name="${name}"]`)?.closest('.field') ?? null;
  const errorOf = (name: string) =>
    form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);

  function setError(name: string, message: string | null): void {
    const field = fieldOf(name);
    const slot = errorOf(name);
    const input = form!.querySelector<HTMLElement>(`[name="${name}"]`);
    if (slot) slot.textContent = message ?? '';
    field?.classList.toggle('invalid', Boolean(message));
    if (input) {
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message && slot?.id) input.setAttribute('aria-describedby', slot.id);
    }
  }

  function validateField(name: string): boolean {
    const input = form!.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${name}"]`);
    if (!input) return true;
    for (const rule of RULES[name] ?? []) {
      const msg = rule(input.value);
      if (msg) { setError(name, msg); return false; }
    }
    setError(name, null);
    return true;
  }

  Object.keys(RULES).forEach((name) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (!input) return;
    // Se valida al salir del campo, no mientras se escribe: menos ruido.
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      if (fieldOf(name)?.classList.contains('invalid')) validateField(name);
    });
  });

  // ── Envío por WhatsApp ────────────────────────────────────────────────
  /*
    Segunda vía, no sustituto. Abre WhatsApp con la solicitud ya escrita: el
    visitante sólo tiene que darle a enviar y le llega a la empresa al móvil,
    sin depender de que el correo salga.

    Se validan los mismos campos obligatorios antes de abrir nada: si no, se
    manda un mensaje a medias y hay que perseguir al cliente para completarlo.

    Las fotos NO viajan: wa.me sólo admite texto. Por eso se avisa en el
    mensaje de que hay imágenes, para que la empresa las pida si le hacen
    falta (o el visitante las adjunte a mano en el chat).
  */
  const waBtn = document.getElementById('waBtn') as HTMLButtonElement | null;

  /** Abre WhatsApp con la solicitud ya escrita. Devuelve false si falta algo. */
  function enviarPorWhatsApp(): boolean {
    if (!waBtn) return false;
    const obligatorios = ['nombre', 'telefono', 'email', 'tipo'];
    const primerFallo = obligatorios.find((n) => !validateField(n));
    if (primerFallo) {
      form!.querySelector<HTMLElement>(`[name="${primerFallo}"]`)?.focus();
      statusEl.className = 'form-status full error';
      statusEl.textContent = 'Completa nombre, teléfono, email y tipo antes de enviar.';
      statusEl.className = 'form-status full error';
      return false;
    }

    const val = (n: string) =>
      (form!.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${n}"]`)?.value ?? '').trim();

    const tel = normalizePhone(val('telefono'));

    const lineas = [
      `Hola, quiero pedir un presupuesto.`,
      ``,
      `Nombre: ${val('nombre')}`,
      `Teléfono: ${tel ? displayPhone(tel) : val('telefono')}`,
      `Email: ${val('email')}`,
      `Tipo de proyecto: ${val('tipo')}`,
    ];
    if (val('ubicacion')) lineas.push(`Ubicación: ${val('ubicacion')}`);
    if (val('descripcion')) lineas.push(``, val('descripcion'));

    const numero = waBtn.dataset.wa!;
    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(lineas.join('\n'))}`,
      '_blank',
      'noopener,noreferrer',
    );
    return true;
  }

  /*
    Se engancha al `submit` del formulario, no al `click` del botón: así
    también funciona al pulsar Intro dentro de un campo, que es como mucha
    gente envía un formulario.
  */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (enviarPorWhatsApp()) {
      statusEl.className = 'form-status full ok';
      statusEl.textContent = 'Abriendo WhatsApp con tu solicitud…';
      showToast('Solicitud preparada en WhatsApp.');
    }
  });

}
