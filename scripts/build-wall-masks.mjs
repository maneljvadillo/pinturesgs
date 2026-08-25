/**
 * Genera las MÁSCARAS DE LAS TRES PAREDES de la sala de "Pinta el teu espai".
 *
 *   node scripts/build-wall-masks.mjs [--debug]
 *
 * La herramienta necesita saber, píxel a píxel, qué es pared y qué es sofá,
 * planta, mesa, suelo o techo. Sin esto el color se aplicaría en un rectángulo
 * plano que pintaría por encima de los muebles.
 *
 * SALIDA: public/room/sala-paredes.png — un solo PNG en color donde cada canal
 * es una pared:
 *
 *   R → pared izquierda      G → pared del fondo      B → tabique derecho
 *
 * Un archivo en vez de tres: una sola descarga, y las tres máscaras llegan
 * siempre sincronizadas con la foto. Va a public/ y NO a src/assets porque
 * Astro reoptimizaría la imagen y los valores de gris tienen que llegar al
 * navegador exactamente como se generan aquí.
 *
 * MÉTODO (el mismo que la máscara de una sola pared que había antes):
 *
 *   1. GEOMETRÍA — cada pared es un polígono. Sus vértices están MEDIDOS sobre
 *      la foto con barridos de luminancia, no puestos a ojo, y metidos 2-4 px
 *      hacia dentro: es preferible dejar un hilo sin pintar en la esquina a que
 *      el color se derrame sobre la pared vecina.
 *   2. CLAVE DE COLOR — dentro del polígono se descarta lo que no puede ser
 *      pared: demasiado oscuro (el sofá gris, L≈0.42 frente a 0.66-0.85 de las
 *      paredes) o demasiado saturado (la planta, S≈0.67, y el suelo de roble,
 *      S≈0.37).
 *   3. LIMPIEZA — desenfoque + umbral para cerrar poros y comerse las motas, y
 *      recorte final contra la geometría para que el desenfoque no desborde.
 *
 * Las tres paredes tienen tonos distintos (la luz entra por la izquierda), y
 * eso es justo lo que hace que al pintarlas se vean como planos distintos: el
 * sombreado de cada una se normaliza por separado en el navegador.
 */
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/assets/photos/sala-tres-paredes.jpg');
const OUT_DIR = path.join(ROOT, 'public/room');
const DEBUG = process.argv.includes('--debug');

// ── 1. Geometría, en fracciones del encuadre ───────────────────────────────
// Medidas (sobre el encuadre normalizado a 1000 px de ancho):
//   · canto vertical izquierda|fondo ...... x = 0.284
//   · canto vertical fondo|tabique ........ x = 0.687
//   · techo de la pared izquierda ......... de y = 0.023 (x=0) a y = 0.168 (x=0.284)
//   · techo de la pared del fondo ......... y = 0.167 → 0.174
//   · rodapié de la pared izquierda ....... de y = 0.824 (x=0) a y = 0.730 (x=0.284)
//   · rodapié de la pared del fondo ....... y = 0.747
//   · rodapié del tabique ................. y = 0.905
/*
  Cada pared lleva SU PROPIA clave de color, no una común. La luz entra por la
  izquierda y cae hacia la derecha: el fondo está a L≈0.85 mientras que la
  esquina superior del tabique baja a L≈0.46, más oscura incluso que el sofá
  (L≈0.42). Con un único umbral no hay número que valga: o se comía la esquina
  del tabique o se tragaba el sofá.
*/
const WALLS = [
  {
    channel: 0,
    id: 'izquierda',
    // Sube hasta el techo por la izquierda y baja al rodapié: es un trapecio.
    poly: [[0.000, 0.030], [0.283, 0.172], [0.283, 0.724], [0.000, 0.812]],
    // La franja del borde izquierdo está quemada por la luz de la ventana
    // (L≈0.98) y ahí el color se dispara a S≈0.41 sin dejar de ser pared: por
    // eso `blown`, que acepta cualquier píxel casi blanco.
    key: { minL: 0.50, maxL: 1.00, maxS: 0.45, blown: 0.92 },
  },
  {
    channel: 1,
    id: 'fondo',
    poly: [[0.286, 0.174], [0.686, 0.179], [0.686, 0.743], [0.286, 0.743]],
    // Aquí conviven la pared clara (L≈0.85), el sofá (L≈0.42) y la planta
    // (S≈0.67): el umbral de luminancia es el que separa el sofá.
    key: { minL: 0.46, maxL: 1.00, maxS: 0.30, blown: 0.95 },
  },
  {
    channel: 2,
    id: 'tabique',
    // Llega al borde superior del encuadre: no se ve dónde acaba.
    poly: [[0.689, 0.000], [1.000, 0.000], [1.000, 0.899], [0.689, 0.899]],
    // Degradado de luz muy marcado: de L≈0.75 pegado al canto a L≈0.46 en la
    // esquina de arriba a la derecha. Dentro de este polígono no hay muebles.
    key: { minL: 0.32, maxL: 1.00, maxS: 0.30, blown: 0.95 },
  },
];

