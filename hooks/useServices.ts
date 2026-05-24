import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDealerships } from "../services/api";
import { loadServices, loadVehicles, saveServices } from "../services/storage";
import { AppSecurityError } from "../security/errors";
import { auditLog } from "../security/logger";
import { actionRateLimiter } from "../security/rateLimiter";
import { validateServiceInput } from "../security/validation";
import { Dealership, NewServiceInput, ServiceRecord } from "../types";
import { useAuth } from "./useAuth";

interface UseServicesResult {
  services: ServiceRecord[];
  upcomingServices: ServiceRecord[];
  historyServices: ServiceRecord[];
  isLoading: boolean;
  errorMessage: string | null;
  reloadServices: () => Promise<void>;
  addService: (input: NewServiceInput) => Promise<ServiceRecord>;
}

const upcomingStatuses: ServiceRecord["status"][] = ["Agendado", "Confirmado", "Em andamento"];

export const useServices = (): UseServicesResult => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { hasPermission, session } = useAuth();

  const reloadServices = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const storedServices = await loadServices();
      setServices(storedServices);
    } catch {
      setErrorMessage("Nao foi possivel carregar seus servicos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadServices();
  }, [reloadServices]);

  const upcomingServices = useMemo(() => {
    return services
      .filter((service) => upcomingStatuses.includes(service.status))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [services]);

  const historyServices = useMemo(() => {
    return services
      .filter((service) => service.status === "Concluido")
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [services]);

  const addService = useCallback(
    async (input: NewServiceInput) => {
      if (!hasPermission("service:create")) {
        throw new AppSecurityError("Service create denied", {
          code: "FORBIDDEN",
          status: 403,
          publicMessage: "Seu perfil não pode criar agendamentos.",
        });
      }

      const limiter = actionRateLimiter.consume(`service-create:${session?.userId ?? "guest"}`);
      if (!limiter.allowed) {
        throw new AppSecurityError("Service create rate limited", {
          code: "RATE_LIMITED",
          status: 429,
          publicMessage: "Muitas tentativas de agendamento. Aguarde e tente novamente.",
        });
      }

      const safeInput = validateServiceInput(input);
      const [vehicles, dealerships] = await Promise.all([loadVehicles(), fetchDealerships()]);
      const vehicle = vehicles.find((item) => item.id === safeInput.vehicleId);
      const dealership = dealerships.find((item) => item.id === safeInput.dealershipId);
      const service: ServiceRecord = {
        id: `s-${Date.now()}`,
        vehicleId: safeInput.vehicleId,
        vehicleName: vehicle?.model ?? "Ford",
        type: safeInput.serviceTypes.join(", "),
        date: safeInput.date,
        time: safeInput.time,
        dealershipId: safeInput.dealershipId,
        dealershipName: dealership?.name ?? "Concessionaria Ford",
        mileage: safeInput.mileage,
        status: "Agendado",
        notes: safeInput.notes,
        details: [
          { label: "Servico", value: safeInput.serviceTypes.join(", ") },
          { label: "Canal", value: "Agendado pelo Ford+" },
          { label: "Previsao", value: "Confirmacao em ate 2 horas uteis" },
        ],
      };
      const nextServices = [service, ...services];
      setServices(nextServices);
      await saveServices(nextServices);
      auditLog({
        event: "service_created",
        severity: "info",
        userId: session?.userId,
        role: session?.role,
        metadata: { serviceId: service.id, dealershipId: service.dealershipId },
      });
      return service;
    },
    [hasPermission, services, session?.role, session?.userId],
  );

  return {
    services,
    upcomingServices,
    historyServices,
    isLoading,
    errorMessage,
    reloadServices,
    addService,
  };
};

export const useDealerships = () => {
  return useQuery<Dealership[]>({
    queryKey: ["dealerships"],
    queryFn: fetchDealerships,
    staleTime: 1000 * 60 * 5,
  });
};
