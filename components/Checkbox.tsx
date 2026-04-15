import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { monoFont } from "@/constants/retroTheme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CheckboxProps = {
  label: string;
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function Checkbox({ label, checked, onPress, disabled = false }: CheckboxProps) {
  const palette = useRetroPalette();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={styles.pressable}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? palette.accent : palette.border,
            backgroundColor: checked ? palette.accent : palette.card,
          },
        ]}
      >
        {checked ? <Text style={[styles.checkMark, { color: palette.onAccent }]}>X</Text> : null}
      </View>
      <Text style={[styles.label, { color: palette.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  box: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontFamily: monoFont,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 10,
  },
  label: {
    fontFamily: monoFont,
    fontSize: 11,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
});
