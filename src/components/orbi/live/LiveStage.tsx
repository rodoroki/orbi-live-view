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
}: {
  scene: LiveScene | null;
  isLoading: boolean;
  onImageError?: () => void;
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
          onLoad={() => setStatus("active")}
          onError={() => {
            setStatus("error");
            onImageError?.();
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-out motion-reduce:transition-none ${
            status === "active" ? "opacity-100 animate-live-drift" : "opacity-0"
          }`}
        />
      )}

      {/* vinheta discreta — a informação lê sobre qualquer imagem */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_45%,rgba(0,0,0,0.55)_100%)]"
      />

      {status === "error" && (
        <p className="label-track absolute inset-0 flex items-center justify-center px-8 text-center text-[10px] text-muted-foreground">
          {t.broadcast.imageUnavailable}
        </p>
      )}

      {!scene && !isLoading && (
        <p className="label-track absolute inset-0 flex items-center justify-center px-8 text-center text-[10px] text-muted-foreground">
          {t.broadcast.noCamera}
        </p>
      )}

      {!scene && isLoading && (
        <p className="label-track absolute inset-0 flex items-center justify-center px-8 text-center text-[10px] text-muted-foreground">
          {t.broadcast.loading}
        </p>
      )}
    </div>
  );
}
