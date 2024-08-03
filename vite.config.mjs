import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';

import { timestampPlugin } from './vite/viteTimestampPlugin';

const ReactCompilerConfig = {};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins:
      mode === 'production'
        ? [
            react({
              babel: {
                plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
              },
            }),
            timestampPlugin(env),
          ]
        : [
            react({
              babel: {
                plugins: [['babel-plugin-react-compiler', ReactCompilerConfig]],
              },
            }),
          ],
    server: {
      port: 3000,
      open: false,
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        plugins: [
          visualizer({
            open: false,
            filename: 'bundle-stats.html',
          }),
        ],
        output: {
          manualChunks: id => {
            if (id.includes('node_modules')) {
              if (id.includes('openpgp')) {
                return 'openpgp';
              }
              if (id.includes('plyr')) {
                return 'plyr';
              }
              if (id.includes('wouter')) {
                return 'wouter';
              }
              if (id.includes('styled-components')) {
                return 'styled-components';
              }
              if (id.includes('spark-md5')) {
                return 'spark-md5';
              }
              if (id.includes('date-fns')) {
                return 'date-fns';
              }

              return 'vendor';
            }
          },
        },
      },
    },
  };
});
