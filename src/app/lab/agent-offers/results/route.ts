import { parseDashboardFilters } from "@/lib/agent-offers/dashboard";
import { loadDashboard } from "@/lib/agent-offers/dashboard-store";
import { renderResultsPage } from "@/lib/agent-offers/results-render";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const filters = parseDashboardFilters(url.searchParams);
  const result = await loadDashboard(filters);

  if (result.status === "error") {
    console.error(
      JSON.stringify({
        source: "agent_offers_lab",
        event_type: "dashboard_database_error",
        route: url.pathname,
        message: "The results dashboard could not read durable telemetry.",
      }),
    );
  }

  return new Response(renderResultsPage(filters, result, url.origin), {
    status: result.status === "error" ? 503 : 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
