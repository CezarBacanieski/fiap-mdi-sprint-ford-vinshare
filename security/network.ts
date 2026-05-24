import { InternalAxiosRequestConfig } from "axios";
import { AppSecurityError } from "./errors";
import { createCorrelationId, createRequestId } from "./logger";

const allowedOrigins = new Set(["https://parallelum.com.br", "https://viacep.com.br"]);

const isHttpsUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const assertAllowedApiUrl = (baseUrl: string): void => {
  if (!isHttpsUrl(baseUrl)) {
    throw new AppSecurityError("Insecure transport not allowed", {
      code: "INSECURE_URL",
      status: 500,
      publicMessage: "Configuração de API inválida.",
    });
  }

  const parsed = new URL(baseUrl);
  const origin = `${parsed.protocol}//${parsed.host}`;
  if (!allowedOrigins.has(origin)) {
    throw new AppSecurityError("Unknown API origin", {
      code: "BLOCKED_ORIGIN",
      status: 500,
      publicMessage: "Origem da API não autorizada.",
    });
  }
};

export const attachSecurityHeaders = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const requestId = createRequestId();
  const correlationId = createCorrelationId();
  config.headers.set("Accept", "application/json");
  config.headers.set("X-Request-ID", requestId);
  config.headers.set("X-Correlation-ID", correlationId);
  config.headers.set("X-Client-Security-Version", "2026.05");
  return config;
};

export const verifySignedPayload = (
  payload: unknown,
  signature: string | null,
  expectedSignature: string,
): boolean => {
  void payload;
  if (!signature) return false;
  return signature === expectedSignature;
};
