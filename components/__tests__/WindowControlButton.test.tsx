import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { WindowControlButton } from "../WindowControlButton";

jest.mock("@/components/hooks/useRetroPalette", () => ({
  useRetroPalette: () => ({
    border: "#333333",
    card: "#111111",
    textPrimary: "#FFFFFF",
  }),
}));

jest.mock("@expo/vector-icons/FontAwesome", () => "MockFontAwesome");

function flattenStyle(style: unknown): { width?: number; height?: number; opacity?: number } {
  return StyleSheet.flatten(style as object) as {
    width?: number;
    height?: number;
    opacity?: number;
  };
}

describe("WindowControlButton", () => {
  it("calls onPress for minimize variant", () => {
    const onPress = jest.fn();

    const { getByLabelText } = render(
      <WindowControlButton
        variant="minimize"
        accessibilityLabel="Minimize workout"
        onPress={onPress}
      />,
    );

    fireEvent.press(getByLabelText("Minimize workout"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders close variant and uses xl size dimensions", () => {
    const { getByLabelText } = render(
      <WindowControlButton
        variant="close"
        size="xl"
        accessibilityLabel="Close"
        onPress={() => {}}
      />,
    );

    const button = getByLabelText("Close");
    const style = flattenStyle(button.props.style);

    expect(style.width).toBe(30);
    expect(style.height).toBe(30);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();

    const { getByLabelText } = render(
      <WindowControlButton
        variant="minimize"
        size="sm"
        accessibilityLabel="Minimize workout"
        onPress={onPress}
        disabled
      />,
    );

    fireEvent.press(getByLabelText("Minimize workout"));

    expect(onPress).not.toHaveBeenCalled();
  });
});
