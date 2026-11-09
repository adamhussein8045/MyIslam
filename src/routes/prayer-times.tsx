import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useNow, useSettings } from "@/lib/store";
import { useSchedule } from "@/lib/use-schedule";
import { METHODS } from "@/lib/prayer";
import { NoLocation, PrayerTimesList, ScheduleStatus } from "@/components/app/PrayerWidgets";
import { LocationSelector } from "@/components/app/LocationSelector";
import { PlaceBar } from "@/components/app/PlaceBar";

export const Route = createFileRoute("/prayer-times")({
  head: () => ({
    meta: [
      { title: "مواقيت الصلاة — MyIslam" },
      { name: "description", content: "مواقيت الصلاة الخمس والشروق لموقعك." },
      { property: "og:title", content: "مواقيت الصلاة — MyIslam" },
      { property: "og:description", content: "مواقيت الصلاة الخمس والشروق لموقعك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrayerTimes,
});

function PrayerTimes() {
  const { settings, ready } = useSettings();
  const { bundle, state, error, retry, hasLocation } = useSchedule();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const method = METHODS.find((m) => m.id === settings.method)?.name;
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold">مواقيت الصلاة</h1>
      {ready && !hasLocation && <NoLocation onPick={() => setOpen(true)} />}
      {hasLocation && <PlaceBar onChange={() => setOpen(true)} />}
      <ScheduleStatus state={state} error={error} fetchedAt={bundle?.fetchedAt} retry={retry} />
      {bundle && now && <PrayerTimesList bundle={bundle} now={now} hour12={settings.hour12} showSunrise />}
      {hasLocation && (
        <p className="text-xs text-muted-foreground">
          طريقة الحساب: {method} · العصر: {settings.school === 1 ? "الحنفي" : "الجمهور"}
        </p>
      )}
      <LocationSelector open={open} onOpenChange={setOpen} />
    </div>
  );
}
