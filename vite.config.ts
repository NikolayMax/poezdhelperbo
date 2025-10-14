import { resolve } from "path";
import { defineConfig } from "vite"
import { spawn, type ChildProcess } from 'child_process';

let nodeProcess: null | ChildProcess = null;

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
        'os', 'crypto',
        'telegraf', 'redis'
      ],
      output: {
        dir: 'dist',
        preserveModules: false
      }
    },
    emptyOutDir: true,
      watch: {
        chokidar: {
            usePolling: true,
            interval: 1000
        }
      }
  },
    plugins: [
        {
            name: 'run-node-after-build',
            apply: 'build',
            closeBundle() {
                console.log('📦 Сборка завершена, запускаем node ./app.mjs...');

                if(nodeProcess){
                    console.log('🛑 Останавливаем предыдущий процесс Node.js...');
                    nodeProcess.kill('SIGTERM');
                }

                nodeProcess = spawn('node', ['./dist/app.mjs'], {
                    stdio: 'inherit',
                    shell: true
                });

                nodeProcess.on('close', (code) => {
                    console.log(`🔚 Node.js процесс завершен с кодом: ${code}`);
                    nodeProcess = null;
                });

                nodeProcess.on('error', (err) => {
                    console.error('❌ Ошибка Node.js процесса:', err);
                    nodeProcess = null;
                });
            }
        }
    ]
})