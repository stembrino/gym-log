import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { WindowControlButton } from "@/components/WindowControlButton";
import { monoFont } from "@/constants/retroTheme";
import { Modal, StyleSheet, Text, View } from "react-native";

interface SelectRoutineGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SelectRoutineGroupModal({ isOpen, onClose }: SelectRoutineGroupModalProps) {
  const palette = useRetroPalette();

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}>
        <View style={[styles.container, { backgroundColor: palette.card }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>
              Start Routine Group
            </Text>
            <WindowControlButton
              variant="close"
              size="md"
              onPress={onClose}
              accessibilityLabel="Close routine group modal"
              borderColor={palette.border}
              backgroundColor={palette.page}
              iconColor={palette.textPrimary}
            />
          </View>

          <View style={styles.content}>
            <Text style={[styles.placeholder, { color: palette.textSecondary }]}>
              Routine group picker modal (coming soon)
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    height: "80%",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: monoFont,
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    fontFamily: monoFont,
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
