const encoder = new TextEncoder();
const decoder = new TextDecoder();

const hexToBytes = (hex: string): Uint8Array => {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((item) => Number.parseInt(item, 16)));
};

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join("");
};

const getSecret = (): string => {
  return process.env.EXPO_PUBLIC_STORAGE_SECRET ?? "fordplus_academic_secret_change_me";
};

const supportsSubtle = (): boolean =>
  typeof globalThis.crypto !== "undefined" &&
  typeof globalThis.crypto.subtle !== "undefined" &&
  typeof globalThis.crypto.subtle.importKey === "function";

const deriveKey = async (): Promise<CryptoKey> => {
  const secretBytes = encoder.encode(getSecret());
  const digest = await globalThis.crypto.subtle.digest("SHA-256", secretBytes);
  return globalThis.crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

export const encryptString = async (value: string): Promise<string> => {
  if (!supportsSubtle()) {
    return `plain:${encodeURIComponent(value)}`;
  }

  const key = await deriveKey();
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const payload = encoder.encode(value);
  const encrypted = await globalThis.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload);

  return `gcm:${bytesToHex(iv)}:${bytesToHex(new Uint8Array(encrypted))}`;
};

export const decryptString = async (value: string): Promise<string | null> => {
  if (value.startsWith("plain:")) {
    return decodeURIComponent(value.slice(6));
  }

  if (!value.startsWith("gcm:") || !supportsSubtle()) {
    return null;
  }

  const [, ivHex, dataHex] = value.split(":");
  if (!ivHex || !dataHex) return null;

  try {
    const key = await deriveKey();
    const iv = hexToBytes(ivHex);
    const data = hexToBytes(dataHex);
    const decrypted = await globalThis.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    return decoder.decode(decrypted);
  } catch {
    return null;
  }
};
