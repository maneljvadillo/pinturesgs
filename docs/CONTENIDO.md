# Cómo cambiar el contenido

Todo lo editable está en `src/data/`. No hace falta tocar componentes.

---

## Datos de la empresa

`src/data/site.ts`

```ts
export const CONTACT = {
  phone:     pending('[Teléfono pendiente]'),
  phoneHref: pending(''),
  whatsapp:  pending(''),
  email:     pending('[Email pendiente]'),
  location:  pending('[Ubicación pendiente]'),
  social:    pending('[Redes sociales pendientes]'),
};
```

Cambia `pending('…')` por `real('…')`:

```ts
phone:     real('+34 972 000 000'),
phoneHref: real('+34972000000'),   // formato E.164, para el enlace tel:
whatsapp:  real('34972000000'),    // sin +, para wa.me
email:     real('info@pinturesgs.com'),
location:  real('Girona'),
```

Con eso, a la vez:

- el pie deja de mostrarlos en cursiva como pendientes y pasan a ser enlaces,
- el botón flotante empieza a abrir WhatsApp en lugar de ir al formulario,
- el JSON-LD de SEO incluye teléfono, email y dirección.

### Estadísticas

```ts
export const STATS = [
  { num: real('15'),  label: 'Años de experiencia' },
  …
];
```

El aviso "dato pendiente" desaparece en cuanto `pending` es `false`.

---

## Fotografías

Hoy son de banco (Pexels). Para poner una real:

1. Deja el archivo en `src/assets/photos/` con **el mismo nombre**
   (`servicio-hogar.jpg`, `proyecto-parking.jpg`…).
2. En `src/data/photos.ts`, en esa entrada: `stock: false` y borra `pexelsId`.
3. Actualiza el `alt` para que describa la foto nueva — es lo que oye
   quien usa un lector de pantalla, y cuenta para SEO.

Cuando ya no quede ninguna con `stock: true`, el aviso de "fotografías de
referencia" desaparece de la sección de servicios.

Tamaño recomendado: 1400 px de ancho como mínimo. Astro genera el resto.

### La foto de la herramienta de pintar

`salon.jpg` es especial: lleva asociada una máscara de pared generada en el
build. Si se cambia hay que **recalibrar** la máscara:

```bash
node scripts/build-wall-mask.mjs --debug
```

y ajustar las constantes del principio de ese archivo (plano de la pared,
objetos que la tapan y umbrales de color) mirando
`public/room/_debug-mask.jpg`, que pinta de magenta lo que se considera pared.
El propio script explica el método.

---

## Servicios

`src/data/services.ts`. Las 3 primeras subfaenas se ven siempre; el resto se
pliegan tras un "+N ver más" automáticamente.

## Proyectos

`src/data/projects.ts`. Al documentar una obra real: cambia `title` y `tags`,
añade la foto al manifiesto y pon `sample: false`.

## Testimonios

`src/data/testimonials.ts`. **Publicar una reseña real requiere permiso del
cliente.** Al sustituirla, `sample: false` quita el aviso de "opinión de
ejemplo".

## Paleta de colores

`src/data/palette.ts`. Añadir un color es añadir una línea `['Nombre', '#HEX']`
a su familia. El nombre es el que aparece en el resumen que viaja al
formulario de presupuesto.

## Los 5 pasos del proceso

`src/data/process.ts`.
