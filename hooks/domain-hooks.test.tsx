import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { mockRewardTransactions, mockServices, mockUser, mockVehicles } from "../constants/mockData";
import { saveRewardTransactions, saveServices, saveUser, saveVehicles } from "../services/storage";
import { NewServiceInput, NewVehicleInput } from "../types";
import { useRewards } from "./useRewards";
import { useServices } from "./useServices";
import { useVehicles } from "./useVehicles";

const storage = AsyncStorage as typeof AsyncStorage & { __clear: () => void };

const newVehicle: NewVehicleInput = {
  brand: "Ford",
  model: "Maverick",
  version: "Lariat",
  year: 2025,
  plate: "ABC1D23",
  mileage: 200,
  fuelType: "Hibrido",
  color: "Azul",
};

describe("domain hooks", () => {
  beforeEach(async () => {
    storage.__clear();
    jest.clearAllMocks();
    await Promise.all([
      saveVehicles(mockVehicles),
      saveServices(mockServices),
      saveUser(mockUser),
      saveRewardTransactions(mockRewardTransactions),
    ]);
  });

  it("loads, adds, deletes and reloads vehicles from persistence", async () => {
    const { result } = await renderHook(() => useVehicles());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.vehicles).toHaveLength(2);

    await act(async () => {
      await result.current.addVehicle(newVehicle);
    });
    expect(result.current.vehicles[0]).toMatchObject({ model: "Maverick", plate: "ABC1D23" });

    await act(async () => {
      await result.current.deleteVehicle(result.current.vehicles[0].id);
    });
    expect(result.current.vehicles).toHaveLength(2);

    await act(async () => {
      await result.current.reloadVehicles();
    });
    expect(result.current.vehicles).toEqual(mockVehicles);
  });

  it("creates an appointment, persists it and exposes it as upcoming", async () => {
    const { result } = await renderHook(() => useServices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const input: NewServiceInput = {
      vehicleId: mockVehicles[0].id,
      serviceTypes: ["Troca de Oleo"],
      mileage: 43000,
      dealershipId: "d-001",
      date: "2030-05-20",
      time: "10:00",
      notes: "Teste automatizado",
    };

    await act(async () => {
      await result.current.addService(input);
    });

    expect(result.current.upcomingServices).toContainEqual(expect.objectContaining({
      type: "Troca de Oleo",
      dealershipName: "Ford Saraiva - Tatuape",
      status: "Agendado",
    }));
    expect(result.current.historyServices.every((service) => service.status === "Concluido")).toBe(true);

    await act(async () => {
      await result.current.reloadServices();
    });
    expect(result.current.services.some((service) => service.notes === "Teste automatizado")).toBe(true);
  });

  it("updates rewards, persists transactions and blocks redemption with insufficient points", async () => {
    const { result } = await renderHook(() => useRewards());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const initialPoints = result.current.user?.points ?? 0;

    await act(async () => {
      await result.current.addPoints(200, "Teste de pontos");
    });
    expect(result.current.user?.points).toBe(initialPoints + 200);
    expect(result.current.transactions[0]).toMatchObject({ points: 200, description: "Teste de pontos" });

    await act(async () => {
      await expect(result.current.redeemReward({
        id: "expensive",
        icon: "star",
        title: "Inacessivel",
        description: "Teste",
        pointsNeeded: 999999,
        category: "service",
      })).resolves.toBe(false);
    });

    await act(async () => {
      await result.current.reloadRewards();
    });
    expect(result.current.user?.points).toBe(initialPoints + 200);
  });

  it("redeems an available reward and records the debit", async () => {
    const { result } = await renderHook(() => useRewards());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let redeemed = false;
    await act(async () => {
      redeemed = await result.current.redeemReward({
        id: "reward-1",
        icon: "percent",
        title: "Desconto",
        description: "Teste",
        pointsNeeded: 500,
        category: "discount",
      });
    });

    expect(redeemed).toBe(true);
    expect(result.current.user?.points).toBe(mockUser.points - 500);
    expect(result.current.transactions[0]).toMatchObject({ points: -500, type: "redeem" });
  });

  it("persists profile changes and restores them after a reload", async () => {
    const { result } = await renderHook(() => useRewards());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const updatedUser = { ...mockUser, name: "Perfil Atualizado", email: "perfil@ford.com" };

    await act(async () => {
      await result.current.updateUser(updatedUser);
      await result.current.reloadRewards();
    });

    expect(result.current.user).toMatchObject({
      name: "Perfil Atualizado",
      email: "perfil@ford.com",
      tier: "Prata",
    });
  });
});
