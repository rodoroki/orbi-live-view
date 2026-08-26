import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { OrbiMark } from "./OrbiMark";
import { useTranslation } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useTranslation();

  const nav = [
    { label: t.nav.planet, to: "/" },
    { label: t.nav.events, to: "/eventos" },
    { label: t.nav.atmosphere, to: "/atmosfera" },
    { label: t.nav.ocean, to: "/oceano" },
    { label: t.nav.explore, to: "/explorar" },
  ] as const;

  return (
    <div className="relative min-h-screen bg-void text-foreground">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-14 items-center gap-6 px-4 md:h-16 md:gap-10 md:px-6">
        <Link to="/" className="pointer-events-auto flex min-w-0 items-center gap-2.5 text-primary md:gap-3">
          <OrbiMark />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-display truncate text-[13px] font-medium tracking-[0.28em] text-foreground md:text-[15px] md:tracking-[0.3em]">
              ORBI LIVE
            </span>
            <span className="label-track mt-1 hidden text-[9px] text-muted-foreground sm:block">
              Earth Intelligence
            </span>
          </span>
        </Link>

        <nav className="pointer-events-auto hidden flex-1 items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="label-track text-muted-foreground transition-colors duration-200 hover:text-foreground data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 md:gap-4">
          <div className="label-track pointer-events-auto hidden items-center gap-2 text-[10px] text-muted-foreground sm:flex">
            {(["pt-BR", "en", "es"] as const).map((code, i) => (
              <span key={code} className="flex items-center gap-2">
                {i > 0 && <span className="opacity-20">|</span>}
                <button
                  onClick={() => setLocale(code)}
                  className={`focus-ring rounded-sm transition-colors duration-200 hover:text-foreground ${
                    locale === code ? "text-primary" : ""
                  }`}
                >
                  {code === "pt-BR" ? "PT" : code.toUpperCase()}
                </button>
              </span>
            ))}
          </div>

          <div className="surface-panel flex items-center gap-2 rounded-full px-2.5 py-1.5 md:px-3">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inset-0 rounded-full bg-primary/50"
                style={{ animation: "orbi-pulse 2.4s ease-in-out infinite" }}
              />
              <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span className="label-track text-[10px] text-foreground">{t.common.live}</span>
          </div>
        </div>
      </header>



      <main className="min-h-screen">{children}</main>
    </div>
  );
}