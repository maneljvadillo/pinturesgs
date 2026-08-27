/**
 * POST /api/presupuesto — recibe el formulario y envía el aviso por email.
 *
 * Es la ÚNICA ruta con servidor de todo el sitio; el resto es estático.
 *
 * Responde JSON cuando lo piden por fetch, y redirige con un mensaje cuando
 * llega de un envío normal de formulario (sin JavaScript). Así el formulario
 * sigue funcionando con JS desactivado.
 */
import type { APIRoute } from 'astro';
import { budgetSchema, fieldErrors } from '~/server/schema';
import { getMailer, mailerIsLive, type Attachment } from '~/server/mailer';
import { CONTACT } from '~/data/site';
import { renderHtml, renderText } from '~/server/render-email';
import { ACCEPTED_TYPES, MAX_FILES, MAX_TOTAL_BYTES, formatBytes } from '~/lib/budget';

export const prerender = false;

/** Un humano tarda más que esto en rellenar el formulario. */
const MIN_FILL_MS = 3000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

export const POST: APIRoute = async ({ request }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json');

  const fail = (
    message: string,
    status = 400,
    errors?: Record<string, string>,
    /** Salida alternativa que el navegador puede ofrecer. Hoy sólo 'whatsapp'. */
    via?: 'whatsapp',
  ) =>
    wantsJson
      ? json({ ok: false, message, errors, via }, status)
      : new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    // Suele significar que los adjuntos han superado el límite del servidor.
    return fail(
      `No hemos podido leer el envío. Si has adjuntado fotos, prueba con menos de ${formatBytes(MAX_TOTAL_BYTES)} en total.`,
      413,
    );
  }

  // ── Antispam ────────────────────────────────────────────────────────────
  // Campo trampa: invisible para las personas, irresistible para los bots.
  if (String(form.get('website') ?? '').trim() !== '') {
    // Se responde "ok" a propósito: si el bot ve un error, reintenta.
    return wantsJson ? json({ ok: true, message: 'Recibido.' }) : new Response(null, { status: 303, headers: { Location: '/gracias' } });
  }
  const renderedAt = Number(form.get('renderedAt'));
  if (Number.isFinite(renderedAt) && Date.now() - renderedAt < MIN_FILL_MS) {
    return fail('El envío ha llegado demasiado rápido. Inténtalo de nuevo.', 429);
  }

  // ── Validación ──────────────────────────────────────────────────────────
  const parsed = budgetSchema.safeParse({
    nombre: form.get('nombre') ?? '',
    telefono: form.get('telefono') ?? '',
    email: form.get('email') ?? '',
    tipo: form.get('tipo') ?? '',
    ubicacion: form.get('ubicacion') ?? '',
    descripcion: form.get('descripcion') ?? '',
  });
  if (!parsed.success) {
    return fail('Revisa los campos marcados.', 422, fieldErrors(parsed.error));
  }
  const data = parsed.data;

  // ── Adjuntos ────────────────────────────────────────────────────────────
  const files = form.getAll('fotos').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) {
    return fail(`Máximo ${MAX_FILES} imágenes.`, 422, { fotos: `Máximo ${MAX_FILES} imágenes.` });
  }
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > MAX_TOTAL_BYTES) {
    const msg = `Las imágenes suman ${formatBytes(total)}; el máximo es ${formatBytes(MAX_TOTAL_BYTES)}.`;
    return fail(msg, 422, { fotos: msg });
  }
  const badType = files.find((f) => f.type && !ACCEPTED_TYPES.includes(f.type));
  if (badType) {
    const msg = `"${badType.name}" no es una imagen admitida.`;
    return fail(msg, 422, { fotos: msg });
  }

  const attachments: Attachment[] = [];
  for (const f of files) {
    attachments.push({
      // Se descarta cualquier ruta que venga en el nombre del archivo.
      filename: f.name.replace(/[/\\]/g, '_').slice(-80),
      content: Buffer.from(await f.arrayBuffer()),
    });
  }

  // ── Envío ───────────────────────────────────────────────────────────────
  const meta = {
    recibido: new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Madrid' }),
    adjuntos: attachments.length,
  };

  /*
    En producción, sin proveedor de correo configurado NO se le dice al
    visitante que su solicitud ha llegado. El mailer de desarrollo escribe el
    aviso por consola y devuelve éxito, así que sin esta comprobación la web
    respondería "¡Recibido!" a un cliente cuya petición no ha visto nadie: se
    perderían clientes en silencio, que es peor que un formulario que falla.

    En desarrollo se deja pasar, que es justo para lo que existe ese mailer.
  */
  if (import.meta.env.PROD && !mailerIsLive()) {
    console.error('[presupuesto] RESEND_API_KEY sin configurar en producción: no se puede entregar la solicitud.');
    /*
      `via: 'whatsapp'` le dice al navegador que esto NO es un error del que
      no se pueda salir: que ofrezca terminar por WhatsApp, con los datos ya
      escritos. Un error rojo y punto deja al cliente sin salida, y en una web
      de empresa eso es un cliente perdido.
    */
    return fail(
      'Ahora mismo no podemos recibirlo por correo. Termínalo por WhatsApp y nos llega al momento.',
      503,
      undefined,
      CONTACT.whatsapp.pending ? undefined : 'whatsapp',
    );
  }

  try {
    await getMailer().send({
      subject: `Presupuesto · ${data.tipo} · ${data.nombre}`,
      html: renderHtml(data, meta),
      text: renderText(data, meta),
      replyTo: data.email,
      attachments,
    });
  } catch (err) {
    // El error real se queda en el log del servidor, no se le enseña al visitante.
    console.error('[presupuesto] fallo al enviar el aviso:', err);
    return fail(
      `No hemos podido enviar tu solicitud. Vuelve a intentarlo en unos minutos o escríbenos a ${CONTACT.email.value}.`,
      502,
    );
  }

  if (!mailerIsLive()) {
    console.warn('[presupuesto] RESEND_API_KEY no configurada: el aviso sólo se ha escrito en consola.');
  }

  return wantsJson
    ? json({ ok: true, message: '¡Recibido! Te responderemos lo antes posible.' })
    : new Response(null, { status: 303, headers: { Location: '/gracias' } });
};

/** Cualquier otro método no tiene sentido aquí. */
export const ALL: APIRoute = () =>
  new Response('Método no permitido', { status: 405, headers: { Allow: 'POST' } });
