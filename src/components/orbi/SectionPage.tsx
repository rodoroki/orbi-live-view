import type { ReactNode } from "react";

export function SectionPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col justify-center px-10 py-24">
      <p className="label-track text-primary">{eyebrow}</p>
      <h1 className="mt-6 text-4xl font-medium tracking-tight">{title}</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">{intro}</p>
      {children ? <div className="mt-16">{children}</div> : null}
    </div>
  );
}

export function DemoList({ items }: { items: [string, string][] }) {
  return (
    <ul className="flex flex-col">
      {items.map(([label, value]) => (
        <li
          key={label}
          className="flex items-baseline justify-between border-t border-border py-4 last:border-b"
        >
          <span className="text-sm text-foreground">{label}</span>
          <span className="font-mono text-xs text-muted-foreground">{value}</span>
        </li>
      ))}
    </ul>
  );
}