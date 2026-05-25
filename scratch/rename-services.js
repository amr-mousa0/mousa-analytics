import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folders = [
  path.join(__dirname, '../src/content/services/en'),
  path.join(__dirname, '../src/content/services/ar')
];

folders.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.md') && /^\d-/.test(file)) {
      const oldPath = path.join(dir, file);
      const newPath = path.join(dir, file.replace(/^\d-/, ''));
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: ${oldPath} -> ${newPath}`);
    }
  });
});
