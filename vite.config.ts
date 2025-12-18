/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Compression for production builds
        ...(mode === 'production' ? [
          compression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024, // Only compress files larger than 1KB
          }),
          compression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024,
          }),
        ] : []),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        // Code splitting configuration
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks
              'vendor-react': ['react', 'react-dom'],
              'vendor-three': ['three', '@react-three/fiber', '@react-three/drei', 'postprocessing'],

              // Feature chunks
              'ui': [
                '@/features/ui/HUD',
                '@/features/ui/onboarding',
              ],
              'game': [
                '@/features/game/state/store',
                '@/features/game/state/checkpoints',
                '@/features/game/levelPatterns',
              ],
              'world': [
                '@/world/actors/Player',
                '@/world/stage/Environment',
                '@/world/stage/LevelManager',
                '@/world/obstacles/Tronco',
                '@/world/fx/Effects',
              ],
              'systems': [
                '@/systems/pooling/ObjectPool',
                '@/systems/core/FixedTimestepLoop',
                '@/systems/audio/AudioEngine',
              ],
              'shared': [
                '@/shared/analytics',
              ],
            },
            // Optimize chunk file names for caching
            chunkFileNames: (chunkInfo) => {
              const facadeModuleId = chunkInfo.facadeModuleId
                ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
                : 'chunk';
              return `assets/${facadeModuleId}-[hash].js`;
            },
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                return 'assets/[name]-[hash][extname]';
              }
              return 'assets/[name]-[hash][extname]';
            },
          },
        },
        // Bundle size warnings and limits
        chunkSizeWarningLimit: 600, // Warn at 600KB instead of 500KB
        sourcemap: false, // Disable sourcemaps for production to reduce bundle size
        minify: 'terser', // Use terser for better compression
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true,
          },
        },
        // Preload optimization
        cssCodeSplit: true, // Split CSS for better caching
      },
      test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: './vitest.setup.ts',
      },
      // Optimize dependencies
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'three',
          '@react-three/fiber',
          '@react-three/drei',
          'zustand',
        ],
      },
    };
});
