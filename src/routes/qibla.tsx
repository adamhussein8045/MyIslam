import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSettings } from "@/lib/store";
import { directionName, distanceToKaaba, qiblaBearing } from "@/lib/qibla";
import { arNum } from "@/lib/format";
import { NoLocation } from "@/components/app/PrayerWidgets";
import { LocationSelector } from "@/components/app/LocationSelector";
import { PlaceBar } from "@/components/app/PlaceBar";
import { QiblaCompass } from "@/components/app/QiblaCompass";

export const Route = createFileRoute("/qibla")({
  head: () => ({
    meta: [
      { title: "اتجاه القبلة — MyIslam" },
      { name: "description", content: "بوصلة تُظهر اتجاه القبلة والمسافة إلى الكعبة من موقعك." },
      { property: "og:title", content: "اتجاه القبلة — MyIslam" },
      { property: "og:description", content: "بوصلة تُظهر اتجاه القبلة والمسافة إلى الكعبة من موقعك." },
    ],
  }),
  component: Qibla,
});

function Qibla() {
  const { settings, ready } = useSettings();
  const [open, setOpen] = useState(false);
  const loc = settings.location;
  const bearing = loc ? qiblaBearing(loc.lat, loc.lng) : 0;
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold">اتجاه القبلة</h1>
      {ready && !loc && <NoLocation onPick={() => setOpen(true)} />}
      {loc && (
        <>
          <PlaceBar onChange={() => setOpen(true)} />
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl border bg-card p-4">
              <div className="text-xs text-muted-foreground">الاتجاه</div>
              <div className="tabular text-2xl font-semibold text-primary">{arNum(bearing, 1)}°</div>
              <div className="text-xs">نحو {directionName(bearing)}</div>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <div className="text-xs text-muted-foreground">المسافة إلى الكعبة</div>
              <div className="tabular text-2xl font-semibold text-primary">{arNum(distanceToKaaba(loc.lat, loc.lng))}</div>
              <div className="text-xs">كم</div>
            </div>
          </div>
          <QiblaCompass bearing={bearing} />
        </>
      )}
      <LocationSelector open={open} onOpenChange={setOpen} />
    </div>
  );
}
