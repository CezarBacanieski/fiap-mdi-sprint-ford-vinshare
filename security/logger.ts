import { SecurityEvent } from "./types";
import { incrementSecurityMetric } from "./metrics";

const sensitiveKeyPattern = /(password|token|authorization|cpf|email|phone|secret|cookie|chassi)/i;

const redactSensitiveData = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveData);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (sensitiveKeyPattern.test(key)) {
          return [key, "[REDACTED]"];
        }
        return [key, redactSensitiveData(item)];
      }),
    );
  }

  return value;
};

const randomHex = (size = 16): string => {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(size);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join("");
  }

  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 18)}`;
};

export const createRequestId = (): string => `req_${randomHex(12)}`;
export const createCorrelationId = (): string => `corr_${randomHex(12)}`;

export const auditLog = (event: SecurityEvent): void => {
  if (event.event.includes("login_success")) incrementSecurityMetric("login_success_total");
  const entry = {
    timestamp: new Date().toISOString(),
    type: "audit",
    ...event,
    metadata: redactSensitiveData(event.metadata ?? {}),
  };

  console.info(JSON.stringify(entry));
};

export const securityLog = (
  level: "info" | "warn" | "error",
  message: string,
  metadata?: Record<string, unknown>,
): void => {
  incrementSecurityMetric("security_events_total");
  if (message.includes("login") || message.includes("account_locked")) incrementSecurityMetric("login_failed_total");
  if (message.includes("rate_limit")) incrementSecurityMetric("rate_limit_blocked_total");
  if (message.includes("refresh") && level !== "info") incrementSecurityMetric("auth_refresh_failed_total");
  const payload = {
    timestamp: new Date().toISOString(),
    type: "security",
    level,
    message,
    metadata: redactSensitiveData(metadata ?? {}),
  };

  const encoded = JSON.stringify(payload);
  if (level === "error") {
    console.error(encoded);
    return;
  }
  if (level === "warn") {
    console.warn(encoded);
    return;
  }
  console.info(encoded);
};
