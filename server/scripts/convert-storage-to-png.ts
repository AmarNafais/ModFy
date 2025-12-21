import fs from 'fs';
import path from 'path';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCb);

// Root to process
const ROOT = path.join(process.cwd(), 'storage', 'products');

type FileInfo = { full: string; dir: string; base: string; ext: string; rel: string };

function walkImages(root: string): FileInfo[] {
  const files: FileInfo[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.jpg', '.jpeg', '.heic'].includes(ext)) {
          const dirName = path.dirname(full);
          const base = path.basename(entry.name, ext);
          const rel = path.relative(root, full).replace(/\\/g, '/');
          files.push({ full, dir: dirName, base, ext, rel });
        }
      }
    }
  }

  walk(root);
  return files;
}

async function convertFile(file: FileInfo) {
  const outPath = path.join(file.dir, `${file.base}.png`);

  // If output already exists, skip conversion but remove source later if same content assumed
  if (fs.existsSync(outPath)) {
    console.log(`Skip (exists): ${file.rel} -> ${path.relative(ROOT, outPath).replace(/\\/g, '/')}`);
    return { converted: false, removed: false };
  }

  // Use ImageMagick (magick) to convert
  const cmd = `magick "${file.full}" "${outPath}"`;
  await exec(cmd);
  console.log(`Converted: ${file.rel} -> ${path.relative(ROOT, outPath).replace(/\\/g, '/')}`);
  return { converted: true, removed: false };
}

async function main() {
  if (!fs.existsSync(ROOT)) {
    console.error(`Root not found: ${ROOT}`);
    process.exit(1);
  }

  const images = walkImages(ROOT);
  console.log(`Found ${images.length} jpg/jpeg/heic files under ${ROOT}`);

  let converted = 0;
  let removed = 0;
  let failed = 0;

  for (const img of images) {
    try {
      const { converted: didConvert } = await convertFile(img);
      if (didConvert) converted++;
      // Remove source after successful convert
      fs.unlinkSync(img.full);
      removed++;
    } catch (err) {
      failed++;
      console.error(`Failed: ${img.rel}`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\nDone. Converted: ${converted}, removed source: ${removed}, failed: ${failed}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
