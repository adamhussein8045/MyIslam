import { cn } from "@/lib/utils";

export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("text-gold", className)} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <rect x="9" y="9" width="22" height="22" />
        <rect x="9" y="9" width="22" height="22" transform="rotate(45 20 20)" />
        <circle cx="20" cy="20" r="4" />
      </g>
    </svg>
  );
}

export function Logo({ className, tagline = false }: { className?: string; tagline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} dir="ltr">
      <StarMark className="size-8 shrink-0" />
      <div className="leading-none">
        <div className="text-xl font-semibold tracking-tight">
          My<span className="text-gold">Islam</span>
        </div>
        {tagline && <div className="mt-1 text-xs opacity-75" dir="rtl">رفيق يومك المسلم</div>}
      </div>
    </div>
  );
}
