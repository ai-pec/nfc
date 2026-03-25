import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";

type MetricValue = string;

export type SiteMetrics = {
  totalUsers: MetricValue;
  publishedPortfolios: MetricValue;
  paidOrders: MetricValue;
  newLeads: MetricValue;
};

type PortfolioPreview = {
  name: string;
  slug: string;
  headline: string | null;
  company: string | null;
};

function formatMetric(value: number | null) {
  if (!value) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN").format(value);
}

export const getSiteMetrics = cache(async (): Promise<SiteMetrics> => {
  const [usersResult, portfoliosResult, ordersResult, leadsResult] = await Promise.all([
    supabaseAdmin.from("users").select("uid", { count: "exact", head: true }),
    supabaseAdmin.from("portfolios").select("uid", { count: "exact", head: true }).eq("published", true),
    supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).in("status", ["paid", "completed"]),
    supabaseAdmin.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  return {
    totalUsers: formatMetric(usersResult.count ?? 0),
    publishedPortfolios: formatMetric(portfoliosResult.count ?? 0),
    paidOrders: formatMetric(ordersResult.count ?? 0),
    newLeads: formatMetric(leadsResult.count ?? 0),
  };
});

export const getFeaturedProfiles = cache(async (): Promise<PortfolioPreview[]> => {
  const { data, error } = await supabaseAdmin
    .from("portfolios")
    .select("name, slug, headline, company")
    .eq("published", true)
    .limit(3);

  if (error || !data) {
    return [];
  }

  return data;
});
