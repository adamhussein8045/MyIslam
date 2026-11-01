import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSchedule, paramsKey, type ScheduleBundle } from "./prayer";
import { useOnline, useSettings } from "./store";

const CACHE = "myislam:schedule:v1";
export type ScheduleState = "idle" | "loading" | "fresh" | "stale" | "error";
export type ScheduleError = "offline" | "service" | null;

function readCache(): ScheduleBundle | null {
  try {
    const b = JSON.parse(localStorage.getItem(CACHE) || "null");
    return b && Array.isArray(b.days) ? b : null;
  } catch {
    return null;
  }
}

export function useSchedule() {
  const { settings, ready } = useSettings();
  const online = useOnline();
  const [bundle, setBundle] = useState<ScheduleBundle | null>(null);
  const [state, setState] = useState<ScheduleState>("idle");
  const [error, setError] = useState<ScheduleError>(null);
  const inflight = useRef<string | null>(null);

  const loc = settings.location;
  const params = loc ? { lat: loc.lat, lng: loc.lng, method: settings.method, school: settings.school, adjust: settings.adjust } : null;
  const key = params ? paramsKey(params) : null;

  const load = useCallback(async () => {
    if (!params || !key) return;
    if (inflight.current === key) return;
    inflight.current = key;
    const cached = readCache();
    const usable = cached && cached.key === key ? cached : null;
    if (usable) setBundle(usable);
    else setBundle(null);
    setState("loading");
    try {
      const b = await fetchSchedule(params);
      localStorage.setItem(CACHE, JSON.stringify(b));
      setBundle(b);
      setState("fresh");
      setError(null);
    } catch {
      setError(navigator.onLine ? "service" : "offline");
      setState(usable ? "stale" : "error");
    } finally {
      inflight.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (ready && key) load();
    if (ready && !key) {
      setBundle(null);
      setState("idle");
    }
  }, [ready, key, load]);

  // retry when back online
  useEffect(() => {
    if (online && (state === "stale" || state === "error")) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  // refresh when the cached window is about to run out (date change)
  useEffect(() => {
    if (!bundle) return;
    const last = bundle.days[bundle.days.length - 1];
    if (!last) return;
    const wait = last.times.Fajr - Date.now() - 6 * 3600000;
    const t = setTimeout(load, Math.max(60000, Math.min(wait, 2 ** 31 - 1)));
    return () => clearTimeout(t);
  }, [bundle, load]);

  return { bundle, state, error, retry: load, hasLocation: !!loc };
}
