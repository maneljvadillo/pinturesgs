/**
 * Genera la MÁSCARA DE PARED de la foto del salón.
 *
 *   node scripts/build-wall-mask.mjs [--debug]
 *
 * La herramienta "Pinta el teu espai" necesita saber qué píxeles son pared y
 * cuáles son sofá, cuadros, plantas o suelo. Sin esto, el color se aplicaría
 * en un rectángulo plano que pintaría por encima de los muebles.
 *
 * No hay segmentación por IA (eso exigiría una API externa). El método es:
 *
 *   1. GEOMETRÍA  — el plano de la pared del fondo, menos los objetos que la
 *                   tapan y que el color NO puede distinguir: el sofá y el puf
 *                   son grises desaturados igual que el ladrillo, y el
 *                   passepartout de los cuadros cae en el mismo rango de
 *                   luminancia que la pared cuando le da el sol.
 *   2. COLOR KEY  — dentro de esa zona se descartan los píxeles imposibles:
 *                   demasiado saturados (la planta), demasiado oscuros
 *                   (sombras duras) o demasiado claros.
 *   3. LIMPIEZA   — desenfoque + umbral para cerrar los poros del ladrillo,
 *                   y recorte final contra la geometría para que el color no
 *                   se derrame sobre los muebles.
 *
 * La foto viene ya recortada por el tercio izquierdo (ver src/data/photos.ts):
 * allí había un foco, una bici y una mecedora imposibles de separar por color.
 *
 * Toda la geometría está en FRACCIONES del encuadre, no en píxeles, para que
 * siga siendo válida si se cambia la resolución de la foto.
 *
 * Salida: public/room/salon-mask.png (escala de grises, blanco = pared).
 */
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/assets/photos/salon.jpg');
// Va a public/ y NO a src/assets: Astro reoptimizaría la imagen y los valores
// de gris de la máscara deben llegar al navegador exactamente como se generan.
const OUT_DIR = path.join(ROOT, 'public/room');
const DEBUG = process.argv.includes('--debug');

// ── 1. Geometría, en fracciones del encuadre ───────────────────────────────

/** Plano de la pared de ladrillo del fondo. */
// Esquina derecha medida por barrido: la pared de ladrillo acaba en x≈852/985.
const WALL = { x0: 0, y0: 0, x1: 0.865, y1: 0.784 };

/** Objetos que tapan la pared y que el color no separa por sí solo. */
const OCCLUDERS = [
  // Todos los bordes están MEDIDOS sobre la foto (barridos de luminancia),
  // no estimados a ojo, y llevan 3–6 px de margen: es preferible dejar un
  // hilo de pared sin pintar a que el color se derrame sobre el mueble.
  //
  // Sofá gris: misma luminancia y saturación que el ladrillo. Borde superior
  // en y≈487, borde derecho en x≈504.
  { name: 'sofa', rect: [0, 0.5411, 0.518, 0.834] },
  // Puf de tela: empieza en x≈518.
  { name: 'puf', rect: [0.522, 0.694, 0.719, 0.852] },
  // Los dos cuadros. El passepartout (L 0.73–0.83) se solapa exactamente con
  // la pared iluminada (L 0.75–0.79): sólo la geometría los separa.
  // Marcos medidos: el izquierdo acaba en x=195, el derecho va de 227 a 448;
  // ambos de y=102 a y=442.
  { name: 'cuadro-izq', rect: [0, 0.1111, 0.2000, 0.4933] },
  { name: 'cuadro-der', rect: [0.2284, 0.1111, 0.4569, 0.4933] },
];

// ── 2. Color key ───────────────────────────────────────────────────────────
// El ladrillo pintado va de L≈0.39 en sombra a L≈0.86 en los brillos justo
// encima del sofá, siempre con saturación casi nula. La planta se va por
// saturación y la maceta negra (L≈0.28) por el mínimo de luminancia. El
// máximo puede ser generoso porque los objetos claros (cuadros) ya los quita
// la geometría. La franja de pared justo encima del sofá recoge un rebote
// cálido y llega a S≈0.11, de ahí que el tope de saturación sea 0.14 y no el
// 0.085 que parecería bastar: por debajo, esa franja quedaba sin pintar.
const KEY = { minL: 0.33, maxL: 0.88, maxS: 0.14 };

/**
 * VETO — lo que no puede ser pared pase lo que pase.
 *
 * El paso de limpieza desenfoca y vuelve a umbralizar para cerrar los poros del
 * ladrillo, y eso también rellena los huecos finos ENTRE LAS HOJAS de la
 * planta: sin este veto, trozos de hoja acababan dentro de la máscara y se
 * pintaban. El veto se aplica DESPUÉS de la limpieza, así que la limpieza
 * puede quitar píxeles pero nunca añadir uno que aquí esté prohibido.
 */
