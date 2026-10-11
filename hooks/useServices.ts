import { useQuery } from "@tanstack/react-query";
import { isBefore, isValid, parseISO, startOfDay } from "date-fns";
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
      const appointmentDate = parseISO(`${input.date}T${input.time}:00`);

      if (!vehicle) {
        throw new Error("O veículo selecionado não está mais disponível.");
      }
      if (!dealership) {
        throw new Error("A concessionária selecionada não está disponível.");
      }
      if (input.serviceTypes.length === 0 || input.mileage < 0) {
        throw new Error("Informe ao menos um serviço e uma quilometragem válida.");
      }
      if (!/^\d{2}:\d{2}$/.test(input.time) || !isValid(appointmentDate) || isBefore(appointmentDate, startOfDay(new Date()))) {
        throw new Error("Escolha uma data e horário futuros para o agendamento.");
      }

      const service: ServiceRecord = {
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        vehicleId: input.vehicleId,
        vehicleName: vehicle.model,
        type: input.serviceTypes.join(", "),
        date: input.date,
        time: input.time,
        dealershipId: input.dealershipId,
        dealershipName: dealership.name,
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
