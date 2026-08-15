import { AWVM_PROBES } from "@/lib/awvm/registry";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return Response.json(
    {
      name: "Agent Web Visibility Matrix",
      short_name: "AWVM",
      version: "1.0",
      probe_count: AWVM_PROBES.length,
      probes: AWVM_PROBES,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
