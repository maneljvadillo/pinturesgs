/**
 * Galería de proyectos.
 *
 * ⚠️  Los proyectos de aquí abajo son EJEMPLOS de estructura, no obras reales
 * documentadas de PINTURESGS. En cuanto haya fotos y datos reales:
 *   1. Añade la foto al manifiesto (src/data/photos.ts).
 *   2. Sustituye título y servicios por los reales.
 *   3. Pon `sample: false`.
 * Mientras `sample` sea true, la sección muestra el aviso correspondiente.
 */

export type Project = {
  title: string;
  /** Servicios aplicados, separados por " · " al pintarse. */
  tags: string[];
  photo: string;
  /** Degradado de marca que se usa si la foto todavía no existe. */
  fallback: string;
  sample: boolean;
};

export const PROJECTS: Project[] = [
  {
    title: 'Parking privado',
    tags: ['Pintura', 'Señalización', 'Protección'],
    photo: 'proyecto-parking',
    fallback: 'linear-gradient(135deg,#277DA1,#161513)',
    sample: true,
  },
  {
    title: 'Vivienda unifamiliar',
    tags: ['Interior', 'Exterior'],
    photo: 'proyecto-vivienda',
    fallback: 'linear-gradient(135deg,#C1502E,#161513)',
    sample: true,
  },
  {
    title: 'Fachada edificio residencial',
    tags: ['Altura', 'Fachada'],
    photo: 'proyecto-fachada',
    fallback: 'linear-gradient(135deg,#52B788,#161513)',
    sample: true,
  },
  {
    title: 'Oficinas corporativas',
    tags: ['Interior', 'Acabados'],
    photo: 'proyecto-oficinas',
    fallback: 'linear-gradient(135deg,#F77F00,#161513)',
    sample: true,
  },
  {
    title: 'Nave industrial',
    tags: ['Estructuras', 'Pintura metálica'],
    photo: 'proyecto-nave',
    fallback: 'linear-gradient(135deg,#B5179E,#161513)',
    sample: true,
  },
  {
    title: 'Local comercial',
    tags: ['Interior', 'Diseño'],
    photo: 'proyecto-local',
    fallback: 'linear-gradient(135deg,#2A9D8F,#161513)',
    sample: true,
  },
];
