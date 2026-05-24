import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { fetchFordModels } from "../services/api";
import { loadVehicles, saveVehicles } from "../services/storage";
import { AppSecurityError } from "../security/errors";
import { auditLog, securityLog } from "../security/logger";
import { actionRateLimiter } from "../security/rateLimiter";
import { validateVehicleInput } from "../security/validation";
import { FipeModel, NewVehicleInput, Vehicle } from "../types";
import { useAuth } from "./useAuth";

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
  const { hasPermission, session } = useAuth();

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
      if (!hasPermission("vehicle:create")) {
        throw new AppSecurityError("Vehicle create denied", {
          code: "FORBIDDEN",
          status: 403,
          publicMessage: "Você não possui permissão para cadastrar veículo.",
        });
      }

      const limiter = actionRateLimiter.consume(`vehicle-create:${session?.userId ?? "guest"}`);
      if (!limiter.allowed) {
        throw new AppSecurityError("Vehicle create rate limited", {
          code: "RATE_LIMITED",
          status: 429,
          publicMessage: "Muitas tentativas de cadastro. Aguarde e tente novamente.",
        });
      }

      const safeInput = validateVehicleInput(input);
      const vehicle: Vehicle = {
        id: `v-${Date.now()}`,
        brand: safeInput.brand,
        model: safeInput.model,
        version: safeInput.version || "Versao nao informada",
        year: safeInput.year,
        plate: safeInput.plate.toLocaleUpperCase("pt-BR"),
        mileage: safeInput.mileage,
        fuelType: safeInput.fuelType,
        color: safeInput.color || "Azul Indianapolis",
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
      auditLog({
        event: "vehicle_created",
        severity: "info",
        userId: session?.userId,
        role: session?.role,
        metadata: { vehicleId: vehicle.id },
      });
      return vehicle;
    },
    [session?.role, session?.userId, vehicles],
  );

  const deleteVehicle = useCallback(
    async (vehicleId: string) => {
      if (!hasPermission("vehicle:delete")) {
        throw new AppSecurityError("Vehicle delete denied", {
          code: "FORBIDDEN",
          status: 403,
          publicMessage: "Seu perfil não pode remover veículos.",
        });
      }

      const nextVehicles = vehicles.filter((vehicle) => vehicle.id !== vehicleId);
      setVehicles(nextVehicles);
      await saveVehicles(nextVehicles);
      auditLog({
        event: "vehicle_deleted",
        severity: "warning",
        userId: session?.userId,
        role: session?.role,
        metadata: { vehicleId },
      });
    },
    [hasPermission, session?.role, session?.userId, vehicles],
  );

  return { vehicles, isLoading, errorMessage, reloadVehicles, addVehicle, deleteVehicle };
};

export const useFordModels = (searchTerm: string) => {
  return useQuery<FipeModel[]>({
    queryKey: ["fipe", "ford-models", searchTerm],
    queryFn: async () => {
      try {
        return await fetchFordModels(searchTerm);
      } catch (error) {
        securityLog("warn", "ford_models_query_failed", {
          message: error instanceof Error ? error.message : "unknown",
        });
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: searchTerm.trim().length >= 2,
  });
};
