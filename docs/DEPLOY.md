# Despliegue

## Vercel (configurado)

1. Sube el repositorio a GitHub/GitLab.
2. En Vercel: **Add New → Project** e impórtalo. Detecta Astro solo
   (build `npm run build`, salida `.vercel/output`). No hay que tocar nada.
3. **Settings → Environment Variables**, añade las tres de `.env.example`:
   `RESEND_API_KEY`, `BUDGET_MAIL_FROM`, `BUDGET_MAIL_TO`.
4. **Settings → Domains**: añade `pinturesgs.com` y sigue los DNS que indique.
5. Cambia `SITE.url` en `src/data/site.ts` al dominio definitivo — de ahí salen
   la URL canónica, el sitemap y las etiquetas Open Graph.

A partir de ahí, cada `git push` a la rama principal publica.

### Dar de alta Resend

1. Cuenta en <https://resend.com> (3.000 emails/mes gratis).
2. **Domains → Add Domain**, `pinturesgs.com`, y añade los registros DNS
   (SPF y DKIM) que os dé. Sin dominio verificado los emails acaban en spam.
3. **API Keys → Create**, permiso *Sending access*, y esa clave va en
   `RESEND_API_KEY`.
4. `BUDGET_MAIL_FROM` tiene que usar el dominio verificado, por ejemplo
   `PINTURESGS <presupuestos@pinturesgs.com>`.

Para probar antes de verificar el dominio, Resend permite enviar desde
`onboarding@resend.dev`, pero sólo a la dirección de la cuenta.

---

## Cambiar de hosting

Todo el acoplamiento está en el `adapter` de `astro.config.mjs`.

### Netlify

```bash
npm rm @astrojs/vercel && npm i @astrojs/netlify
```

```js
import netlify from '@astrojs/netlify';
export default defineConfig({ adapter: netlify(), /* … */ });
```

Las variables de entorno van en **Site settings → Environment variables**.

### Servidor propio con Node

```bash
npm rm @astrojs/vercel && npm i @astrojs/node
```

```js
import node from '@astrojs/node';
export default defineConfig({ adapter: node({ mode: 'standalone' }), /* … */ });
```

Luego `node ./dist/server/entry.mjs` detrás de nginx o Caddy.

### Hosting estático (Hostinger, FTP, cPanel…)

Un hosting estático **no puede ejecutar `/api/presupuesto`**. Hay dos salidas:

**a) Un servicio de formularios externo.** Quita el `adapter`, borra
`src/pages/api/presupuesto.ts` y apunta el `action` del formulario
(`src/components/sections/Budget.astro`) a Formspree, Basin o similar. El
JavaScript de `src/scripts/budget-form.ts` ya envía por `fetch` con
`Accept: application/json`, que es justo lo que esperan esos servicios.

**b) Un PHP que haga de puente.** Si el hosting tiene PHP, un `contacto.php`
con `mail()` puede sustituir a la ruta. Menos fiable en cuanto a entrega:
sin SPF/DKIM bien puestos, acaba en spam.

En ambos casos, `npm run build` con `output: 'static'` y sin adapter deja en
`dist/` los archivos listos para subir por FTP.
