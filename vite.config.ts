import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'

// Shared base config — now used only by the bare SSR gate command:
//   bunx vite build --ssr test/hub.render.test.ts --outDir ...
// The hub app itself builds through vite.hub.config.ts (dev:hub /
// build:hub / preview:hub); this file supplies what the SSR bundle
// needs: the Vue plugin (incl. the model-viewer custom element), the
// Tailwind pipeline, and the `@` alias.
export default defineConfig({
  plugins: [
  vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('model-viewer'),
      },
    },
  }),
  tailwindcss(),
],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
