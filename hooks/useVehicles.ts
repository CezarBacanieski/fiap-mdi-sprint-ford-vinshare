import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { fetchFordModels } from "../services/api";
import { loadVehicles, saveVehicles } from "../services/storage";
import { FipeModel, NewVehicleInput, Vehicle } from "../types";

const normalizePlate = (plate: string): string => plate.replace(/[^A-Za-z0-9]/g, "").toLocaleUpperCase("pt-BR");
const isValidPlate = (plate: string): boolean => /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(plate);

interface UseVehiclesResult {
  vehicles: Vehicle[];
  isLoading: boolean;
  errorMessage: string | null;
  reloadVehicles: () => Promise<void>;
  addVehicle: (vehicle: NewVehicleInput) => Promise<Vehicle>;
  deleteVehicle: (vehicleId: string) => Promise<void>;
}

export const useVehicles = (): UseVehiclesResult => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reloadVehicles = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const storedVehicles = await loadVehicles();
      setVehicles(storedVehicles);
    } catch {
      setErrorMessage("Nao foi possivel carregar seus veiculos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadVehicles();
  }, [reloadVehicles]);

  const addVehicle = useCallback(
    async (input: NewVehicleInput) => {
      const plate = normalizePlate(input.plate);
      if (!isValidPlate(plate)) {
        throw new Error("Informe uma placa brasileira válida.");
      }

      if (vehicles.some((vehicle) => normalizePlate(vehicle.plate) === plate)) {
        throw new Error("Este veículo já está cadastrado na garagem.");
      }

      const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const vehicle: Vehicle = {
        id: `v-${uniqueId}`,
        brand: input.brand,
        model: input.model,
        version: input.version || "Versao nao informada",
        year: input.year,
        plate,
        mileage: input.mileage,
        fuelType: input.fuelType,
        color: input.color || "Azul Indianapolis",
        chassi: `9BF${uniqueId.replace(/\D/g, "").slice(-14).padStart(14, "0")}`,
        healthScore: 86,
        lastService: new Date().toISOString().slice(0, 10),
        nextService: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString().slice(0, 10),
        systems: {
          motor: 90,
          freios: 86,
          pneus: 82,
          suspensao: 88,
          arCondicionado: 91,
          fluidos: 84,
        },
      };
      const nextVehicles = [vehicle, ...vehicles];
      setVehicles(nextVehicles);
      await saveVehicles(nextVehicles);
      return vehicle;
    },
    [vehicles],
  );

  const deleteVehicle = useCallback(
    async (vehicleId: string) => {
      const nextVehicles = vehicles.filter((vehicle) => vehicle.id !== vehicleId);
      setVehicles(nextVehicles);
      await saveVehicles(nextVehicles);
    },
    [vehicles],
  );

  return { vehicles, isLoading, errorMessage, reloadVehicles, addVehicle, deleteVehicle };
};

export const useFordModels = (searchTerm: string) => {
  return useQuery<FipeModel[]>({
    queryKey: ["fipe", "ford-models", searchTerm],
    queryFn: () => fetchFordModels(searchTerm),
    staleTime: 1000 * 60 * 5,
    enabled: searchTerm.trim().length >= 2,
  });
};
