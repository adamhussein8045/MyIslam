import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Clock } from "lucide-react";
import { useNow, useSettings } from "@/lib/store";
import { useSchedule } from "@/lib/use-schedule";
import { computeStatus } from "@/lib/prayer";
import { fmtDate, fmtHijri } from "@/lib/format";
import { NextPrayerCard, NoLocation, PrayerTimesList, ScheduleStatus } from "@/components/app/PrayerWidgets";
import { LocationSelector } from "@/components/app/LocationSelector";
import { PlaceBar } from "@/components/app/PlaceBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MyIslam — الصلاة القادمة ومواقيت اليوم" },
      { name: "description", content: "اعرف الصلاة القادمة والوقت المتبقي ومواقيت اليوم لموقعك." },
      { property: "og:title", content: "MyIslam — الصلاة القادمة ومواقيت اليوم" },
      { property: "og:description", content: "اعرف الصلاة القادمة والوقت المتبقي ومواقيت اليوم لموقعك." },
    ],
  }),
  component: Home,
});

function Home() {
  const { settings, ready } = useSettings();
  const { bundle, state, error, retry, hasLocation } = useSchedule();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const tz = bundle?.days[0]?.timezone;
  const today = bundle && now ? computeStatus(bundle.days, now).today : null;

  return (
    <div className="space-y-5">
      {now && (
        <div>
          <h1 className="font-display text-2xl font-bold">{fmtDate(now, tz)}</h1>
          <p className="text-sm text-muted-foreground">{today?.hijri || fmtHijri(now, tz)}</p>
        </div>
      )}
      {ready && !hasLocation && <NoLocation onPick={() => setOpen(true)} />}
      {hasLocation && <PlaceBar onChange={() => setOpen(true)} />}
      <ScheduleStatus state={state} error={error} fetchedAt={bundle?.fetchedAt} retry={retry} />
      {bundle && now && (
        <>
          <NextPrayerCard bundle={bundle} now={now} hour12={settings.hour12} />
          <PrayerTimesList bundle={bundle} now={now} hour12={settings.hour12} />
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/prayer-times" className="flex items-center gap-2 rounded-2xl border bg-card p-4 text-sm font-medium hover:border-gold"><Clock className="size-5 text-gold" /> كل المواقيت</Link>
        <Link to="/qibla" className="flex items-center gap-2 rounded-2xl border bg-card p-4 text-sm font-medium hover:border-gold"><Compass className="size-5 text-gold" /> اتجاه القبلة</Link>
      </div>
      <LocationSelector open={open} onOpenChange={setOpen} />
    </div>
  );
}
