# PINTURESGS — web

Web corporativa de PINTURESGS, empresa de pintura profesional.

> **Concepto de marca:** *una capa blanca que esconde un mundo de color debajo.*
> Minimalismo por fuera, color y creatividad por dentro.

---

## Arranque rápido

```bash
npm install
npm run dev
```

Abre <http://localhost:4321>. No hace falta configurar nada para trabajar en
local: el formulario de presupuesto funciona igual y escribe el email por
consola en vez de enviarlo.

---

## El stack, y por qué

| Pieza | Elección | Motivo |
|---|---|---|
| Framework | **Astro 7** | El sitio es una landing: casi todo es HTML estático. Astro no manda JavaScript al navegador salvo el que se pide explícitamente, así que la página carga como un documento y no como una aplicación. |
| Lenguaje | **TypeScript** estricto | Los datos de servicios, proyectos, paleta y fotos están tipados: un error de contenido salta al construir, no en producción. |
| Estilos | **CSS con ámbito por componente** + tokens | Sin framework de utilidades. El diseño es muy propio y con tokens (`src/styles/tokens.css`) se toca un color en un sitio y cambia en todos. |
| Imágenes | **astro:assets** (sharp en build) | Genera WebP responsive en el build. Estáticos en el CDN, sin coste por petición y sin atarse a Vercel. |
| Backend | **Una sola ruta serverless** | `/api/presupuesto` es lo único que necesita servidor. El resto se pre-renderiza. |
| Email | **Resend**, detrás de una interfaz | `src/server/mailer.ts` define `Mailer`; cambiar a SMTP o a un CRM es añadir una clase, sin tocar la ruta. |
| Hosting | **Vercel** | Deploy con `git push`. Cambiar de hosting es cambiar el `adapter` en `astro.config.mjs` (ver [docs/DEPLOY.md](docs/DEPLOY.md)). |

---

## Estructura

```
src/
├── assets/          logo y fotografías (las optimiza Astro en el build)
├── components/
│   ├── sections/    una por sección de la home
│   └── …            Header, Footer, Seo, Logo, BrushCursor, Toast
├── data/            ← TODO EL CONTENIDO EDITABLE ESTÁ AQUÍ
│   ├── site.ts        datos de la empresa y placeholders pendientes
│   ├── services.ts    las 9 categorías y sus subfaenas
│   ├── projects.ts    la galería de proyectos
│   ├── palette.ts     los 78 colores de la herramienta
│   ├── photos.ts      manifiesto de fotografías
│   ├── process.ts     los 5 pasos
│   └── testimonials.ts
├── layouts/         BaseLayout
├── lib/             utilidades compartidas cliente/servidor
├── pages/
│   ├── index.astro
│   ├── gracias.astro   destino del formulario sin JavaScript
│   ├── 404.astro
│   └── api/presupuesto.ts   ← la única ruta con servidor
├── scripts/         JavaScript de navegador
│   └── paint-tool/    la herramienta "Pinta el teu espai"
├── server/          validación, envío de email y plantillas
└── styles/          tokens.css y base.css

scripts/             utilidades de build (se lanzan a mano)
docs/                despliegue, contenido y mejoras futuras
```

**Para cambiar textos, servicios, proyectos o colores no hay que tocar ningún
componente: todo vive en `src/data/`.**

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en el 4321 |
| `npm run build` | Build de producción |
| `npm run preview` | Sirve el build ya hecho |
| `npm run check` | Comprueba tipos en `.astro` y `.ts` |
| `npm run fetch:photos` | Vuelve a descargar las fotos de banco del manifiesto |

Dos utilidades que sólo hay que lanzar si cambia la foto del salón o el logotipo:

```bash
node scripts/build-wall-mask.mjs --debug   # máscara de pared de la herramienta
node scripts/build-social-images.mjs       # og.png y apple-touch-icon.png
```

---

## Datos de la empresa: qué está verificado y qué no

### Verificado

| Dato | Valor | Fuente |
|---|---|---|
| Teléfono | `(+376) 608 908` | [ficha en ReformesAndorra](https://www.reformesandorra.com/pintures-gs-andorra.html) |
| Ámbito | Principat d'Andorra | misma ficha |
| Servicios | pintura en general, decorativa, microciment, paper pintat, façanes, manteniment de fusta | misma ficha |

> ⚠️ **Una sola fuente.** PINTURES GS **no** aparece en las [Pàgines Grogues
> d'Andorra Telecom](https://paginesgrogues.ad/categoria/pintors) ni en
> [empreses.ad](https://empreses.ad/servei/pintura), así que el teléfono no está
> contrastado con una segunda fuente independiente. Conviene que la empresa lo
> confirme antes de publicar.

### Sigue pendiente (no hay fuente pública)

- **Email** → `src/data/site.ts` (`CONTACT.email`)
- **WhatsApp** → `CONTACT.whatsapp`. Dejado pendiente a propósito: que el 608 908
  tenga WhatsApp es una suposición. Mientras siga así, el botón flotante lleva al
  formulario en lugar de a un `wa.me` que podría no existir.
- **Dirección postal y parroquia** → no consta en ninguna fuente
- **Redes sociales** → `CONTACT.social`
- **Las 4 estadísticas** (`STATS`) → años, proyectos, clientes, certificaciones
- **Testimonios** → `src/data/testimonials.ts`, todos con `sample: true`.
  **No se han encontrado reseñas reales** (ni Google Maps, ni Facebook, ni
  directorios). Hacen falta reseñas reales del cliente, con su permiso.
- **Fotografías** → siguen siendo de banco, ver [CREDITS.md](CREDITS.md)
- **Dominio** → `SITE.url` apunta a `pinturesgs.com`, que **no está registrado**

Al rellenar un dato hay que poner su `pending`/`sample` en `false`: los avisos
desaparecen solos. El JSON-LD omite a propósito email y dirección mientras sigan
pendientes, para no publicar información falsa en los buscadores.

Ver [docs/CONTENIDO.md](docs/CONTENIDO.md) para el detalle de cada cambio.

### Categorías de servicio sin confirmar

Las 9 categorías vienen del encargo inicial. La ficha pública sólo respalda
**Hogar, Exteriores, Acabados y Madera**. Nadie confirma que la empresa preste
**Parkings, Altura, Metal e Industrial**: conviene confirmarlo o retirarlas de
`src/data/services.ts`.

## Variables de entorno

Copia `.env.example` a `.env`. Sin ninguna de ellas el sitio funciona: el
formulario valida, responde y escribe el aviso por consola.

| Variable | Para qué |
|---|---|
| `RESEND_API_KEY` | Enviar los avisos de verdad |
| `BUDGET_MAIL_FROM` | Remitente (dominio verificado en Resend) |
| `BUDGET_MAIL_TO` | Destinatarios, separados por coma |

---

## Notas

**Aviso de `npm audit`.** Hay 3 avisos de severidad alta en `path-to-regexp`,
que entra como dependencia transitiva de `@astrojs/vercel`. Es una dependencia
**de build** (genera la configuración de rutas), no interviene en ninguna
petición en producción. `npm audit fix --force` NO es la solución: degradaría
`@astrojs/vercel` a la versión 8, incompatible con Astro 7. Se corrige solo
cuando Vercel publique la actualización.

**Sin detección automática de paredes.** La pared del fondo de la herramienta
viene marcada con una máscara generada en el build. Detectar paredes en una
foto cualquiera exigiría una API externa de segmentación; está descrito en
[docs/MEJORAS-FUTURAS.md](docs/MEJORAS-FUTURAS.md).
