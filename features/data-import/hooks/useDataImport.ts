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

        showAlert({
          title: t("settings.dataImportPreflightOkTitle"),
          message: t("settings.dataImportPreflightOkMessage", {
            workouts: preflightResult.backup.counts.workouts,
            exercises: preflightResult.backup.counts.exercises,
          }),
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
          type: "application/json",
          copyToCacheDirectory: true,
          multiple: false,
        });
        const fileUri = resolvePickedFileUri(selection);

        if (!fileUri) {
          return;
        }

        const rawText = await readAsStringAsync(fileUri, {
          encoding: EncodingType.UTF8,
        });
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
      } catch {
        showAlert({
          title: t("settings.dataImportErrorTitle"),
          message: t("settings.dataImportErrorMessage"),
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
