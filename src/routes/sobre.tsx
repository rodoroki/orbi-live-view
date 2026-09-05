import { createFileRoute } from "@tanstack/react-router";
import { SectionPage } from "@/components/orbi/SectionPage";

const INTRO =
  "ORBI LIVE é uma janela de observação da Terra. Reúne fontes públicas oficiais de monitoramento planetário em uma única interface, sem intermediários e com atribuição clara de origem.";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Fontes e transparência" },
      { name: "description", content: INTRO },
      { property: "og:title", content: "ORBI LIVE — Fontes e transparência" },
      { property: "og:description", content: INTRO },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

type Source = {
  name: string;
  org: string;
  use: string;
  status: "live" | "planned";
  url: string;
};

const SOURCES: Source[] = [
  {
    name: "EONET v3",
    org: "NASA · Earth Observatory",
    use: "Eventos naturais em curso: incêndios, tempestades, vulcões, gelo marinho",
    status: "live",
    url: "https://eonet.gsfc.nasa.gov/docs/v3",
  },
  {
    name: "Point Forecast API (GFS)",
    org: "Windy.com",
    use: "Previsão pontual: temperatura, vento, pressão, umidade, precipitação, nuvens",
    status: "live",
    url: "https://api.windy.com/point-forecast/docs",
  },
  {
    name: "Windy Embed",
    org: "Windy.com · ECMWF",
    use: "Mapa meteorológico ao vivo por região",
    status: "live",
    url: "https://www.windy.com",
  },
  {
    name: "Webcams API v3",
    org: "Windy.com",
    use: "Câmeras ao vivo próximas ao ponto observado",
    status: "live",
    url: "https://api.windy.com/webcams/docs",
  },
  {
    name: "Geocoding API",
    org: "Open-Meteo",
    use: "Busca de continentes, países, estados e cidades",
    status: "live",
    url: "https://open-meteo.com/en/docs/geocoding-api",
  },
  {
    name: "World Imagery e World Boundaries",
    org: "Esri · Maxar · Earthstar Geographics",
    use: "Imagem de satélite em alta resolução, limites e nomes de lugares ao aproximar",
    status: "live",
    url: "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9",
  },
  {
    name: "Blue Marble e Black Marble",
    org: "NASA · Visible Earth",
    use: "Texturas de base do planeta: dia e luzes urbanas noturnas",
    status: "live",
    url: "https://visibleearth.nasa.gov",
  },
  {
    name: "Earthquake Catalog",
    org: "USGS",
    use: "Sismos em tempo real",
    status: "planned",
    url: "https://earthquake.usgs.gov/fdsnws/event/1/",
  },
  {
    name: "Ocean e Marine Data",
    org: "NOAA",
    use: "Ondas, swell, correntes e temperatura da superfície do mar",
    status: "planned",
    url: "https://www.noaa.gov",
  },
];

function Page() {
  return (
    <SectionPage eyebrow="Sobre" title="Fontes e transparência" intro={INTRO}>
      <ul className="flex flex-col">
        {SOURCES.map((source) => (
          <li
            key={source.name}
            className="flex flex-col gap-1 border-t border-border py-5 last:border-b sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
          >
            <div className="min-w-0">
              <div className="flex items-baseline gap-2.5">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="focus-ring text-sm text-foreground underline-offset-4 hover:underline"
                >
                  {source.name}
                </a>
                <span
                  className={`label-track text-[8px] ${
                    source.status === "live" ? "text-primary" : "text-muted-foreground/60"
                  }`}
                >
                  {source.status === "live" ? "Ao vivo" : "Previsto"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {source.use}
              </p>
            </div>
            <span className="label-track shrink-0 text-[9px] text-muted-foreground/70">
              {source.org}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs leading-relaxed text-muted-foreground/80">
        Os dados exibidos pertencem às respectivas instituições e são usados conforme
        seus termos públicos de uso. O ORBI LIVE não altera os valores originais: apenas
        organiza, traduz e apresenta a informação.
      </p>
    </SectionPage>
  );
}
