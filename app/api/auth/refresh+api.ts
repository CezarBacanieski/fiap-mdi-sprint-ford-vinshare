import { refreshSession } from "../../../security/auth";
import { AppSecurityError } from "../../../security/errors";
import { auditLog } from "../../../security/logger";
import { parseJsonBody, preflightResponse, withSecurity } from "../_lib/http";
import { assertPayloadSignature } from "../_lib/payloadSignature";

interface RefreshBody {
  refreshToken?: string;
}

export async function OPTIONS(request: Request) {
  return preflightResponse(request) ?? new Response(null, { status: 405 });
}

export async function POST(request: Request) {
  const preflight = preflightResponse(request);
  if (preflight) return preflight;

  return withSecurity(request, async ({ requestId, correlationId }) => {
    const body = await parseJsonBody<RefreshBody>(request, 4_096);
    await assertPayloadSignature(request, body);

    const refreshToken = body.refreshToken?.trim();
    if (!refreshToken) {
      throw new AppSecurityError("Missing refresh token", {
        code: "MISSING_REFRESH_TOKEN",
        status: 422,
        publicMessage: "Refresh token ausente.",
      });
    }

    const session = refreshSession(refreshToken);

    auditLog({
      event: "api_refresh_success",
      severity: "info",
      requestId,
      correlationId,
      userId: session.userId,
      role: session.role,
      metadata: { sessionId: session.sessionId },
    });

    const response = Response.json(
      {
        data: {
          sessionId: session.sessionId,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          accessTokenExpiresAt: session.accessTokenExpiresAt,
          refreshTokenExpiresAt: session.refreshTokenExpiresAt,
        },
      },
      { status: 200 },
    );

    response.headers.append(
      "Set-Cookie",
      `fordplus_refresh=${session.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800`,
    );
    return response;
  });
}
