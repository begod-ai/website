import { renderAwvmReference } from "@/lib/awvm/render";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return new Response(renderAwvmReference(new URL(request.url).origin), {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
