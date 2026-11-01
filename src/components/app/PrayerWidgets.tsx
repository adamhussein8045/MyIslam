import { AlertCircle, Loader2, MapPin, RefreshCw, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRAYERS, PRAYER_AR, computeStatus, type ScheduleBundle } from "@/lib/prayer";
import { fmtCountdown, fmtTime } from "@/lib/format";
import type { ScheduleError, ScheduleState } from "@/lib/use-schedule";
import { cn } from "@/lib/utils";

export function NextPrayerCard({ bundle, now, hour12 }: { bundle: ScheduleBundle; now: number; hour12: boolean }) {
  const { next, prev } = computeStatus(bundle.days, now);
  if (!next) return null;
  const tz = bundle.days[0]?.timezone;
  const span = prev ? next.time - prev.time : 1;
  const pct = prev ? Math.min(100, Math.max(0, ((now - prev.time) / span) * 100)) : 0;
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-gold sm:p-6" aria-live="polite">
      <div className="text-sm text-muted-foreground">الصلاة القادمة</div>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-display text-4xl font-bold text-primary">{PRAYER_AR[next.key]}</div>
          <div className="mt-1 tabular text-lg">{fmtTime(next.time, hour12, tz)}</div>
        </div>
        <div className="text-left">
          <div className="text-xs text-muted-foreground">متبقٍ</div>
          <div className="tabular text-3xl font-semibold text-gold" dir="ltr">{fmtCountdown(next.time - now)}</div>
        </div>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="الوقت المنقضي منذ الصلاة السابقة">
        <div className="h-full rounded-full bg-gold transition-[width] duration-1000" style={{ width: `${pct}%` }} />
      </div>
      {prev && <div className="mt-2 text-xs text-muted-foreground">منذ {PRAYER_AR[prev.key]}</div>}
    </section>
  );
}

export function PrayerTimesList({ bundle, now, hour12, showSunrise = false }: { bundle: ScheduleBundle; now: number; hour12: boolean; showSunrise?: boolean }) {
  const { today, next } = computeStatus(bundle.days, now);
  if (!today) return <p className="text-sm text-muted-foreground">لا تتوفر مواقيت لهذا اليوم بعد.</p>;
  const tz = today.timezone;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {PRAYERS.map((k) => {
        const t = today.times[k];
        const isNext = next?.time === t;
        const passed = t <= now;
        return (
          <li
            key={k}
            className={cn(
              "rounded-2xl border bg-card p-4 transition",
              isNext && "border-gold shadow-gold",
              passed && !isNext && "opacity-60",
            )}
          >
            <div className="flex items-center justify-between text-sm">
              <span className={cn("font-semibold", isNext && "text-primary")}>{PRAYER_AR[k]}</span>
              {isNext ? (
                <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-emerald-dark">القادمة</span>
              ) : passed ? (
                <span className="text-[10px] text-muted-foreground">انقضت</span>
              ) : null}
            </div>
            <div className="mt-2 tabular text-xl font-medium">{fmtTime(t, hour12, tz)}</div>
          </li>
        );
      })}
      {showSunrise && today.sunrise > 0 && (
        <li className="flex items-center justify-between rounded-2xl border border-dashed p-4 text-sm text-muted-foreground sm:col-span-3 lg:col-span-5">
          <span className="flex items-center gap-2"><Sunrise className="size-4" /> الشروق</span>
          <span className="tabular">{fmtTime(today.sunrise, hour12, tz)}</span>
        </li>
      )}
    </ul>
  );
}

export function ScheduleStatus({ state, error, fetchedAt, retry }: { state: ScheduleState; error: ScheduleError; fetchedAt?: number; retry: () => void }) {
  if (state === "loading" && !fetchedAt)
    return (
      <div className="flex items-center gap-2 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> جارٍ حساب مواقيت الصلاة…
      </div>
    );
  if (state === "error")
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/40 bg-card p-4 text-sm">
        <span className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-4" />
          {error === "offline" ? "لا يوجد اتصال بالإنترنت ولا توجد مواقيت محفوظة لهذا الموقع." : "خدمة مواقيت الصلاة غير متاحة حاليًا."}
        </span>
        <Button size="sm" variant="outline" onClick={retry}><RefreshCw /> إعادة المحاولة</Button>
      </div>
    );
  if (state === "stale" && fetchedAt)
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gold-soft p-3 text-sm text-emerald-dark">
        <span>تعذّر التحديث — تُعرض بيانات محفوظة بتاريخ {new Date(fetchedAt).toLocaleString("ar")}.</span>
        <Button size="sm" variant="outline" onClick={retry}><RefreshCw /> تحديث</Button>
      </div>
    );
  return null;
}

export function NoLocation({ onPick }: { onPick: () => void }) {
  return (
    <div className="rounded-3xl border bg-card p-6 text-center">
      <MapPin className="mx-auto size-8 text-gold" />
      <h2 className="mt-3 text-lg font-semibold">حدّد موقعك لعرض المواقيت</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">نحتاج إلى موقعك لحساب مواقيت الصلاة واتجاه القبلة بدقة. لا يُرسل موقعك إلا لخدمة حساب المواقيت.</p>
      <Button className="mt-4" onClick={onPick}>اختيار الموقع</Button>
    </div>
  );
}
