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
   * ⚠️  A CONFIRMAR POR LA EMPRESA. Es el mismo número de arriba, que sale de
   * su ficha pública. Que ESE número tenga WhatsApp no está verificado por
   * ninguna fuente: se ha activado porque el cliente pidió que el formulario
   * pueda enviarse por WhatsApp y es el único número que hay. Si no es el
   * correcto, se cambia aquí y cambia en todo el sitio (botón flotante y
   * botón del formulario).
   */
  whatsapp: real('376608908'),
  // Facilitado por la empresa.
  email: real('pinturesgs@gmail.com'),
  // Fuente: ReformesAndorra indica "Principat d'Andorra" como ámbito.
  // No hay dirección postal ni parroquia en ninguna fuente pública.
  location: real("Principat d'Andorra"),
} satisfies Record<string, PendingValue>;

/**
 * Redes sociales. Facilitadas por la empresa.
 *
 * El orden es el de aparición en el pie. `handle` es lo que se lee; `url` es
 * a dónde va. Añadir una red es añadir una línea aquí: el pie las recorre.
 */
export const SOCIAL = [
  {
    name: 'Instagram',
    handle: '@pinturesgs',
    url: 'https://www.instagram.com/pinturesgs/',
  },
] as const;

/**
 * ── El teléfono ───────────────────────────────────────────────────────────
 * PINTURESGS trabaja en Andorra, así que el formulario da por hecho un número
 * andorrano: enseña el +376 fijo al lado del campo y quien escribe sólo pone
 * sus seis cifras. Andorra usa seis dígitos, sin prefijo interno.
 *
 * Aun así se acepta un internacional completo (empezando por +) para quien
 * llame desde fuera: obligar a todo el mundo a tener número andorrano dejaría
 * fuera a un cliente español con una obra en Andorra, que es un caso real.
 */
export const PHONE_CC = '+376';
export const PHONE_COUNTRY = 'Andorra';
/** Cuántas cifras tiene un número andorrano, sin prefijo. */
export const PHONE_NATIONAL_DIGITS = 6;

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
