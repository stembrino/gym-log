import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet } from "react-native";
import { useRetroPalette } from "./hooks/useRetroPalette";

type WindowControlButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  variant: "minimize" | "close";
  size?: "sm" | "md" | "xl";
  disabled?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  iconColor?: string;
  testID?: string;
};

function getIconName(variant: WindowControlButtonProps["variant"]): "minus" | "times" {
  return variant === "close" ? "times" : "minus";
}

function getIconSize(size: WindowControlButtonProps["size"]): number {
  if (size === "sm") {
    return 9;
  }

  if (size === "xl") {
    return 13;
  }

  return 11;
}

export function WindowControlButton({
  onPress,
  accessibilityLabel,
  variant,
  size = "md",
  disabled = false,
  borderColor,
  backgroundColor,
  iconColor,
  testID = "window-control-button",
}: WindowControlButtonProps) {
  const palette = useRetroPalette();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={8}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === "sm" ? styles.buttonSm : null,
        size === "xl" ? styles.buttonXl : null,
        {
          borderColor: borderColor ?? palette.border,
          backgroundColor: backgroundColor ?? palette.card,
          opacity: disabled ? 0.6 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <FontAwesome
        name={getIconName(variant)}
        size={getIconSize(size)}
        color={iconColor ?? palette.textPrimary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSm: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  buttonXl: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
