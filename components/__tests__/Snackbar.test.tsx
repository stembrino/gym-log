import React from "react";
import { render } from "@testing-library/react-native";
import { Snackbar } from "../Snackbar";

jest.mock("@/components/hooks/useRetroPalette", () => ({
  useRetroPalette: () => ({
    card: "#1A1A1A",
    border: "#333333",
    textPrimary: "#FFFFFF",
    accent: "#E95420",
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
});
