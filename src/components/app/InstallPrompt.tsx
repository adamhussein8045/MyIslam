import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS = "myislam:install-dismissed";

export function useInstall() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const h = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    const done = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", h);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    const r = await evt.userChoice;
    if (r.outcome === "accepted") setInstalled(true);
    setEvt(null);
  };
  return { canPrompt: !!evt, install, installed, ios };
}

export function InstallInstructions({ ios }: { ios: boolean }) {
  return ios ? (
    <p className="text-sm text-muted-foreground">
      في Safari اضغط على زر المشاركة <Share className="inline size-4" /> ثم اختر «إضافة إلى الشاشة الرئيسية».
    </p>
  ) : (
    <p className="text-sm text-muted-foreground">
      افتح قائمة المتصفح واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية». تختلف الخطوات حسب المتصفح، وقد لا تدعم بعض المتصفحات التثبيت.
    </p>
  );
}

export function InstallPrompt() {
  const { canPrompt, install, installed, ios } = useInstall();
  const [hidden, setHidden] = useState(true);
  useEffect(() => setHidden(localStorage.getItem(DISMISS) === "1"), []);
  if (installed || hidden || (!canPrompt && !ios)) return null;
  const close = () => {
    localStorage.setItem(DISMISS, "1");
    setHidden(true);
  };
  return (
    <div className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-md rounded-2xl border bg-card p-4 shadow-soft md:bottom-6">
      <button onClick={close} aria-label="إغلاق" className="absolute left-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted">
        <X className="size-4" />
      </button>
      <div className="font-semibold">ثبّت MyIslam على جهازك</div>
      <p className="mb-3 mt-1 text-sm text-muted-foreground">للوصول السريع إلى مواقيت الصلاة والقبلة حتى بدون إنترنت.</p>
      {canPrompt ? (
        <Button onClick={install} className="w-full">
          <Download /> تثبيت التطبيق
        </Button>
      ) : (
        <InstallInstructions ios={ios} />
      )}
    </div>
  );
}
