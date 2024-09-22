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
