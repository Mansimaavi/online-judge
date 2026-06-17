import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      darkMode: 'class', // This enables class-based dark mode
      theme: {
        extend: {
          colors: {
            indigo: {
              400: '#818cf8',
              500: '#6366f1',
              600: '#4f46e5',
            },
          },
        },
      },
    }),
  ],
});