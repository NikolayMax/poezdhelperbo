import { resolve } from "path";
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    target: 'node18',
    lib: {
      entry: resolve(__dirname, 'src/app.ts'),
      formats: ['es'],
      fileName: 'app'
    },
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: [
        'fs', 'path', 'http', 'https', 'url', 'stream', 'until',
        'os',
        'telegraf', 'redis'
      ],
      output: {
        dir: 'dist',
        preserveModules: false
      }
    },
    emptyOutDir: true
  },
})
