/**
 * Genera las imágenes sociales a partir del logotipo real.
 *
 *   node scripts/build-social-images.mjs
 *
 *   public/og.png              1200×630  — la tarjeta que se ve al compartir
 *   public/apple-touch-icon.png 180×180  — icono al guardar en pantalla de inicio
 *
 * Se generan en vez de mantenerlas a mano para que sigan al logotipo si cambia.
 */
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = path.join(ROOT, 'src/assets/logo.png');
const OUT = path.join(ROOT, 'public');

const GESSO = '#FAFAF8';
const INK = '#161513';

await fs.mkdir(OUT, { recursive: true });

// ── Tarjeta social ─────────────────────────────────────────────────────────
{
  const W = 1200, H = 630;
  const logo = await sharp(LOGO).resize({ height: 330 }).toBuffer();
  const { width: lw } = await sharp(logo).metadata();

  // Fondo gesso con un rastro de color por debajo, como el hero.
  const bg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="#FF1E3C"/><stop offset="14%" stop-color="#FF7A00"/>
          <stop offset="28%"  stop-color="#FFD400"/><stop offset="43%" stop-color="#00D26A"/>
          <stop offset="57%"  stop-color="#00C2D1"/><stop offset="71%" stop-color="#2979FF"/>
          <stop offset="86%"  stop-color="#C400FF"/><stop offset="100%" stop-color="#FF2FB0"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="${GESSO}"/>
      <rect x="0" y="${H - 14}" width="${W}" height="14" fill="url(#stripe)"/>
      <text x="72" y="300" font-family="Georgia, serif" font-size="60" font-weight="500" fill="${INK}">No solo pintamos.</text>
      <text x="72" y="372" font-family="Georgia, serif" font-size="60" font-weight="500" fill="${INK}">Transformamos espacios.</text>
      <text x="72" y="432" font-family="Helvetica, Arial, sans-serif" font-size="23" fill="#8A8680">Pintura profesional · interior, exterior, altura e industrial</text>
    </svg>`);

  await sharp(bg)
    .composite([{ input: logo, top: Math.round((H - 330) / 2), left: W - lw - 72 }])
    .png()
    .toFile(path.join(OUT, 'og.png'));
  console.log('✓ og.png 1200×630');
}

// ── Icono para iOS ─────────────────────────────────────────────────────────
{
  const S = 180;
  const logo = await sharp(LOGO).resize({ width: Math.round(S * 0.86) }).toBuffer();
  const { width: lw, height: lh } = await sharp(logo).metadata();
  await sharp({ create: { width: S, height: S, channels: 4, background: GESSO } })
    .composite([{ input: logo, top: Math.round((S - lh) / 2), left: Math.round((S - lw) / 2) }])
    .png()
    .toFile(path.join(OUT, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png 180×180');
}
