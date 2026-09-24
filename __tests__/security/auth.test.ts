import { AppSecurityError } from "../../security/errors";
import { refreshSession, revokeSession, signIn } from "../../security/auth";
import { getSecurityMetrics } from "../../security/metrics";

describe("auth security flow", () => {
  it("creates and rotates refresh token", async () => {
    const session = await signIn({
      email: "cliente@fordplus.app",
      password: "FordPlus#2026!",
      requestFingerprint: "test-device",
    });

    const rotated = refreshSession(session.refreshToken);
    expect(rotated.refreshToken).not.toEqual(session.refreshToken);
    revokeSession(rotated.sessionId);
  });

  it("blocks refresh token replay", async () => {
    const session = await signIn({
      email: "cliente@fordplus.app",
      password: "FordPlus#2026!",
      requestFingerprint: "test-device-replay",
    });

    const rotated = refreshSession(session.refreshToken);
    expect(() => refreshSession(session.refreshToken)).toThrow(AppSecurityError);
    revokeSession(rotated.sessionId);
  });

  it("registers an authentication failure metric", async () => {
    const before = getSecurityMetrics().counters.auth_refresh_failed_total;
    expect(() => refreshSession("invalid-refresh-token")).toThrow(AppSecurityError);
    expect(getSecurityMetrics().counters.auth_refresh_failed_total).toBe(before + 1);
  });
});
