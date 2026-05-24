import { hasPermission } from "../../security/permissions";

describe("rbac permissions", () => {
  it("allows admin security actions", () => {
    expect(hasPermission("admin", "security:admin")).toBe(true);
  });

  it("blocks user destructive action", () => {
    expect(hasPermission("user", "vehicle:delete")).toBe(false);
  });
});
