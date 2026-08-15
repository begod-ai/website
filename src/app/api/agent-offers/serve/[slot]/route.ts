import { handleOfferEndpoint } from "@/lib/agent-offers/handlers";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slot: string }>;
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { slot } = await context.params;
  return handleOfferEndpoint(request, slot);
}
