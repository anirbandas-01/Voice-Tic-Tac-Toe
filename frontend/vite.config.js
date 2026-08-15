import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()
    , VitePWA({ 
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        }, 
        manifest: { 
          name: 'Voice Tic-Tac-Toe', 
          short_name: 'TicTacToe',
          description: 'Voice-controlled Tic-Tac-Toe with AI and online multiplayer', 
          theme_color: '#0f172a', 
          background_color: '#0f172a', 
          display: 'standalone', 
          start_url: '/', 
          icons: [ { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', }, { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', }, ], 
      },
     })
  ],
  server: { port: 5173, },
})
