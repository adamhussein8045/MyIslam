import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Adjustments } from "./prayer";

export interface SavedLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
  source: "auto" | "manual";
}

export interface Settings {
  location: SavedLocation | null;
  method: number;
  school: 0 | 1;
  adjust: Adjustments;
  hour12: boolean;
  theme: "light" | "dark" | "system";
}

export const DEFAULT_SETTINGS: Settings = {
  location: null,
  method: 3,
  school: 0,
  adjust: { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 },
  hour12: true,
  theme: "system",
};

const KEY = "myislam:settings:v1";

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const p = JSON.parse(raw);
    const s = { ...DEFAULT_SETTINGS, ...p, adjust: { ...DEFAULT_SETTINGS.adjust, ...(p.adjust ?? {}) } } as Settings;
    if (s.location && (!Number.isFinite(s.location.lat) || !Number.isFinite(s.location.lng))) s.location = null;
    return s;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface Ctx {
  settings: Settings;
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}
const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings, ready]);

  // theme
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#071F19" : "#063B2E");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme]);

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => {
    localStorage.removeItem("myislam:schedule:v1");
    setSettings(DEFAULT_SETTINGS);
  }, []);
  const value = useMemo(() => ({ settings, ready, update, reset }), [settings, ready, update, reset]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const c = useContext(SettingsContext);
  if (!c) throw new Error("SettingsProvider missing");
  return c;
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      t = setTimeout(tick, intervalMs - (Date.now() % intervalMs));
    };
    t = setTimeout(tick, intervalMs - (Date.now() % intervalMs));
    return () => clearTimeout(t);
  }, [intervalMs]);
  return now;
}

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
