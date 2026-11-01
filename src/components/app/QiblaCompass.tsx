import { useCallback, useEffect, useRef, useState } from "react";
import { Compass, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { arNum } from "@/lib/format";
import { directionName } from "@/lib/qibla";
import { cn } from "@/lib/utils";

type Mode = "checking" | "needs-permission" | "live" | "denied" | "unsupported" | "waiting";

type OrientEvt = DeviceOrientationEvent & { webkitCompassHeading?: number };

function useHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("checking");
  const gotData = useRef(false);

  const attach = useCallback(() => {
    const handler = (e: OrientEvt) => {
      let h: number | null = null;
      if (typeof e.webkitCompassHeading === "number") h = e.webkitCompassHeading;
      else if (e.absolute && typeof e.alpha === "number") h = 360 - e.alpha;
      if (h == null || Number.isNaN(h)) return;
      const screenAngle = window.screen.orientation?.angle ?? 0;
      gotData.current = true;
      setHeading((h + screenAngle + 360) % 360);
      setMode("live");
    };
    const evName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(evName, handler as EventListener, true);
    setMode("waiting");
    const t = setTimeout(() => {
      if (!gotData.current) setMode("unsupported");
    }, 3000);
    return () => {
      clearTimeout(t);
      window.removeEventListener(evName, handler as EventListener, true);
    };
  }, []);

  const cleanup = useRef<null | (() => void)>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setMode("unsupported");
      return;
    }
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof D.requestPermission === "function") setMode("needs-permission");
    else cleanup.current = attach();
    return () => cleanup.current?.();
  }, [attach]);

  const request = async () => {
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    try {
      const r = await D.requestPermission?.();
      if (r === "granted") cleanup.current = attach();
      else setMode("denied");
    } catch {
      setMode("denied");
    }
  };
  return { heading, mode, request };
}

const CARDINALS = [
  { a: 0, l: "ش" },
  { a: 90, l: "ق" },
  { a: 180, l: "ج" },
  { a: 270, l: "غ" },
];

export function QiblaCompass({ bearing }: { bearing: number }) {
  const { heading, mode, request } = useHeading();
  const live = mode === "live" && heading != null;
  const rot = live ? -heading! : 0;
  const diff = live ? (((bearing - heading!) % 360) + 540) % 360 - 180 : null;
  const aligned = diff != null && Math.abs(diff) < 5;

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-square w-full max-w-[340px]">
        {/* fixed top marker = phone direction */}
        <div className={cn("absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[16px] border-x-transparent", aligned ? "border-t-gold" : "border-t-primary")} aria-hidden="true" />
        <div
          className={cn("absolute inset-3 rounded-full border-4 bg-hero pattern-geo shadow-soft transition-transform duration-300 ease-out", aligned ? "border-gold" : "border-gold-soft/60")}
          style={{ transform: `rotate(${rot}deg)` }}
        >
          {Array.from({ length: 72 }).map((_, i) => (
            <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 5}deg)` }}>
              <div className={cn("mx-auto mt-1.5 w-px bg-hero-foreground", i % 18 === 0 ? "h-4 opacity-90" : i % 2 === 0 ? "h-2.5 opacity-50" : "h-1.5 opacity-30")} />
            </div>
          ))}
          {CARDINALS.map((c) => (
            <div key={c.a} className="absolute inset-0" style={{ transform: `rotate(${c.a}deg)` }}>
              <div className={cn("mx-auto mt-7 w-6 text-center text-lg font-bold", c.a === 0 ? "text-gold" : "text-hero-foreground")} style={{ transform: `rotate(${-c.a - rot}deg)` }}>
                {c.l}
              </div>
            </div>
          ))}
          {/* Qibla needle */}
          <div className="absolute inset-0" style={{ transform: `rotate(${bearing}deg)` }}>
            <div className="absolute left-1/2 top-[14%] flex -translate-x-1/2 flex-col items-center">
              <div className="flex size-10 items-center justify-center rounded-lg border-2 border-gold bg-emerald-dark shadow-gold" style={{ transform: `rotate(${-bearing - rot}deg)` }} aria-label="الكعبة">
                <div className="h-5 w-6 rounded-sm bg-emerald-dark ring-1 ring-gold">
                  <div className="mt-1 h-1 bg-gold" />
                </div>
              </div>
              <div className="h-[calc(170px*0.55)] w-1 rounded-full bg-gradient-to-b from-gold to-transparent sm:h-24" />
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold ring-4 ring-emerald-dark" />
        </div>
      </div>

      <div className="mt-5 text-center">
        <div className="text-sm text-muted-foreground">اتجاه القبلة من الشمال الجغرافي</div>
        <div className="tabular text-4xl font-bold text-gold">{arNum(bearing, 1)}°</div>
        <div className="text-sm">نحو {directionName(bearing)}</div>
        {live && (
          <div className={cn("mt-2 text-sm font-medium", aligned ? "text-gold" : "text-muted-foreground")}>
            {aligned ? "أنت تتجه نحو القبلة ✓" : `أدِر الجهاز ${diff! > 0 ? "يمينًا" : "يسارًا"} ${arNum(Math.abs(diff!))}°`}
          </div>
        )}
      </div>

      <div className="mt-5 w-full max-w-md">
        {mode === "needs-permission" && (
          <Button className="w-full" onClick={request}>
            <Compass /> تفعيل البوصلة الحية
          </Button>
        )}
        {mode === "waiting" && <p className="text-center text-sm text-muted-foreground">جارٍ قراءة مستشعر الاتجاه…</p>}
        {mode === "denied" && (
          <Note>لم يتم السماح بالوصول إلى مستشعر الاتجاه. يمكنك تفعيله من إعدادات المتصفح، أو استخدام الزاوية المحسوبة مع بوصلة خارجية.</Note>
        )}
        {mode === "unsupported" && (
          <Note>
            جهازك أو متصفحك لا يوفّر بوصلة حية. الرسم أعلاه ثابت ويُظهر اتجاه القبلة بالنسبة إلى الشمال (ش). وجّه أعلى الرسم نحو الشمال لتعرف الاتجاه.
          </Note>
        )}
        {live && (
          <Note>
            <Smartphone className="inline size-4" /> ضع الهاتف بشكل أفقي وبعيدًا عن المعادن والمغناطيس. إن بدت القراءة غير دقيقة، حرّك الهاتف في الهواء على شكل الرقم 8 عدة مرات لمعايرة البوصلة.
          </Note>
        )}
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border bg-card p-4 text-sm leading-relaxed text-muted-foreground">{children}</p>;
}
