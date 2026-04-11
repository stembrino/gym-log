import { monoFont } from "@/constants/retroTheme";
import { Pressable, StyleSheet, Text } from "react-native";

type HeaderActionButtonProps = {
  label: string;
  onPress: () => void;
  palette: {
    border: string;
    textPrimary: string;
    card: string;
    listSelected: string;
  };
};

export function HeaderActionButton({ label, onPress, palette }: HeaderActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: palette.border,
          backgroundColor: pressed ? palette.listSelected : palette.card,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.label, { color: palette.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 2,
    minHeight: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: monoFont,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
