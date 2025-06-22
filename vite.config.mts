import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import manifest from './manifest.json';

export default defineConfig({
    plugins: [react(), tailwindcss(), crx({ manifest })],

    build: {
        rollupOptions: {
            input: {
                // Explicit definitions because sometimes Vite misses dynamically loaded files
                devtoolsHtml: 'src/devtools/index.html',
                panelHtml: 'src/devtools/panel/index.html',
            },
        },
    },

    server: {
        cors: {
            origin: [/chrome-extension:\/\//],
        },
    },
});
