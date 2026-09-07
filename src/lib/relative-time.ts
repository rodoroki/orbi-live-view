import type { Locale } from "@/lib/i18n";

/**
 * Rótulo relativo ("há 12 min" / "12 min ago" / "hace 12 min") no idioma
 * atual da interface. Apresentação apenas — o dado continua sendo
 * `detectedMinutesAgo`, vindo da fonte.
 */
export function formatElapsed(minutesAgo: number, locale: Locale): string {
  const value =
    minutesAgo < 60
      ? `${minutesAgo} min`
      : minutesAgo < 1440
        ? `${Math.round(minutesAgo / 60)} h`
        : `${Math.round(minutesAgo / 1440)} d`;

  if (locale === "en") return `${value} ago`;
  if (locale === "es") return `hace ${value}`;
  return `há ${value}`;
}
