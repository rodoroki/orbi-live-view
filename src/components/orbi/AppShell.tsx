import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";
import { OrbiMark } from "./OrbiMark";
import { useTranslation } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useTranslation();
  // Modo transmissão (/live?mode=broadcast): sem chrome do site, só a cena.
  const isBroadcast = useRouterState({
    select: (s) =>
      s.location.pathname === "/live" &&
      (s.location.search as { mode?: string }).mode === "broadcast",
  });

  if (isBroadcast) return <>{children}</>;

  // Navegação por intenção do usuário, não por fonte de dados.
  const nav = [
    { label: t.nav.planet, to: "/" },
    { label: t.nav.live, to: "/live" },
    { label: t.nav.events, to: "/eventos" },
    { label: t.nav.explore, to: "/explorar" },
  ] as const;

  return (
    <div className="relative min-h-screen bg-void text-foreground">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 lg:flex lg:gap-6 px-4 md:h-16 md:gap-10 md:px-6">
        <Link
          to="/"
          className="pointer-events-auto flex min-w-0 items-center gap-2.5 text-primary md:gap-3"
        >
          <OrbiMark />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-display truncate text-[13px] font-medium tracking-normal text-foreground md:text-[15px] md:tracking-normal">
              ORBI LIVE <span className="font-light text-primary/80">WORLD</span>
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

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t.common.explore} title={t.common.explore} className="pointer-events-auto h-11 w-11 text-muted-foreground lg:hidden"><Menu /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {nav.map((item) => <DropdownMenuItem key={item.to} asChild className="min-h-11"><Link to={item.to}>{item.label}</Link></DropdownMenuItem>)}
              <DropdownMenuSeparator />
              {(["pt-BR", "en", "es"] as const).map((code) => <DropdownMenuItem key={code} onSelect={() => setLocale(code)} className="min-h-11" aria-current={locale === code ? "true" : undefined}>{code === "pt-BR" ? "Português" : code === "en" ? "English" : "Español"}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="label-track pointer-events-auto hidden items-center gap-2 text-[10px] text-muted-foreground sm:flex">
            {(["pt-BR", "en", "es"] as const).map((code, i) => (
              <span key={code} className="flex items-center gap-2">
                {i > 0 && <span className="opacity-20">|</span>}
                <Button variant="ghost" size="sm"
                  onClick={() => setLocale(code)}
                  className={`focus-ring h-11 min-w-8 rounded-sm px-1 transition-colors duration-200 hover:text-foreground ${
                    locale === code ? "text-primary" : ""
                  }`}
                >
                  {code === "pt-BR" ? "PT" : code.toUpperCase()}
                </Button>
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
