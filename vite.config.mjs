import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import SemiPlugin from 'vite-plugin-semi-theme';

import { timestampPlugin } from './vite/viteTimestampPlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins:
      mode === 'production'
        ? [
            react(),
            SemiPlugin({
              theme: '@semi-bot/semi-theme-notenotecc',
            }),
            timestampPlugin(env),
          ]
        : [
            react(),
            SemiPlugin({
              theme: '@semi-bot/semi-theme-notenotecc',
            }),
          ],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    server: {
      port: 3000,
      open: false,
    },
    build: {
      chunkSizeWarningLimit: 1300,
      rollupOptions: {
        plugins: [
          visualizer({
            open: false,
            filename: 'bundle-stats.html',
          }),
        ],
      },
    },
  };
});
