import { Link } from "@tanstack/react-router";
import { Compass, Home, Settings, Clock, WifiOff, BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { InstallPrompt } from "./InstallPrompt";
import { useOnline } from "@/lib/store";

const NAV = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/prayer-times", label: "مواقيت الصلاة", icon: Clock },
  { to: "/quran", label: "القرآن الكريم", icon: BookOpen },
  { to: "/qibla", label: "اتجاه القبلة", icon: Compass },
  { to: "/settings", label: "الإعدادات", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const online = useOnline();
  return (
    <div className="min-h-screen overflow-x-clip pb-24 md:pb-10">
      <header className="sticky top-0 z-30 bg-hero pattern-geo shadow-soft">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" aria-label="MyIslam - الرئيسية">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="rounded-full px-4 py-2 text-sm opacity-80 transition hover:opacity-100 data-[status=active]:bg-gold data-[status=active]:text-emerald-dark data-[status=active]:opacity-100"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {!online && (
        <div role="status" className="flex items-center justify-center gap-2 bg-gold-soft px-4 py-2 text-center text-sm text-emerald-dark">
          <WifiOff className="size-4" /> أنت غير متصل بالإنترنت — نعرض آخر بيانات محفوظة.
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 pt-5">{children}</main>
      <InstallPrompt />

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-5">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="group flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground data-[status=active]:text-primary"
            >
              <span className="rounded-full px-4 py-1 transition group-data-[status=active]:bg-secondary">
                <n.icon className="size-5" />
              </span>
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
