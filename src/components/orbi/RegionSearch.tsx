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
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
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
      <div className="surface-panel flex items-center gap-2 rounded-full py-2 pl-3 pr-1.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.4} />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setOpen(true);
              if ((results ?? []).length > 0) pick(results![0]);
            }
          }}
          placeholder={t.search.placeholder}
          aria-label={t.search.title}
          className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        {current && !query && (
          <span className="label-track shrink-0 text-[9px] text-primary">{current.name}</span>
        )}
        {query && (
          <button
            type="button"
            aria-label={t.common.close}
            onClick={() => setQuery("")}
            className="focus-ring text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.4} />
          </button>
        )}
        <button
          type="button"
          aria-label={t.search.myLocation}
          title={t.search.myLocation}
          onClick={locate}
          className="focus-ring text-muted-foreground hover:text-primary"
        >
          <LocateFixed className="h-3.5 w-3.5" strokeWidth={1.4} />
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            if ((results ?? []).length > 0) pick(results![0]);
          }}
          disabled={query.trim().length < 2}
          className="focus-ring label-track shrink-0 rounded-full bg-primary/15 px-3 py-1.5 text-[9px] text-primary transition-colors hover:bg-primary/25 disabled:opacity-40"
        >
          {t.common.search}
        </button>
      </div>


      {open && query.trim().length >= 2 && (
        <div className="surface-panel mt-2 max-h-72 overflow-y-auto rounded-md p-1 animate-rise">
          {(results ?? []).map((place) => (
            <button
              key={`${place.kind}-${place.id}`}
              type="button"
              onClick={() => pick(place)}
              className="focus-ring flex w-full items-baseline justify-between gap-3 rounded-sm px-2.5 py-2 text-left transition-colors hover:bg-accent"
            >
              <span className="text-xs text-foreground">{place.name}</span>
              <span className="label-track text-[9px] text-muted-foreground">{place.detail}</span>
            </button>
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
