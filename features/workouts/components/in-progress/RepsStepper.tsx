import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet } from "react-native";
import { useRetroPalette } from "@/components/hooks/useRetroPalette";

type RepsStepperButtonProps = {
  icon: "minus" | "plus";
  side?: "left" | "right" | "single";
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
};

export function RepsStepperButton({
  icon,
  side = "single",
  onPress,
  disabled = false,
  accessibilityLabel,
}: RepsStepperButtonProps) {
  const palette = useRetroPalette();
  const isPlus = icon === "plus";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        side === "left" ? styles.leftButton : null,
        side === "right" ? styles.rightButton : null,
        side === "single" ? styles.singleButton : null,
        {
          borderColor: isPlus ? palette.accent : palette.border,
          backgroundColor: pressed ? palette.listSelected : palette.page,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <FontAwesome name={icon} size={12} color={isPlus ? palette.accent : palette.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  singleButton: {
    borderRadius: 2,
  },
  leftButton: {
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  rightButton: {
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    borderLeftWidth: 0,
  },
});
