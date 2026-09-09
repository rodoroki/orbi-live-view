import { useEffect, useState } from "react";

import { format, useTranslation } from "@/lib/i18n";
import type { LiveScene } from "@/lib/live/scene";

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
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!scene?.imageUrl) return;
    setPreviousUrl((prev) => currentUrl ?? prev);
    setCurrentUrl(scene.imageUrl);
    setStatus("loading");
    // currentUrl é lido de propósito só na troca de cena
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.imageUrl]);

  // Algumas origens não disparam erro prontamente; trate loading travado como falha.
  useEffect(() => {
    if (!currentUrl || status !== "loading") return;
    const timer = window.setTimeout(() => {
      setStatus("error");
      onImageError?.();
    }, 12_000);
    return () => window.clearTimeout(timer);
  }, [currentUrl, onImageError, status]);

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

      {currentUrl && (
        <img
          key={currentUrl}
          src={currentUrl}
          alt={alt}
          loading="eager"
          decoding="async"
          onLoad={() => {
            setStatus("active");
            setPreviousUrl(null);
            onImageLoad?.();
          }}
          onError={() => {
            setStatus("error");
            onImageError?.();
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-out motion-reduce:transition-none ${
            status === "active" ? "opacity-100 animate-live-drift" : "opacity-0"
          }`}
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
