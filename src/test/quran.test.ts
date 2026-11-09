import { describe, expect, it } from 'vitest';
import { JUZ_PAGES, PROGRESS_KEY, SURAHS, TOTAL_PAGES, loadProgress, pageImage, pageInfo, saveProgress, validPage } from '@/lib/quran';

describe('Authentic complete Mushaf', () => {
  it('includes all 114 Surahs in Quranic order from Fatihah to Nas', () => {
    expect(SURAHS.map(s => s.number)).toEqual(Array.from({ length: 114 }, (_, i) => i + 1));
    expect(SURAHS[0]?.page).toBe(1);
    expect(SURAHS[113]?.page).toBe(604);
    expect(SURAHS.reduce((n, s) => n + s.verses, 0)).toBe(6236);
  });
  it('makes all 30 Juz accessible in standard Madinah order', () => {
    expect(JUZ_PAGES).toEqual([1,22,42,62,82,102,121,142,162,182,201,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582]);
    JUZ_PAGES.forEach((page, i) => expect(pageInfo(page).juz).toBe(i + 1));
  });
  it('has an authentic image and Surah mapping for every one of 604 pages', () => {
    expect(TOTAL_PAGES).toBe(604);
    const urls = Array.from({ length: 604 }, (_, i) => pageImage(i + 1));
    expect(new Set(urls).size).toBe(604);
    urls.forEach((url, i) => { expect(url).toContain(`mushaf-page-${i + 1}.png`); expect(pageInfo(i + 1).surahs.length).toBeGreaterThan(0); });
  });
  it('saves and resumes the last page locally without an account', () => {
    localStorage.clear(); saveProgress(582);
    expect(localStorage.getItem(PROGRESS_KEY)).toBe('582'); expect(loadProgress()).toBe(582);
  });
  it('never navigates outside pages 1 through 604', () => {
    expect(validPage(0)).toBe(1); expect(validPage(605)).toBe(1); expect(validPage(604)).toBe(604); expect(validPage(2.5)).toBe(1);
  });
});