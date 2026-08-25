# Créditos de las imágenes

> Generado automáticamente por `npm run fetch:photos`. No editar a mano.

## Logotipo

`src/assets/logo.png` — logotipo de PINTURESGS. Propiedad del cliente.

## Fotografías de banco (temporales)

Todas provienen de **Pexels** y se usan bajo la [Pexels License](https://www.pexels.com/license/):
uso gratuito para fines comerciales y **sin atribución obligatoria**. Aun así las
listamos aquí para poder rastrear su origen y sustituirlas ordenadamente.

⚠️ **Ninguna de estas imágenes documenta un proyecto real de PINTURESGS.**
Son referencias visuales hasta disponer de fotografías propias.

| Archivo | Origen |
|---|---|
| `servicio-hogar.jpg` | [pexels.com/photo/6474471](https://www.pexels.com/photo/6474471/) |
| `servicio-negocios.jpg` | [pexels.com/photo/8606292](https://www.pexels.com/photo/8606292/) |
| `servicio-exteriores.jpg` | [pexels.com/photo/2209529](https://www.pexels.com/photo/2209529/) |
| `servicio-parkings.jpg` | [pexels.com/photo/3095713](https://www.pexels.com/photo/3095713/) |
| `servicio-altura.jpg` | [pexels.com/photo/32115287](https://www.pexels.com/photo/32115287/) |
| `servicio-metal.jpg` | [pexels.com/photo/8689333](https://www.pexels.com/photo/8689333/) |
| `servicio-madera.jpg` | [pexels.com/photo/16047683](https://www.pexels.com/photo/16047683/) |
| `servicio-acabados.jpg` | [pexels.com/photo/4286939](https://www.pexels.com/photo/4286939/) |
| `servicio-industrial.jpg` | [pexels.com/photo/12771407](https://www.pexels.com/photo/12771407/) |
| `proyecto-parking.jpg` | [pexels.com/photo/2280148](https://www.pexels.com/photo/2280148/) |
| `proyecto-vivienda.jpg` | [pexels.com/photo/1115804](https://www.pexels.com/photo/1115804/) |
| `proyecto-fachada.jpg` | [pexels.com/photo/5768449](https://www.pexels.com/photo/5768449/) |
| `proyecto-oficinas.jpg` | [pexels.com/photo/8477444](https://www.pexels.com/photo/8477444/) |
| `proyecto-nave.jpg` | [pexels.com/photo/30912898](https://www.pexels.com/photo/30912898/) |
| `proyecto-local.jpg` | [pexels.com/photo/5490931](https://www.pexels.com/photo/5490931/) |
| `salon.jpg` | [pexels.com/photo/20390760](https://www.pexels.com/photo/20390760/) |

## Cómo sustituirlas por fotos reales

1. Deja la foto en `src/assets/photos/` con el mismo nombre de archivo.
2. En `src/data/photos.ts`, pon `stock: false` y borra el `pexelsId`.
3. Revisa el `alt`: debe describir lo que se ve en la foto nueva.
4. Vuelve a generar este archivo con `npm run fetch:photos`.
