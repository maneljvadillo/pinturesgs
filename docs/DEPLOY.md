# Despliegue

## Antes de publicar: comprobaciones

Nada de esto lo puede hacer el desarrollador solo; hace falta que la empresa
confirme los datos.

- [ ] **Confirmar el teléfono.** `(+376) 608 908` sale de una única fuente
      pública ([ReformesAndorra](https://www.reformesandorra.com/pintures-gs-andorra.html))
      y no aparece ni en las Pàgines Grogues ni en empreses.ad. Si es correcto,
      no hay que tocar nada; si no, cambiarlo en `src/data/site.ts`.
- [ ] **¿Ese número tiene WhatsApp?** Si sí, rellenar `CONTACT.whatsapp` con
      `376608908` y el botón flotante empieza a abrir WhatsApp. Si no, se queda
      como está y el botón sigue llevando al formulario.
- [ ] **Email de contacto** → `CONTACT.email`, y el mismo en `BUDGET_MAIL_TO`.
- [ ] **Dominio definitivo** → `SITE.url`. Ahora apunta a `pinturesgs.com`, que
      **no está registrado**. Ver más abajo.
- [ ] **Decidir el idioma.** La web está en español. Para un negocio andorrano,
      el catalán suele ser la opción natural; es una decisión de la empresa.
- [ ] **Confirmar las categorías de servicio.** Parkings, Altura, Metal e
      Industrial no las respalda ninguna fuente pública. O se confirman, o se
      quitan de `src/data/services.ts`.
- [ ] **Estadísticas y testimonios.** Siguen con `[X]` y marcados como ejemplo.
      Se puede publicar así (se ve que están pendientes), pero da mejor imagen
      rellenarlos o quitar esas secciones.
- [ ] `npm run check` y `npm run build` sin errores.

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
