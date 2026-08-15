import { handleLandingPage } from "@/lib/agent-offers/handlers";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleLandingPage(request);
}
