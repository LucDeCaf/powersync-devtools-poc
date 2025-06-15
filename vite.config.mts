// vite.config.ts
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import manifest from './manifest.json';

export default defineConfig({
    plugins: [tailwindcss(), crx({ manifest })],

    build: {
        rollupOptions: {
            input: {
                // Explicit definitions because sometimes Vite misses dynamically loaded files
                devtoolsHtml: 'src/devtools.html',
                panelHtml: 'src/panel.html',
            },
        },
    },

    server: {
        cors: {
            origin: [/chrome-extension:\/\//],
        },
    },
});
