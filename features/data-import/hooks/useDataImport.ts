import { useCallback, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { EncodingType, readAsStringAsync } from "expo-file-system/legacy";

import { useGlobalAlert } from "@/components/hooks/useGlobalAlert";
import { useI18n } from "@/components/providers/i18n-provider";
import { runBackupImportPreflight } from "../lib/runBackupImportPreflight";
import { transactionalRestore } from "../restore/transactionalRestore";

function resolvePickedFileUri(result: DocumentPicker.DocumentPickerResult): string | null {
  if ("canceled" in result) {
    if (result.canceled || result.assets.length === 0) {
      return null;
    }

    return result.assets[0]?.uri ?? null;
  }

  if ((result as { type?: string }).type === "cancel") {
    return null;
  }

  return (result as { uri?: string }).uri ?? null;
}

function normalizeRawJsonText(rawText: string): string {
  // Remove UTF-8 BOM when present. Some providers include it and JSON.parse rejects it.
  return rawText.replace(/^\uFEFF/, "");
}

async function readPickedFileText(fileUri: string): Promise<string> {
  try {
    const text = await readAsStringAsync(fileUri, {
      encoding: EncodingType.UTF8,
    });

    return normalizeRawJsonText(text);
  } catch (legacyError) {
    // Android providers can return content:// URIs that fail in legacy FS on release builds.
    if (!fileUri.startsWith("content://")) {
      throw legacyError;
    }

    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error(`Could not read selected file (status ${response.status}).`);
    }

    const text = await response.text();
    return normalizeRawJsonText(text);
  }
}

export function useDataImport() {
  const { t } = useI18n();
  const { showAlert, alertElement } = useGlobalAlert();
  const [isImporting, setIsImporting] = useState(false);

  const importFromText = useCallback(
    async (rawText: string) => {
      if (isImporting) {
        return;
      }

      setIsImporting(true);

      try {
        const preflightResult = runBackupImportPreflight(rawText);

        if (preflightResult.status === "error") {
          showAlert({
            title: t("settings.dataImportInvalidTitle"),
            message: preflightResult.issues[0] ?? t("settings.dataImportInvalidMessage"),
            buttonLabel: t("workouts.postFinishCloseCta"),
          });
          return;
        }

        const restoreResult = await transactionalRestore(preflightResult.backup);

        if (restoreResult.status === "failed") {
          showAlert({
            title: t("settings.dataImportErrorTitle"),
            message: restoreResult.message,
            buttonLabel: t("workouts.postFinishCloseCta"),
          });
          return;
        }

        showAlert({
          title: t("settings.dataImportSuccessTitle"),
          message: t("settings.dataImportSuccessMessage", {
            workouts: restoreResult.restoredCounts.workouts,
            exercises: restoreResult.restoredCounts.exercises,
          }),
          buttonLabel: t("workouts.postFinishCloseCta"),
        });
      } catch (error) {
        console.error("Import from text error:", error);
        showAlert({
          title: t("settings.dataImportErrorTitle"),
          message: t("settings.dataImportErrorMessage"),
          buttonLabel: t("workouts.postFinishCloseCta"),
        });
      } finally {
        setIsImporting(false);
      }
    },
    [isImporting, showAlert, t],
  );

  const importFromDevice = useCallback(() => {
    if (isImporting) {
      return;
    }

    void (async () => {
      setIsImporting(true);

      try {
        const selection = await DocumentPicker.getDocumentAsync({
          type: ["application/json", "text/json", "text/plain", "*/*"],
          copyToCacheDirectory: true,
          multiple: false,
        });
        const fileUri = resolvePickedFileUri(selection);

        if (!fileUri) {
          return;
        }

        const rawText = await readPickedFileText(fileUri);
        const preflightResult = runBackupImportPreflight(rawText);

        if (preflightResult.status === "error") {
          showAlert({
            title: t("settings.dataImportInvalidTitle"),
            message: preflightResult.issues[0] ?? t("settings.dataImportInvalidMessage"),
            buttonLabel: t("workouts.postFinishCloseCta"),
          });
          return;
        }

        const restoreResult = await transactionalRestore(preflightResult.backup);

        if (restoreResult.status === "failed") {
          showAlert({
            title: t("settings.dataImportErrorTitle"),
            message: restoreResult.message,
            buttonLabel: t("workouts.postFinishCloseCta"),
          });
          return;
        }

        showAlert({
          title: t("settings.dataImportSuccessTitle"),
          message: t("settings.dataImportSuccessMessage", {
            workouts: restoreResult.restoredCounts.workouts,
            exercises: restoreResult.restoredCounts.exercises,
          }),
          buttonLabel: t("workouts.postFinishCloseCta"),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Import from device error:", error);
        showAlert({
          title: t("settings.dataImportErrorTitle"),
          message: `${t("settings.dataImportErrorMessage")}\n\n${errorMessage}`,
          buttonLabel: t("workouts.postFinishCloseCta"),
        });
      } finally {
        setIsImporting(false);
      }
    })();
  }, [isImporting, showAlert, t]);

  return {
    alertElement,
    importFromText,
    importFromDevice,
    isImporting,
  };
}
