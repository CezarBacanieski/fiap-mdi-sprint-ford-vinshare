export type AppRole = "admin" | "analyst" | "user";

export type Permission =
  | "vehicle:view"
  | "vehicle:create"
  | "vehicle:delete"
  | "service:create"
  | "service:view"
  | "profile:update"
  | "rewards:redeem"
  | "security:admin";

export interface AuthSession {
  sessionId: string;
  userId: string;
  role: AppRole;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
  createdAt: number;
}

export interface LoginAttemptState {
  count: number;
  firstAttemptAt: number;
  lockUntil?: number;
}

export interface SecurityEvent {
  event: string;
  severity: "info" | "warning" | "critical";
  requestId?: string;
  correlationId?: string;
  userId?: string;
  role?: AppRole;
  metadata?: Record<string, unknown>;
}
