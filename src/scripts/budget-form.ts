/**
 * Formulario de presupuesto en el navegador.
 *
 * El <form> ya funciona sin JavaScript (method="post" a la ruta de la API).
 * Esto añade: validación inmediata, control de los adjuntos, arrastrar y
 * soltar, y envío por fetch para no recargar la página.
 */
import { showToast } from '~/scripts/toast';
import {
  MAX_FILES, MAX_TOTAL_BYTES, ACCEPTED_TYPES, LIMITS,
  EMAIL_RE, formatBytes, normalizePhone, displayPhone,
} from '~/lib/budget';

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
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
  const fileInput = document.getElementById('f-fotos') as HTMLInputElement;
  const fileLabel = document.getElementById('fileLabel')!;
  const fileDrop = document.getElementById('fileDrop')!;
  const renderedAt = document.getElementById('renderedAt') as HTMLInputElement;

  // Marca cuándo se pintó el formulario: un envío instantáneo delata un bot.
  renderedAt.value = String(Date.now());


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

  // ── Adjuntos ──────────────────────────────────────────────────────────
  function describeFiles(files: FileList | null): void {
    if (!files || files.length === 0) {
      fileLabel.textContent = 'Haz clic o arrastra tus imágenes aquí';
      setError('fotos', null);
      return;
    }
    const list = Array.from(files);
    const total = list.reduce((n, f) => n + f.size, 0);

    const badType = list.find((f) => f.type && !ACCEPTED_TYPES.includes(f.type));
    if (badType) { setError('fotos', `"${badType.name}" no es una imagen admitida.`); return; }
    if (list.length > MAX_FILES) { setError('fotos', `Máximo ${MAX_FILES} imágenes.`); return; }
    if (total > MAX_TOTAL_BYTES) {
      setError('fotos', `Las imágenes suman ${formatBytes(total)}; el máximo es ${formatBytes(MAX_TOTAL_BYTES)}.`);
      return;
    }
    setError('fotos', null);
    fileLabel.textContent =
      list.length === 1
        ? `1 imagen · ${formatBytes(total)}`
        : `${list.length} imágenes · ${formatBytes(total)}`;
  }

  fileInput.addEventListener('change', () => describeFiles(fileInput.files));

  ['dragenter', 'dragover'].forEach((ev) =>
    fileDrop.addEventListener(ev, (e) => { e.preventDefault(); fileDrop.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    fileDrop.addEventListener(ev, (e) => { e.preventDefault(); fileDrop.classList.remove('dragover'); }));
  fileDrop.addEventListener('drop', (e) => {
    const dt = (e as DragEvent).dataTransfer;
    if (!dt?.files.length) return;
    fileInput.files = dt.files;
    describeFiles(dt.files);
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
      return false;
    }

    const val = (n: string) =>
      (form!.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${n}"]`)?.value ?? '').trim();

    const tel = normalizePhone(val('telefono'));
    const nFotos = fileInput.files?.length ?? 0;

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
    if (nFotos > 0) {
      lineas.push(``, `(Tengo ${nFotos} ${nFotos === 1 ? 'foto' : 'fotos'} para enseñaros; os las paso por aquí.)`);
    }

    const numero = waBtn.dataset.wa!;
    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(lineas.join('\n'))}`,
      '_blank',
      'noopener,noreferrer',
    );
    return true;
  }

  waBtn?.addEventListener('click', () => { enviarPorWhatsApp(); });

  // ── Envío ─────────────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const names = Object.keys(RULES);
    const firstBad = names.find((n) => !validateField(n));
    if (firstBad) {
      form.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      statusEl.className = 'form-status full error';
      statusEl.textContent = 'Revisa los campos marcados antes de enviar.';
      return;
    }
    if (errorOf('fotos')?.textContent) {
      statusEl.className = 'form-status full error';
      statusEl.textContent = 'Revisa las imágenes adjuntas.';
      return;
    }

    submitBtn.disabled = true;
    statusEl.className = 'form-status full';
    statusEl.textContent = 'Enviando…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean; message?: string; errors?: Record<string, string>; via?: string;
      };

      if (!res.ok || !data.ok) {
        if (data.errors) {
          for (const [name, msg] of Object.entries(data.errors)) setError(name, msg);
        }
        /*
          El servidor puede decir que hay otra salida. Pasa cuando el correo
          no está configurado: en vez de dejar al cliente delante de un error
          rojo sin nada que hacer, se le termina la solicitud por WhatsApp con
          todo lo que ya había escrito.

          No se abre WhatsApp solo: entre el clic y esta respuesta hay una
          espera, y los navegadores bloquean las ventanas que se abren fuera
          de un gesto del usuario. Se le pide un clic más, que además es lo
          honesto: nadie quiere que una web le abra WhatsApp sin avisar.
        */
        if (data.via === 'whatsapp' && waBtn) {
          statusEl.className = 'form-status full';
          statusEl.textContent = data.message ?? 'Termínalo por WhatsApp y nos llega al momento.';
          waBtn.classList.add('urge');
          waBtn.focus();
          return;
        }
        statusEl.className = 'form-status full error';
        statusEl.textContent = data.message ?? 'No hemos podido enviar la solicitud. Inténtalo de nuevo.';
        return;
      }

      form.reset();
      describeFiles(null);
      statusEl.className = 'form-status full ok';
      statusEl.textContent = data.message ?? '¡Recibido! Te responderemos lo antes posible.';
      showToast('Solicitud enviada. Gracias.');
    } catch {
      statusEl.className = 'form-status full error';
      statusEl.textContent =
        'No hemos podido conectar. Revisa tu conexión o escríbenos directamente.';
    } finally {
      submitBtn.disabled = false;
      renderedAt.value = String(Date.now());
    }
  });
}
