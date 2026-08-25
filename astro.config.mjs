// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

import { SITE } from './src/data/site.ts';

/**
 * El sitio es estático salvo la ruta /api/presupuesto, que necesita servidor.
 * Astro renderiza estático por defecto y solo esa ruta declara
 * `export const prerender = false`.
 *
 * Para cambiar de hosting solo hay que tocar el `adapter` de aquí abajo:
 *   - Netlify  -> `import netlify from '@astrojs/netlify'`
 *   - Node     -> `import node from '@astrojs/node'`
 *   - Estático -> quita el adapter y mira `docs/DEPLOY.md` (formulario externo)
 */
export default defineConfig({
  site: SITE.url,
  adapter: vercel({
    // Las imágenes se optimizan en el BUILD con sharp, no con el servicio de
    // imágenes de Vercel. Son 16 fotos fijas: generarlas una vez sale gratis,
    // se sirven como estáticos desde el CDN y el sitio no queda atado a Vercel.
    imageService: false,
    webAnalytics: { enabled: false },
  }),
  integrations: [sitemap()],
  image: {
    // Los formatos modernos se generan en build; el <img> lleva srcset y fallback.
    responsiveStyles: true,
  },
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
