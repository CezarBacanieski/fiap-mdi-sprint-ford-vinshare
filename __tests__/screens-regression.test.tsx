import { Alert } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";
import { mockVehicles } from "../constants/mockData";

const mockFocusEffect = jest.fn();
const mockDeleteVehicle = jest.fn();
const mockReloadVehicles = jest.fn();
let mockCurrentVehicles = mockVehicles;

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useFocusEffect: (callback: () => void) => mockFocusEffect(callback),
}));
jest.mock("../hooks/useVehicles", () => ({
  useVehicles: () => ({
    vehicles: mockCurrentVehicles,
    isLoading: false,
    errorMessage: null,
    addVehicle: jest.fn(),
    deleteVehicle: mockDeleteVehicle,
    reloadVehicles: mockReloadVehicles,
  }),
  useFordModels: () => ({ data: [], isFetching: false }),
}));
jest.mock("../components/ui/ScreenContainer", () => {
  const React = require("react"); const { View } = require("react-native");
  return ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children);
});
jest.mock("../components/ui/SkeletonBox", () => {
  const React = require("react"); const { View } = require("react-native"); return () => React.createElement(View);
});
jest.mock("../components/ui/ThemedButton", () => {
  const React = require("react"); const { Pressable, Text } = require("react-native");
  return ({ title, onPress }: { title: string; onPress: () => void }) => React.createElement(Pressable, { onPress }, React.createElement(Text, null, title));
});
jest.mock("../components/ui/VehicleCard", () => {
  const React = require("react"); const { Pressable, Text } = require("react-native");
  return ({ vehicle, onDelete }: { vehicle: { model: string }; onDelete: () => void }) => React.createElement(Pressable, { accessibilityLabel: `Excluir ${vehicle.model}`, onPress: onDelete }, React.createElement(Text, null, vehicle.model));
});
jest.mock("react-native-paper", () => {
  const React = require("react"); const { View } = require("react-native");
  return { MD3DarkTheme: { colors: {} }, FAB: () => React.createElement(View), HelperText: () => React.createElement(View), Menu: ({ anchor }: { anchor: React.ReactNode }) => React.createElement(View, null, anchor), Modal: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children), Portal: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children), TextInput: () => React.createElement(View) };
});

import VehiclesScreen from "../app/(tabs)/vehicles";

describe("vehicles tab regression", () => {
  beforeEach(() => {
    mockCurrentVehicles = mockVehicles;
    jest.clearAllMocks();
  });

  it("asks for confirmation and only removes after confirmation", async () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const screen = await render(<VehiclesScreen />);

    fireEvent.press(screen.getByLabelText("Excluir Ranger XLS"));
    const actions = alert.mock.calls[0][2] ?? [];
    expect(alert).toHaveBeenCalledWith("Excluir veiculo?", expect.any(String), expect.any(Array));

    actions.find((action) => action.text === "Cancelar")?.onPress?.();
    expect(mockDeleteVehicle).not.toHaveBeenCalled();

    actions.find((action) => action.text === "Excluir")?.onPress?.();
    expect(mockDeleteVehicle).toHaveBeenCalledWith(mockVehicles[0].id);
  });

  it("reloads persisted data when the tab receives focus again", async () => {
    const screen = await render(<VehiclesScreen />);
    const callback = mockFocusEffect.mock.calls[0][0] as () => void;
    expect(screen.getByText("Ranger XLS")).toBeTruthy();

    await act(async () => callback());

    expect(mockReloadVehicles).toHaveBeenCalled();
  });
});
