import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { fetchFordModels } from "../services/api";
import { loadVehicles, saveVehicles } from "../services/storage";
import { FipeModel, NewVehicleInput, Vehicle } from "../types";

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
      const vehicle: Vehicle = {
        id: `v-${Date.now()}`,
        brand: input.brand,
        model: input.model,
        version: input.version || "Versao nao informada",
        year: input.year,
        plate: input.plate.toLocaleUpperCase("pt-BR"),
        mileage: input.mileage,
        fuelType: input.fuelType,
        color: input.color || "Azul Indianapolis",
        chassi: `9BF${Date.now().toString().slice(-12)}`,
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
