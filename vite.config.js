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
    host: 'localhost',
    //host: '0.0.0.0',   // utilizzato per prove in LAN
    port: 5173,
    strictPort: true,
    proxy: {
      '/nominatim-api': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nominatim-api/, ''),
        headers: {
          'User-Agent': 'GeoBooksharing/1.0 (contatto@tuamail.com)',
          'Referer': 'https://nominatim.openstreetmap.org/'
        }
      }
    }
  }
})
