import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { fileURLToPath, URL } from 'node:url'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [NaiveUiResolver()],
    })],
    resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
    server: {
    //host: 'localhost',
    host: '0.0.0.0',  
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    },
    proxy: {
      '/nominatim-api': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nominatim-api/, ''),
        headers: {
          'User-Agent': 'GeoBooksharing/1.0 (gbs@example.com)',
          'Referer': 'https://nominatim.openstreetmap.org/'
        }
      }
    }
  }
})
