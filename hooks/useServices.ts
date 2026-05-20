import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDealerships } from "../services/api";
import { loadServices, loadVehicles, saveServices } from "../services/storage";
import { Dealership, NewServiceInput, ServiceRecord } from "../types";

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
      const [vehicles, dealerships] = await Promise.all([loadVehicles(), fetchDealerships()]);
      const vehicle = vehicles.find((item) => item.id === input.vehicleId);
      const dealership = dealerships.find((item) => item.id === input.dealershipId);
      const service: ServiceRecord = {
        id: `s-${Date.now()}`,
        vehicleId: input.vehicleId,
        vehicleName: vehicle?.model ?? "Ford",
        type: input.serviceTypes.join(", "),
        date: input.date,
        time: input.time,
        dealershipId: input.dealershipId,
        dealershipName: dealership?.name ?? "Concessionaria Ford",
        mileage: input.mileage,
        status: "Agendado",
        notes: input.notes,
        details: [
          { label: "Servico", value: input.serviceTypes.join(", ") },
          { label: "Canal", value: "Agendado pelo Ford+" },
          { label: "Previsao", value: "Confirmacao em ate 2 horas uteis" },
        ],
      };
      const nextServices = [service, ...services];
      setServices(nextServices);
      await saveServices(nextServices);
      return service;
    },
    [services],
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
