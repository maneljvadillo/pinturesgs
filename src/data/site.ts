/**
 * Datos de la empresa.
 *
 * ⚠️  TODO LO MARCADO COMO `pending: true` ES UN PLACEHOLDER.
 * No inventes datos aquí: en cuanto PINTURESGS facilite los reales,
 * sustituye el valor y pon `pending: false`. Los componentes leen ese
 * flag para mostrar (o no) el aviso de "dato pendiente".
 */

export type PendingValue = {
  value: string;
  pending: boolean;
};

const pending = (label: string): PendingValue => ({ value: label, pending: true });
const real = (value: string): PendingValue => ({ value, pending: false });

export const SITE = {
  /** Marca tal y como se escribe en la web y en el logotipo. */
  name: 'PINTURESGS',
  /**
   * Nombre real de la empresa, con espacio, tal y como aparece en el
   * directorio (ReformesAndorra) y en el propio logotipo ("pintures GS").
   * Se usa en los datos estructurados, donde importa el nombre real y no la
   * forma en que se estiliza la marca.
   */
  legalName: 'Pintures GS',
  /**
   * ⚠️  DOMINIO PROVISIONAL. pinturesgs.com no está registrado (comprobado:
   * no resuelve). Hay que cambiarlo por el definitivo ANTES del primer deploy:
   * de aquí salen la URL canónica, el sitemap y las etiquetas Open Graph.
   */
  url: 'https://pinturesgs.com',
  tagline: 'Tú eliges el color. Nosotros hacemos que ocurra.',
  claim: 'No solo pintamos. Transformamos espacios.',
  /**
   * Descripción para buscadores. Menciona Andorra (clave para el SEO local) y
   * sólo los servicios confirmados por la ficha pública de la empresa.
   */
  description:
    'Pintores profesionales en Andorra. Pintura en general y decorativa, microcemento, papel pintado, fachadas, interiores y mantenimiento de madera, para particulares y empresas.',
  /** Título por defecto: marca + servicio + territorio, en 46 caracteres. */
  seoTitle: 'PINTURESGS — Pintores profesionales en Andorra',
  locale: 'es_ES',
  lang: 'es',
} as const;

/**
 * FUENTES DE LOS DATOS VERIFICADOS
 *
 * Teléfono, territorio y servicios salen de la ficha pública de la empresa en
 * el directorio ReformesAndorra:
 *   https://www.reformesandorra.com/pintures-gs-andorra.html
 *
 * ⚠️  Es la ÚNICA fuente pública encontrada. Se buscó confirmación en las
 * Pàgines Grogues d'Andorra Telecom (paginesgrogues.ad) y en empreses.ad y
 * PINTURES GS no aparece en ninguno de los dos, así que el teléfono NO está
 * contrastado con una segunda fuente independiente. Conviene que la empresa
 * lo confirme antes de publicar.
 */
export const CONTACT = {
  // Fuente: ficha de ReformesAndorra (única fuente pública encontrada).
  phone: real('(+376) 608 908'),
  /** Formato E.164, para los enlaces tel: y wa.me. Sin el + ni espacios en whatsapp. */
  phoneHref: real('+376608908'),
  /**
   * Pendiente a propósito. 608 908 es un móvil andorrano, pero que ese número
   * tenga WhatsApp es una suposición, no un dato. Mientras siga pendiente, el
   * botón flotante lleva al formulario en vez de a un wa.me que podría no
   * existir. Basta con que la empresa lo confirme para activarlo.
   */
  whatsapp: pending(''),
  email: pending('[Email pendiente]'),
  // Fuente: ReformesAndorra indica "Principat d'Andorra" como ámbito.
  // No hay dirección postal ni parroquia en ninguna fuente pública.
  location: real("Principat d'Andorra"),
  social: pending('[Redes sociales pendientes]'),
} satisfies Record<string, PendingValue>;

/**
 * Estadísticas de la home. Siguen TODAS pendientes: no hay ninguna fuente
 * pública con años de experiencia, número de proyectos, clientes ni
 * certificaciones de PINTURES GS. Estos datos sólo los puede dar la empresa.
 */
export const STATS = [
  { num: pending('[X]'), label: 'Años de experiencia' },
  { num: pending('[X]'), label: 'Proyectos realizados' },
  { num: pending('[X]'), label: 'Clientes satisfechos' },
  { num: pending('[X]'), label: 'Certificaciones' },
];

export const AUDIENCES = [
  'Particulares',
  'Empresas',
  'Comunidades',
  'Locales comerciales',
  'Constructoras',
  'Grandes instalaciones',
];

/** Tipos de proyecto del formulario de presupuesto. */
export const PROJECT_TYPES = [
  'Vivienda / interior',
  'Exterior / fachada',
  'Parking / garaje',
  'Trabajo en altura',
  'Empresa / local comercial',
  'Comunidad de propietarios',
  'Gran proyecto / industrial',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export { pending, real };
