/**
 * validate-links.js
 * Script para validar links internos en archivos Markdown de la carpeta /docs.
 *
 * Uso: node .gemini/validate-links.js
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const ROOT_DIR = path.join(__dirname, '..');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

function validateFileLinks() {
  const mdFiles = getAllFiles(DOCS_DIR);
  // También incluir el README y CONTRIBUTING de la raíz
  if (fs.existsSync(path.join(ROOT_DIR, 'README.md'))) mdFiles.push(path.join(ROOT_DIR, 'README.md'));
  if (fs.existsSync(path.join(ROOT_DIR, 'CONTRIBUTING.md'))) mdFiles.push(path.join(ROOT_DIR, 'CONTRIBUTING.md'));

  let errors = 0;

  mdFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(ROOT_DIR, file);

    // Ignorar bloques de código triple backtick
    content = content.replace(/```[\s\S]*?```/g, '');
    // Ignorar código inline
    content = content.replace(/`[^`\n]+`/g, '');

    // Regex para encontrar links de markdown: [label](path)
    // Filtra links externos (http) y anclas internas (#) que no tienen path de archivo
    const linkRegex = /\[.*?\]\((?!http|https|#)(.*?)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      let linkPath = match[1].split('#')[0]; // Ignorar anclas al validar existencia de archivo
      if (!linkPath) continue;

      const absoluteLinkPath = path.resolve(path.dirname(file), linkPath);

      if (!fs.existsSync(absoluteLinkPath)) {
        console.error(`❌ Link roto en [${relativePath}]: "${match[1]}" -> No existe: ${path.relative(ROOT_DIR, absoluteLinkPath)}`);
        errors++;
      }
    }
  });

  if (errors === 0) {
    console.log('✅ Todos los links internos son válidos.');
    process.exit(0);
  } else {
    console.error(`\n🔴 Se encontraron ${errors} links rotos.`);
    process.exit(1);
  }
}

console.log('🔍 Validando links internos en la documentación...');
validateFileLinks();
