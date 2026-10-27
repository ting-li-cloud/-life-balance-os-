import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built site works under a sub-path such as GitHub Pages.
export default defineConfig({ base: './', plugins: [react()] });
