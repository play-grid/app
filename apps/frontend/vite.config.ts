import path from 'node:path';
import process from 'node:process';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { ogImageGeneratorPlugin } from './src/plugins/og-image-generator';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [ogImageGeneratorPlugin(), react(), tailwindcss(), ViteImageOptimizer()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'es2022',
      minify: mode === 'production',
    },
    server: {
      port: Number(env.VITE_SERVER_PORT) || 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
