/**
 * ORBI LIVE — modelo de cena da transmissão.
 *
 * Uma "cena" é o que está no ar num dado momento: mídia real de câmera,
 * o lugar que ela mostra e o contexto mínimo que a fonte declara.
 *
 * Separação arquitetural:
 *   Scene Selector → LiveScene → Live Stage → Broadcast Overlay
 * O palco e o overlay nunca escolhem a cena; apenas a apresentam.
 */
import type { WindyWebcam } from "@/lib/windy.functions";
import { placeOrRegion } from "@/lib/data/adapters/place-label";

export type LiveSceneWeather = {
  temperature?: string | undefined;
  condition?: string | undefined;
  wind?: string | undefined;
};

export type LiveMedia =
  | { type: "live"; url: string; presentation: "iframe" }
  | { type: "timelapse"; url: string; presentation: "iframe" }
  | { type: "image"; url: string; presentation: "image" };

export type LiveScene = {
  id: string;
  /** Ordem de apresentação e fallback: live → timelapse → image. */
  media: LiveMedia[];
  title: string;
  /** linha principal do overlay (cidade ou nome da câmera) */
  place: string;
  /** linha secundária (região / país) */
  area: string | null;
  lat: number;
  lng: number;
  timezone?: string | undefined;
  sourceUrl: string;
  sourceLabel: string;
};

function safeHttpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Normaliza somente formatos que a fonte declarou e o navegador sabe apresentar. */
export function webcamMedia(cam: WindyWebcam): LiveMedia[] {
  const media: LiveMedia[] = [];
  const liveUrl = safeHttpsUrl(cam.player?.live);
  const timelapseUrl = safeHttpsUrl(cam.player?.day);
  const imageUrl = safeHttpsUrl(cam.imageUrl);

  if (liveUrl) media.push({ type: "live", url: liveUrl, presentation: "iframe" });
  if (timelapseUrl) {
    media.push({ type: "timelapse", url: timelapseUrl, presentation: "iframe" });
  }
  if (imageUrl) media.push({ type: "image", url: imageUrl, presentation: "image" });
  return media;
}

export function sceneMediaSignature(scene: LiveScene): string {
  return scene.media.map(({ type, url }) => `${type}:${url}`).join("|");
}

/** Converte uma webcam do Windy na cena que o palco sabe renderizar. */
export function webcamToScene(cam: WindyWebcam): LiveScene {
  const place = cam.city?.trim() || cam.title?.trim() || placeOrRegion(null, cam.lat, cam.lng);
  const area = [cam.region?.trim(), cam.country?.trim()].filter(Boolean).join(", ") || null;

  return {
    id: cam.id,
    media: webcamMedia(cam),
    title: cam.title,
    place,
    area,
    lat: cam.lat,
    lng: cam.lng,
    timezone: cam.timezone,
    sourceUrl: safeHttpsUrl(cam.sourceUrl) ?? `https://windy.com/webcams/${cam.id}`,
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
