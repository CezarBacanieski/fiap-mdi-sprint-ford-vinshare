import { render, waitFor } from "@testing-library/react-native";
import { mockVehicles } from "../../constants/mockData";

let mockRegisteredVehicles = [] as typeof mockVehicles;

jest.mock("../../hooks/useVehicles", () => ({
  useVehicles: () => ({ vehicles: mockRegisteredVehicles, isLoading: false }),
}));
jest.mock("../../hooks/useServices", () => ({
  useServices: () => ({ addService: jest.fn() }),
  useDealerships: () => ({ data: [], isLoading: false }),
}));
jest.mock("../../hooks/useNotifications", () => ({
  useNotifications: () => ({ scheduleServiceReminder: jest.fn() }),
}));
jest.mock("../../components/ui/ScreenContainer", () => {
  const React = require("react"); const { View } = require("react-native");
  return ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children);
});
jest.mock("../../components/ui/ThemedButton", () => {
  const React = require("react"); const { Pressable, Text } = require("react-native");
  return ({ title, disabled }: { title: string; disabled?: boolean }) => React.createElement(Pressable, { accessibilityLabel: title, accessibilityState: { disabled } }, React.createElement(Text, null, title));
});
jest.mock("../../components/ui/ThemedCard", () => {
  const React = require("react"); const { View } = require("react-native");
  return ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children);
});
jest.mock("react-native-paper", () => {
  const React = require("react"); const { View } = require("react-native");
  return { MD3DarkTheme: { colors: {} }, Searchbar: () => React.createElement(View), Snackbar: () => React.createElement(View), TextInput: () => React.createElement(View) };
});

import NewServiceScreen from "./new";

describe("new service validation", () => {
  beforeEach(() => {
    mockRegisteredVehicles = [];
  });

  it("blocks the scheduling flow without a registered vehicle", async () => {
    const screen = await render(<NewServiceScreen />);

    expect(screen.getByText("Cadastre um veiculo primeiro")).toBeTruthy();
    expect(screen.getByText("Ir para meus veiculos")).toBeTruthy();
  });

  it("keeps the continue action disabled while mandatory service fields are incomplete", async () => {
    mockRegisteredVehicles = [mockVehicles[0]];
    const screen = await render(<NewServiceScreen />);

    await waitFor(() => {
      expect(screen.getByLabelText("Continuar").props.accessibilityState.disabled).toBe(true);
    });
  });
});
