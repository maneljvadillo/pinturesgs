/**
 * ⚠️  RESEÑAS DE EJEMPLO. Ninguna es una opinión real de un cliente.
 * Mientras `sample` sea true la tarjeta muestra el aviso "opinión de ejemplo".
 * Al sustituirlas por reseñas reales (con permiso del cliente), pon `sample: false`.
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
    text: 'Ejemplo de opinión: puntuales, limpios y el acabado quedó perfecto. Repetiremos sin duda.',
    author: 'Nombre del cliente',
    sample: true,
  },
  {
    stars: 5,
    text: 'Ejemplo de opinión: nos asesoraron muy bien con los colores y cumplieron el plazo acordado.',
    author: 'Nombre del cliente',
    sample: true,
  },
  {
    stars: 5,
    text: 'Ejemplo de opinión: trabajo profesional en la fachada de nuestra comunidad, muy recomendable.',
    author: 'Nombre del cliente',
    sample: true,
  },
];
