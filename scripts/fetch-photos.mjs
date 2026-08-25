/**
 * Descarga las fotos de banco declaradas en src/data/photos.ts.
 *
 *   npm run fetch:photos
 *
 * Las fotos descargadas SÍ se commitean: así el deploy no depende de que Pexels
 * responda. Este script es la forma de (re)generarlas desde el manifiesto: las
 * normaliza a un ancho razonable y escribe CREDITS.md con la procedencia.
 *
 * Si una foto ya existe en disco NO se vuelve a descargar (usa --force para
 * rehacerlas). Las fotos marcadas `stock: false` son reales del cliente: el
 * script no las toca nunca.
 */
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/assets/photos');
const FORCE = process.argv.includes('--force');

/** Lee el manifiesto sin arrastrar TypeScript: extrae los literales con regex. */
async function readManifest() {
  const src = await fs.readFile(path.join(ROOT, 'src/data/photos.ts'), 'utf8');
  const body = src.slice(src.indexOf('export const PHOTOS'), src.indexOf('export const PHOTO_BY_KEY'));
  const entries = [];
  for (const block of body.split('{ key:').slice(1)) {
    const key = block.match(/^\s*'([^']+)'/)?.[1];
    const pexelsId = block.match(/pexelsId:\s*(\d+)/)?.[1];
    const stock = /stock:\s*true/.test(block);
    const width = block.match(/width:\s*(\d+)/)?.[1];
    // El recorte se declara como fracciones, a veces escritas como división.
    const cropRaw = block.match(/crop:\s*\{([^}]+)\}/)?.[1];
    let crop;
    if (cropRaw) {
      const num = (name) => {
        const m = cropRaw.match(new RegExp(`${name}:\\s*([0-9./ ]+)`));
        if (!m) return undefined;
        const [a, b] = m[1].trim().split('/');
        return b ? Number(a) / Number(b) : Number(a);
      };
      crop = { left: num('left'), top: num('top'), width: num('width'), height: num('height') };
    }
    if (key) entries.push({ key, pexelsId: pexelsId && Number(pexelsId), stock, width: width ? Number(width) : 1400, crop });
  }
  return entries;
}

const pexelsUrl = (id, w) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'pinturesgs-web/1.0 (build script)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const photos = await readManifest();
await fs.mkdir(OUT, { recursive: true });

let downloaded = 0, skipped = 0, real = 0;
const credits = [];

for (const p of photos) {
  const dest = path.join(OUT, `${p.key}.jpg`);

  if (!p.stock) {
    real++;
    console.log(`  ·  ${p.key} — foto real del cliente, no se toca`);
    continue;
  }
  if (existsSync(dest) && !FORCE) {
    skipped++;
    credits.push(p);
    continue;
  }
  if (!p.pexelsId) {
    console.warn(`  !  ${p.key} — marcada como stock pero sin pexelsId, se omite`);
    continue;
  }

  process.stdout.write(`  ↓  ${p.key} … `);
  const buf = await download(pexelsUrl(p.pexelsId, p.width));
  // Reencodamos a un JPEG progresivo y limpio. Astro genera después los
  // AVIF/WebP responsive a partir de este original.
  let pipeline = sharp(buf).resize({ width: p.width, withoutEnlargement: true });
  if (p.crop) {
    const meta = await sharp(await pipeline.clone().toBuffer()).metadata();
    pipeline = sharp(await pipeline.toBuffer()).extract({
      left: Math.round(p.crop.left * meta.width),
      top: Math.round(p.crop.top * meta.height),
      width: Math.round(p.crop.width * meta.width),
      height: Math.round(p.crop.height * meta.height),
    });
  }
  const out = await pipeline
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toBuffer();
  await fs.writeFile(dest, out);
  const { width, height } = await sharp(out).metadata();
  console.log(`${width}×${height}, ${(out.length / 1024).toFixed(0)} kB`);
  downloaded++;
  credits.push(p);
}

// ── CREDITS.md ────────────────────────────────────────────────────────────
const md = `# Créditos de las imágenes

> Generado automáticamente por \`npm run fetch:photos\`. No editar a mano.

## Logotipo

\`src/assets/logo.png\` — logotipo de PINTURESGS. Propiedad del cliente.

## Fotografías de banco (temporales)

Todas provienen de **Pexels** y se usan bajo la [Pexels License](https://www.pexels.com/license/):
uso gratuito para fines comerciales y **sin atribución obligatoria**. Aun así las
listamos aquí para poder rastrear su origen y sustituirlas ordenadamente.

⚠️ **Ninguna de estas imágenes documenta un proyecto real de PINTURESGS.**
Son referencias visuales hasta disponer de fotografías propias.

| Archivo | Origen |
|---|---|
${credits.map((p) => `| \`${p.key}.jpg\` | [pexels.com/photo/${p.pexelsId}](https://www.pexels.com/photo/${p.pexelsId}/) |`).join('\n')}

## Cómo sustituirlas por fotos reales

1. Deja la foto en \`src/assets/photos/\` con el mismo nombre de archivo.
2. En \`src/data/photos.ts\`, pon \`stock: false\` y borra el \`pexelsId\`.
3. Revisa el \`alt\`: debe describir lo que se ve en la foto nueva.
4. Vuelve a generar este archivo con \`npm run fetch:photos\`.
`;
await fs.writeFile(path.join(ROOT, 'CREDITS.md'), md);

console.log(
  `\n✓ ${downloaded} descargadas · ${skipped} ya existían · ${real} reales del cliente` +
  `\n✓ CREDITS.md actualizado`,
);
