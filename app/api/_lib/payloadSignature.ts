import { AppSecurityError } from "../../../security/errors";

const encoder = new TextEncoder();

const supportsSubtle = (): boolean =>
  typeof globalThis.crypto !== "undefined" &&
  typeof globalThis.crypto.subtle !== "undefined" &&
  typeof globalThis.crypto.subtle.sign === "function";

const secret = (): string => process.env.API_HMAC_SECRET ?? "academic-hmac-secret-change-me";

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join("");

const hmacSha256 = async (payload: string): Promise<string> => {
  if (!supportsSubtle()) {
    return toHex(encoder.encode(`${secret()}:${payload}`)).slice(0, 64);
  }

  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toHex(new Uint8Array(signed));
};

const constantTimeCompare = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
};

export const assertPayloadSignature = async (request: Request, payload: unknown): Promise<void> => {
  const signature = request.headers.get("x-payload-signature");
  if (!signature) {
    throw new AppSecurityError("Missing payload signature", {
      code: "MISSING_SIGNATURE",
      status: 401,
      publicMessage: "Assinatura de payload ausente.",
    });
  }

  const expected = await hmacSha256(JSON.stringify(payload));
  if (!constantTimeCompare(signature, expected)) {
    throw new AppSecurityError("Invalid payload signature", {
      code: "INVALID_SIGNATURE",
      status: 401,
      publicMessage: "Assinatura de payload inválida.",
    });
  }
};

export const createPayloadSignature = async (payload: unknown): Promise<string> => {
  return hmacSha256(JSON.stringify(payload));
};
