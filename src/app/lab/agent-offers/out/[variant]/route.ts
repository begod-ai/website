import { handleOutboundAction } from "@/lib/agent-offers/handlers";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ variant: string }>;
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { variant } = await context.params;
  return handleOutboundAction(request, variant);
}
