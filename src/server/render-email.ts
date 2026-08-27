/** Maquetado del aviso de presupuesto. */
import { displayPhone } from '~/lib/budget';
import type { BudgetInput } from './schema';

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!
  ));

type Meta = { recibido: string; adjuntos: number };

export function renderText(d: BudgetInput, meta: Meta): string {
  const rows = [
    ['Nombre', d.nombre],
    ['Teléfono', displayPhone(d.telefono)],
    ['Email', d.email],
    ['Tipo de proyecto', d.tipo],
    ['Ubicación', d.ubicacion || '—'],
    ['Descripción', d.descripcion || '—'],
    ['Fotografías', String(meta.adjuntos)],
    ['Recibido', meta.recibido],
  ];
  return rows.map(([k, v]) => `${k}: ${v}`).join('\n');
}

export function renderHtml(d: BudgetInput, meta: Meta): string {
  const row = (label: string, value: string, mono = false) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #E6E3DC;color:#8A8680;
                 font:500 12px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;
                 text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;
                 vertical-align:top;">${esc(label)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #E6E3DC;color:#161513;
                 font:400 15px/1.5 ${mono ? 'ui-monospace,SFMono-Regular,monospace' : '-apple-system,Segoe UI,Roboto,sans-serif'};">
        ${esc(value) || '—'}
      </td>
    </tr>`;

  return `<!doctype html>
<html lang="es"><body style="margin:0;background:#FAFAF8;padding:28px 14px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #D8D5CE;border-radius:10px;overflow:hidden;">
    <tr>
      <td style="background:#161513;padding:22px 24px;">
        <div style="color:#FAFAF8;font:500 19px/1.2 Georgia,serif;">Nueva solicitud de presupuesto</div>
        <div style="color:#a6a29a;font:400 13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;margin-top:5px;">
          Enviada desde el formulario de pinturesgs.com
        </div>
      </td>
    </tr>
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row('Nombre', d.nombre)}
        ${row('Teléfono', displayPhone(d.telefono))}
        ${row('Email', d.email)}
        ${row('Proyecto', d.tipo)}
        ${row('Ubicación', d.ubicacion)}
        ${row('Descripción', d.descripcion)}
        ${row('Fotografías', meta.adjuntos ? `${meta.adjuntos} adjunta(s)` : 'ninguna')}
        ${row('Recibido', meta.recibido)}
      </table>
    </td></tr>
    <tr>
      <td style="padding:18px 24px;background:#EFEDE7;">
        <a href="mailto:${esc(d.email)}"
           style="display:inline-block;background:#C1502E;color:#fff;text-decoration:none;
                  padding:11px 20px;border-radius:3px;font:500 14px -apple-system,Segoe UI,Roboto,sans-serif;">
          Responder a ${esc(d.nombre)}
        </a>
      </td>
    </tr>
  </table>
</body></html>`;
}
