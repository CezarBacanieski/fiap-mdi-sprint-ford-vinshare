import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

jest.mock("./ThemedButton", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return ({ title, onPress }: { title: string; onPress: () => void }) =>
    React.createElement(Pressable, { onPress }, React.createElement(Text, null, title));
});

import AppErrorBoundary from "./AppErrorBoundary";

describe("AppErrorBoundary", () => {
  it("renders recovery UI and retries after the underlying error is fixed", async () => {
    let shouldThrow = true;
    const ProblemChild = () => {
      if (shouldThrow) throw new Error("test error");
      return <Text>Aplicativo recuperado</Text>;
    };
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    const screen = await render(
      <AppErrorBoundary><ProblemChild /></AppErrorBoundary>,
    );
    expect(screen.getByText("Algo saiu do planejado.")).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(screen.getByText("Tentar novamente"));
    await screen.rerender(
      <AppErrorBoundary><ProblemChild /></AppErrorBoundary>,
    );
    expect(screen.getByText("Aplicativo recuperado")).toBeTruthy();
  });
});
