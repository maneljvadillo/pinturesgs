/**
 * MANIFIESTO DE FOTOGRAFÍAS
 * ─────────────────────────
 * Fuente única de verdad de las imágenes del sitio.
 *
 * Hoy son fotos de banco libres de derechos (Pexels License: uso comercial
 * permitido, sin atribución obligatoria). Están pensadas para sustituirse por
 * fotos reales de PINTURESGS.
 *
 * PARA SUSTITUIR UNA FOTO POR UNA REAL:
 *   1. Deja el archivo en `src/assets/photos/` con el mismo nombre (`<key>.jpg`).
 *   2. En la entrada de abajo, pon `stock: false` y borra `pexelsId`.
 *   3. Ya está. No hay que tocar ningún componente.
 *
 * Las fotos SÍ se versionan en git, para que el deploy no dependa de que
 * Pexels esté disponible. `npm run fetch:photos` sirve para (re)generarlas
 * desde este manifiesto, no es un paso del build.
 */

export type PhotoEntry = {
  /** Nombre de archivo sin extensión, y clave usada desde services.ts / projects.ts */
  key: string;
  /** Texto alternativo. Obligatorio y descriptivo: es lo que oye un lector de pantalla. */
  alt: string;
  /** true = foto de banco pendiente de sustituir por una real de PINTURESGS */
  stock: boolean;
  /** ID de Pexels, solo mientras sea foto de banco. */
  pexelsId?: number;
  /** Ancho al que se descarga el original. */
  width?: number;
  /**
   * Recorte opcional, en fracciones del original ya redimensionado
   * (0–1). Se aplica antes de guardar.
   */
  crop?: { left: number; top: number; width: number; height: number };
};

export const PHOTOS: PhotoEntry[] = [
  // ── Servicios ────────────────────────────────────────────────────────────
  { key: 'servicio-hogar', pexelsId: 6474471, stock: true,
    alt: 'Pintor aplicando pintura con rodillo de mango largo en la pared de una vivienda' },
  { key: 'servicio-negocios', pexelsId: 8606292, stock: true,
    alt: 'Interior de oficina moderna con mobiliario de madera y puestos de trabajo' },
  { key: 'servicio-exteriores', pexelsId: 2209529, stock: true,
    alt: 'Operarios trabajando sobre un andamio en la fachada de un edificio' },
  { key: 'servicio-parkings', pexelsId: 3095713, stock: true,
    alt: 'Parking cubierto con pilares señalizados en amarillo y suelo pintado' },
  { key: 'servicio-altura', pexelsId: 32115287, stock: true,
    alt: 'Operario pintando la fachada de un edificio desde una plataforma elevadora' },
  { key: 'servicio-metal', pexelsId: 8689333, stock: true,
    alt: 'Superficie metálica con pintura desconchada y óxido, antes del tratamiento anticorrosión' },
  { key: 'servicio-madera', pexelsId: 16047683, stock: true,
    alt: 'Puerta de madera antigua con pintura turquesa y herrajes desgastados' },
  { key: 'servicio-acabados', pexelsId: 4286939, stock: true,
    alt: 'Detalle de una pared con estuco decorativo blanco en relieve' },
  { key: 'servicio-industrial', pexelsId: 12771407, stock: true,
    alt: 'Interior diáfano de una nave industrial con estructura metálica vista' },

  // ── Proyectos ────────────────────────────────────────────────────────────
  { key: 'proyecto-parking', pexelsId: 2280148, stock: true,
    alt: 'Parking subterráneo vacío con pilares de hormigón e iluminación lineal' },
  { key: 'proyecto-vivienda', pexelsId: 1115804, stock: true,
    alt: 'Vivienda unifamiliar moderna de fachada blanca bajo un cielo despejado' },
  { key: 'proyecto-fachada', pexelsId: 5768449, stock: true,
    alt: 'Fachada de un edificio residencial blanco con vegetación en la planta baja' },
  { key: 'proyecto-oficinas', pexelsId: 8477444, stock: true,
    alt: 'Oficina diáfana con mesas corridas, sillas ergonómicas y suelo de madera' },
  { key: 'proyecto-nave', pexelsId: 30912898, stock: true,
    alt: 'Estructura metálica interior de una nave industrial vista en simetría' },
  { key: 'proyecto-local', pexelsId: 5490931, stock: true,
    alt: 'Interior de local comercial con estanterías, iluminación de raíl y plantas' },

  // ── Herramienta "Pinta el teu espai" ─────────────────────────────────────
  // Frontal, pared de ladrillo lisa y bien iluminada: es la que mejor deja ver
  // que el color respeta la textura y las sombras reales de la foto.
  //
  // Se recorta el tercio izquierdo. El original tiene ahí un foco de pie, una
  // bicicleta, una mecedora y un macetero: objetos grises y lisos que la
  // máscara de pared no puede separar del ladrillo por color, y que obligarían
  // a recortarlos a mano dejando halos. Fuera de encuadre desaparece el
  // problema y la pared gana protagonismo. Siguen dentro sofá, mesa y plantas.
  { key: 'salon', pexelsId: 20390760, stock: true, width: 1600,
    crop: { left: 615 / 1600, top: 0, width: 985 / 1600, height: 1 },
    alt: 'Salón con sofá gris, mesa de centro redonda, planta de interior y pared de ladrillo pintada de blanco' },

  // ── Sala de la herramienta ───────────────────────────────────────────────
  // NO es una foto de banco ni una obra real: es una sala generada a medida
  // para "Pinta el teu espai", con tres planos de pared limpios y muebles bajos
  // que casi no tapan. Se hizo así a propósito, porque en una foto cualquiera
  // las paredes se recortan mal y el color acaba derramándose sobre los
  // muebles. `stock: false` para que no la reclame `npm run fetch:photos` ni
  // aparezca en el aviso de fotos de banco.
  { key: 'sala-tres-paredes', stock: false,
    alt: 'Sala vacía con tres paredes visibles, suelo de roble en espiga, sofá gris, mesa auxiliar y una planta' },
];

export const PHOTO_BY_KEY: Record<string, PhotoEntry> = Object.fromEntries(
  PHOTOS.map((p) => [p.key, p]),
);

/** ¿Queda alguna foto de banco? Lo usa la home para mostrar el aviso. */
export const HAS_STOCK_PHOTOS = PHOTOS.some((p) => p.stock);
