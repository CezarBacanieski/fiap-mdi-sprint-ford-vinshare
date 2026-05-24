import { verifyAccessToken } from "../../../security/auth";
import { AppSecurityError } from "../../../security/errors";
import { hasPermission } from "../../../security/permissions";
import { auditLog } from "../../../security/logger";
import { preflightResponse, withSecurity } from "../_lib/http";

export async function OPTIONS(request: Request) {
  return preflightResponse(request) ?? new Response(null, { status: 405 });
}

export async function GET(request: Request) {
  const preflight = preflightResponse(request);
  if (preflight) return preflight;

  return withSecurity(request, async ({ requestId, correlationId }) => {
    const authorization = request.headers.get("authorization") ?? "";
    const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!accessToken) {
      throw new AppSecurityError("Missing token", {
        code: "MISSING_ACCESS_TOKEN",
        status: 401,
        publicMessage: "Token de acesso ausente.",
      });
    }

    const session = verifyAccessToken(accessToken);
    if (!hasPermission(session.role, "security:admin")) {
      throw new AppSecurityError("Forbidden role", {
        code: "FORBIDDEN",
        status: 403,
        publicMessage: "Acesso restrito ao perfil admin.",
      });
    }

    auditLog({
      event: "admin_audit_view",
      severity: "warning",
      requestId,
      correlationId,
      userId: session.userId,
      role: session.role,
    });

    return Response.json(
      {
        data: {
          message: "Endpoint administrativo seguro ativo.",
          generatedAt: new Date().toISOString(),
          controls: [
            "rbac_admin_required",
            "access_token_validation",
            "correlation_id",
            "security_headers",
          ],
        },
      },
      { status: 200 },
    );
  });
}
