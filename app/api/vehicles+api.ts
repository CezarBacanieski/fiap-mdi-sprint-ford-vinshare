import { verifyAccessToken } from "../../security/auth";
import { AppSecurityError } from "../../security/errors";
import { hasPermission } from "../../security/permissions";
import { auditLog } from "../../security/logger";
import { validateVehicleInput } from "../../security/validation";
import { NewVehicleInput } from "../../types";
import { createVehicle, listVehicles } from "./_lib/database";
import { ensureHttpsRequest, parseJsonBody, preflightResponse, withSecurity } from "./_lib/http";
import { assertPayloadSignature } from "./_lib/payloadSignature";

const getAccessToken = (request: Request): string => {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.replace(/^Bearer\s+/i, "").trim();
};

export async function OPTIONS(request: Request) {
  return preflightResponse(request) ?? new Response(null, { status: 405 });
}

export async function GET(request: Request) {
  const preflight = preflightResponse(request);
  if (preflight) return preflight;

  return withSecurity(request, async ({ requestId, correlationId }) => {
    ensureHttpsRequest(request);

    const accessToken = getAccessToken(request);
    if (!accessToken) {
      throw new AppSecurityError("Missing access token", {
        code: "MISSING_ACCESS_TOKEN",
        status: 401,
        publicMessage: "Token de acesso ausente.",
      });
    }
    const session = verifyAccessToken(accessToken);
    if (!hasPermission(session.role, "vehicle:view")) {
      throw new AppSecurityError("Forbidden read", {
        code: "FORBIDDEN",
        status: 403,
        publicMessage: "Sem permissão para consultar veículos.",
      });
    }

    auditLog({
      event: "vehicle_mass_query",
      severity: "warning",
      requestId,
      correlationId,
      userId: session.userId,
      role: session.role,
      metadata: { endpoint: "/api/vehicles" },
    });

    return Response.json({ data: listVehicles() }, { status: 200 });
  });
}

export async function POST(request: Request) {
  const preflight = preflightResponse(request);
  if (preflight) return preflight;

  return withSecurity(request, async ({ requestId, correlationId }) => {
    ensureHttpsRequest(request);

    const accessToken = getAccessToken(request);
    if (!accessToken) {
      throw new AppSecurityError("Missing access token", {
        code: "MISSING_ACCESS_TOKEN",
        status: 401,
        publicMessage: "Token de acesso ausente.",
      });
    }
    const session = verifyAccessToken(accessToken);
    if (!hasPermission(session.role, "vehicle:create")) {
      throw new AppSecurityError("Forbidden create", {
        code: "FORBIDDEN",
        status: 403,
        publicMessage: "Sem permissão para cadastrar veículos.",
      });
    }

    const body = await parseJsonBody<NewVehicleInput>(request, 16_384);
    await assertPayloadSignature(request, body);
    const safeInput = validateVehicleInput(body);
    const created = await createVehicle(safeInput);

    auditLog({
      event: "vehicle_created_api",
      severity: "info",
      requestId,
      correlationId,
      userId: session.userId,
      role: session.role,
      metadata: { vehicleId: created.id },
    });

    return Response.json({ data: created }, { status: 201 });
  });
}
