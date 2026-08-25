// Recorta el margen transparente del recorte de IA y lo deja al tamaño que
// usa la web, con el mismo criterio que el logo original.
import sharp from 'sharp';

const [, , input, output] = process.argv;
const img = sharp(input).trim({ threshold: 8 });
const buf = await img.png().toBuffer();
const meta = await sharp(buf).metadata();
await sharp(buf)
  .resize({ width: 1100, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: false })
  .toFile(output);
const out = await sharp(output).metadata();
console.log(`${input} -> ${output}: recortado ${meta.width}x${meta.height}, final ${out.width}x${out.height}`);
