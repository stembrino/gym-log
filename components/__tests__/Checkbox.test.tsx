import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Checkbox } from "../Checkbox";

jest.mock("@/components/hooks/useRetroPalette", () => ({
  useRetroPalette: () => ({
    border: "#404040",
    accent: "#E95420",
    card: "#1E1E1E",
    onAccent: "#FFFFFF",
    textPrimary: "#EAEAEA",
  }),
}));

describe("Checkbox", () => {
  it("renders label and unchecked state", () => {
    const { getByText, queryByText } = render(
      <Checkbox label="Chest" checked={false} onPress={() => {}} />,
    );

    expect(getByText("Chest")).toBeTruthy();
    expect(queryByText("X")).toBeNull();
  });

  it("renders checked state", () => {
    const { getByText } = render(<Checkbox label="Chest" checked onPress={() => {}} />);

    expect(getByText("X")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByRole } = render(<Checkbox label="Chest" checked={false} onPress={onPress} />);

    fireEvent.press(getByRole("checkbox"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
