import { monoFont } from "@/constants/retroTheme";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type ControlledInfoHintProps = {
  visible: boolean;
  onVisibleChange: (nextVisible: boolean) => void;
  message: string;
  dismissLabel: string;
  triggerAccessibilityLabel: string;
  tintColor: string;
  cardBackgroundColor: string;
  borderColor: string;
  textColor: string;
};

export function ControlledInfoHint({
  visible,
  onVisibleChange,
  message,
  dismissLabel,
  triggerAccessibilityLabel,
  tintColor,
  cardBackgroundColor,
  borderColor,
  textColor,
}: ControlledInfoHintProps) {
  return (
    <>
      <Pressable
        onPress={() => onVisibleChange(true)}
        accessibilityRole="button"
        accessibilityLabel={triggerAccessibilityLabel}
        hitSlop={8}
        style={[styles.trigger, { borderColor: tintColor, backgroundColor: tintColor }]}
      >
        <Text style={[styles.triggerText, { color: cardBackgroundColor }]}>?</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => onVisibleChange(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.scrim} onPress={() => onVisibleChange(false)} />
          <View
            style={[
              styles.card,
              { backgroundColor: cardBackgroundColor, borderColor, shadowColor: borderColor },
            ]}
          >
            <Text style={[styles.message, { color: textColor }]}>{message}</Text>
            <Pressable
              onPress={() => onVisibleChange(false)}
              style={[styles.dismissButton, { borderColor, backgroundColor: cardBackgroundColor }]}
              accessibilityRole="button"
              accessibilityLabel={dismissLabel}
            >
              <Text style={[styles.dismissText, { color: tintColor }]}>{dismissLabel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerText: {
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  message: {
    fontFamily: monoFont,
    fontSize: 13,
    lineHeight: 18,
  },
  dismissButton: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dismissText: {
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
