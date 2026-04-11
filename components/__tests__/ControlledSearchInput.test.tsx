import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ControlledSearchInput } from "../ControlledSearchInput";

jest.mock("@/components/hooks/useRetroPalette", () => ({
  useRetroPalette: () => ({
    inputBg: "#111111",
    inputBorder: "#222222",
    accent: "#E95420",
    textSecondary: "#888888",
  }),
}));

jest.mock("@expo/vector-icons/FontAwesome", () => "MockFontAwesome");

function flattenStyle(style: unknown): { borderWidth?: number } {
  return StyleSheet.flatten(style as object) as { borderWidth?: number };
}

describe("ControlledSearchInput", () => {
  it("renders placeholder and calls onChangeText", () => {
    const onChangeText = jest.fn();

    const { getByPlaceholderText } = render(
      <ControlledSearchInput value="" onChangeText={onChangeText} placeholder="Search exercises" />,
    );

    const input = getByPlaceholderText("Search exercises");
    fireEvent.changeText(input, "bench");

    expect(onChangeText).toHaveBeenCalledWith("bench");
  });

  it("uses accent border on focus for default variant", () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ControlledSearchInput value="" onChangeText={() => {}} placeholder="Search exercises" />,
    );

    const input = getByPlaceholderText("Search exercises");
    const container = getByTestId("controlled-search-input-container");

    expect(flattenStyle(container.props.style).borderWidth).toBe(1);
    fireEvent(input, "focus");
    expect(
      flattenStyle(getByTestId("controlled-search-input-container").props.style).borderWidth,
    ).toBe(2);
    fireEvent(input, "blur");
    expect(
      flattenStyle(getByTestId("controlled-search-input-container").props.style).borderWidth,
    ).toBe(1);
  });

  it("keeps compact variant border stable on focus", () => {
    const { getByPlaceholderText, getByTestId } = render(
      <ControlledSearchInput
        value=""
        onChangeText={() => {}}
        placeholder="Search exercises"
        variant="compact"
      />,
    );

    const input = getByPlaceholderText("Search exercises");
    const container = getByTestId("controlled-search-input-container");

    expect(flattenStyle(container.props.style).borderWidth).toBe(1);
    fireEvent(input, "focus");
    expect(
      flattenStyle(getByTestId("controlled-search-input-container").props.style).borderWidth,
    ).toBe(1);
  });
});
