import { revokeSession } from "../../../security/auth";
import { AppSecurityError } from "../../../security/errors";
import { auditLog } from "../../../security/logger";
import { sanitizeText } from "../../../security/sanitization";
import { parseJsonBody, preflightResponse, withSecurity } from "../_lib/http";
import { assertPayloadSignature } from "../_lib/payloadSignature";

interface RevokeBody {
  sessionId?: string;
}

export async function OPTIONS(request: Request) {
  return preflightResponse(request) ?? new Response(null, { status: 405 });
}

export async function DELETE(request: Request) {
  const preflight = preflightResponse(request);
  if (preflight) return preflight;

  return withSecurity(request, async ({ requestId, correlationId }) => {
    const body = await parseJsonBody<RevokeBody>(request, 2_048);
    await assertPayloadSignature(request, body);

    const sessionId = sanitizeText(body.sessionId ?? "");
    if (!sessionId) {
      throw new AppSecurityError("Missing session id", {
        code: "MISSING_SESSION_ID",
        status: 422,
        publicMessage: "Sessão não informada.",
      });
    }

    revokeSession(sessionId);
    auditLog({
      event: "api_session_revoked",
      severity: "warning",
      requestId,
      correlationId,
      metadata: { sessionId },
    });

    const response = Response.json({ data: { revoked: true } }, { status: 200 });
    response.headers.append("Set-Cookie", "fordplus_sid=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
    response.headers.append(
      "Set-Cookie",
      "fordplus_refresh=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0",
    );
    return response;
  });
}
