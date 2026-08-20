import type { ReactNode } from "react";

export function ContextPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-8 border-l border-border bg-background/40 px-6 py-8 lg:flex">
      <div>
        <p className="label-track text-primary">{eyebrow}</p>
        <h2 className="mt-3 text-lg font-medium tracking-tight">{title}</h2>
      </div>
      {children}
    </aside>
  );
}

export function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
      <span className="label-track text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}