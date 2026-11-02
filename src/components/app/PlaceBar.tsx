import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/store";

export function PlaceBar({ onChange }: { onChange: () => void }) {
  const { settings } = useSettings();
  const loc = settings.location;
  if (!loc) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        <MapPin className="size-4 shrink-0 text-gold" />
        <span className="truncate font-medium">{loc.name}{loc.country ? `، ${loc.country}` : ""}</span>
      </span>
      <Button size="sm" variant="ghost" onClick={onChange}>تغيير</Button>
    </div>
  );
}
