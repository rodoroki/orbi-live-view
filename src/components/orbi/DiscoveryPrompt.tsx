import type { ReactNode } from "react";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DiscoveryPrompt({
  eyebrow,
  children,
  action,
  onAction,
  onClose,
  className,
  live = false,
  closeLabel = "Close",
}: {
  eyebrow: string;
  children: ReactNode;
  action?: string;
  onAction?: () => void;
  onClose?: () => void;
  className?: string;
  live?: boolean;
  closeLabel?: string;
}) {
  return (
    <div
      className={cn("surface-panel rounded-md px-4 py-3 animate-rise", className)}
      role={live ? "status" : undefined}
      aria-live={live ? "polite" : undefined}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-discovery" />
        <div className="min-w-0 flex-1">
          <p className="label-track text-[9px] text-discovery">{eyebrow}</p>
          <div className="mt-1 text-xs font-light leading-relaxed text-foreground/90">
            {children}
          </div>
          {action && onAction && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAction}
              className="mt-2 h-auto px-0 py-1 text-[10px] text-primary hover:bg-transparent hover:text-primary/70"
            >
              {action}
              <ArrowRight className="h-3 w-3" strokeWidth={1.4} />
            </Button>
          )}
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={closeLabel}
            className="-mr-2 -mt-2 h-7 w-7 text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <X className="h-3 w-3" strokeWidth={1.4} />
          </Button>
        )}
      </div>
    </div>
  );
}
