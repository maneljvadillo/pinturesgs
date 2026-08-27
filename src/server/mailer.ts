/**
 * Envío del aviso de presupuesto.
 *
 * Detrás de una interfaz mínima para poder cambiar de proveedor sin tocar la
 * ruta de la API. Hoy hay dos implementaciones:
 *
 *   ResendMailer  — producción. Necesita RESEND_API_KEY.
 *   ConsoleMailer — desarrollo. Escribe el email por consola. Es lo que se usa
 *                   si no hay clave, para poder probar el formulario entero sin
 *                   dar de alta ningún servicio.
 *
 * Para cambiar a SMTP o a un CRM basta con añadir otra clase que cumpla
 * `Mailer` y devolverla desde `getMailer()`.
 */

import { CONTACT } from '~/data/site';

export type Attachment = { filename: string; content: Buffer };

export type MailMessage = {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: Attachment[];
};

export interface Mailer {
  send(msg: MailMessage): Promise<void>;
}

/*
  A quién le llega el aviso. `BUDGET_MAIL_TO` permite desviarlo (a varias
  direcciones, separadas por comas) sin tocar código; si no está puesta, va al
  correo de la empresa que hay en site.ts. Antes, sin esa variable, no había
  destinatario y el envío fallaba: ahora funciona nada más desplegar.
*/
function recipients(): string[] {
  const configured = (import.meta.env.BUDGET_MAIL_TO ?? process.env.BUDGET_MAIL_TO ?? '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  if (configured.length > 0) return configured;
  return CONTACT.email.pending ? [] : [CONTACT.email.value];
}

function sender(): string {
  return (
    import.meta.env.BUDGET_MAIL_FROM ??
    process.env.BUDGET_MAIL_FROM ??
    'PINTURESGS <onboarding@resend.dev>'
  );
}

class ResendMailer implements Mailer {
  constructor(private apiKey: string) {}

  async send(msg: MailMessage): Promise<void> {
    const to = recipients();
    if (to.length === 0) {
      throw new Error('No hay a quién enviar el aviso: revisa CONTACT.email o BUDGET_MAIL_TO.');
    }
    // Import perezoso: así el paquete no entra en el bundle si no se usa.
    const { Resend } = await import('resend');
    const resend = new Resend(this.apiKey);

    const { error } = await resend.emails.send({
      from: sender(),
      to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo,
      attachments: msg.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });
    if (error) throw new Error(`Resend: ${error.message}`);
  }
}

class ConsoleMailer implements Mailer {
  async send(msg: MailMessage): Promise<void> {
    console.info(
      [
        '',
        '─'.repeat(72),
        '  AVISO DE PRESUPUESTO (modo desarrollo — no se ha enviado nada)',
        '  Configura RESEND_API_KEY en .env para enviarlo de verdad.',
        '─'.repeat(72),
        `  Para:      ${recipients().join(', ') || '(BUDGET_MAIL_TO sin configurar)'}`,
        `  Responder: ${msg.replyTo ?? '—'}`,
        `  Asunto:    ${msg.subject}`,
        `  Adjuntos:  ${msg.attachments?.length ?? 0}`,
        '─'.repeat(72),
        msg.text,
        '─'.repeat(72),
        '',
      ].join('\n'),
    );
  }
}

export function getMailer(): Mailer {
  const key = import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
  return key ? new ResendMailer(key) : new ConsoleMailer();
}

/** ¿Está el envío real configurado? Lo usa la API para avisar en el log. */
export function mailerIsLive(): boolean {
  return Boolean(import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY);
}
