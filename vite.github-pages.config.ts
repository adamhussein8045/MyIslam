import { defineConfig } from '@lovable.dev/vite-tanstack-config';

export default defineConfig({
  tanstackStart: {
    server: { entry: 'server' },
    router: { basepath: '/MyIslam' },
    // Pages are route paths; the configured router basepath is added by the prerenderer.
    pages: ['/', '/prayer-times', '/qibla', '/settings', '/quran'].map(path => ({ path })),
    prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false },
  },
  vite: { base: '/MyIslam/' },
});