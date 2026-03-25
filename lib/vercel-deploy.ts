import "server-only";

export async function queueVercelPortfolioDeployment(payload: {
  slug: string;
  portfolioUid: string;
  publishedUrl: string;
}) {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return {
      queued: false,
      reason: "Missing Vercel deployment credentials",
    };
  }

  return {
    queued: true,
    provider: "vercel",
    payload,
  };
}
