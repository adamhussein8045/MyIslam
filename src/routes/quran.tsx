import { createFileRoute } from '@tanstack/react-router';
import { QuranReader } from '@/components/app/QuranReader';

export const Route = createFileRoute('/quran')({
  head: () => ({ meta: [
    { title: 'القرآن الكريم — MyIslam' },
    { name: 'description', content: 'المصحف الشريف كاملًا، ٦٠٤ صفحات مع فهرس السور والأجزاء وحفظ موضع القراءة.' },
    { property: 'og:title', content: 'القرآن الكريم — MyIslam' },
    { property: 'og:description', content: 'اقرأ مصحف المدينة المنورة كاملًا وتنقّل بين ١١٤ سورة و٣٠ جزءًا.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: QuranReader,
});