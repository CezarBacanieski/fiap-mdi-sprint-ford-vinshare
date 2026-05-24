import { preflightResponse, withSecurity } from "../_lib/http";

export async function OPTIONS(request: Request) {
  return preflightResponse(request) ?? new Response(null, { status: 405 });
}

export async function GET(request: Request) {
  const preflight = preflightResponse(request);
  if (preflight) return preflight;

  return withSecurity(request, async () => {
    return Response.json(
      {
        data: {
          securityMode: "secure-by-default",
          timestamp: new Date().toISOString(),
          controls: [
            "rate_limiting",
            "cors_allowlist",
            "csrf_header",
            "payload_signature",
            "structured_audit_logs",
          ],
        },
      },
      { status: 200 },
    );
  });
}
