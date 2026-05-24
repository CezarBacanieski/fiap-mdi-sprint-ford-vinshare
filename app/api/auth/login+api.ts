import { signIn } from "../../../security/auth";
import { AppSecurityError } from "../../../security/errors";
import { auditLog } from "../../../security/logger";
import { sanitizeText } from "../../../security/sanitization";
import { parseJsonBody, preflightResponse, withSecurity } from "../_lib/http";
import { assertPayloadSignature } from "../_lib/payloadSignature";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function OPTIONS(request: Request) {
  return preflightResponse(request) ?? new Response(null, { status: 405 });
}

export async function POST(request: Request) {
  const preflight = preflightResponse(request);
  if (preflight) return preflight;

  return withSecurity(request, async ({ requestId, correlationId, ip }) => {
    const body = await parseJsonBody<LoginBody>(request, 8_192);
    await assertPayloadSignature(request, body);

    const email = sanitizeText(body.email ?? "").toLowerCase();
    const password = sanitizeText(body.password ?? "");

    if (!email || !password) {
      throw new AppSecurityError("Missing credentials", {
        code: "MISSING_CREDENTIALS",
        status: 422,
        publicMessage: "Informe e-mail e senha.",
      });
    }

    const session = await signIn({
      email,
      password,
      requestFingerprint: `${ip}:${request.headers.get("user-agent") ?? "unknown"}`,
    });

    auditLog({
      event: "api_login_success",
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
          role: session.role,
        },
      },
      { status: 200 },
    );

    response.headers.append(
      "Set-Cookie",
      `fordplus_sid=${session.sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
    );
    response.headers.append(
      "Set-Cookie",
      `fordplus_refresh=${session.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800`,
    );

    return response;
  });
}
