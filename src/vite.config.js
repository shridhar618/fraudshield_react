import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Keep the frontend self-contained under `src/` so `npm run dev` works from here.
export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
})
