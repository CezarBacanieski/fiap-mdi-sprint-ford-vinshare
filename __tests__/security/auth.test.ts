import { AppSecurityError } from "../../security/errors";
import { refreshSession, revokeSession, signIn } from "../../security/auth";

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
});
