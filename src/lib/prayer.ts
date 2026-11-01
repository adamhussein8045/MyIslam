export type PrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
export const PRAYERS: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
export const PRAYER_AR: Record<PrayerKey, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

export const METHODS = [
  { id: 3, name: "رابطة العالم الإسلامي" },
  { id: 5, name: "الهيئة المصرية العامة للمساحة" },
  { id: 4, name: "أم القرى - مكة المكرمة" },
  { id: 1, name: "جامعة العلوم الإسلامية - كراتشي" },
  { id: 2, name: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)" },
] as const;

export type Adjustments = Record<PrayerKey, number>;

export interface DaySchedule {
  /** yyyy-mm-dd in the location's timezone */
  date: string;
  timezone: string;
  /** epoch ms per prayer (already adjusted) */
  times: Record<PrayerKey, number>;
  sunrise: number;
  hijri: string;
}

export interface ScheduleBundle {
  key: string;
  fetchedAt: number;
  days: DaySchedule[];
}

export interface ScheduleParams {
  lat: number;
  lng: number;
  method: number;
  school: 0 | 1;
  adjust: Adjustments;
}

export const paramsKey = (p: ScheduleParams) =>
  [p.lat.toFixed(3), p.lng.toFixed(3), p.method, p.school, PRAYERS.map((k) => p.adjust[k]).join(",")].join("|");

/** Convert a wall-clock time in a given IANA zone to epoch ms (DST-safe). */
export function zonedToEpoch(y: number, mo: number, d: number, h: number, mi: number, tz: string): number {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offset = (t: number) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(new Date(t));
    const g = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"), g("second")) - t;
  };
  let t = guess - offset(guess);
  t = guess - offset(t);
  return t;
}

const parseHM = (s: unknown) => {
  if (typeof s !== "string") return null;
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]), mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return [h, mi] as const;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseDay(raw: any, adjust: Adjustments): DaySchedule | null {
  const timings = raw?.timings;
  const greg = raw?.date?.gregorian?.date; // dd-mm-yyyy
  const tz = raw?.meta?.timezone;
  if (!timings || typeof greg !== "string" || typeof tz !== "string") return null;
  const [d, mo, y] = greg.split("-").map(Number);
  if (!d || !mo || !y) return null;
  const times = {} as Record<PrayerKey, number>;
  for (const k of PRAYERS) {
    const hm = parseHM(timings[k]);
    if (!hm) return null;
    times[k] = zonedToEpoch(y, mo, d, hm[0], hm[1], tz) + (adjust[k] || 0) * 60000;
  }
  const sr = parseHM(timings.Sunrise);
  const h = raw?.date?.hijri;
  return {
    date: `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    timezone: tz,
    times,
    sunrise: sr ? zonedToEpoch(y, mo, d, sr[0], sr[1], tz) : 0,
    hijri: h ? `${h.day} ${h.month?.ar ?? ""} ${h.year} هـ` : "",
  };
}

const ddmmyyyy = (dt: Date) =>
  `${String(dt.getUTCDate()).padStart(2, "0")}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${dt.getUTCFullYear()}`;

/** Fetches yesterday..+2 days from AlAdhan. */
export async function fetchSchedule(p: ScheduleParams, now = Date.now()): Promise<ScheduleBundle> {
  if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng) || Math.abs(p.lat) > 90 || Math.abs(p.lng) > 180) {
    throw new Error("invalid-coords");
  }
  const offsets = [-1, 0, 1, 2];
  const days = await Promise.all(
    offsets.map(async (o) => {
      const dt = new Date(now + o * 86400000);
      const url = `https://api.aladhan.com/v1/timings/${ddmmyyyy(dt)}?latitude=${p.lat}&longitude=${p.lng}&method=${p.method}&school=${p.school}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("service");
      const json = await res.json();
      const day = parseDay(json?.data, p.adjust);
      if (!day) throw new Error("bad-data");
      return day;
    }),
  );
  const unique = days.filter((d, i, a) => a.findIndex((x) => x.date === d.date) === i).sort((a, b) => a.times.Fajr - b.times.Fajr);
  return { key: paramsKey(p), fetchedAt: now, days: unique };
}

export interface PrayerStatus {
  today: DaySchedule | null;
  next: { key: PrayerKey; time: number } | null;
  prev: { key: PrayerKey; time: number } | null;
}

/** All prayer instants flattened; next = first instant after now. */
export function computeStatus(days: DaySchedule[], now: number): PrayerStatus {
  const all = days.flatMap((d) => PRAYERS.map((k) => ({ key: k, time: d.times[k] }))).sort((a, b) => a.time - b.time);
  const idx = all.findIndex((x) => x.time > now);
  const next = idx >= 0 ? all[idx] : null;
  const prev = idx > 0 ? all[idx - 1] : idx === -1 && all.length ? all[all.length - 1] : null;
  const today =
    days.find((d) => d.times.Fajr <= now && now < (days[days.indexOf(d) + 1]?.times.Fajr ?? Infinity) && now >= d.times.Fajr) ??
    days.find((d) => d.times.Fajr > now) ??
    null;
  // "Today" = the calendar day whose Isha hasn't ended yet (ends at next day's Fajr).
  const cal = days.find((d, i) => now < (days[i + 1]?.times.Fajr ?? Infinity) && (i === 0 || now >= days[i - 1].times.Isha || now >= d.times.Fajr || true));
  return { today: pickToday(days, now) ?? cal ?? today, next, prev };
}

function pickToday(days: DaySchedule[], now: number) {
  // the day whose date matches local date in its timezone
  if (!days.length) return null;
  const tz = days[0].timezone;
  const local = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
  return days.find((d) => d.date === local) ?? null;
}
