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

### La sala de la herramienta de pintar

`sala-tres-paredes.jpg` es especial: no es una foto de banco ni una obra real,
sino una sala hecha a medida para la herramienta, con tres planos de pared
limpios y muebles bajos que casi no tapan. Lleva asociadas CUATRO máscaras:
las tres paredes viajan juntas en `public/room/sala-paredes.png`, una por canal
de color (R = izquierda, G = fondo, B = tabique), y el techo va aparte en
`public/room/sala-techo.png`, en escala de grises — el canal alfa no sirve como
cuarto canal porque al dibujar el PNG en un lienzo se lleva por delante el RGB
de los otros tres.

Si se cambia la foto hay que **recalibrar** las máscaras:

```bash
node scripts/build-wall-masks.mjs --debug
```

y ajustar las constantes del principio de ese archivo —los polígonos de cada
zona, los muebles que la tapan y los umbrales de color, que van por zona porque
la luz cae mucho de izquierda a derecha— mirando `public/room/_debug-paredes.jpg`,
que pinta cada zona de un color. El propio script explica el método y de dónde
sale cada medida.

Con `--audit` genera además `public/room/_audit-paredes.jpg`, que pinta de
**amarillo lo que está dentro del plano y se ha quedado sin máscara**: es la
vista a mirar cuando "hay trozos que no se pintan". Ojo al leerla: los muebles
que se recortan por umbral (el sofá) salen amarillos y eso es correcto, no un
fallo — lo que hay que buscar son manchas amarillas sobre pared lisa.

La foto vieja del salón de ladrillo (`salon.jpg` + `salon-mask.png` +
`scripts/build-wall-mask.mjs`, en singular) sigue en el repositorio por si se
quiere volver a ella: era de una sola pared.

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
