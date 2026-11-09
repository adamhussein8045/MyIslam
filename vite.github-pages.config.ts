import { defineConfig } from '@lovable.dev/vite-tanstack-config';

export default defineConfig({
  tanstackStart: {
    server: { entry: 'server' },
    router: { basepath: '/MyIslam' },
    pages: ['/', '/prayer-times', '/qibla', '/settings', '/quran'].map(path => ({ path: `/MyIslam${path}` })),
    prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false },
  },
  vite: { base: '/MyIslam/' },
});