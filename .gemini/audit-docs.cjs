/**
 * audit-docs.cjs
 * Auditor de Calidad Documental para Calamar Loco.
 *
 * Este script verifica que los archivos Markdown cumplan con los estándares:
 * 1. Naming convention (kebab-case).
 * 2. Existencia de Front Matter o Banner de alineación.
 * 3. Referencias a TASK-XXX.
 * 4. Presencia de H1 único.
 * 5. Footer con links de referencia.
 *
 * Uso: node .gemini/audit-docs.cjs
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');
const ROOT_DIR = path.join(__dirname, '..');

const STANDARD_TASKS_REGEX = /TASK-\d{3}/;
const KEBAB_CASE_REGEX = /^[a-z0-9-_]+\.md$/;

function getAllMarkdownFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllMarkdownFiles(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function auditFile(filePath) {
  const fileName = path.basename(filePath);
  const relativePath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const report = {
    file: relativePath,
    errors: [],
    warnings: []
  };

  // 1. Naming Convention (Solo en /docs)
  if (filePath.includes('/docs/') && !KEBAB_CASE_REGEX.test(fileName) && fileName !== 'README.md') {
    report.warnings.push(`Naming: El archivo no sigue kebab-case.`);
  }

  // 2. Front Matter o Banner
  const hasFrontMatter = content.startsWith('---');
  const hasBanner = content.includes('> ') && content.includes('TASK.MD');
  if (!hasFrontMatter && !hasBanner) {
    report.errors.push(`Header: Falta Front Matter (---) o Banner de alineación (>).`);
  }

  // 3. Referencia a TASK-XXX
  if (!STANDARD_TASKS_REGEX.test(content)) {
    report.errors.push(`Trazabilidad: No se encontró ninguna referencia a TASK-XXX.`);
  }

  // 4. H1 Único
  const h1Count = lines.filter(line => line.startsWith('# ') && !line.startsWith('##')).length;
  if (h1Count === 0) {
    report.errors.push(`Jerarquía: Falta un título H1 (# Titulo).`);
  } else if (h1Count > 1) {
    report.warnings.push(`Jerarquía: Se encontró más de un título H1.`);
  }

  // 5. Footer con links
  const hasFooterLinks = content.includes('TASK.MD') && (content.includes('README.md') || content.includes('PROJECT_STRUCTURE.md'));
  if (!hasFooterLinks) {
    report.warnings.push(`Footer: Falta sección de referencias (links a TASK.MD/README.md).`);
  }

  return report;
}

function runAudit() {
  console.log('🔍 Iniciando auditoría de calidad documental...\n');

  const files = getAllMarkdownFiles(DOCS_DIR);
  // Incluir archivos raíz críticos
  ['README.md', 'CONTRIBUTING.md'].forEach(f => {
    const p = path.join(ROOT_DIR, f);
    if (fs.existsSync(p)) files.push(p);
  });

  let totalErrors = 0;
  let totalWarnings = 0;

  files.forEach(file => {
    const result = auditFile(file);

    if (result.errors.length > 0 || result.warnings.length > 0) {
      console.log(`📄 Archivo: ${result.file}`);

      result.errors.forEach(err => {
        console.log(`  🔴 ERROR: ${err}`);
        totalErrors++;
      });

      result.warnings.forEach(warn => {
        console.log(`  🟡 WARN:  ${warn}`);
        totalWarnings++;
      });
      console.log('');
    }
  });

  console.log('---');
  console.log(`📊 Resumen de Auditoría:`);
  console.log(`✅ Archivos analizados: ${files.length}`);
  console.log(`🔴 Errores críticos:   ${totalErrors}`);
  console.log(`🟡 Advertencias:       ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log('\n❌ La documentación no cumple con los estándares mínimos.');
    process.exit(1);
  } else {
    console.log('\n✨ ¡Calidad documental aprobada!');
    process.exit(0);
  }
}

runAudit();
