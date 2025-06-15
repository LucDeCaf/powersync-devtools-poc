// vite.config.ts
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import manifest from './manifest.json';

export default defineConfig({
    plugins: [tailwindcss(), crx({ manifest })],

    server: {
        cors: {
            origin: [/chrome-extension:\/\//],
        },
    },
});
