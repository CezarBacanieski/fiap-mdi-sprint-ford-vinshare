import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockUser, mockVehicles } from "../constants/mockData";
import {
  getJsonItem,
  loadUser,
  loadVehicles,
  saveUser,
  seedInitialData,
  storageKeys,
} from "./storage";

const storage = AsyncStorage as typeof AsyncStorage & { __clear: () => void };

describe("storage", () => {
  beforeEach(() => {
    storage.__clear();
    jest.clearAllMocks();
  });

  it("seeds the local demonstration data only once", async () => {
    await seedInitialData();
    await seedInitialData();

    expect(await loadUser()).toEqual(mockUser);
    expect(await loadVehicles()).toEqual(mockVehicles);
    expect(AsyncStorage.multiSet).toHaveBeenCalledTimes(1);
  });

  it("persists and reloads a changed user", async () => {
    const updatedUser = { ...mockUser, name: "Ana Ford", points: 2300 };

    await saveUser(updatedUser);

    expect(await loadUser()).toEqual(updatedUser);
  });

  it("uses mock data when a stored collection does not exist", async () => {
    expect(await loadVehicles()).toEqual(mockVehicles);
  });

  it("returns null for a missing JSON value", async () => {
    expect(await getJsonItem(storageKeys.services)).toBeNull();
  });
});
