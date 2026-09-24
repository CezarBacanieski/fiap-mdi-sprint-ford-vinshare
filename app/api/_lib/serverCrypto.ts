const encoder = new TextEncoder();

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join("");

const getEncryptionSecret = (): string => {
  const secret = process.env.API_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("API_HMAC_SECRET must be configured with at least 32 characters.");
  }
  return secret;
};

export const encryptServerValue = async (value: string): Promise<string> => {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is required for server-side encryption.");
  }
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoder.encode(getEncryptionSecret()));
  const key = await globalThis.crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await globalThis.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(value));
  return `gcm:${bytesToHex(iv)}:${bytesToHex(new Uint8Array(encrypted))}`;
};
