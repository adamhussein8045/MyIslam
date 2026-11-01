import type { SavedLocation } from "./store";

const BASE = "https://nominatim.openstreetmap.org";

export interface GeoResult extends SavedLocation {
  id: string;
  detail: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toResult(r: any, source: "auto" | "manual"): GeoResult | null {
  const lat = Number(r?.lat), lng = Number(r?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const a = r.address ?? {};
  const name = a.city || a.town || a.village || a.municipality || a.county || a.state || r.name || "";
  if (!name) return null;
  const country = a.country || "";
  const detail = [a.state && a.state !== name ? a.state : null, country].filter(Boolean).join("، ");
  return { id: String(r.place_id ?? `${lat},${lng}`), name, country, detail, lat, lng, source };
}

export async function searchCities(city: string, country: string): Promise<GeoResult[]> {
  const params = new URLSearchParams({ format: "jsonv2", addressdetails: "1", limit: "10", "accept-language": "ar" });
  if (country.trim()) {
    params.set("city", city.trim());
    params.set("country", country.trim());
  } else params.set("q", city.trim());
  const res = await fetch(`${BASE}/search?${params}`);
  if (!res.ok) throw new Error("service");
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error("bad-data");
  const seen = new Set<string>();
  return json
    .map((r) => toResult(r, "manual"))
    .filter((r): r is GeoResult => !!r)
    .filter((r) => {
      const k = `${r.name}|${r.detail}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

export async function reverseGeocode(lat: number, lng: number): Promise<{ name: string; country: string }> {
  try {
    const res = await fetch(`${BASE}/reverse?format=jsonv2&zoom=10&accept-language=ar&lat=${lat}&lon=${lng}`);
    if (!res.ok) throw new Error();
    const r = toResult(await res.json(), "auto");
    if (r) return { name: r.name, country: r.country };
  } catch {
    /* fall through */
  }
  return { name: "موقعي الحالي", country: "" };
}

export type GeoError = "denied" | "unavailable" | "timeout" | "unsupported";

export function getDevicePosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject("unsupported" as GeoError);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => reject((e.code === 1 ? "denied" : e.code === 3 ? "timeout" : "unavailable") as GeoError),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
    );
  });
}

export const GEO_ERROR_AR: Record<GeoError, string> = {
  denied: "لم يتم السماح بالوصول إلى موقعك. يمكنك اختيار مدينتك يدويًا.",
  unavailable: "تعذّر تحديد موقعك حاليًا. حاول مرة أخرى أو اختر مدينتك يدويًا.",
  timeout: "استغرق تحديد الموقع وقتًا طويلًا. حاول مرة أخرى.",
  unsupported: "متصفحك لا يدعم تحديد الموقع. اختر مدينتك يدويًا.",
};
