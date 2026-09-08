/**
 * ORBI LIVE — modelo de cena da transmissão.
 *
 * Uma "cena" é o que está no ar num dado momento: uma imagem real de câmera,
 * o lugar que ela mostra e o contexto mínimo que a fonte declara.
 *
 * Separação arquitetural:
 *   Scene Selector → LiveScene → Live Stage → Broadcast Overlay
 * O palco e o overlay nunca escolhem a cena; apenas a apresentam.
 */
import type { WindyWebcam } from "@/lib/windy.functions";
import { placeOrRegion } from "@/lib/data/adapters/place-label";

export type LiveSceneWeather = {
  temperature?: string;
  condition?: string;
  wind?: string;
};

export type LiveScene = {
  id: string;
  /** URL temporária da fonte — nunca tratada como asset permanente */
  imageUrl: string | null;
  title: string;
  /** linha principal do overlay (cidade ou nome da câmera) */
  place: string;
  /** linha secundária (região / país) */
  area: string | null;
  lat: number;
  lng: number;
  timezone?: string;
  sourceUrl: string;
  sourceLabel: string;
};

/** Converte uma webcam do Windy na cena que o palco sabe renderizar. */
export function webcamToScene(cam: WindyWebcam): LiveScene {
  const place = cam.city?.trim() || cam.title?.trim() || placeOrRegion(null, cam.lat, cam.lng);
  const area = [cam.region?.trim(), cam.country?.trim()].filter(Boolean).join(", ") || null;

  return {
    id: cam.id,
    imageUrl: cam.imageUrl,
    title: cam.title,
    place,
    area,
    lat: cam.lat,
    lng: cam.lng,
    timezone: cam.timezone,
    sourceUrl: `https://windy.com/webcams/${cam.id}`,
    sourceLabel: "windy.com",
  };
}

/** Hora local do lugar observado, sem inventar fuso quando a fonte não declara. */
export function sceneLocalTime(scene: LiveScene, now: Date, locale: string): string | null {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      ...(scene.timezone ? { timeZone: scene.timezone } : {}),
    }).format(now);
  } catch {
    return null;
  }
}
