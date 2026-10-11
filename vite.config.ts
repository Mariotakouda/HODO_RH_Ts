// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     // Sans ca, Vite bloque les requetes qui arrivent via un domaine externe
//     // comme ngrok (protection anti DNS-rebinding activee par defaut).
//     allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.ngrok.app'],
//   },
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.io', '.ngrok.app'],
    // Redirige tout ce qui commence par /api vers ton serveur Laravel local.
    // Ainsi le navigateur du client ne voit qu'une seule adresse (celle de
    // ngrok), et Vite se charge en coulisse de relayer vers localhost:8000.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})