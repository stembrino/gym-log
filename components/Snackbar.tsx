import { monoFont } from "@/constants/retroTheme";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SnackbarProps = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  durationMs?: number;
  position?: "top" | "bottom";
  align?: "start" | "center" | "end";
};

export function Snackbar({
  visible,
  message,
  onDismiss,
  durationMs = 1400,
  position = "bottom",
  align = "center",
}: SnackbarProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timeout = setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => clearTimeout(timeout);
  }, [durationMs, onDismiss, visible, message]);

  if (!visible || !message) {
    return null;
  }

  const isTop = position === "top";
  const verticalInset = isTop ? Math.max(8, insets.top) : Math.max(16, insets.bottom + 8);

  return (
    <View
      testID="snackbar-container"
      pointerEvents="none"
      style={[
        styles.container,
        isTop ? styles.containerTop : styles.containerBottom,
        isTop ? styles.containerTopFullWidth : undefined,
        isTop ? { top: verticalInset } : { bottom: verticalInset },
        align === "start"
          ? styles.containerStart
          : align === "end"
            ? styles.containerEnd
            : styles.containerCenter,
      ]}
    >
      <View
        testID="snackbar-body"
        style={[
          styles.body,
          isTop ? styles.bodyTopFullWidth : undefined,
          {
            backgroundColor: "rgba(39, 164, 85, 0.45)",
            borderColor: "rgba(34, 197, 94, 0.55)",
          },
        ]}
      >
        <Text style={[styles.message, { color: "#1cd25f" }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  containerTop: {
    top: 16,
  },
  containerBottom: {
    bottom: 16,
  },
  containerTopFullWidth: {
    left: 0,
    right: 0,
  },
  containerStart: {
    alignItems: "flex-start",
  },
  containerCenter: {
    alignItems: "center",
  },
  containerEnd: {
    alignItems: "flex-end",
  },
  body: {
    borderWidth: 1,
    borderRadius: 4,
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "100%",
  },
  bodyTopFullWidth: {
    width: "100%",
    borderRadius: 0,
  },
  message: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "center",
  },
});
