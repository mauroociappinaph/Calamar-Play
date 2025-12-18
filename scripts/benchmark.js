#!/usr/bin/env node

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runBenchmark() {
  console.log('🚀 Iniciando benchmarks automatizados de Calamar Loco...');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    recordVideo: { dir: 'test-results/videos/', size: { width: 1280, height: 720 } }
  });

  const page = await context.newPage();

  try {
    // Navigate to the built app (assuming it's served locally for CI)
    const appUrl = process.env.APP_URL || 'http://localhost:4173'; // Vite preview default
    console.log(`📱 Navegando a ${appUrl}...`);

    await page.goto(appUrl, { waitUntil: 'networkidle' });

    // Wait for game to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('🎮 Juego cargado, iniciando sesión de gameplay...');

    // Start collecting performance metrics
    const metrics = {
      fps: [],
      memory: [],
      longTasks: [],
      navigationTiming: null,
      paintTiming: null
    };

    // Collect performance observer data
    await page.evaluate(() => {
      // FPS monitoring using requestAnimationFrame
      let frameCount = 0;
      let lastFpsTime = performance.now();
      let fps = 0;

      function measureFPS() {
        frameCount++;
        const now = performance.now();
        if (now - lastFpsTime >= 1000) {
          fps = frameCount;
          frameCount = 0;
          lastFpsTime = now;
        }
        window.fps = fps;
        requestAnimationFrame(measureFPS);
      }
      measureFPS();

      // Long tasks monitoring
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            window.longTasks = window.longTasks || [];
            window.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime
            });
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Memory monitoring
      window.memoryUsage = window.memoryUsage || [];
    });

    // Simulate gameplay for 30 seconds
    console.log('⏱️  Ejecutando sesión de 30 segundos...');

    const startTime = Date.now();
    const testDuration = 30000; // 30 seconds

    while (Date.now() - startTime < testDuration) {
      // Simulate user input (random movements)
      const actions = ['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      await page.keyboard.press(randomAction);
      await page.waitForTimeout(100 + Math.random() * 200); // Random delay

      // Collect metrics every second
      if (Math.floor((Date.now() - startTime) / 1000) % 1 === 0) {
        const currentMetrics = await page.evaluate(() => ({
          fps: window.fps || 0,
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null,
          longTasks: window.longTasks || []
        }));

        if (currentMetrics.fps > 0) metrics.fps.push(currentMetrics.fps);
        if (currentMetrics.memory) metrics.memory.push(currentMetrics.memory);
        metrics.longTasks = currentMetrics.longTasks;
      }
    }

    // Collect final performance metrics
    console.log('📊 Recolectando métricas finales...');

    const finalMetrics = await page.evaluate(() => ({
      navigationTiming: performance.getEntriesByType('navigation')[0],
      paintTiming: performance.getEntriesByType('paint'),
      resourceTiming: performance.getEntriesByType('resource'),
      memory: performance.memory
    }));

    metrics.navigationTiming = finalMetrics.navigationTiming;
    metrics.paintTiming = finalMetrics.paintTiming;

    // Calculate aggregates
    const report = {
      timestamp: new Date().toISOString(),
      duration: testDuration,
      url: appUrl,
      device: {
        viewport: { width: 1280, height: 720 },
        userAgent: await page.evaluate(() => navigator.userAgent)
      },
      performance: {
        fps: {
          samples: metrics.fps.length,
          average: metrics.fps.length > 0 ? metrics.fps.reduce((a, b) => a + b) / metrics.fps.length : 0,
          min: metrics.fps.length > 0 ? Math.min(...metrics.fps) : 0,
          max: metrics.fps.length > 0 ? Math.max(...metrics.fps) : 0,
          p95: metrics.fps.length > 0 ? calculatePercentile(metrics.fps, 95) : 0
        },
        memory: {
          samples: metrics.memory.length,
          average: metrics.memory.length > 0 ? metrics.memory.reduce((acc, m) => acc + m.usedJSHeapSize, 0) / metrics.memory.length : 0,
          peak: metrics.memory.length > 0 ? Math.max(...metrics.memory.map(m => m.usedJSHeapSize)) : 0
        },
        timing: {
          domContentLoaded: finalMetrics.navigationTiming ? finalMetrics.navigationTiming.domContentLoadedEventEnd - finalMetrics.navigationTiming.domContentLoadedEventStart : 0,
          loadComplete: finalMetrics.navigationTiming ? finalMetrics.navigationTiming.loadEventEnd - finalMetrics.navigationTiming.loadEventStart : 0,
          firstPaint: finalMetrics.paintTiming.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: finalMetrics.paintTiming.find(p => p.name === 'first-contentful-paint')?.startTime || 0
        },
        longTasks: {
          count: metrics.longTasks.length,
          totalDuration: metrics.longTasks.reduce((acc, task) => acc + task.duration, 0),
          averageDuration: metrics.longTasks.length > 0 ? metrics.longTasks.reduce((acc, task) => acc + task.duration, 0) / metrics.longTasks.length : 0
        }
      },
      budgets: {
        fps: {
          min: 30,
          target: 55,
          status: metrics.fps.length > 0 && Math.min(...metrics.fps) >= 30 ? 'PASS' : 'FAIL'
        },
        memory: {
          maxMB: 100,
          status: metrics.memory.length > 0 && Math.max(...metrics.memory.map(m => m.usedJSHeapSize)) / 1024 / 1024 < 100 ? 'PASS' : 'FAIL'
        },
        longTasks: {
          maxCount: 5,
          status: metrics.longTasks.length <= 5 ? 'PASS' : 'FAIL'
        }
      }
    };

    // Write report
    const reportDir = path.join(__dirname, '..', 'benchmark-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `benchmark-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Reporte generado: ${reportPath}`);
    console.log('\n📈 Resumen de Performance:');
    console.log(`   FPS Promedio: ${report.performance.fps.average.toFixed(1)} (${report.performance.fps.p95.toFixed(1)} P95)`);
    console.log(`   Memoria Pico: ${(report.performance.memory.peak / 1024 / 1024).toFixed(1)} MB`);
    console.log(`   Long Tasks: ${report.performance.longTasks.count} (${report.performance.longTasks.averageDuration.toFixed(1)}ms avg)`);
    console.log(`   TTI: ${report.performance.timing.firstContentfulPaint.toFixed(1)}ms`);

    // Check budgets and exit with appropriate code
    const allPass = Object.values(report.budgets).every(budget => budget.status === 'PASS');
    if (!allPass) {
      console.log('\n❌ Benchmarks fallaron - revisa budgets');
      process.exit(1);
    } else {
      console.log('\n✅ Todos los budgets pasaron');
    }

  } catch (error) {
    console.error('❌ Error en benchmark:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

function calculatePercentile(values, percentile) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (upper >= sorted.length) return sorted[sorted.length - 1];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

runBenchmark().catch(console.error);
