import { AppSecurityError, toSafeErrorResult } from "../../../security/errors";
import { auditLog, createCorrelationId, createRequestId, securityLog } from "../../../security/logger";

const allowedOrigins = new Set(["https://ford-plus-vinshare.expo.app", "http://localhost:8081"]);

const securityHeaders = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

const ipRate = new Map<string, number[]>();
const RATE_LIMIT = 80;
const RATE_WINDOW_MS = 60_000;

const getClientIp = (request: Request): string => {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
};

const applyRateLimit = (key: string): void => {
  const now = Date.now();
  const hits = ipRate.get(key) ?? [];
  const recent = hits.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    throw new AppSecurityError("API rate limit exceeded", {
      code: "API_RATE_LIMITED",
      status: 429,
      publicMessage: "Muitas requisições. Aguarde alguns segundos.",
    });
  }
  recent.push(now);
  ipRate.set(key, recent);
};

const assertCors = (request: Request): void => {
  const origin = request.headers.get("origin");
  if (!origin) return;
  if (!allowedOrigins.has(origin)) {
    throw new AppSecurityError("Blocked origin", {
      code: "CORS_BLOCKED",
      status: 403,
      publicMessage: "Origem não autorizada.",
    });
  }
};

const assertCsrfForStateChange = (request: Request): void => {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return;
  }

  const csrfToken = request.headers.get("x-csrf-token");
  if (!csrfToken || csrfToken.length < 16) {
    throw new AppSecurityError("Missing CSRF token", {
      code: "CSRF_TOKEN_REQUIRED",
      status: 403,
      publicMessage: "Token CSRF ausente ou inválido.",
    });
  }
};

export const preflightResponse = (request: Request): Response | null => {
  if (request.method !== "OPTIONS") return null;
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin ?? "null",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Payload-Signature,X-Request-ID",
      "Access-Control-Max-Age": "600",
      ...securityHeaders,
    },
  });
};

const parseContentLength = (request: Request): number => {
  const raw = request.headers.get("content-length") ?? "0";
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return 0;
  return value;
};

const forbiddenObjectKeys = new Set(["__proto__", "prototype", "constructor"]);

const assertNoPrototypePollution = (value: unknown): void => {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach(assertNoPrototypePollution);
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenObjectKeys.has(key)) {
      throw new AppSecurityError("Prototype pollution key detected", {
        code: "MALICIOUS_INPUT",
        status: 400,
        publicMessage: "Entrada inválida detectada.",
      });
    }
    assertNoPrototypePollution(nested);
  }
};

export const parseJsonBody = async <T>(request: Request, maxSize = 32_768): Promise<T> => {
  const contentLength = parseContentLength(request);
  if (contentLength > maxSize) {
    throw new AppSecurityError("Payload exceeded", {
      code: "PAYLOAD_TOO_LARGE",
      status: 413,
      publicMessage: "Payload excedeu o limite permitido.",
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    throw new AppSecurityError("Malformed JSON", {
      code: "INVALID_JSON",
      status: 400,
      publicMessage: "JSON inválido.",
    });
  }

  assertNoPrototypePollution(payload);

  return payload as T;
};

export const withSecurity = async (
  request: Request,
  handler: (context: { requestId: string; correlationId: string; ip: string }) => Promise<Response>,
): Promise<Response> => {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  const correlationId = request.headers.get("x-correlation-id") ?? createCorrelationId();
  const ip = getClientIp(request);

  try {
    assertCors(request);
    assertCsrfForStateChange(request);
    applyRateLimit(ip);

    const response = await handler({ requestId, correlationId, ip });
    const origin = request.headers.get("origin");
    const headers = new Headers(response.headers);
    if (origin && allowedOrigins.has(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", "Origin");
    }
    headers.set("X-Request-ID", requestId);
    headers.set("X-Correlation-ID", correlationId);
    Object.entries(securityHeaders).forEach(([key, value]) => headers.set(key, value));
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    const safeError = toSafeErrorResult(error);
    securityLog("warn", "api_error", {
      requestId,
      correlationId,
      status: safeError.status,
      code: safeError.body.error.code,
    });
    auditLog({
      event: "api_error",
      severity: safeError.status >= 500 ? "critical" : "warning",
      requestId,
      correlationId,
      metadata: {
        path: request.url,
        method: request.method,
        code: safeError.body.error.code,
      },
    });
    return Response.json(safeError.body, {
      status: safeError.status,
      headers: {
        "X-Request-ID": requestId,
        "X-Correlation-ID": correlationId,
        ...securityHeaders,
      },
    });
  }
};

export const ensureHttpsRequest = (request: Request): void => {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto && proto !== "https") {
    throw new AppSecurityError("Insecure protocol", {
      code: "HTTPS_REQUIRED",
      status: 426,
      publicMessage: "Use HTTPS para esta operação.",
    });
  }
};
