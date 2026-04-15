import { monoFont } from "@/constants/retroTheme";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

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

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        position === "top" ? styles.containerTop : styles.containerBottom,
        align === "start"
          ? styles.containerStart
          : align === "end"
            ? styles.containerEnd
            : styles.containerCenter,
      ]}
    >
      <View
        style={[
          styles.body,
          {
            backgroundColor: "rgba(233, 84, 32, 0.18)",
            borderColor: "rgba(233, 84, 32, 0.55)",
          },
        ]}
      >
        <Text style={[styles.message, { color: "#E95420" }]}>{message}</Text>
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
  message: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    textAlign: "center",
  },
});
