import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
    site: 'https://zacharysmithdatatonic.github.io',
    base: '/google-cloud-certification-flashcards/',
    output: 'static',
    integrations: [react()],
});
