import { recordTelemetry } from "@/lib/agent-offers/telemetry";
import { awvmToken } from "@/lib/awvm/registry";

export const dynamic = "force-dynamic";

const ALLOWED_POINTERS = new Set([
  awvmToken("headerLink"),
  awvmToken("hrefAttribute"),
  awvmToken("linkAlternate"),
  awvmToken("linkCustom"),
]);

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pointer = url.searchParams.get("probe");
  if (!pointer || !ALLOWED_POINTERS.has(pointer)) {
    return new Response("AWVM resource not found.\n", {
      status: 404,
      headers: {
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  await recordTelemetry(request, {
    source: "awvm",
    eventType: "awvm_resource_fetch",
    variant: null,
    canaryId: null,
  });

  return new Response(`AWVM linked-resource probe: ${awvmToken("resourceLink")}\n`, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
