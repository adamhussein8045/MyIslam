import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSettings, type Settings } from "@/lib/store";
import { METHODS, PRAYERS, PRAYER_AR } from "@/lib/prayer";
import { LocationSelector } from "@/components/app/LocationSelector";
import { PlaceBar } from "@/components/app/PlaceBar";
import { InstallInstructions, useInstall } from "@/components/app/InstallPrompt";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — MyIslam" },
      { name: "description", content: "اضبط الموقع وطريقة حساب المواقيت والمظهر." },
      { property: "og:title", content: "الإعدادات — MyIslam" },
      { property: "og:description", content: "اضبط الموقع وطريقة حساب المواقيت والمظهر." },
    ],
  }),
  component: SettingsPage,
});

const sel = "w-full rounded-xl border bg-background px-3 py-2 text-sm";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-3xl border bg-card p-5">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function SettingsPage() {
  const { settings, update, reset } = useSettings();
  const [open, setOpen] = useState(false);
  const install = useInstall() as unknown as { installed?: boolean; ios?: boolean; prompt?: () => void; canPrompt?: boolean };
  return (
    <div className="space-y-5 pb-6">
      <h1 className="font-display text-3xl font-bold">الإعدادات</h1>
      <Section title="الموقع">
        {settings.location ? <PlaceBar onChange={() => setOpen(true)} /> : <Button onClick={() => setOpen(true)}>اختيار الموقع</Button>}
      </Section>
      <Section title="حساب المواقيت">
        <label className="block space-y-1 text-sm">
          <span>طريقة الحساب</span>
          <select className={sel} value={settings.method} onChange={(e) => update({ method: Number(e.target.value) })}>
            {METHODS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span>مذهب صلاة العصر</span>
          <select className={sel} value={settings.school} onChange={(e) => update({ school: Number(e.target.value) as 0 | 1 })}>
            <option value={0}>الجمهور (الشافعي والمالكي والحنبلي)</option>
            <option value={1}>الحنفي</option>
          </select>
        </label>
        <div className="space-y-2">
          <div className="text-sm">تعديل يدوي (بالدقائق)</div>
          <div className="grid grid-cols-5 gap-2">
            {PRAYERS.map((k) => (
              <label key={k} className="space-y-1 text-center text-xs">
                <span>{PRAYER_AR[k]}</span>
                <input
                  type="number" min={-30} max={30} dir="ltr"
                  className={`${sel} text-center`}
                  value={settings.adjust[k]}
                  onChange={(e) => {
                    const v = Math.max(-30, Math.min(30, Math.round(Number(e.target.value) || 0)));
                    update({ adjust: { ...settings.adjust, [k]: v } });
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      </Section>
      <Section title="المظهر">
        <label className="flex items-center justify-between text-sm">
          <span>نظام ١٢ ساعة</span>
          <Switch checked={settings.hour12} onCheckedChange={(v) => update({ hour12: v })} />
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([["light", "فاتح"], ["dark", "داكن"], ["system", "تلقائي"]] as [Settings["theme"], string][]).map(([v, l]) => (
            <Button key={v} variant={settings.theme === v ? "default" : "outline"} onClick={() => update({ theme: v })}>{l}</Button>
          ))}
        </div>
      </Section>
      {!install.installed && (
        <Section title="تثبيت التطبيق">
          {install.canPrompt && install.prompt ? (
            <Button onClick={install.prompt}><Download /> تثبيت على الجهاز</Button>
          ) : (
            <InstallInstructions ios={!!install.ios} />
          )}
        </Section>
      )}
      <Button variant="outline" className="w-full text-destructive" onClick={() => confirm("إعادة جميع الإعدادات؟") && reset()}>إعادة الضبط</Button>
      <LocationSelector open={open} onOpenChange={setOpen} />
    </div>
  );
}
