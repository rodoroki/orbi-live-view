import { useEffect, useState } from "react";

/**
 * ORBI — "sua localização é o centro do universo".
 *
 * Tenta obter a posição aproximada do usuário uma única vez, guarda o
 * resultado localmente e nunca bloqueia a experiência: sem permissão,
 * o planeta simplesmente permanece em visão global.
 */
export type UserLocation = { lat: number; lng: number };

const STORAGE_KEY = "orbi.user-location";

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [state, setState] = useState<"idle" | "asking" | "granted" | "denied">("idle");

  useEffect(() => {
    let cancelled = false;

    const cached = (() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as UserLocation) : null;
      } catch {
        return null;
      }
    })();

    if (cached) {
      setLocation(cached);
      setState("granted");
      return;
    }

    if (!("geolocation" in navigator)) {
      setState("denied");
      return;
    }

    setState("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(next);
        setState("granted");
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* armazenamento indisponível — segue sem cache */
        }
      },
      () => {
        if (!cancelled) setState("denied");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 30 * 60_000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return { location, state };
}
