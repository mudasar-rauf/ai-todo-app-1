import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // globals also lets Testing Library register its automatic cleanup after each test
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    passWithNoTests: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
