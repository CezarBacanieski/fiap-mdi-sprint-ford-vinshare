import { AppSecurityError } from "./errors";

const disallowedPattern = /[<>`$\\{}[\]|;&]/g;
const controlCharsPattern = /[\u0000-\u001f\u007f]/g;
const sqlMetaPattern = /(\b(select|insert|update|delete|drop|alter|union|sleep)\b|--|\/\*|\*\/)/gi;
const pathTraversalPattern = /(\.\.\/|%2e%2e%2f|%2e%2e\\)/gi;

export const normalizeText = (value: string): string => {
  return value.normalize("NFKC").replace(controlCharsPattern, "").trim();
};

export const sanitizeText = (value: string): string => {
  const normalized = normalizeText(value);
  return normalized.replace(disallowedPattern, "");
};

export const sanitizeNumeric = (value: string): string => {
  return normalizeText(value).replace(/\D/g, "");
};

export const assertSafePayload = (raw: string): void => {
  if (raw.length > 4096) {
    throw new AppSecurityError("Payload size exceeded", {
      code: "PAYLOAD_TOO_LARGE",
      status: 413,
      publicMessage: "Payload excedeu o limite permitido.",
    });
  }

  const normalized = normalizeText(raw);
  if (sqlMetaPattern.test(normalized) || pathTraversalPattern.test(normalized)) {
    throw new AppSecurityError("Potential malicious payload", {
      code: "MALICIOUS_INPUT",
      status: 400,
      publicMessage: "Entrada inválida detectada.",
    });
  }
};
