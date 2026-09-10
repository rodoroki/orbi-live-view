/**
 * ORBI LIVE — camada de SEO.
 * Metadados, canonical, hreflang e dados estruturados centralizados,
 * para que nenhuma rota precise repetir strings de domínio.
 */

export const SITE_URL = "https://orbiliveword.com";
export const SITE_NAME = "ORBI LIVE";

export const absoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Imagem social oficial e global do ORBI LIVE (1200x630). */
export const SITE_OG_IMAGE = `${SITE_URL}/og/orbi-live-og.jpg`;

type SeoInput = {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  locale?: "pt_BR" | "en_US" | "es_ES";
};

/** Meta tags completas (title, description, Open Graph, Twitter) de uma página. */
export function seoMeta({
  path,
  title,
  description,
  type = "website",
  locale = "pt_BR",
}: SeoInput) {
  const url = absoluteUrl(path);
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: locale },
    { property: "og:image", content: SITE_OG_IMAGE },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "ORBI LIVE — Janela para o mundo." },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: SITE_OG_IMAGE },
  ];
}

/** Canonical + hreflang. Enquanto houver uma única árvore de URLs,
 *  os três idiomas apontam para a mesma página, com x-default. */
export function seoLinks(path: string) {
  const url = absoluteUrl(path);
  return [
    { rel: "canonical", href: url },
    // Enquanto não existirem URLs por idioma (/en, /pt-br, /es), apenas x-default.
    { rel: "alternate", hrefLang: "x-default", href: url },
  ];
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "ORBI LIVE — Real-Time Earth Intelligence",
  url: `${SITE_URL}/`,
  inLanguage: ["pt-BR", "en", "es"],
  description:
    "Explore a Terra em tempo real: terremotos, eventos naturais, alertas meteorológicos e condições atmosféricas ao redor do planeta.",
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
};

/** WebPage simples para páginas indexáveis de conteúdo. */
export function webPageJsonLd({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
  };
}

export const jsonLdScript = (data: unknown) => ({
  type: "application/ld+json",
  children: JSON.stringify(data),
});

/** Páginas públicas e indexáveis — fonte única do sitemap. */
export const PUBLIC_ROUTES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "hourly" },
  { path: "/live", priority: "0.9", changefreq: "hourly" },
  { path: "/earthquakes", priority: "0.9", changefreq: "hourly" },
  { path: "/natural-events", priority: "0.9", changefreq: "hourly" },
  { path: "/weather", priority: "0.9", changefreq: "hourly" },
  { path: "/eventos", priority: "0.7", changefreq: "daily" },
  { path: "/atmosfera", priority: "0.6", changefreq: "daily" },
  { path: "/oceano", priority: "0.6", changefreq: "daily" },
  { path: "/explorar", priority: "0.6", changefreq: "weekly" },
  { path: "/timeline", priority: "0.6", changefreq: "weekly" },
  { path: "/sobre", priority: "0.5", changefreq: "monthly" },
];
