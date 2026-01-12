import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/token-visualizer/' : '/',
  plugins: [wasm(), topLevelAwait()],
  server: {
    fs: {
      allow: ['..'],
    },
  },
});