function isVetoed(r, g, b) {
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (L < 0.30) return true;                       // demasiado oscuro para ser esta pared
  const greenish = g - r > 8 && g - b > 8;         // follaje
  return greenish && L < 0.52;
}

// ── Implementación ─────────────────────────────────────────────────────────

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const N = W * H;

const px = (fx, fy) => [Math.round(fx * W), Math.round(fy * H)];

/** Máscara geométrica: 255 donde el plano de pared no está tapado. */
const geom = Buffer.alloc(N, 0);
{
  const [wx0, wy0] = px(WALL.x0, WALL.y0);
  const [wx1, wy1] = px(WALL.x1, WALL.y1);
  const boxes = OCCLUDERS.map((o) => {
    const [x0, y0] = px(o.rect[0], o.rect[1]);
    const [x1, y1] = px(o.rect[2], o.rect[3]);
    return { x0, y0, x1, y1 };
  });
  for (let y = Math.max(0, wy0); y <= Math.min(wy1, H - 1); y++) {
    for (let x = Math.max(0, wx0); x <= Math.min(wx1, W - 1); x++) {
      if (boxes.some((b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1)) continue;
      geom[y * W + x] = 255;
    }
  }
}

/** Máscara cruda: geometría ∩ color key. */
const raw = Buffer.alloc(N, 0);
for (let i = 0; i < N; i++) {
  if (!geom[i]) continue;
  const j = i * C;
  const r = data[j] / 255, g = data[j + 1] / 255, b = data[j + 2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2, d = mx - mn;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (l < KEY.minL || l > KEY.maxL || s > KEY.maxS) continue;
  raw[i] = 255;
}

// ── 3. Limpieza ────────────────────────────────────────────────────────────
// Desenfocar y volver a umbralizar cierra los poros del ladrillo y se come las
// motas sueltas. El umbral cruza en el 40% para que el relleno gane terreno.
const A = 6, CROSS = 0.4 * 255;
const smoothed = await sharp(raw, { raw: { width: W, height: H, channels: 1 } })
  .blur(3.5)
  .linear(A, 128 - A * CROSS)
  .toColourspace('b-w')
  .raw()
  .toBuffer();

// El desenfoque desborda sobre los muebles: se recorta otra vez contra la
// geometría, con un pixel de transición para que el borde no quede escalonado.
const geomSoft = await sharp(geom, { raw: { width: W, height: H, channels: 1 } })
  .blur(0.8)
  .toColourspace('b-w')
  .raw()
  .toBuffer();

// Veto por color, suavizado un pelín para que el borde de la hoja no quede
// dentado contra el color de la pared.
const vetoRaw = Buffer.alloc(N, 255);
for (let i = 0; i < N; i++) {
  const j = i * C;
  if (isVetoed(data[j], data[j + 1], data[j + 2])) vetoRaw[i] = 0;
}
const veto = await sharp(vetoRaw, { raw: { width: W, height: H, channels: 1 } })
  .blur(0.8)
  .toColourspace('b-w')
  .raw()
  .toBuffer();

const finalMask = Buffer.alloc(N);
for (let i = 0; i < N; i++) {
  finalMask[i] = (smoothed[i] * geomSoft[i] * veto[i]) / (255 * 255);
}

const cleaned = await sharp(finalMask, { raw: { width: W, height: H, channels: 1 } })
  .blur(1.2)
  .toColourspace('b-w')
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(path.join(OUT_DIR, 'salon-mask.png'), cleaned);

let sum = 0;
for (let i = 0; i < N; i++) sum += finalMask[i];
const coverage = ((sum / N / 255) * 100).toFixed(1);
const meta = await sharp(cleaned).metadata();
console.log(
  `✓ salon-mask.png  ${W}×${H}  ${meta.channels} canal  ${(cleaned.length / 1024).toFixed(0)} kB` +
  `  · pared = ${coverage}% del encuadre`,
);

// ── Vista de comprobación ──────────────────────────────────────────────────
if (DEBUG) {
  const rgba = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    rgba[i * 4] = 255; rgba[i * 4 + 1] = 47; rgba[i * 4 + 2] = 176;
    rgba[i * 4 + 3] = Math.round(finalMask[i] * 0.62);
  }
  const preview = await sharp(SRC)
    .composite([{ input: rgba, raw: { width: W, height: H, channels: 4 }, blend: 'over' }])
    .jpeg({ quality: 88 }).toBuffer();
  const dbg = path.join(OUT_DIR, '_debug-mask.jpg');
  await fs.writeFile(dbg, preview);
  console.log(`  debug → ${path.relative(ROOT, dbg)}`);
}
