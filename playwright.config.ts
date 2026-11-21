import { defineConfig, devices } from '@playwright/test'

// vite preview's default port
const baseURL = 'http://localhost:4173'

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL },
  webServer: {
    command: 'npm run build && npm run preview',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Pixel 7', use: { ...devices['Pixel 7'] } },
  ],
})
