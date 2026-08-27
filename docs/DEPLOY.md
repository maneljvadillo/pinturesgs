# Despliegue

## Antes de publicar: comprobaciones

Estado a fecha del lanzamiento (agosto de 2026).

### Cerrado

- [x] **Email de contacto.** `pinturesgs@gmail.com`, facilitado por la empresa.
      Está en `CONTACT.email` y es a donde llegan los presupuestos por defecto
      (sin necesidad de configurar `BUDGET_MAIL_TO`).
- [x] **Instagram.** `https://www.instagram.com/pinturesgs/`, en el pie y en los
      datos estructurados (`sameAs`).
- [x] **Dominio.** `pinturesgs.com`, comprado en Vercel. Vive sólo en
      `SITE.url`; de ahí salen la canónica, el sitemap, el robots.txt y las
      etiquetas Open Graph.
- [x] **Categorías de servicio.** La empresa confirmó que presta las nueve,
      incluidas Parkings, Altura, Metal e Industrial.
- [x] **Teléfono y WhatsApp.** `(+376) 608 908`, confirmado por la empresa,
      y confirmado que ese número tiene WhatsApp.
- [x] `npm run check` y `npm run build` sin errores.

### Pendiente — hace falta la empresa

- [ ] **⚠️ `RESEND_API_KEY` en Vercel.** SIN ESTO EL FORMULARIO NO ENTREGA
      NADA. La API lo detecta y, en producción, en vez de decirle al cliente
      "¡Recibido!" le pide que escriba directamente — o sea, el formulario se
      ve como averiado hasta que la clave esté puesta. Alta gratuita en
      resend.com (3.000 emails/mes).
- [ ] **Remitente verificado.** `BUDGET_MAIL_FROM` tiene que ser una dirección
      de un dominio verificado en Resend (p. ej. `presupuestos@pinturesgs.com`).
      El `onboarding@resend.dev` de prueba sólo entrega al dueño de la cuenta.
- [ ] **Reseñas reales.** Las seis de la home son de ejemplo y la sección lo
      dice ("Ejemplos ilustrativos… estamos recogiendo las opiniones"). En
      cuanto haya reseñas de verdad: se sustituye el texto en
      `src/data/testimonials.ts` y se pone `sample: false` en cada una. El
      aviso desaparece solo cuando ninguna quede marcada como ejemplo.

      NO se puede quitar el aviso dejando los textos actuales: presentar como
      opinión de un cliente algo que nadie ha dicho es publicidad engañosa
      (Directiva Ómnibus, en España Ley de Competencia Desleal).
- [ ] **Fotos reales.** Las 16 son de banco. Sustituirlas en
      `src/data/photos.ts` cuando haya fotos de obras propias.
- [ ] **Idioma.** La web está en español. Para un negocio andorrano el catalán
      suele ser la opción natural; es decisión de la empresa.

### Opcional

- [ ] **Borrar `/logo`.** Es la página interna para elegir la variante del
      logotipo. Ya está decidida (`realista-b`), lleva `noindex` y está fuera
      del sitemap, así que no la encuentra nadie — pero sigue siendo accesible
      con la URL. Borrar `src/pages/logo.astro` y las variantes descartadas de
      `src/assets` deja el sitio más limpio y el build más ligero.

---

## El dominio

`pinturesgs.com` no está registrado a día de hoy. Dos opciones:

- **`.ad`** — la extensión de Andorra. Desde 2024 puede registrarla cualquiera,
  sin necesidad de residir en el país, por unos 17–26 €/año. Es la que mejor
  señal de negocio local da a Google y a los clientes andorranos. Hay que
  hacerlo a través de un registrador acreditado (Andorra Telecom ya no los
  vende directamente).
- **`.com`** — más barato y reconocible fuera. Buena opción si también se busca
  clientela de España o Francia.

Se puede registrar el `.com` y el `.ad` y redirigir uno al otro.

Elijas la que elijas, hay que ponerla en `SITE.url` (`src/data/site.ts`) **antes**
del primer deploy: de ahí salen la URL canónica, el sitemap y las etiquetas
Open Graph.

---

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
