# My Islam

Arabic RTL prayer times, Qibla and a complete reading-only Madinah Mushaf.

## Enable GitHub Pages

1. In **adamhussein8045/MyIslam**, open **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**, not “Deploy from a branch”.
3. Push these changes to **main**, or open **Actions → Deploy MyIslam to GitHub Pages → Run workflow**.
4. Wait for the build and deployment jobs to succeed, then open **https://adamhussein8045.github.io/MyIslam/**.

The workflow publishes **dist/github-pages**: actual prerendered HTML, CSS, JavaScript, icons, manifest, service worker and Quran images—not development source or README. Future pushes to main automatically test, build and deploy. Repository settings and the final live deployment need to be verified in GitHub; adding this configuration does not change Pages settings.

`bun run build:pages` uses a separate /MyIslam/ configuration. The ordinary Lovable build remains at /. Each supported page has its own index.html, so deep links and refreshes work on static hosting. The preparation script refuses incomplete output.

## Authentic Quran sources

- Original image pack: **King Saud University, Ayat Electronic Mushaf**, https://quran.ksu.edu.sa/ayat/?l=en&pg=patches.
- Download: https://quran.ksu.edu.sa/ayat/images.ayt, verified 604 original numbered PNGs, pages 1–604.
- SHA-256: `7ffd8dd3919fafdc240179c17e1c7307353ab89d6155fb1b9714c61468a9c441`.
- Metadata: https://api.alquran.cloud/v1/meta, 114 Surahs, 30 Juz, 6,236 verses in standard Madinah pagination.
- Pages are unaltered: no AI-generated scripture, audio, video or radio.

The Pages build downloads the official pack, verifies its hash and page count, and ships the original images. It does not depend on Lovable image URLs. A changed pack fails deployment until it is re-verified.

## Offline and device features

Reading progress and preferences stay on the current device. The service worker caches visited pages, capped at 40 Mushaf images; unvisited pages need internet. Navigation is network-first, and hashed JavaScript/CSS prevents stale releases. Installation and compass permissions depend on device/browser support and should be checked on a real phone after deployment.

Prayer times use AlAdhan, and city search uses OpenStreetMap Nominatim. These external services can be unavailable or rate-limited. No hosting backend is required.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fc43902e-a53c-470e-8c71-6d8332161b99).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
bun install --frozen-lockfile
bun run dev
bun run test
bun run build:pages
```
