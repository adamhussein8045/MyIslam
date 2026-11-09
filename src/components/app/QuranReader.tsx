import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Maximize, Minimize, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JUZ_PAGES, SURAHS, TOTAL_PAGES, loadProgress, pageImage, pageInfo, saveProgress, validPage } from '@/lib/quran';
import { arNum } from '@/lib/format';

export function QuranReader() {
  const [page, setPage] = useState(1);
  const [saved, setSaved] = useState(1);
  const [ready, setReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const info = pageInfo(page);
  const go = (next: number) => { const target = validPage(next); if (target === page) return; setPage(target); setLoaded(false); setError(false); };

  useEffect(() => { const last = loadProgress(); setSaved(last); setPage(last); setReady(true); }, []);
  useEffect(() => { if (ready) saveProgress(page); }, [page, ready]);
  useEffect(() => {
    const changed = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', changed);
    return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    for (const next of [page - 1, page + 1]) {
      if (next < 1 || next > TOTAL_PAGES) continue;
      const image = new Image(); image.src = pageImage(next);
    }
  }, [page, loaded]);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (root.current?.requestFullscreen) await root.current.requestFullscreen();
      else setFullscreen(v => !v);
    } catch { setFullscreen(v => !v); }
  };

  return (
    <div ref={root} className={`quran-reader ${fullscreen ? 'quran-fullscreen' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold"><BookOpen className="size-6 text-gold" /> القرآن الكريم</h1>
        <Button variant="outline" onClick={() => go(saved)}><BookOpen /> متابعة القراءة</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 border-y py-3">
        <label className="space-y-1 text-sm"><span>السورة</span>
          <select aria-label="السورة" className="w-full rounded-md border bg-card px-2 py-2" value={info.surahs[0]?.number ?? 1} onChange={e => { const s = SURAHS.find(s => s.number === Number(e.target.value)); if (s) go(s.page); }}>
            {SURAHS.map(s => <option key={s.number} value={s.number}>{arNum(s.number)} · {s.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm"><span>الجزء</span>
          <select aria-label="الجزء" className="w-full rounded-md border bg-card px-2 py-2" value={info.juz} onChange={e => go(JUZ_PAGES[Number(e.target.value) - 1] ?? 1)}>
            {JUZ_PAGES.map((p, i) => <option key={p} value={i + 1}>الجزء {arNum(i + 1)}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <p className="min-w-0 text-sm text-muted-foreground">{info.surahs.map(s => s.name).join(' · ')} · الجزء {arNum(info.juz)}</p>
        <div className="flex shrink-0 items-center gap-1">
          <Button size="icon" variant="ghost" title="تصغير" aria-label="تصغير" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - .25))}><ZoomOut /></Button>
          <span className="w-12 text-center text-xs tabular">{arNum(zoom * 100)}٪</span>
          <Button size="icon" variant="ghost" title="تكبير" aria-label="تكبير" disabled={zoom >= 2.5} onClick={() => setZoom(z => Math.min(2.5, z + .25))}><ZoomIn /></Button>
          <Button size="icon" variant="ghost" title={fullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'} aria-label={fullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'} onClick={toggleFullscreen}>{fullscreen ? <Minimize /> : <Maximize />}</Button>
        </div>
      </div>
      <div className={`mushaf-viewport zoom-${Math.round(zoom * 100)}`} onTouchStart={e => { const t = e.touches[0]; if (t && e.touches.length === 1) touch.current = { x: t.clientX, y: t.clientY }; else touch.current = null; }} onTouchEnd={e => {
        const start = touch.current; touch.current = null; if (!start || zoom > 1) return;
        const t = e.changedTouches[0]; if (!t) return; const dx = t.clientX - start.x; const dy = t.clientY - start.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { if (dx > 0 && page < TOTAL_PAGES) go(page + 1); else if (dx < 0 && page > 1) go(page - 1); }
      }}>
        {!loaded && !error && <div role="status" className="mushaf-status text-muted-foreground">جارٍ تحميل الصفحة…</div>}
        {error && <div role="alert" className="mushaf-status space-y-3"><p>تعذّر تحميل الصفحة. تحقق من اتصالك بالإنترنت.</p><Button variant="outline" onClick={() => { setError(false); setLoaded(false); setRetry(r => r + 1); }}><RotateCcw /> إعادة المحاولة</Button></div>}
        <img key={`${page}-${retry}`} src={pageImage(page)} alt={`المصحف الشريف — الصفحة ${arNum(page)}`} className={`mushaf-page ${loaded ? '' : 'invisible'}`} decoding="async" fetchPriority="high" onLoad={() => { setLoaded(true); setError(false); }} onError={() => { setError(true); setLoaded(false); }} />
      </div>
      <div className="flex items-center justify-between gap-2 border-b py-3">
        <Button variant="outline" aria-label="الصفحة السابقة" disabled={page === 1} onClick={() => go(page - 1)}><ArrowRight /><span className="hidden sm:inline">السابقة</span></Button>
        <label className="flex items-center gap-2 text-sm">صفحة <input aria-label="رقم الصفحة" type="number" min={1} max={604} value={page} dir="ltr" className="w-16 rounded-md border bg-card px-1 py-2 text-center tabular" onChange={e => { if (e.target.value) go(Number(e.target.value)); }} /> <span className="text-muted-foreground">/ {arNum(TOTAL_PAGES)}</span></label>
        <Button variant="outline" aria-label="الصفحة التالية" disabled={page === TOTAL_PAGES} onClick={() => go(page + 1)}><span className="hidden sm:inline">التالية</span><ArrowLeft /></Button>
      </div>
      <p className="py-3 text-center text-xs text-muted-foreground">مصحف المدينة المنورة · رواية حفص عن عاصم · مشروع آيات، جامعة الملك سعود</p>
    </div>
  );
}