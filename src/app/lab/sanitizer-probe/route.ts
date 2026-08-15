import { recordTelemetry } from "@/lib/agent-offers/telemetry";
import { renderSanitizerProbe } from "@/lib/sanitizer-probe/render";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  await recordTelemetry(request, {
    eventType: "page_fetch",
    variant: null,
    canaryId: null,
  });

  return new Response(renderSanitizerProbe(new URL(request.url).origin), {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Sanitizer-Probe": "HEADER-X72",
    },
  });
}
