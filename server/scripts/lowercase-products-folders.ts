import fs from 'fs';
import path from 'path';

// Root directory to process
const ROOT = path.join(process.cwd(), 'storage', 'products');

type DirInfo = { fullPath: string; parent: string; base: string; depth: number };

function getAllDirectories(root: string): DirInfo[] {
  const results: DirInfo[] = [];

  function walk(current: string, depth: number) {
    const items = fs.readdirSync(current, { withFileTypes: true });
    for (const item of items) {
      if (!item.isDirectory()) continue;
      const fullPath = path.join(current, item.name);
      results.push({ fullPath, parent: current, base: item.name, depth });
      walk(fullPath, depth + 1);
    }
  }

  walk(root, 0);
  return results;
}

function samePathInsensitive(a: string, b: string) {
  return path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
}

function safeRenameDir(src: string, dest: string) {
  // If destination exists and is a different directory, skip
  if (fs.existsSync(dest) && !samePathInsensitive(src, dest)) {
    console.log(`Skip: target exists -> ${dest}`);
    return;
  }
  const tmp = path.join(path.dirname(src), `_tmp_${Math.random().toString(36).slice(2)}`);
  fs.renameSync(src, tmp);
  fs.renameSync(tmp, dest);
  console.log(`Renamed: ${src} -> ${dest}`);
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.error(`Not found: ${ROOT}`);
    process.exit(1);
  }

  const dirs = getAllDirectories(ROOT);
  // Rename deepest first to avoid parent path changes breaking traversal
  dirs.sort((a, b) => b.depth - a.depth);

  let changes = 0;
  for (const d of dirs) {
    const lowerBase = d.base.toLowerCase();
    if (lowerBase !== d.base) {
      const target = path.join(d.parent, lowerBase);
      try {
        safeRenameDir(d.fullPath, target);
        changes++;
      } catch (e) {
        console.error(`Failed: ${d.fullPath} -> ${target}`, e);
      }
    }
  }

  console.log(`\nDone. ${changes} folder(s) renamed to lowercase.`);
}

main();
