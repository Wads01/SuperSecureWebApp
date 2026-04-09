import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), '..');
const source = path.join(projectRoot, 'node_modules', 'lightningcss-win32-x64-msvc', 'lightningcss.win32-x64-msvc.node');
const target = path.join(projectRoot, 'node_modules', 'lightningcss', 'lightningcss.win32-x64-msvc.node');

if (!fs.existsSync(source)) {
  console.warn('fix-lightningcss: source binary not found:', source);
  process.exit(0);
}

if (fs.existsSync(target)) {
  process.exit(0);
}

try {
  fs.copyFileSync(source, target);
  console.log('fix-lightningcss: copied native LightningCSS binary to', target);
} catch (error) {
  console.warn('fix-lightningcss: failed to copy LightningCSS binary:', error);
}
