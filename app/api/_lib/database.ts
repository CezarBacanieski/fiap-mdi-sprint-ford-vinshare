import { encryptString } from "../../../security/cryptoStorage";
import { NewVehicleInput, Vehicle } from "../../../types";

interface StoredVehicle {
  id: string;
  createdAt: string;
  encryptedPlate: string;
  encryptedChassi: string;
  payload: Omit<Vehicle, "plate" | "chassi">;
}

const vehicles = new Map<string, StoredVehicle>();

const maskPlate = (plate: string): string => {
  if (plate.length < 4) return "***";
  return `${plate.slice(0, 3)}***${plate.slice(-1)}`;
};

const maskChassi = (chassi: string): string => {
  if (chassi.length < 8) return "********";
  return `${chassi.slice(0, 3)}********${chassi.slice(-3)}`;
};

const buildVehicle = (input: NewVehicleInput): Vehicle => {
  const now = new Date();
  return {
    id: `v-${now.getTime()}`,
    brand: input.brand,
    model: input.model,
    version: input.version,
    year: input.year,
    plate: input.plate,
    mileage: input.mileage,
    fuelType: input.fuelType,
    color: input.color,
    chassi: `9BF${now.getTime().toString().slice(-12)}`,
    healthScore: 84,
    lastService: now.toISOString().slice(0, 10),
    nextService: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    systems: {
      motor: 88,
      freios: 87,
      pneus: 83,
      suspensao: 86,
      arCondicionado: 90,
      fluidos: 82,
    },
  };
};

export const createVehicle = async (input: NewVehicleInput): Promise<Vehicle> => {
  const vehicle = buildVehicle(input);
  const { plate, chassi, ...payload } = vehicle;

  const record: StoredVehicle = {
    id: vehicle.id,
    createdAt: new Date().toISOString(),
    encryptedPlate: await encryptString(plate),
    encryptedChassi: await encryptString(chassi),
    payload,
  };

  vehicles.set(vehicle.id, record);
  return {
    ...vehicle,
    plate: maskPlate(plate),
    chassi: maskChassi(chassi),
  };
};

export const listVehicles = (): Vehicle[] => {
  return Array.from(vehicles.values()).map((record) => ({
    ...(record.payload as Omit<Vehicle, "plate" | "chassi">),
    plate: "***-***",
    chassi: "**************",
  }));
};
