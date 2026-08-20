import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { OrbiMark } from "./OrbiMark";

const nav = [
  { label: "Planeta", to: "/" },
  { label: "Eventos", to: "/eventos" },
  { label: "Atmosfera", to: "/atmosfera" },
  { label: "Oceano", to: "/oceano" },
  { label: "Explorar", to: "/explorar" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-void text-foreground">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-16 items-center gap-10 px-6">
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

        <nav className="pointer-events-auto hidden flex-1 items-center gap-8 md:flex">
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

        <div className="surface-panel ml-auto flex items-center gap-2 rounded-full px-3 py-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animation: "orbi-pulse 2.4s ease-in-out infinite" }}
          />
          <span className="label-track text-foreground">Live</span>
        </div>
      </header>

      <main className="min-h-screen">{children}</main>
    </div>
  );
}