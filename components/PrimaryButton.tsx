import { monoFont } from "@/constants/retroTheme";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRetroPalette } from "./hooks/useRetroPalette";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  size?: "default" | "small" | "tiny";
}

export function PrimaryButton({ label, onPress, size = "default" }: PrimaryButtonProps) {
  const palette = useRetroPalette();
  const isSmall = size === "small";
  const isTiny = size === "tiny";

  const buttonStyles = useMemo(
    () => ({
      backgroundColor: palette.accent,
      backgroundColorPressed: palette.accentPressed,
      borderColor: palette.accent,
    }),
    [palette],
  );

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={[
            styles.primaryButton,
            isSmall ? styles.primaryButtonSmall : null,
            isTiny ? styles.primaryButtonTiny : null,
            {
              backgroundColor: pressed
                ? buttonStyles.backgroundColorPressed
                : buttonStyles.backgroundColor,
              borderColor: buttonStyles.borderColor,
            },
          ]}
        >
          <Text
            style={[
              styles.primaryButtonText,
              isSmall ? styles.primaryButtonTextSmall : null,
              isTiny ? styles.primaryButtonTextTiny : null,
              {
                color: palette.onAccent,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    borderRadius: 5,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
    minHeight: 44,
    justifyContent: "center",
  },
  primaryButtonText: {
    fontFamily: monoFont,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  primaryButtonSmall: {
    paddingVertical: 8,
    minHeight: 34,
  },
  primaryButtonTextSmall: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
  primaryButtonTiny: {
    paddingVertical: 5,
    paddingHorizontal: 3,
    minHeight: 16,
    marginTop: 0,
  },
  primaryButtonTextTiny: {
    fontSize: 8,
    letterSpacing: 0.2,
  },
});
