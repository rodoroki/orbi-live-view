import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Search, X, LocateFixed } from "lucide-react";
import { usePlaceSearch, type GeoPlace } from "@/lib/geo-search";
import { useTranslation } from "@/lib/i18n";

/**
 * Busca de regiões sobre o mapa: continente, país, estado ou cidade.
 * Ao escolher um resultado, a câmera vai até o ponto e as condições abrem.
 */
export default function RegionSearch({
  onPick,
  current,
}: {
  onPick: (place: GeoPlace) => void;
  current: GeoPlace | null;
}) {
  const { t, locale } = useTranslation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const { data: results, isFetching } = usePlaceSearch(query, locale);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const pick = (place: GeoPlace) => {
    onPick(place);
    setQuery("");
    setOpen(false);
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      pick({
        id: "me",
        name: t.search.myLocation,
        detail: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        kind: "city",
      }),
    );
  };

  return (
    <div
      ref={boxRef}
      className="absolute left-1/2 top-20 z-30 w-[min(92vw,26rem)] -translate-x-1/2 md:top-24 md:left-[calc(50%+7rem)] xl:left-1/2"
    >
      <div className="surface-panel flex items-center gap-2 rounded-full py-0 pl-3 pr-1.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.4} />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              e.currentTarget.blur();
            }
            if (e.key === "Enter") {
              setOpen(true);
              const firstResult = results?.[0];
              if (firstResult) pick(firstResult);
            }
          }}
          placeholder={t.search.placeholder}
          aria-label={t.search.title}
          className="min-w-0 w-full bg-transparent text-base md:text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
        {current && !query && (
          <span className="label-track max-w-24 truncate text-[11px] text-primary">
            {current.name}
          </span>
        )}
        {query && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            aria-label={t.common.close}
            onClick={() => setQuery("")}
            className="focus-ring h-11 w-11 shrink-0 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.4} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          aria-label={t.search.myLocation}
          title={t.search.myLocation}
          onClick={locate}
          className="focus-ring h-11 w-11 shrink-0 p-0 text-muted-foreground hover:text-primary"
        >
          <LocateFixed className="h-3.5 w-3.5" strokeWidth={1.4} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setOpen(true);
            const firstResult = results?.[0];
            if (firstResult) pick(firstResult);
          }}
          disabled={query.trim().length < 2}
          className="focus-ring label-track shrink-0 rounded-full min-h-11 bg-primary/15 px-3 py-1.5 text-[11px] text-primary transition-colors hover:bg-primary/25 disabled:opacity-40"
        >
          {t.common.search}
        </Button>
      </div>

      {open && query.trim().length >= 2 && (
        <div className="surface-panel mt-2 max-h-72 overflow-y-auto rounded-md p-1 animate-rise">
          {(results ?? []).map((place) => (
            <Button
              variant="ghost"
              size="sm"
              key={`${place.kind}-${place.id}`}
              type="button"
              onClick={() => pick(place)}
              className="focus-ring grid min-h-11 h-auto w-full grid-cols-[minmax(0,1fr)_auto] whitespace-normal items-baseline justify-between gap-3 rounded-sm px-2.5 py-2 text-left transition-colors hover:bg-accent"
            >
              <span className="min-w-0 text-sm text-foreground">{place.name}</span>
              <span className="label-track max-w-32 text-right text-[11px] text-muted-foreground">
                {place.detail}
              </span>
            </Button>
          ))}
          {!isFetching && (results ?? []).length === 0 && (
            <p className="label-track px-2.5 py-3 text-[9px] text-muted-foreground">
              {t.search.noResults}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
