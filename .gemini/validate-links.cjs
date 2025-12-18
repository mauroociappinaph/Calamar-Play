/**
 * validate-links.js
 * Valida links internos en archivos Markdown de /docs.
 * Uso: node .gemini/validate-links.js
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const ROOT_DIR = path.join(__dirname, '..');

// ✅ FIX: Consistencia con path.join (evita "/" hardcodeado)
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file); // ← más limpio

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.md')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// ✅ NEW: Extracción de lógica para testabilidad
function extractLinks(content) {
  // Ignorar bloques de código
  let cleaned = content.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`[^`\n]+`/g, '');

  const links = [];
  // ✅ FIX: Regex más robusto (permite espacios en label)
  const linkRegex = /\[([^\]]*)\]\((?!http|https|mailto|#)([^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(cleaned)) !== null) {
    const [fullMatch, label, href] = match;
    const filePath = href.split('#')[0].trim(); // ← trim para espacios
    if (filePath) {
      links.push({ label, href, filePath });
    }
  }

  return links;
}

function validateFileLinks() {
  const mdFiles = getAllFiles(DOCS_DIR);

  // Agregar archivos de raíz si existen
  ['README.md', 'CONTRIBUTING.md'].forEach((file) => {
    const fullPath = path.join(ROOT_DIR, file);
    if (fs.existsSync(fullPath)) mdFiles.push(fullPath);
  });

  const errors = [];

  mdFiles.forEach((file) => {
    // ✅ NEW: Try/catch para archivos problemáticos
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (err) {
      console.warn(`⚠️  No se pudo leer: ${path.relative(ROOT_DIR, file)}`);
      return;
    }

    const relativePath = path.relative(ROOT_DIR, file);
    const links = extractLinks(content);

    links.forEach(({ href, filePath }) => {
      const absoluteLinkPath = path.resolve(path.dirname(file), filePath);

      if (!fs.existsSync(absoluteLinkPath)) {
        errors.push({
          file: relativePath,
          link: href,
          target: path.relative(ROOT_DIR, absoluteLinkPath),
        });
      }
    });
  });

  // Reporte
  if (errors.length === 0) {
    console.log('✅ Todos los links internos son válidos.');
    process.exit(0);
  } else {
    console.error('\n🔴 Links rotos encontrados:\n');
    errors.forEach(({ file, link, target }) => {
      console.error(`  ❌ [${file}]: "${link}" → No existe: ${target}`);
    });
    console.error(`\n   Total: ${errors.length} errores\n`);
    process.exit(1);
  }
}

console.log('🔍 Validando links internos en la documentación...\n');
validateFileLinks();
