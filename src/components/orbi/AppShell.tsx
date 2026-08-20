import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Globe2, Activity, Clock, Info } from "lucide-react";
import { OrbiMark } from "./OrbiMark";

const nav = [
  { label: "Planeta", to: "/" },
  { label: "Eventos", to: "/eventos" },
  { label: "Atmosfera", to: "/atmosfera" },
  { label: "Oceano", to: "/oceano" },
  { label: "Explorar", to: "/explorar" },
] as const;

const rail = [
  { label: "Mapa", to: "/", icon: Globe2 },
  { label: "Eventos", to: "/eventos", icon: Activity },
  { label: "Timeline", to: "/timeline", icon: Clock },
  { label: "Sobre o ORBI", to: "/sobre", icon: Info },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-void text-foreground">
      <header className="flex h-16 shrink-0 items-center gap-10 border-b border-border px-6">
        <Link to="/" className="flex items-center gap-3 text-primary">
          <OrbiMark />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-medium tracking-[0.3em] text-foreground">
              ORBI LIVE
            </span>
            <span className="label-track mt-1 text-[9px] text-muted-foreground">
              Earth Intelligence
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="label-track text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 border border-border px-3 py-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animation: "orbi-pulse 2.4s ease-in-out infinite" }}
          />
          <span className="label-track text-foreground">Live</span>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 flex-col justify-between border-r border-border bg-sidebar px-3 py-6 sm:flex">
          <nav className="flex flex-col gap-1">
            {rail.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors ${
                    active
                      ? "bg-sidebar-accent text-primary"
                      : "text-muted-foreground hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.4} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="label-track px-3 text-[9px] text-muted-foreground/70">
            v0.1 · protótipo
          </p>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}