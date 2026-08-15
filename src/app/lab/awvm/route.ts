import { recordTelemetry } from "@/lib/agent-offers/telemetry";
import { sanitizeTestRunId } from "@/lib/agent-offers/offer";
import { renderAwvmPage, awvmResourcePath } from "@/lib/awvm/render";
import { awvmToken } from "@/lib/awvm/registry";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const runId = sanitizeTestRunId(url.searchParams.get("run"));

  await recordTelemetry(request, {
    source: "awvm",
    eventType: "awvm_page_fetch",
    variant: null,
    canaryId: null,
  });

  return new Response(renderAwvmPage(url.origin, runId), {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "Content-Type": "text/html; charset=utf-8",
      Link: `<${awvmResourcePath(awvmToken("headerLink"), runId)}>; rel="awvm-probe"; type="text/plain"`,
      "X-AWVM-Metadata": awvmToken("headerMetadata"),
      "X-AWVM-Probe": awvmToken("headerCustom"),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
