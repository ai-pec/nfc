type PortfolioUrlInput = {
  slug: string | null | undefined;
};

export function getAppBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function getPortfolioPublicUrl({ slug }: PortfolioUrlInput) {
  if (!slug) {
    return null;
  }

  return `${getAppBaseUrl()}/p/${slug}`;
}
