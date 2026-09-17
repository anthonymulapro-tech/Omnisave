// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Automatically update the service worker
      registerType: 'autoUpdate',

      devOptions: {enabled: true},
      
      // Options for the web app manifest
      manifest: {
        name: 'Omnisave',
        short_name: 'Omnisave',
        description: 'Save and organize your favorite social media links seamlessly.',
        // Matches the dark background of your UI
        theme_color: '#0f172a',
        background_color: '#0f172a',
        // Opens without the browser address bar
        display: 'standalone',
        id: '/',
        start_url: '/',
        
        // Android specific: allows the app to appear in the native share menu
        share_target: {
          action: '/dashboard', // React route that will handle the incoming link
          method: 'GET',
          enctype: 'application/x-www-form-urlencoded',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        },
        
        // App icons (we will need to add these to the public/ folder)
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-desktop.png',
            sizes: '2544x1272',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/screenshot-mobile.png',
            sizes: '376x864',
            type: 'image/png'
          }
          ]
      }
    })
  ]
});