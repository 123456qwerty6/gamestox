import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const stripOrigin = (proxy) => {
  proxy.on('proxyReq', (proxyReq) => {
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
  });
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/steam-api': {
        target: 'https://api.steampowered.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/steam-api/, ''),
        configure: stripOrigin,
      },
      '/fortnite-api': {
        target: 'https://api.fortnite.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/fortnite-api/, ''),
        configure: stripOrigin,
      },
      '/mc-api': {
        target: 'https://api.mcsrvstat.us',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/mc-api/, ''),
        configure: stripOrigin,
      },
      '/roblox-api': {
        target: 'https://games.roblox.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/roblox-api/, ''),
        configure: stripOrigin,
      },
    },
  },
});