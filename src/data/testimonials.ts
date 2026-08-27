/**
 * ⚠️  RESEÑAS DE EJEMPLO. Ninguna es una opinión real de un cliente.
 * Mientras `sample` sea true la tarjeta muestra el aviso "opinión de ejemplo".
 * Al sustituirlas por reseñas reales (con permiso del cliente), pon `sample: false`.
 *
 * Están escritas como texto de relleno con la forma de una reseña de verdad —
 * cada una de un trabajo distinto de los que hace la empresa— para que la
 * sección se vea como se verá cuando haya opiniones reales. NO se pueden
 * publicar como reseñas auténticas: en la UE, presentar como opinión de un
 * cliente algo que nadie ha dicho es publicidad engañosa (Directiva Ómnibus,
 * traspuesta en la Ley de Competencia Desleal). Por eso llevan el aviso, y por
 * eso el aviso sólo se quita reseña a reseña, cuando esa reseña sea real.
 *
 * SON SEIS, y no ocho. Se quitaron la de la nave industrial y la de trabajos
 * en altura porque son justo dos de las categorías que NINGUNA fuente pública
 * confirma que la empresa preste (ver la nota de services.ts): sostener una
 * reseña sobre un servicio que aún está por confirmar era lo más frágil de
 * las ocho. Las seis que quedan cubren seis parroquias distintas y cuatro de
 * ellas caen en servicios sí confirmados.
 */

export type Testimonial = {
  stars: number;
  text: string;
  author: string;
  sample: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    stars: 5,
    text: 'Pintaron todo el piso en cuatro días, con nosotros viviendo dentro. Taparon los muebles cada mañana y lo dejaban recogido al irse. El acabado, impecable.',
    author: 'Reforma de vivienda — Escaldes-Engordany',
    sample: true,
  },
  {
    stars: 5,
    text: 'Nos costaba decidir los colores y vinieron con muestras a casa. Acertaron de pleno: el salón ha quedado mucho más luminoso de lo que esperábamos.',
    author: 'Pintura interior — Andorra la Vella',
    sample: true,
  },
  {
    stars: 5,
    text: 'La fachada del edificio llevaba años pidiéndolo. Montaron el andamio, avisaron a todos los vecinos de los plazos y cumplieron día por día.',
    author: 'Comunidad de propietarios — Sant Julià de Lòria',
    sample: true,
  },
  {
    stars: 5,
    text: 'Necesitábamos repintar el local sin cerrar. Trabajaron de noche y el sábado abrimos con todo listo. Ni un día sin facturar.',
    author: 'Local comercial — Encamp',
    sample: true,
  },
  {
    stars: 5,
    text: 'Marcaron las plazas y los pasillos del parking con señalización nueva. Se nota que saben lo que hacen: dos años después sigue como el primer día.',
    author: 'Parking comunitario — La Massana',
    sample: true,
  },
  {
    stars: 5,
    text: 'Barnizaron las vigas y las contraventanas de madera de la casa. Lijaron a mano lo que hacía falta y respetaron la veta. Un trabajo de artesano.',
    author: 'Madera y barnices — Ordino',
    sample: true,
  },
];
