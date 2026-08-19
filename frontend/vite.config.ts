import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Publica en https://rafaelvegafigueroa-eng.github.io/ETNARA/
  // (repositorio de proyecto, no de usuario/org) -> requiere base path no-raíz.
  base: '/ETNARA/',
  plugins: [react()],
})
