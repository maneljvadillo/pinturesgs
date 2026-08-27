/**
 * robots.txt generado, no escrito a mano.
 *
 * Antes vivía en `public/robots.txt` con el dominio escrito literalmente. Eso
 * significa que el día que cambie el dominio hay DOS sitios que tocar, y el
 * que se olvida siempre es éste: el resultado es un sitemap anunciado en una
 * dirección que no existe, y los buscadores dejan de encontrarlo sin avisar.
 *
 * Aquí sale de `SITE.url`, que es la misma fuente de la que salen la URL
 * canónica, el sitemap y las etiquetas Open Graph. Un solo sitio que tocar.
 */
import type { APIRoute } from 'astro';
import { SITE } from '~/data/site';

export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${new URL('/sitemap-index.xml', SITE.url).href}`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
