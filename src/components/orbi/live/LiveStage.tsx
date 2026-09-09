import { useEffect, useRef, useState } from "react";

import { format, useTranslation } from "@/lib/i18n";
import { sceneMediaSignature, type LiveMedia, type LiveScene } from "@/lib/live/scene";

type Status = "loading" | "active" | "error";

/**
 * Palco da transmissão: apenas apresenta a cena recebida.
 * Crossfade suave entre imagens; nunca decide qual cena entra no ar.
 */
export default function LiveStage({
  scene,
  isLoading,
  onImageError,
  onImageLoad,
}: {
  scene: LiveScene | null;
  isLoading: boolean;
  onImageError?: () => void;
  onImageLoad?: () => void;
}) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>("loading");
  /** imagem anterior mantida no ar até a próxima carregar (crossfade) */
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const activeImageUrlRef = useRef<string | null>(null);
  const [mediaIndex, setMediaIndex] = useState(0);

  const media = scene?.media[mediaIndex] ?? null;
  const currentUrl = media?.url ?? null;
  const mediaSignature = scene ? sceneMediaSignature(scene) : null;

  useEffect(() => {
    if (!mediaSignature) return;
    setPreviousUrl(activeImageUrlRef.current);
    setMediaIndex(0);
    setStatus("loading");
  }, [mediaSignature]);

  const failCurrentMedia = () => {
    if (scene && mediaIndex + 1 < scene.media.length) {
      setMediaIndex((index) => index + 1);
      setStatus("loading");
      return;
    }
    setStatus("error");
    onImageError?.();
  };

  // Algumas origens não disparam erro prontamente; trate loading travado como falha.
  useEffect(() => {
    if (!currentUrl || status !== "loading") return;
    const timer = window.setTimeout(() => {
      failCurrentMedia();
    }, 12_000);
    return () => window.clearTimeout(timer);
    // A função depende da mídia atual e reinicia o watchdog a cada fallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl, status]);

  const alt = scene ? format(t.broadcast.cameraAlt, { place: scene.place }) : "";

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      {previousUrl && status !== "active" && (
        <img
          src={previousUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-100"
        />
      )}

      {media && (
        <MediaSurface
          key={`${scene?.id ?? "scene"}-${mediaIndex}-${media.url}`}
          media={media}
          alt={alt}
          active={status === "active"}
          onReady={() => {
            setStatus("active");
            setPreviousUrl(null);
            activeImageUrlRef.current = media.type === "image" ? media.url : null;
            onImageLoad?.();
          }}
          onError={failCurrentMedia}
        />
      )}

      {/* leve escurecimento nas bordas — a informação lê sobre qualquer imagem */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/60 to-transparent"
      />

      {status === "error" && !previousUrl && (
        <p className="label-track absolute inset-0 flex items-center justify-center px-8 text-center text-[10px] text-muted-foreground">
          {t.broadcast.imageUnavailable}
        </p>
      )}

      {!scene && !isLoading && (
        <p className="label-track absolute inset-0 flex items-center justify-center px-8 text-center text-[10px] text-muted-foreground">
          {t.broadcast.noCamera}
        </p>
      )}

      {(isLoading || (!!scene && status === "loading" && !previousUrl)) && (
        <p className="label-track absolute inset-0 flex animate-pulse items-center justify-center px-8 text-center text-[10px] text-muted-foreground motion-reduce:animate-none">
          {t.broadcast.loading}
        </p>
      )}
    </div>
  );
}

function MediaSurface({
  media,
  alt,
  active,
  onReady,
  onError,
}: {
  media: LiveMedia;
  alt: string;
  active: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  const className = `absolute inset-0 h-full w-full transition-opacity duration-[900ms] ease-out motion-reduce:transition-none ${
    active ? "opacity-100" : "opacity-0"
  }`;

  if (media.presentation === "iframe") {
    return (
      <iframe
        src={media.url}
        title={alt}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="eager"
        onLoad={onReady}
        onError={onError}
        className={`${className} border-0`}
      />
    );
  }

  return (
    <img
      src={media.url}
      alt={alt}
      loading="eager"
      decoding="async"
      onLoad={onReady}
      onError={onError}
      className={`${className} object-cover ${active ? "animate-live-drift" : ""}`}
    />
  );
}
