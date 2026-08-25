/**
 * Las variantes del logotipo.
 *
 *   clasico     el original de la empresa: ilustración plana.
 *   realista-a  repintado con IA a partir del original: pintura acrílica real,
 *               brillo húmedo y textura. Es el más fotográfico.
 *   realista-b  igual, pero respetando más la silueta y el trazo del original.
 *
 * Las dos variantes de IA se generaron con Nano Banana Pro tomando el logotipo
 * original como referencia, y se les recortó el fondo. Se conservan las dos
 * hasta que la empresa elija; cambiar la de la web es cambiar DEFAULT_LOGO.
 */
import clasico from '~/assets/logo.png';
import realistaA from '~/assets/logo-realista-a.png';
import realistaB from '~/assets/logo-realista-b.png';

export type LogoVariant = 'clasico' | 'realista-a' | 'realista-b';

export const LOGOS = {
  clasico,
  'realista-a': realistaA,
  'realista-b': realistaB,
} as const;

/** La variante que usa toda la web. Cambia esta línea y cambia en todas partes. */
export const DEFAULT_LOGO: LogoVariant = 'realista-b';
