import { useState, type FormEvent } from "react";
import { Loader2, LocateFixed, MapPin, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GEO_ERROR_AR, getDevicePosition, reverseGeocode, searchCities, type GeoError, type GeoResult } from "@/lib/geo";
import { useSettings } from "@/lib/store";

export function useDetectLocation() {
  const { update } = useSettings();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detect = async () => {
    setBusy(true);
    setError(null);
    try {
      const { lat, lng } = await getDevicePosition();
      const place = await reverseGeocode(lat, lng);
      update({ location: { ...place, lat, lng, source: "auto" } });
      return true;
    } catch (e) {
      setError(GEO_ERROR_AR[(e as GeoError) in GEO_ERROR_AR ? (e as GeoError) : "unavailable"]);
      return false;
    } finally {
      setBusy(false);
    }
  };
  return { detect, busy, error };
}

export function LocationSelector({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { settings, update } = useSettings();
  const { detect, busy, error: geoError } = useDetectLocation();
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [results, setResults] = useState<GeoResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<GeoResult | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPicked(null);
    if (!city.trim()) return setError("اكتب اسم المدينة للبحث.");
    if (!navigator.onLine) return setError("لا يوجد اتصال بالإنترنت. البحث عن المدن يحتاج إلى اتصال.");
    setSearching(true);
    try {
      const r = await searchCities(city, country);
      setResults(r);
      if (!r.length) setError("لم نجد مدينة بهذا الاسم. جرّب كتابة الاسم بطريقة أخرى أو أضف اسم الدولة.");
    } catch {
      setError("تعذّر الاتصال بخدمة البحث عن المدن. حاول مرة أخرى بعد قليل.");
    } finally {
      setSearching(false);
    }
  };

  const confirm = () => {
    if (!picked) return;
    const { name, country, lat, lng } = picked;
    update({ location: { name, country, lat, lng, source: "manual" } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle>اختيار الموقع</DialogTitle>
          <DialogDescription>نستخدم موقعك فقط لحساب مواقيت الصلاة واتجاه القبلة، ويُحفظ على جهازك.</DialogDescription>
        </DialogHeader>

        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            if (await detect()) onOpenChange(false);
          }}
        >
          {busy ? <Loader2 className="animate-spin" /> : <LocateFixed />} تحديد موقعي تلقائيًا
        </Button>
        {geoError && <p className="text-sm text-destructive">{geoError}</p>}

        <div className="my-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> أو ابحث يدويًا <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة" aria-label="المدينة" />
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="الدولة (اختياري)" aria-label="الدولة" />
          <Button type="submit" disabled={searching}>
            {searching ? <Loader2 className="animate-spin" /> : <Search />} بحث
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}

        {results && results.length > 0 && (
          <ul className="grid max-h-64 gap-1 overflow-y-auto" role="listbox" aria-label="نتائج البحث">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setPicked(r)}
                  aria-selected={picked?.id === r.id}
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-right transition hover:bg-muted aria-selected:border-gold aria-selected:bg-secondary"
                >
                  <MapPin className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{r.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.detail}</span>
                  </span>
                  {picked?.id === r.id && <Check className="size-4 text-gold" />}
                </button>
              </li>
            ))}
          </ul>
        )}

        {picked && (
          <Button onClick={confirm} className="w-full">
            تأكيد: {picked.name}
            {picked.country ? `، ${picked.country}` : ""}
          </Button>
        )}
        {settings.location && (
          <p className="text-center text-xs text-muted-foreground">الموقع الحالي: {settings.location.name}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
