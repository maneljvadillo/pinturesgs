/**
 * Las 9 categorías de servicio de la home.
 *
 * SERVICIOS CONFIRMADOS POR FUENTE PÚBLICA
 * La ficha de PINTURES GS en ReformesAndorra
 * (https://www.reformesandorra.com/pintures-gs-andorra.html) enumera seis
 * servicios, que aquí van SIEMPRE los primeros de su categoría para que sean
 * los que se ven sin desplegar:
 *
 *   Pintura en general ....... Hogar
 *   Pintura decorativa ....... Acabados
 *   Microciment .............. Acabados  (Microcemento)
 *   Col·locació paper pintat . Acabados  (Papel pintado)
 *   Pintura façanes .......... Exteriores (Fachadas)
 *   Manteniment de fusta ..... Madera    (Mantenimiento de madera)
 *
 * ⚠️  Las categorías Parkings, Altura, Metal e Industrial vienen del encargo
 * inicial, NO de esa ficha. Ninguna fuente pública confirma que PINTURES GS
 * preste esos servicios: conviene que la empresa lo confirme o se retiren.
 *
 * `photo` es la CLAVE del manifiesto de fotos (src/data/photos.ts), no una URL.
 * Para cambiar la imagen de una categoría se cambia ahí, no aquí.
 */

export type Service = {
  emoji: string;
  name: string;
  /** Subfaenas concretas. Las 3 primeras se ven siempre; el resto tras "+N ver más". */
  tasks: string[];
  photo: string;
};

/** Cuántas etiquetas se ven antes de plegar el resto. */
export const VISIBLE_TAGS = 3;

export const SERVICES: Service[] = [
  {
    emoji: '🏠',
    name: 'Hogar',
    tasks: ['Pintura en general', 'Viviendas', 'Apartamentos', 'Comunidades de propietarios', 'Dormitorios', 'Salones', 'Cocinas'],
    photo: 'servicio-hogar',
  },
  {
    emoji: '🏢',
    name: 'Negocios',
    tasks: ['Oficinas', 'Locales comerciales', 'Reformas', 'Pintura decorativa comercial'],
    photo: 'servicio-negocios',
  },
  {
    emoji: '🏗️',
    name: 'Exteriores',
    tasks: ['Fachadas', 'Edificios', 'Comunidades', 'Revestimientos exteriores'],
    photo: 'servicio-exteriores',
  },
  {
    emoji: '🚗',
    name: 'Parkings',
    tasks: ['Parkings', 'Garajes', 'Señalización de parkings', 'Protección de suelos'],
    photo: 'servicio-parkings',
  },
  {
    emoji: '🧗',
    name: 'Altura',
    tasks: ['Trabajos verticales', 'Fachadas altas', 'Estructuras en altura', 'Cubiertas y tejados'],
    photo: 'servicio-altura',
  },
  {
    emoji: '🔩',
    name: 'Metal',
    tasks: ['Estructuras metálicas', 'Puertas metálicas', 'Protección anticorrosión', 'Naves industriales'],
    photo: 'servicio-metal',
  },
  {
    emoji: '🪵',
    name: 'Madera',
    tasks: ['Mantenimiento de madera', 'Barnices', 'Lacados', 'Puertas de madera', 'Muebles y carpintería'],
    photo: 'servicio-madera',
  },
  {
    emoji: '🎨',
    name: 'Acabados',
    tasks: ['Pintura decorativa', 'Microcemento', 'Papel pintado', 'Acabados especiales', 'Texturas decorativas', 'Estucados', 'Efectos decorativos'],
    photo: 'servicio-acabados',
  },
  {
    emoji: '🏭',
    name: 'Industrial',
    tasks: ['Grandes proyectos', 'Naves industriales', 'Constructoras', 'Instalaciones industriales'],
    photo: 'servicio-industrial',
  },
];
