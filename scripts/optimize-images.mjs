// Converts photos to responsive WebP and updates src/data/images.json.
// Usage: node scripts/optimize-images.mjs <source-image> <name> [focal, e.g. "50% 30%"]
// Output: public/images/<name>.webp (1600w) + <name>-640.webp, <name>-1024.webp
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [src, name, focal = '50% 50%'] = process.argv.slice(2);
if (!src || !name) {
  console.error('Usage: node scripts/optimize-images.mjs <source> <name> [focal]');
  process.exit(1);
}

const outDir = 'public/images';
const manifestPath = 'src/data/images.json';
fs.mkdirSync(outDir, { recursive: true });

const WIDTHS = [640, 1024, 1600];
const meta = await sharp(src).rotate().metadata();
const variants = [];

for (const w of WIDTHS) {
  const width = Math.min(w, meta.width);
  // Skip sizes the original can't reach (keeps the largest one as the main file)
  if (w !== 1600 && width < w) continue;
  const file = w === 1600 ? `${name}.webp` : `${name}-${w}.webp`;
  const info = await sharp(src)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: w === 1600 ? 78 : 74, effort: 6 })
    .toFile(path.join(outDir, file));
  variants.push({ file, width: info.width, height: info.height, kb: Math.round(info.size / 1024) });
}

const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const main = variants[variants.length - 1];
manifest[`/images/${name}.webp`] = {
  width: main.width,
  height: main.height,
  srcset: variants.map((v) => `/images/${v.file} ${v.width}w`).join(', '),
  position: focal,
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(name, variants.map((v) => `${v.width}w ${v.kb}KB`).join(' · '));
