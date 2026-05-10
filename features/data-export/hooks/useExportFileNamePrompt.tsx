import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { ControlledSearchInput } from "@/components/ControlledSearchInput";
import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { monoFont } from "@/constants/retroTheme";

type FileNameModalState = {
  isVisible: boolean;
  defaultFileName: string;
  resolve?: (value: string | null) => void;
};

function ExportFileNameModal({
  isVisible,
  inputValue,
  onInputChange,
  onConfirm,
  onCancel,
}: {
  isVisible: boolean;
  inputValue: string;
  onInputChange: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const palette = useRetroPalette();

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.scrim} onPress={onCancel} />
        <View
          style={[
            styles.card,
            {
              borderColor: palette.border,
              backgroundColor: palette.card,
            },
          ]}
        >
          <Text style={[styles.title, { color: palette.textPrimary }]}>Nome do arquivo</Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            Digite um nome para o backup (sem extensão)
          </Text>

          <ControlledSearchInput
            placeholder="gym-log-backup"
            value={inputValue}
            onChangeText={onInputChange}
            showLeadingIcon={false}
            showClearButton
            autoFocus
            maxLength={50}
          />

          <View style={styles.actionsWrap}>
            <Pressable
              style={[
                styles.actionButton,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.page,
                },
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.actionText, { color: palette.textPrimary }]}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                {
                  borderColor: palette.accent,
                  backgroundColor: palette.accent,
                },
              ]}
              onPress={onConfirm}
            >
              <Text style={[styles.actionText, { color: palette.onAccent }]}>Exportar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function useExportFileNamePrompt() {
  const [state, setState] = useState<FileNameModalState>({
    isVisible: false,
    defaultFileName: "",
  });
  const [inputValue, setInputValue] = useState("");

  const promptForFileName = useCallback((defaultFileName: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setInputValue(defaultFileName);
      setState({
        isVisible: true,
        defaultFileName,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const finalName = inputValue.trim() || state.defaultFileName;
    state.resolve?.(finalName);
    setState({ isVisible: false, defaultFileName: "" });
    setInputValue("");
  }, [inputValue, state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(null);
    setState({ isVisible: false, defaultFileName: "" });
    setInputValue("");
  }, [state]);

  const modalElement = useMemo(
    () => (
      <ExportFileNameModal
        isVisible={state.isVisible}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [state.isVisible, inputValue, handleConfirm, handleCancel],
  );

  return { promptForFileName, modalElement };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  card: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 14,
    gap: 10,
  },
  title: {
    fontFamily: monoFont,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: monoFont,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  actionsWrap: {
    gap: 8,
    marginTop: 4,
    flexDirection: "row",
  },
  actionButton: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  actionText: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
