import "server-only";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";

export async function queueVercelPortfolioDeployment(payload: {
  slug: string;
  portfolioUid: string;
  publishedUrl: string;
}) {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return {
      queued: false,
      reason: "Missing Vercel deployment credentials",
    };
  }

  const deploymentUrl = getPortfolioPublicUrl({ slug: payload.slug }) ?? payload.publishedUrl;

  // With only the default *.vercel.app domain, we keep published portfolios path-based.
  // True per-user subdomains should be added once a custom domain is configured on the project.
  const response = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}${teamId ? `?teamId=${teamId}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      queued: false,
      reason: "Vercel project lookup failed",
      publishedUrl: deploymentUrl,
    };
  }

  return {
    queued: true,
    provider: "vercel",
    publishedUrl: deploymentUrl,
    payload,
  };
}
