import data from './quran-data.json';

export const TOTAL_PAGES = 604;
export const PROGRESS_KEY = 'myislam:quran:page:v1';
export const SURAHS = data.surahs;
export const JUZ_PAGES = data.juzPages;
const assets = import.meta.glob<{ url: string }>('../assets/mushaf/*.asset.json', { eager: true, import: 'default' });

export function validPage(value: unknown): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 && page <= TOTAL_PAGES ? page : 1;
}

export function pageImage(page: number): string {
  if (import.meta.env.MODE === 'github-pages') return `${import.meta.env.BASE_URL}mushaf/${validPage(page)}.png`;
  return assets[`../assets/mushaf/${validPage(page)}.png.asset.json`]?.url ?? '';
}

export function pageInfo(page: number) {
  const safe = validPage(page);
  const numbers = data.pageSurahs[safe - 1] ?? [];
  return { surahs: SURAHS.filter(s => numbers.includes(s.number)), juz: JUZ_PAGES.filter(p => p <= safe).length };
}

export function loadProgress(): number {
  try { return validPage(localStorage.getItem(PROGRESS_KEY)); } catch { return 1; }
}

export function saveProgress(page: number) {
  try { localStorage.setItem(PROGRESS_KEY, String(validPage(page))); } catch { /* Private browsing may disable storage. */ }
}