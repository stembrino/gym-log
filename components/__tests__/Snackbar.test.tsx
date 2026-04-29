import React from "react";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { Snackbar } from "../Snackbar";

jest.mock("@/components/hooks/useRetroPalette", () => ({
  useRetroPalette: () => ({
    card: "#1A1A1A",
    border: "#333333",
    textPrimary: "#FFFFFF",
    accent: "#E95420",
  }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    top: 28,
    right: 0,
    bottom: 14,
    left: 0,
  }),
}));

describe("Snackbar", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders message when visible", () => {
    const { getByText } = render(
      <Snackbar visible message="Exercise added" onDismiss={() => {}} />,
    );

    expect(getByText("Exercise added")).toBeTruthy();
  });

  it("does not render when hidden", () => {
    const { queryByText } = render(
      <Snackbar visible={false} message="Exercise added" onDismiss={() => {}} />,
    );

    expect(queryByText("Exercise added")).toBeNull();
  });

  it("auto dismisses after duration", () => {
    const onDismiss = jest.fn();

    render(<Snackbar visible message="Exercise added" onDismiss={onDismiss} durationMs={900} />);

    jest.advanceTimersByTime(899);
    expect(onDismiss).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("uses safe area and full width when position is top", () => {
    const { getByTestId } = render(
      <Snackbar visible message="Exercise added" onDismiss={() => {}} position="top" />,
    );

    const containerStyle = StyleSheet.flatten(getByTestId("snackbar-container").props.style);
    const bodyStyle = StyleSheet.flatten(getByTestId("snackbar-body").props.style);

    expect(containerStyle.top).toBe(28);
    expect(containerStyle.left).toBe(0);
    expect(containerStyle.right).toBe(0);
    expect(bodyStyle.width).toBe("100%");
  });
});
