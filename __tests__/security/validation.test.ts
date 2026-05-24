import { AppSecurityError } from "../../security/errors";
import { validateServiceInput, validateVehicleInput } from "../../security/validation";

describe("security validation", () => {
  it("accepts a safe vehicle payload", () => {
    const vehicle = validateVehicleInput({
      brand: "Ford",
      model: "Ranger",
      version: "2.2 Diesel",
      year: 2024,
      plate: "BRA2E19",
      mileage: 1000,
      fuelType: "Diesel",
      color: "Branco",
    });

    expect(vehicle.plate).toBe("BRA2E19");
  });

  it("blocks malicious vehicle payload", () => {
    expect(() =>
      validateVehicleInput({
        brand: "Ford<script>",
        model: "Ranger",
        version: "2.2 Diesel",
        year: 2024,
        plate: "BRA2E19",
        mileage: 1000,
        fuelType: "Diesel",
        color: "Branco",
      }),
    ).toThrow(AppSecurityError);
  });

  it("blocks invalid service payload", () => {
    expect(() =>
      validateServiceInput({
        vehicleId: "v-001",
        serviceTypes: [],
        mileage: 1,
        dealershipId: "d-001",
        date: "2026-12-12",
        time: "10:00",
        notes: "ok",
      }),
    ).toThrow(AppSecurityError);
  });
});
