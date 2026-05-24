import { createRequestId, securityLog } from "../security/logger";

const blockedUserAgentPatterns = [/sqlmap/i, /nikto/i, /acunetix/i, /nmap/i];
const blockedPathPatterns = [/\.\.\//, /%2e%2e%2f/i, /<script/i];

export const unstable_settings = {
  matcher: {
    patterns: ["/api", "/api/[...path]"],
  },
};

export default function middleware(request: Request) {
  const path = new URL(request.url).pathname;
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  if (blockedPathPatterns.some((pattern) => pattern.test(path))) {
    securityLog("warn", "middleware_blocked_path", { path });
    return Response.json(
      { error: { code: "BLOCKED_PATH", message: "Requisição bloqueada." } },
      {
        status: 400,
        headers: {
          "X-Request-ID": createRequestId(),
        },
      },
    );
  }

  if (blockedUserAgentPatterns.some((pattern) => pattern.test(userAgent))) {
    securityLog("warn", "middleware_blocked_user_agent", { userAgent });
    return Response.json(
      { error: { code: "BLOCKED_AGENT", message: "Requisição bloqueada." } },
      {
        status: 403,
        headers: {
          "X-Request-ID": createRequestId(),
        },
      },
    );
  }
}
