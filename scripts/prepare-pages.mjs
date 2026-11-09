import { access, cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const routes = ['', 'prayer-times', 'qibla', 'settings', 'quran'];
let source;
for (const candidate of ['dist/client', '.output/public', 'output/client']) {
  try { await access(join(candidate, 'index.html')); source = candidate; break; } catch { }
}
if (!source) throw new Error('Static index.html was not generated; refusing to deploy source files.');
for (const route of routes) await access(join(source, route, 'index.html'));
const destination = 'dist/github-pages';
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
await writeFile(join(destination, '.nojekyll'), '');
const manifest = JSON.parse(await readFile('public/manifest.webmanifest', 'utf8'));
manifest.start_url = '/MyIslam/'; manifest.scope = '/MyIslam/';
manifest.icons = manifest.icons.map(icon => ({ ...icon, src: '/MyIslam/' + icon.src.replace(/^\//, '') }));
await writeFile(join(destination, 'manifest.webmanifest'), JSON.stringify(manifest));

// Ship unaltered institutional pages with the static site, not Lovable-only URLs.
const response = await fetch('https://quran.ksu.edu.sa/ayat/images.ayt');
if (!response.ok) throw new Error(`Official Mushaf download failed: ${response.status}`);
const archive = Buffer.from(await response.arrayBuffer());
if (createHash('sha256').update(archive).digest('hex') !== '7ffd8dd3919fafdc240179c17e1c7307353ab89d6155fb1b9714c61468a9c441') throw new Error('Official Mushaf pack changed; re-verify before publishing.');
const archivePath = join(tmpdir(), 'myislam-mushaf.ayt');
await writeFile(archivePath, archive);
await mkdir(join(destination, 'mushaf'), { recursive: true });
execFileSync('python3', ['-c', `
import zipfile,sys,pathlib
with zipfile.ZipFile(sys.argv[1]) as archive:
  pages=[n for n in archive.namelist() if n.endswith('.png')]
  assert sorted(pages)==sorted('images/%s.png'%i for i in range(1,605)), 'Incomplete Mushaf pack'
  for i in range(1,605):
    pathlib.Path(sys.argv[2],str(i)+'.png').write_bytes(archive.read('images/%s.png'%i))
`, archivePath, join(destination, 'mushaf')]);
await rm(archivePath);
await writeFile(join(destination, '404.html'), await readFile(join(destination, 'index.html'), 'utf8'));
for (const route of routes) {
  const document = await readFile(join(destination, route, 'index.html'), 'utf8');
  if (!document.includes('/MyIslam/assets/')) throw new Error(`Wrong asset base path in ${route || '/'}`);
  if (document.includes('src="/__l5e/')) throw new Error('Lovable-only image remains in static output.');
}
if ((await readdir(join(destination, 'mushaf'))).length !== 604) throw new Error('Missing Quran pages.');
console.log('Verified: five static index.html pages, /MyIslam/ assets, PWA files and all 604 Mushaf pages.');