import sharp from 'sharp';
import { copyFile } from 'node:fs/promises';

const [podiumPath, awardPath] = process.argv.slice(2);
if (!podiumPath || !awardPath) throw new Error('Usage: node scripts/import-photos.mjs <podium.png> <award.png>');
const photos = [[podiumPath, 'mohamed-podium'], [awardPath, 'mohamed-award']];
for (const [path, name] of photos) {
  await copyFile(path, `public/images/${name}.png`);
  await sharp(path).webp({ quality: 90 }).toFile(`public/images/${name}.webp`);
  console.log(`${name}: imported and optimized`);
}
