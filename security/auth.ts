import { AppSecurityError } from "./errors";
import { auditLog, securityLog } from "./logger";
import { authRateLimiter } from "./rateLimiter";
import { AppRole, AuthSession, LoginAttemptState } from "./types";

interface LoginRequest {
  email: string;
  password: string;
  requestFingerprint: string;
}

interface AuthIdentity {
  userId: string;
  email: string;
  passwordHash: string;
  role: AppRole;
}

const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

const sessions = new Map<string, AuthSession>();
const refreshToSession = new Map<string, string>();
const usedRefreshTokens = new Set<string>();
const loginAttempts = new Map<string, LoginAttemptState>();
const identitiesByEmail = new Map<string, AuthIdentity>();

const encoder = new TextEncoder();

const randomToken = (bytes = 32): string => {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.getRandomValues === "function") {
    const data = new Uint8Array(bytes);
    globalThis.crypto.getRandomValues(data);
    return Array.from(data, (item) => item.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2).padEnd(bytes * 2, "0")}`;
};

const secureEquals = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
};

const hex = (bytes: Uint8Array): string => {
  return Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join("");
};

const weakHashFallback = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
};

const supportsSubtle = (): boolean =>
  typeof globalThis.crypto !== "undefined" &&
  typeof globalThis.crypto.subtle !== "undefined" &&
  typeof globalThis.crypto.subtle.digest === "function";

const derivePasswordHash = async (password: string, salt: string): Promise<string> => {
  if (!supportsSubtle()) {
    return `fallback$${weakHashFallback(`${salt}:${password}`)}`;
  }

  let current = encoder.encode(`${salt}:${password}`);
  for (let round = 0; round < 12_000; round += 1) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", current);
    current = new Uint8Array(digest);
  }

  return `sha256i12k$${hex(current)}`;
};

const validatePasswordPolicy = (password: string): void => {
  const policyValid =
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[\d]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  if (!policyValid) {
    throw new AppSecurityError("Password policy failed", {
      code: "WEAK_PASSWORD",
      status: 422,
      publicMessage:
        "Senha inválida. Use no mínimo 12 caracteres com letras maiúsculas, minúsculas, números e símbolos.",
    });
  }
};

const now = (): number => Date.now();

const getAttemptState = (key: string): LoginAttemptState => {
  const state = loginAttempts.get(key);
  if (!state) {
    const initial: LoginAttemptState = { count: 0, firstAttemptAt: now() };
    loginAttempts.set(key, initial);
    return initial;
  }
  return state;
};

const registerAttemptFailure = (key: string): void => {
  const state = getAttemptState(key);
  const current = now();
  if (current - state.firstAttemptAt > LOGIN_WINDOW_MS) {
    state.count = 0;
    state.firstAttemptAt = current;
  }
  state.count += 1;
  if (state.count >= LOGIN_MAX_ATTEMPTS) {
    state.lockUntil = current + LOCK_MS;
    securityLog("warn", "account_locked", { key, lockUntil: state.lockUntil });
  }
  loginAttempts.set(key, state);
};

const ensureNotLocked = (key: string): void => {
  const state = getAttemptState(key);
  if (state.lockUntil && state.lockUntil > now()) {
    throw new AppSecurityError("Account temporarily locked", {
      code: "ACCOUNT_LOCKED",
      status: 429,
      publicMessage: "Conta temporariamente bloqueada por múltiplas tentativas inválidas.",
    });
  }
};

const clearAttempts = (key: string): void => {
  loginAttempts.delete(key);
};

const buildSession = (identity: AuthIdentity): AuthSession => {
  const createdAt = now();
  const sessionId = `sid_${randomToken(18)}`;
  const accessToken = `atk_${randomToken(24)}`;
  const refreshToken = `rtk_${randomToken(24)}`;

  const session: AuthSession = {
    sessionId,
    userId: identity.userId,
    role: identity.role,
    accessToken,
    refreshToken,
    createdAt,
    accessTokenExpiresAt: createdAt + ACCESS_TTL_MS,
    refreshTokenExpiresAt: createdAt + REFRESH_TTL_MS,
  };

  sessions.set(sessionId, session);
  refreshToSession.set(refreshToken, sessionId);
  return session;
};

let seededIdentityPromise: Promise<void> | null = null;

const ensureSeededIdentity = async (): Promise<void> => {
  if (seededIdentityPromise) {
    await seededIdentityPromise;
    return;
  }

  seededIdentityPromise = (async () => {
    const defaultEmail = "cliente@fordplus.app";
    const defaultPassword = "FordPlus#2026!";
    validatePasswordPolicy(defaultPassword);

    const passwordHash = await derivePasswordHash(defaultPassword, defaultEmail);
    identitiesByEmail.set(defaultEmail, {
      userId: "user-001",
      email: defaultEmail,
      passwordHash,
      role: "user",
    });
  })();

  await seededIdentityPromise;
};

export const signIn = async (request: LoginRequest): Promise<AuthSession> => {
  await ensureSeededIdentity();

  const rateKey = `${request.requestFingerprint}:${request.email.toLowerCase()}`;
  const rate = authRateLimiter.consume(rateKey);
  if (!rate.allowed) {
    throw new AppSecurityError("Rate limit exceeded", {
      code: "RATE_LIMITED",
      status: 429,
      publicMessage: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.",
    });
  }

  ensureNotLocked(rateKey);

  const identity = identitiesByEmail.get(request.email.toLowerCase());
  if (!identity) {
    registerAttemptFailure(rateKey);
    throw new AppSecurityError("Invalid credentials", {
      code: "INVALID_CREDENTIALS",
      status: 401,
      publicMessage: "Credenciais inválidas.",
    });
  }

  const candidateHash = await derivePasswordHash(request.password, identity.email);
  if (!secureEquals(candidateHash, identity.passwordHash)) {
    registerAttemptFailure(rateKey);
    throw new AppSecurityError("Invalid credentials", {
      code: "INVALID_CREDENTIALS",
      status: 401,
      publicMessage: "Credenciais inválidas.",
    });
  }

  clearAttempts(rateKey);
  const session = buildSession(identity);
  auditLog({
    event: "login_success",
    severity: "info",
    userId: session.userId,
    role: session.role,
    metadata: { sessionId: session.sessionId },
  });
  return session;
};

export const refreshSession = (refreshToken: string): AuthSession => {
  if (usedRefreshTokens.has(refreshToken)) {
    throw new AppSecurityError("Refresh token replay detected", {
      code: "TOKEN_REPLAY",
      status: 401,
      publicMessage: "Sessão inválida. Faça login novamente.",
    });
  }

  const sessionId = refreshToSession.get(refreshToken);
  if (!sessionId) {
    throw new AppSecurityError("Invalid refresh token", {
      code: "INVALID_REFRESH_TOKEN",
      status: 401,
      publicMessage: "Sessão inválida. Faça login novamente.",
    });
  }

  const currentSession = sessions.get(sessionId);
  if (!currentSession || currentSession.refreshToken !== refreshToken || currentSession.refreshTokenExpiresAt < now()) {
    sessions.delete(sessionId);
    refreshToSession.delete(refreshToken);
    throw new AppSecurityError("Expired refresh token", {
      code: "REFRESH_TOKEN_EXPIRED",
      status: 401,
      publicMessage: "Sessão expirada. Faça login novamente.",
    });
  }

  usedRefreshTokens.add(refreshToken);
  refreshToSession.delete(refreshToken);

  const rotated: AuthSession = {
    ...currentSession,
    accessToken: `atk_${randomToken(24)}`,
    refreshToken: `rtk_${randomToken(24)}`,
    accessTokenExpiresAt: now() + ACCESS_TTL_MS,
    refreshTokenExpiresAt: now() + REFRESH_TTL_MS,
  };

  sessions.set(rotated.sessionId, rotated);
  refreshToSession.set(rotated.refreshToken, rotated.sessionId);
  auditLog({
    event: "refresh_rotated",
    severity: "info",
    userId: rotated.userId,
    role: rotated.role,
    metadata: { sessionId: rotated.sessionId },
  });
  return rotated;
};

export const revokeSession = (sessionId: string): void => {
  const session = sessions.get(sessionId);
  if (!session) return;
  refreshToSession.delete(session.refreshToken);
  usedRefreshTokens.add(session.refreshToken);
  sessions.delete(sessionId);
  auditLog({
    event: "session_revoked",
    severity: "warning",
    userId: session.userId,
    role: session.role,
    metadata: { sessionId },
  });
};

export const verifyAccessToken = (token: string): AuthSession => {
  const session = Array.from(sessions.values()).find((item) => secureEquals(item.accessToken, token));
  if (!session || session.accessTokenExpiresAt < now()) {
    throw new AppSecurityError("Invalid access token", {
      code: "INVALID_ACCESS_TOKEN",
      status: 401,
      publicMessage: "Sessão inválida.",
    });
  }
  return session;
};

export const getSessionById = (sessionId: string): AuthSession | null => {
  const session = sessions.get(sessionId);
  if (!session) return null;
  return session;
};
