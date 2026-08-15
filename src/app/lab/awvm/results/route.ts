import { sanitizeTestRunId } from "@/lib/agent-offers/offer";
import { renderAwvmResults, type AwvmResultsView } from "@/lib/awvm/render";
import { scoreAwvmObservation } from "@/lib/awvm/scoring";

export const dynamic = "force-dynamic";

const NO_INDEX_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "Content-Type": "text/html; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, { status, headers: NO_INDEX_HEADERS });
}

function boundedText(value: FormDataEntryValue | null, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").slice(0, maxLength);
}

export async function GET(request: Request): Promise<Response> {
  return htmlResponse(renderAwvmResults(new URL(request.url).origin));
}

export async function POST(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 100_000) {
    return htmlResponse(renderAwvmResults(origin), 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return htmlResponse(renderAwvmResults(origin), 400);
  }

  const agentName = boundedText(formData.get("agent_name"), 80).trim();
  const runId = sanitizeTestRunId(boundedText(formData.get("run_id"), 64).trim() || null);
  const responseText = boundedText(formData.get("agent_response"), 50_000);
  const fetchSucceeded = formData.get("fetch_status") !== "failure";
  const view: AwvmResultsView = {
    agentName,
    runId,
    responseText,
    result: scoreAwvmObservation(fetchSucceeded, responseText),
  };

  return htmlResponse(renderAwvmResults(origin, view));
}