/**
 * Objetos que tapan pared y que la clave de color no separa por sí sola.
 * El sofá se va por luminancia, pero sus cojines cogen un brillo que roza el
 * umbral; la mesa de roble tiene el tablero tan claro como la pared.
 *
 * El sofá va como polígono y no como rectángulo: su brazo izquierdo avanza
 * hacia el centro según baja (x≈0.504 arriba, x≈0.458 abajo) y un rectángulo
 * que lo cubriese entero se comía una franja de pared por encima.
 */
const OCCLUDERS = [
  { name: 'sofa', poly: [[0.497, 0.594], [0.690, 0.594], [0.690, 0.830], [0.448, 0.830], [0.448, 0.660]] },
  { name: 'mesa', poly: [[0.398, 0.650], [0.505, 0.650], [0.505, 0.800], [0.398, 0.800]] },
];

// ── Implementación ─────────────────────────────────────────────────────────

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const N = W * H;

/** ¿Está el punto dentro del polígono? (regla par-impar) */
function inPoly(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = [poly[i][0] * W, poly[i][1] * H];
    const [xj, yj] = [poly[j][0] * W, poly[j][1] * H];
    const hits = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hits) inside = !inside;
  }
  return inside;
}

/** Clave de color: ¿este píxel puede ser pared, con el umbral de SU pared? */
function isWallColour(i, key) {
  const j = i * C;
  const r = data[j] / 255, g = data[j + 1] / 255, b = data[j + 2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2, d = mx - mn;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  // Un píxel quemado ha perdido el color: su saturación no dice nada.
  if (l >= key.blown) return true;
  return l >= key.minL && l <= key.maxL && s <= key.maxS;
}

const channels = [];
for (const wall of WALLS) {
  const geom = Buffer.alloc(N, 0);
  const raw = Buffer.alloc(N, 0);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!inPoly(wall.poly, x + 0.5, y + 0.5)) continue;
      if (OCCLUDERS.some((o) => inPoly(o.poly, x + 0.5, y + 0.5))) continue;
      const i = y * W + x;
      geom[i] = 255;
      if (isWallColour(i, wall.key)) raw[i] = 255;
    }
  }

  // 3. Limpieza: cerrar poros y motas, y recortar contra la geometría.
  const A = 6, CROSS = 0.4 * 255;
  const smoothed = await sharp(raw, { raw: { width: W, height: H, channels: 1 } })
    .blur(3.0)
    .linear(A, 128 - A * CROSS)
    .toColourspace('b-w')
    .raw()
    .toBuffer();

  const geomSoft = await sharp(geom, { raw: { width: W, height: H, channels: 1 } })
    .blur(0.8)
    .toColourspace('b-w')
    .raw()
    .toBuffer();

  const out = Buffer.alloc(N);
  for (let i = 0; i < N; i++) out[i] = (smoothed[i] * geomSoft[i]) / 255;

  const cleaned = await sharp(out, { raw: { width: W, height: H, channels: 1 } })
    .blur(1.0)
    .toColourspace('b-w')
    .raw()
    .toBuffer();

  let sum = 0;
  for (let i = 0; i < N; i++) sum += cleaned[i];
  channels[wall.channel] = { id: wall.id, buf: cleaned, coverage: (sum / N / 255) * 100 };
}

// Un PNG con las tres máscaras, una por canal.
const rgb = Buffer.alloc(N * 3);
for (let i = 0; i < N; i++) {
  rgb[i * 3] = channels[0].buf[i];
  rgb[i * 3 + 1] = channels[1].buf[i];
  rgb[i * 3 + 2] = channels[2].buf[i];
}
await fs.mkdir(OUT_DIR, { recursive: true });
const png = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();
await fs.writeFile(path.join(OUT_DIR, 'sala-paredes.png'), png);

console.log(`✓ sala-paredes.png  ${W}×${H}  ${(png.length / 1024).toFixed(0)} kB`);
for (const ch of channels) console.log(`   ${ch.id.padEnd(11)} ${ch.coverage.toFixed(1)}% del encuadre`);

// ── Vista de comprobación ──────────────────────────────────────────────────
if (DEBUG) {
  const TINT = [[255, 47, 176], [0, 210, 106], [41, 121, 255]];
  const rgba = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let c = 0; c < 3; c++) {
      const v = channels[c].buf[i];
      if (v > a) { a = v; [r, g, b] = TINT[c]; }
    }
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = Math.round(a * 0.55);
  }
  const preview = await sharp(SRC)
    .composite([{ input: rgba, raw: { width: W, height: H, channels: 4 }, blend: 'over' }])
    .jpeg({ quality: 88 })
    .toBuffer();
  const dbg = path.join(OUT_DIR, '_debug-paredes.jpg');
  await fs.writeFile(dbg, preview);
  console.log(`  debug → ${path.relative(ROOT, dbg)}`);
}
