import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// En desarrollo, las llamadas a /api se redirigen al backend local (puerto 3000).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
  test: { environment: 'jsdom' },
});
