export function fmtTime(t: number, hour12: boolean, timeZone?: string, seconds = false) {
  return new Intl.DateTimeFormat("ar", {
    hour: "numeric",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
    hour12,
    timeZone,
    numberingSystem: "arab",
  }).format(new Date(t));
}

export function fmtDate(t: number, timeZone?: string) {
  return new Intl.DateTimeFormat("ar", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone }).format(new Date(t));
}

export function fmtHijri(t: number, timeZone?: string) {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric", timeZone }).format(new Date(t));
  } catch {
    return "";
  }
}

const num = (n: number) => new Intl.NumberFormat("ar", { minimumIntegerDigits: 2 }).format(n);

export function fmtCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${num(Math.floor(s / 3600))}:${num(Math.floor((s % 3600) / 60))}:${num(s % 60)}`;
}

export const arNum = (n: number, digits = 0) =>
  new Intl.NumberFormat("ar", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);

export const deviceTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
